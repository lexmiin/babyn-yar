package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/pagination"
	"github.com/lex-unix/babyn-yar/internal/publications"
)

// Queries holds the publication reads that need no use case.
type Queries struct {
	DB *pgxpool.Pool
}

// ListFilter narrows a list of translations. Empty fields match everything.
type ListFilter struct {
	Kind          publications.Kind
	Locale        publications.Locale
	MissingLocale publications.Locale
	Title         string
}

func (q Queries) List(ctx context.Context, filter ListFilter, filters pagination.Filters) ([]*publications.Summary, pagination.Metadata, error) {
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
		OrderBy(fmt.Sprintf("%s %s", sortColumn(filters), filters.SortDirection())).
		OrderBy("p.id ASC").
		OrderBy("pt.locale ASC").
		Limit(uint64(filters.Limit())).
		Offset(uint64(filters.Offset()))

	if filter.Kind != "" {
		query = query.Where(sq.Eq{"p.kind": filter.Kind})
	}

	if filter.Locale != "" {
		query = query.Where(sq.Eq{"pt.locale": filter.Locale})
	}

	if filter.MissingLocale != "" {
		query = query.Where(sq.Expr(`
			NOT EXISTS (
				SELECT 1
				FROM publication_translations existing
				WHERE existing.publication_id = p.id
                AND existing.locale = ?
			)`, filter.MissingLocale))
	}

	if filter.Title != "" {
		query = query.Where(sq.Expr("strpos(lower(pt.title), lower(?)) > 0", filter.Title))
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, pagination.Metadata{}, err
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	rows, err := q.DB.Query(ctx, sql, args...)
	if err != nil {
		return nil, pagination.Metadata{}, err
	}

	totalRecords := 0
	summaries, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*publications.Summary, error) {
		var summary publications.Summary
		if err := row.Scan(
			&totalRecords,
			&summary.ID,
			&summary.Kind,
			&summary.Locale,
			&summary.OccurredOn,
			&summary.Title,
			&summary.Description,
			&summary.Cover,
			&summary.CreatedAt,
			&summary.UpdatedAt,
			&summary.PublicationVersion,
			&summary.Publisher.ID,
			&summary.Publisher.FullName,
		); err != nil {
			return nil, err
		}
		return &summary, nil
	})

	if err != nil {
		return nil, pagination.Metadata{}, err
	}

	return summaries, pagination.CalculateMetadata(totalRecords, filters.Page, filters.PageSize), nil
}

// Detail returns one translation of a publication, or apperr.ErrNotFound when
// the publication or the translation does not exist.
func (q Queries) Detail(ctx context.Context, id int64, locale publications.Locale) (*publications.Detail, error) {
	if id < 1 {
		return nil, apperr.ErrNotFound
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var detail publications.Detail
	err := q.DB.QueryRow(ctx, `
		SELECT p.id, p.kind, pt.locale, p.occurred_on, pt.title, pt.description, pt.cover,
			pt.created_at, pt.updated_at, p.version, u.id, u.full_name, pt.content, pt.documents
		FROM publication_translations pt
		INNER JOIN publications p ON p.id = pt.publication_id
		INNER JOIN users u ON u.id = pt.publisher_id
		WHERE p.id = $1 AND pt.locale = $2
	`, id, locale).Scan(
		&detail.ID,
		&detail.Kind,
		&detail.Locale,
		&detail.OccurredOn,
		&detail.Title,
		&detail.Description,
		&detail.Cover,
		&detail.CreatedAt,
		&detail.UpdatedAt,
		&detail.PublicationVersion,
		&detail.Publisher.ID,
		&detail.Publisher.FullName,
		&detail.Content,
		&detail.Documents,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperr.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &detail, nil
}

func sortColumn(filters pagination.Filters) string {
	switch filters.SortColumn() {
	case "created_at":
		return "pt.created_at"
	case "occurred_on":
		return "p.occurred_on"
	default:
		panic("unsafe publication sort parameter: " + filters.Sort)
	}
}
