// Package postgres implements the assets ports on Postgres.
package postgres

import (
	"context"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/jackc/pgx/v5"
	"github.com/lex-unix/babyn-yar/internal/assets"
)

var psql = sq.StatementBuilder.PlaceholderFormat(sq.Dollar)

// repository implements assets.Repository within one transaction.
type repository struct {
	tx pgx.Tx
}

func (r repository) InsertPending(ctx context.Context, batch []*assets.Asset) error {
	for _, asset := range batch {
		err := r.tx.QueryRow(ctx, `
			INSERT INTO assets (url, file_name, content_type, storage_key, status)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id, created_at
		`, asset.URL, asset.Filename, asset.ContentType, asset.Key, assets.Pending).Scan(&asset.ID, &asset.CreatedAt)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r repository) MarkReady(ctx context.Context, ids []int64) (int, error) {
	tag, err := r.tx.Exec(ctx, `
		UPDATE assets
		SET status = $2, status_changed_at = NOW()
		WHERE id = ANY($1) AND status = $3
	`, ids, assets.Ready, assets.Pending)
	return int(tag.RowsAffected()), err
}

// MarkDeleting waits for anything holding the rows, such as an image being
// added to the gallery, and then rechecks that they are still ready.
func (r repository) MarkDeleting(ctx context.Context, ids []int64) ([]*assets.Asset, error) {
	rows, err := r.tx.Query(ctx, `
		UPDATE assets
		SET status = $2, status_changed_at = NOW()
		WHERE id = ANY($1) AND status = $3
		RETURNING id, created_at, url, file_name, content_type, storage_key
	`, ids, assets.Deleting, assets.Ready)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanAsset)
}

// ClaimStale skips rows another sweeper is claiming instead of waiting for
// them.
func (r repository) ClaimStale(ctx context.Context, staleAfter time.Duration, limit int) ([]*assets.Asset, error) {
	rows, err := r.tx.Query(ctx, `
		WITH stale AS (
			SELECT id
			FROM assets
			WHERE status <> $1
				AND status_changed_at <= NOW() - make_interval(secs => $2)
			ORDER BY status_changed_at, id
			FOR UPDATE SKIP LOCKED
			LIMIT $3
		)
		UPDATE assets
		SET status = $4, status_changed_at = NOW()
		FROM stale
		WHERE assets.id = stale.id
		RETURNING assets.id, assets.created_at, assets.url, assets.file_name, assets.content_type, assets.storage_key
	`, assets.Ready, staleAfter.Seconds(), limit, assets.Deleting)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanAsset)
}

func (r repository) Claim(ctx context.Context, ids []int64) ([]*assets.Asset, error) {
	rows, err := r.tx.Query(ctx, `
		UPDATE assets
		SET status = $2, status_changed_at = NOW()
		WHERE id = ANY($1) AND status <> $3
		RETURNING id, created_at, url, file_name, content_type, storage_key
	`, ids, assets.Deleting, assets.Ready)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, scanAsset)
}

func (r repository) Remove(ctx context.Context, ids []int64) error {
	_, err := r.tx.Exec(ctx, `DELETE FROM assets WHERE id = ANY($1) AND status = $2`, ids, assets.Deleting)
	return err
}

// gallery implements assets.Gallery within one transaction.
type gallery struct {
	tx pgx.Tx
}

func (g gallery) Remove(ctx context.Context, ids []int64) (bool, error) {
	tag, err := g.tx.Exec(ctx, `DELETE FROM gallery_images WHERE id = ANY($1)`, ids)
	return tag.RowsAffected() > 0, err
}

func scanAsset(row pgx.CollectableRow) (*assets.Asset, error) {
	var asset assets.Asset
	err := row.Scan(&asset.ID, &asset.CreatedAt, &asset.URL, &asset.Filename, &asset.ContentType, &asset.Key)
	return &asset, err
}
