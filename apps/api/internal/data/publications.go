package data

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

var validPublicationKinds = []string{
	"event",
	"book",
	"holocaust_document",
	"victim_testimony",
	"media_article",
	"partner",
	"development_concept",
	"legal_document",
}
var validPublicationLocales = []string{"uk", "en"}

type PublicationModel struct {
	DB *pgxpool.Pool
}

type PublicationSummary struct {
	ID                 int64     `json:"id"`
	Kind               string    `json:"kind"`
	Locale             string    `json:"locale"`
	OccurredOn         time.Time `json:"occurredOn"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	Cover              string    `json:"cover"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
	PublicationVersion int32     `json:"publicationVersion"`
	Publisher          Publisher `json:"publisher"`
}

type Publisher struct {
	ID       int64  `json:"id"`
	FullName string `json:"fullName"`
}

type PublicationDetail struct {
	PublicationSummary
	Content   json.RawMessage `json:"content"`
	Documents []string        `json:"documents"`
}

type Publication struct {
	ID           int64
	Kind         string
	OccurredOn   time.Time
	Version      int32
	Translations []PublicationTranslation
}

type PublicationTranslation struct {
	Locale      string
	Title       string
	Description string
	Content     json.RawMessage
	Cover       string
	Documents   []string
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Publisher   Publisher
}

func (p *Publication) Translation(locale string) (*PublicationTranslation, bool) {
	for i := range p.Translations {
		if p.Translations[i].Locale == locale {
			return &p.Translations[i], true
		}
	}
	return nil, false
}

func (p *Publication) Detail(locale string) (*PublicationDetail, error) {
	translation, ok := p.Translation(locale)
	if !ok {
		return nil, ErrRecordNotFound
	}

	return &PublicationDetail{
		PublicationSummary: PublicationSummary{
			ID:                 p.ID,
			Kind:               p.Kind,
			Locale:             translation.Locale,
			OccurredOn:         p.OccurredOn,
			Title:              translation.Title,
			Description:        translation.Description,
			Cover:              translation.Cover,
			CreatedAt:          translation.CreatedAt,
			UpdatedAt:          translation.UpdatedAt,
			PublicationVersion: p.Version,
			Publisher:          translation.Publisher,
		},
		Content:   translation.Content,
		Documents: translation.Documents,
	}, nil
}

type PublicationTranslationFields struct {
	Title       string
	Description string
	Content     json.RawMessage
	Cover       string
	Documents   []string
}

type CreatePublicationInput struct {
	Kind       string
	Locale     string
	OccurredOn time.Time
	PublicationTranslationFields
}

type AddPublicationTranslationInput struct {
	Locale     string
	OccurredOn time.Time
	PublicationTranslationFields
}

type UpdatePublicationTranslationInput struct {
	OccurredOn time.Time
	PublicationTranslationFields
}

func ValidatePublicationKind(v *validator.Validator, kind string) {
	v.Check(validator.In(kind, validPublicationKinds...), "kind", "must be supported publication kind")
}

func ValidatePublicationLocale(v *validator.Validator, value string) {
	v.Check(validator.In(value, validPublicationLocales...), "locale", "must be supported locale")
}

func ValidatePublicationTranslation(v *validator.Validator, occurredOn time.Time, fields PublicationTranslationFields) {
	v.Check(!occurredOn.IsZero(), "occurredOn", "must be a valid date")
	v.Check(fields.Title != "", "title", "must not be empty")
	v.Check(fields.Description != "", "description", "must not be empty")
	v.Check(len(fields.Content) > 0 && json.Valid(fields.Content), "content", "must be valid JSON")
	v.Check(fields.Cover != "", "cover", "must not be empty")
	for _, document := range fields.Documents {
		parsed, err := url.ParseRequestURI(document)
		v.Check(err == nil && parsed.Scheme != "" && parsed.Host != "", "documents", "must contain valid URLs")
	}
}

func (m PublicationModel) GetAll(kind string, locale string, missingLocale string, title string, filters Filters) ([]*PublicationSummary, Metadata, error) {
	query := psql.
		Select(
			"count(*) OVER()",
			"p.id",
			"p.kind",
			"pt.locale",
			"p.occurred_on",
			"pt.title",
			"pt.description",
			"pt.cover",
			"pt.created_at",
			"pt.updated_at",
			"p.version",
			"u.id",
			"u.full_name",
		).
		From("publication_translations pt").
		Join("publications p ON p.id = pt.publication_id").
		Join("users u ON u.id = pt.publisher_id").
		OrderBy(fmt.Sprintf("%s %s", publicationSortColumn(filters), filters.sortDirection())).
		OrderBy("p.id ASC").
		OrderBy("pt.locale ASC").
		Limit(uint64(filters.limit())).
		Offset(uint64(filters.offset()))

	if kind != "" {
		query = query.Where(sq.Eq{"p.kind": kind})
	}

	if locale != "" {
		query = query.Where(sq.Eq{"pt.locale": locale})
	}

	if missingLocale != "" {
		query = query.Where(sq.Expr(`
			NOT EXISTS (
				SELECT 1
				FROM publication_translations existing
				WHERE existing.publication_id = p.id
                AND existing.locale = ?
			)`, missingLocale))
	}

	if title != "" {
		query = query.Where(sq.Expr("strpos(lower(pt.title), lower(?)) > 0", title))
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, Metadata{}, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, sql, args...)
	if err != nil {
		return nil, Metadata{}, err
	}

	totalRecords := 0
	publications, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*PublicationSummary, error) {
		var publication PublicationSummary
		if err := row.Scan(
			&totalRecords,
			&publication.ID,
			&publication.Kind,
			&publication.Locale,
			&publication.OccurredOn,
			&publication.Title,
			&publication.Description,
			&publication.Cover,
			&publication.CreatedAt,
			&publication.UpdatedAt,
			&publication.PublicationVersion,
			&publication.Publisher.ID,
			&publication.Publisher.FullName,
		); err != nil {
			return nil, err
		}
		return &publication, nil
	})

	if err != nil {
		return nil, Metadata{}, err
	}

	return publications, calculateMetadata(totalRecords, filters.Page, filters.PageSize), nil
}

func (m PublicationModel) GetByID(id int64) (*Publication, error) {
	if id < 1 {
		return nil, ErrRecordNotFound
	}

	query := psql.
		Select(
			"p.id",
			"p.kind",
			"p.occurred_on",
			"p.version",
			"pt.locale",
			"pt.title",
			"pt.description",
			"pt.cover",
			"pt.created_at",
			"pt.updated_at",
			"u.id",
			"u.full_name",
			"pt.content",
			"pt.documents",
		).
		From("publication_translations pt").
		Join("publications p ON p.id = pt.publication_id").
		Join("users u ON u.id = pt.publisher_id").
		Where(sq.Eq{"p.id": id}).
		OrderBy("pt.locale ASC")

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}

	var publication Publication
	translations, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (PublicationTranslation, error) {
		var translation PublicationTranslation
		err := row.Scan(
			&publication.ID,
			&publication.Kind,
			&publication.OccurredOn,
			&publication.Version,
			&translation.Locale,
			&translation.Title,
			&translation.Description,
			&translation.Cover,
			&translation.CreatedAt,
			&translation.UpdatedAt,
			&translation.Publisher.ID,
			&translation.Publisher.FullName,
			&translation.Content,
			&translation.Documents,
		)
		return translation, err
	})
	if err != nil {
		return nil, err
	}
	if len(translations) == 0 {
		return nil, ErrRecordNotFound
	}
	publication.Translations = translations

	return &publication, nil
}

func (m PublicationModel) getDetail(id int64, locale string) (*PublicationDetail, error) {
	publication, err := m.GetByID(id)
	if err != nil {
		return nil, err
	}
	return publication.Detail(locale)
}

func (m PublicationModel) Create(input CreatePublicationInput, publisherID int64) (*PublicationDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	query := psql.
		Insert("publications").
		Columns("kind", "occurred_on").
		Values(input.Kind, input.OccurredOn).
		Suffix("RETURNING id")

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	var publicationID int64
	err = tx.QueryRow(ctx, sql, args...).Scan(&publicationID)
	if err != nil {
		return nil, err
	}

	query = psql.
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
			input.Locale,
			input.Title,
			input.Description,
			sq.Expr("?::jsonb", input.Content),
			input.Cover,
			nonNilDocuments(input.Documents),
			publisherID,
		)

	sql, args, err = query.ToSql()
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, sql, args...)
	if err != nil {
		return nil, publicationWriteError(err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return m.getDetail(publicationID, input.Locale)
}

func (m PublicationModel) AddTranslation(id int64, expectedVersion int32, input AddPublicationTranslationInput, publisherID int64) (*PublicationDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	if err := updatePublication(ctx, tx, id, input.OccurredOn, expectedVersion); err != nil {
		return nil, err
	}

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
			id,
			input.Locale,
			input.Title,
			input.Description,
			sq.Expr("?::jsonb", input.Content),
			input.Cover,
			nonNilDocuments(input.Documents),
			publisherID,
		)
	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	_, err = tx.Exec(ctx, sql, args...)
	if err != nil {
		return nil, publicationWriteError(err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return m.getDetail(id, input.Locale)
}

func (m PublicationModel) UpdateTranslation(id int64, locale string, expectedVersion int32, input UpdatePublicationTranslationInput) (*PublicationDetail, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	if err := updatePublication(ctx, tx, id, input.OccurredOn, expectedVersion); err != nil {
		return nil, err
	}

	query := psql.
		Update("publication_translations").
		Set("title", input.Title).
		Set("description", input.Description).
		Set("content", sq.Expr("?::jsonb", input.Content)).
		Set("cover", input.Cover).
		Set("documents", nonNilDocuments(input.Documents)).
		Set("updated_at", sq.Expr("GREATEST(now(), updated_at + interval '1 second')")).
		Where(sq.Eq{"publication_id": id}).
		Where(sq.Eq{"locale": locale})

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, err
	}

	result, err := tx.Exec(ctx, sql, args...)

	if err != nil {
		return nil, publicationWriteError(err)
	}
	if result.RowsAffected() == 0 {
		return nil, ErrRecordNotFound
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return m.getDetail(id, locale)
}

func (m PublicationModel) DeleteTranslation(id int64, locale string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if err := advancePublicationVersion(ctx, tx, id); err != nil {
		return err
	}

	result, err := tx.Exec(ctx, `
		DELETE FROM publication_translations
		WHERE publication_id = $1 AND locale = $2
	`, id, locale)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrRecordNotFound
	}
	return tx.Commit(ctx)
}

func publicationSortColumn(filters Filters) string {
	switch filters.sortColumn() {
	case "created_at":
		return "pt.created_at"
	case "occurred_on":
		return "p.occurred_on"
	default:
		panic("unsafe publication sort parameter: " + filters.Sort)
	}
}

func nonNilDocuments(documents []string) []string {
	if documents == nil {
		return []string{}
	}
	return documents
}

func publicationWriteError(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "publication_translations_publication_id_locale_key" {
		return ErrDuplicatePublicationLocale
	}
	return err
}

func updatePublication(ctx context.Context, tx pgx.Tx, id int64, occurredOn time.Time, expectedVersion int32) error {
	query := psql.
		Update("publications").
		Set("occurred_on", occurredOn).
		Set("updated_at", sq.Expr("GREATEST(now(), updated_at + interval '1 second')")).
		Set("version", sq.Expr("version + 1")).
		Where(sq.Eq{"id": id}).
		Where(sq.Eq{"version": expectedVersion})

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	result, err := tx.Exec(ctx, sql, args...)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		var exists bool
		if err := tx.QueryRow(ctx, `
			SELECT EXISTS (SELECT 1 FROM publications WHERE id = $1)
		`, id).Scan(&exists); err != nil {
			return err
		}
		if !exists {
			return ErrRecordNotFound
		}
		return ErrEditConflict
	}

	return nil
}

func advancePublicationVersion(ctx context.Context, tx pgx.Tx, id int64) error {
	query := psql.
		Update("publications").
		Set("updated_at", sq.Expr("GREATEST(now(), updated_at + interval '1 second')")).
		Set("version", sq.Expr("version + 1")).
		Where(sq.Eq{"id": id})

	sql, args, err := query.ToSql()
	if err != nil {
		return err
	}

	result, err := tx.Exec(ctx, sql, args...)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrRecordNotFound
	}

	return nil
}
