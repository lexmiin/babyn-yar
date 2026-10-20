package postgres

import (
	"context"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/assets"
	"github.com/lex-unix/babyn-yar/internal/pagination"
)

// Queries holds the asset reads that need no use case.
type Queries struct {
	DB *pgxpool.Pool
}

// ListFilter narrows a list of ready assets. Empty fields match everything;
// others match case-insensitive substrings.
type ListFilter struct {
	Filename    string
	ContentType string
}

func (q Queries) List(ctx context.Context, filter ListFilter, filters pagination.Filters) ([]*assets.Asset, pagination.Metadata, error) {
	query := psql.
		Select(
			"count(*) OVER()",
			"id",
			"created_at",
			"url",
			"file_name",
			"content_type",
		).
		From("assets").
		Where(sq.Eq{"status": assets.Ready}).
		OrderBy(fmt.Sprintf("%s %s", sortColumn(filters), filters.SortDirection())).
		OrderBy("id ASC").
		Limit(uint64(filters.Limit())).
		Offset(uint64(filters.Offset()))

	if filter.Filename != "" {
		query = query.Where(sq.Expr("strpos(lower(file_name), lower(?)) > 0", filter.Filename))
	}

	if filter.ContentType != "" {
		query = query.Where(sq.Expr("strpos(lower(content_type), lower(?)) > 0", filter.ContentType))
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
	list, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*assets.Asset, error) {
		var asset assets.Asset
		err := row.Scan(&totalRecords, &asset.ID, &asset.CreatedAt, &asset.URL, &asset.Filename, &asset.ContentType)
		return &asset, err
	})
	if err != nil {
		return nil, pagination.Metadata{}, err
	}

	return list, pagination.CalculateMetadata(totalRecords, filters.Page, filters.PageSize), nil
}

func sortColumn(filters pagination.Filters) string {
	switch filters.SortColumn() {
	case "created_at", "file_name":
		return filters.SortColumn()
	default:
		panic("unsafe asset sort parameter: " + filters.Sort)
	}
}
