// Package postgres implements the assets ports on Postgres.
package postgres

import (
	"context"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/lex-unix/babyn-yar/internal/assets"
)

var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// repository implements assets.Repository. It must run inside a transaction,
// or Lock's lock is released as soon as it is taken.
type repository struct {
	tx pgx.Tx
}

func (r repository) Lock(ctx context.Context, ids []int64) ([]*assets.Asset, error) {
	rows, err := r.tx.Query(ctx, `
		SELECT id, created_at, url, file_name, content_type
		FROM assets
		WHERE id = ANY($1)
		ORDER BY id
		FOR UPDATE
	`, ids)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanAsset)
}

func (r repository) Insert(ctx context.Context, batch []*assets.Asset) error {
	for _, asset := range batch {
		err := r.tx.QueryRow(ctx, `
			INSERT INTO assets (url, file_name, content_type)
			VALUES ($1, $2, $3)
			RETURNING id, created_at
		`, asset.URL, asset.Filename, asset.ContentType).Scan(&asset.ID, &asset.CreatedAt)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r repository) Delete(ctx context.Context, ids []int64) error {
	_, err := r.tx.Exec(ctx, `DELETE FROM assets WHERE id = ANY($1)`, ids)
	return err
}

// gallery implements assets.Gallery within one transaction.
type gallery struct {
	tx pgx.Tx
}

func (g gallery) Shows(ctx context.Context, ids []int64) (bool, error) {
	var shown bool
	err := g.tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM gallery_images
			WHERE id = ANY($1)
		)
	`, ids).Scan(&shown)
	return shown, err
}

func scanAsset(row pgx.CollectableRow) (*assets.Asset, error) {
	var asset assets.Asset
	err := row.Scan(&asset.ID, &asset.CreatedAt, &asset.URL, &asset.Filename, &asset.ContentType)
	return &asset, err
}
