package data

import (
	"context"
	"fmt"
	"time"

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
	query := fmt.Sprintf(`
		SELECT count(*) OVER(), id, created_at, url, file_name, content_type
		FROM assets
		WHERE (STRPOS(LOWER(file_name), LOWER($1)) > 0 OR $1 = '')
		AND (STRPOS(LOWER(content_type), LOWER($2)) > 0 OR $2 = '')
		ORDER BY %s %s, id ASC
		LIMIT $3 OFFSET $4 `, filters.sortColumn(), filters.sortDirection())

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []any{filename, contentType, filters.limit(), filters.offset()}

	rows, err := m.DB.Query(ctx, query, args...)
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
