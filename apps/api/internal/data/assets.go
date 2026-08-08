package data

import (
	"context"
	"fmt"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Asset struct {
	ID          int64     `json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	URL         string    `json:"url"`
	Filename    string    `json:"fileName"`
	ContentType string    `json:"contentType"`
}

type AssetModel struct {
	DB *pgxpool.Pool
}

func (m AssetModel) Insert(assets []*Asset) error {
	query := `
		INSERT INTO assets (url, file_name, content_type)
		VALUES ($1, $2, $3)
		RETURNING id`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	for _, asset := range assets {
		args := []any{asset.URL, asset.Filename, asset.ContentType}
		err := m.DB.QueryRow(ctx, query, args...).Scan(&asset.ID)
		if err != nil {
			return ErrIncompleteCopy
		}
	}
	return nil
}

func (m AssetModel) InsertBulk(assets [][]any) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	copyCount, err := m.DB.CopyFrom(
		ctx,
		pgx.Identifier{"assets"},
		[]string{"url", "file_name", "content_type"},
		pgx.CopyFromRows(assets),
	)

	if copyCount != int64(len(assets)) {
		return ErrIncompleteCopy
	}

	if err != nil {
		return err
	}

	return err
}

func (m AssetModel) GetAll(filename, contentType string, filters Filters) ([]*Asset, Metadata, error) {
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
		OrderBy(fmt.Sprintf("%s %s", filters.sortColumn(), filters.sortDirection())).
		OrderBy("id ASC").
		Limit(uint64(filters.limit())).
		Offset(uint64(filters.offset()))

	if filename != "" {
		query = query.Where(sq.Expr("STRPOS(lower(file_name), lower(?)) > 0", filename))
	}

	if contentType != "" {
		query = query.Where(sq.Expr("STRPOS(lower(content_type), lower(?)) > 0", contentType))
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
	defer rows.Close()

	totalRecords := 0
	assets, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*Asset, error) {
		var asset Asset
		err := row.Scan(&totalRecords,
			&asset.ID,
			&asset.CreatedAt,
			&asset.URL,
			&asset.Filename,
			&asset.ContentType,
		)
		return &asset, err
	})

	if err != nil {
		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return assets, metadata, nil
}

func (m AssetModel) DeleteMultiple(ids []int64) error {
	if len(ids) < 1 {
		return ErrRecordNotFound
	}

	query := `
		DELETE FROM assets
		WHERE id = ANY($1)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.Exec(ctx, query, ids)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()

	if rowsAffected == 0 {
		return ErrRecordNotFound
	}

	return nil
}

func (m AssetModel) GetFileNames(ids []int64) ([]*string, error) {
	if len(ids) < 1 {
		return nil, ErrRecordNotFound
	}

	query := `
		SELECT file_name
		FROM assets
		WHERE id = ANY($1)`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}

	filenames, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*string, error) {
		var filename string
		err := row.Scan(&filename)
		return &filename, err
	})

	if err != nil {
		return nil, err
	}

	return filenames, err
}
