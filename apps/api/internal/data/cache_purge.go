package data

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CachePurgeRequest struct {
	ID       int64
	Scope    string
	Attempts int
}

type CachePurgeRequestModel struct {
	DB *pgxpool.Pool
}

func enqueueCachePurge(
	ctx context.Context,
	tx pgx.Tx,
	scope string,
) error {
	_, err := tx.Exec(ctx, `
		INSERT INTO cache_purge_requests (scope)
		VALUES ($1)
	`, scope)
	return err
}

func (m CachePurgeRequestModel) Claim(
	ctx context.Context,
	limit int,
	leaseDuration time.Duration,
) ([]CachePurgeRequest, error) {
	rows, err := m.DB.Query(ctx, `
		WITH claimable AS (
			SELECT id
			FROM cache_purge_requests
			WHERE available_at <= NOW()
				AND (leased_until IS NULL OR leased_until <= NOW())
			ORDER BY available_at, id
			FOR UPDATE SKIP LOCKED
			LIMIT $1
		)
		UPDATE cache_purge_requests AS purge
		SET attempts = purge.attempts + 1,
			leased_until = NOW() + make_interval(secs => $2)
		FROM claimable
		WHERE purge.id = claimable.id
		RETURNING purge.id, purge.scope, purge.attempts
	`, limit, int(leaseDuration.Seconds()))
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (CachePurgeRequest, error) {
		var purge CachePurgeRequest
		err := row.Scan(
			&purge.ID,
			&purge.Scope,
			&purge.Attempts,
		)
		return purge, err
	})
}

func (m CachePurgeRequestModel) Complete(ctx context.Context, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}
	_, err := m.DB.Exec(ctx, `DELETE FROM cache_purge_requests WHERE id = ANY($1)`, ids)
	return err
}

func (m CachePurgeRequestModel) Retry(ctx context.Context, ids []int64, retryAfter time.Duration, message string) error {
	if len(ids) == 0 {
		return nil
	}
	_, err := m.DB.Exec(ctx, `
		UPDATE cache_purge_requests
		SET available_at = NOW() + make_interval(secs => $2),
			leased_until = NULL,
			last_error = $3
		WHERE id = ANY($1)
	`, ids, int(retryAfter.Seconds()), message)
	return err
}
