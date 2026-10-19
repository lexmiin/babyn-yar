// Package postgres implements the publications ports on Postgres.
package postgres

import (
	"context"
	"errors"
	"fmt"
	"slices"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/publications"
)

var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// repository implements publications.Repository. It must run inside a
// transaction, or Load's lock is released as soon as it is taken.
type repository struct {
	tx pgx.Tx
}

func (r repository) Load(ctx context.Context, id int64) (*publications.Publication, error) {
	if id < 1 {
		return nil, apperr.ErrNotFound
	}

	// FOR UPDATE waits for concurrent edits and then reads the row as they
	// left it.
	p := publications.Publication{ID: id}
	err := r.tx.QueryRow(ctx, `
		SELECT kind, occurred_on, version
		FROM publications
		WHERE id = $1
		FOR UPDATE
	`, id).Scan(&p.Kind, &p.OccurredOn, &p.Version)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperr.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	// Under READ COMMITTED this statement takes a fresh snapshot after the lock.
	rows, err := r.tx.Query(ctx, `
		SELECT locale, publisher_id, title, description, content, cover, documents
		FROM publication_translations
		WHERE publication_id = $1
		ORDER BY locale
	`, id)
	if err != nil {
		return nil, err
	}
	p.Translations, err = pgx.CollectRows(rows, func(row pgx.CollectableRow) (publications.Translation, error) {
		var t publications.Translation
		err := row.Scan(&t.Locale, &t.PublisherID, &t.Title, &t.Description, &t.Content, &t.Cover, &t.Documents)
		return t, err
	})
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r repository) Save(ctx context.Context, p *publications.Publication) error {
	events := p.PullEvents()
	if len(events) == 0 {
		return nil
	}

	if slices.ContainsFunc(events, func(event publications.PublicationEvent) bool {
		_, removed := event.(publications.PublicationRemoved)
		return removed
	}) {
		// Deleting the publication cascades to its translations.
		return r.deletePublication(ctx, p)
	}

	if _, created := events[0].(publications.PublicationCreated); !created {
		if err := r.advanceVersion(ctx, p); err != nil {
			return err
		}
	}

	for _, event := range events {
		var err error
		switch event := event.(type) {
		case publications.PublicationCreated:
			err = r.insertPublication(ctx, p)
		case publications.TranslationAdded:
			err = r.insertTranslation(ctx, p.ID, event.Translation)
		case publications.TranslationUpdated:
			err = r.updateTranslation(ctx, p.ID, event.Locale, event.Fields)
		case publications.TranslationRemoved:
			_, err = r.tx.Exec(ctx, `
				DELETE FROM publication_translations
				WHERE publication_id = $1 AND locale = $2
			`, p.ID, event.Locale)
		default:
			err = fmt.Errorf("unhandled publication event %T", event)
		}
		if err != nil {
			return err
		}
	}
	return nil
}

func (r repository) insertPublication(ctx context.Context, p *publications.Publication) error {
	query := psql.
		Insert("publications").
		Columns("kind", "occurred_on").
		Values(p.Kind, p.OccurredOn).
		Suffix("RETURNING id, version")

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	return r.tx.QueryRow(ctx, sql, args...).Scan(&p.ID, &p.Version)
}

func (r repository) advanceVersion(ctx context.Context, p *publications.Publication) error {
	query := psql.
		Update("publications").
		Set("occurred_on", p.OccurredOn).
		Set("updated_at", sq.Expr("GREATEST(now(), updated_at + interval '1 second')")).
		Set("version", sq.Expr("version + 1")).
		Where(sq.Eq{"id": p.ID}).
		Where(sq.Eq{"version": p.Version}).
		Suffix("RETURNING version")

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	err = r.tx.QueryRow(ctx, sql, args...).Scan(&p.Version)
	if errors.Is(err, pgx.ErrNoRows) {
		return apperr.ErrEditConflict
	}
	return err
}

func (r repository) deletePublication(ctx context.Context, p *publications.Publication) error {
	result, err := r.tx.Exec(ctx, `DELETE FROM publications WHERE id = $1 AND version = $2`, p.ID, p.Version)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperr.ErrEditConflict
	}
	return nil
}

func (r repository) insertTranslation(ctx context.Context, publicationID int64, translation publications.Translation) error {
	query := psql.
		Insert("publication_translations").
		Columns(
			"publication_id",
			"locale",
			"title",
			"description",
			"content",
			"cover",
			"documents",
			"publisher_id",
		).
		Values(
			publicationID,
			translation.Locale,
			translation.Title,
			translation.Description,
			sq.Expr("?::jsonb", translation.Content),
			translation.Cover,
			translation.Documents,
			translation.PublisherID,
		)

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = r.tx.Exec(ctx, sql, args...)
	return translationWriteError(err)
}

func (r repository) updateTranslation(ctx context.Context, publicationID int64, locale publications.Locale, fields publications.TranslationFields) error {
	query := psql.
		Update("publication_translations").
		Set("title", fields.Title).
		Set("description", fields.Description).
		Set("content", sq.Expr("?::jsonb", fields.Content)).
		Set("cover", fields.Cover).
		Set("documents", fields.Documents).
		Set("updated_at", sq.Expr("GREATEST(now(), updated_at + interval '1 second')")).
		Where(sq.Eq{"publication_id": publicationID}).
		Where(sq.Eq{"locale": locale})

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	_, err = r.tx.Exec(ctx, sql, args...)
	return err
}

func translationWriteError(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "publication_translations_publication_id_locale_key" {
		return publications.ErrDuplicateLocale
	}
	return err
}
