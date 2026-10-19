package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/assets"
	"github.com/lex-unix/babyn-yar/internal/cachepurge"
	"github.com/lex-unix/babyn-yar/internal/database"
)

// UnitOfWork implements assets.UnitOfWork with one database transaction.
type UnitOfWork struct {
	DB *pgxpool.Pool
}

func (u UnitOfWork) Do(ctx context.Context, fn func(ctx context.Context, repos assets.Repositories) error) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	return database.WithTx(ctx, u.DB, func(tx pgx.Tx) error {
		return fn(ctx, assets.Repositories{
			Assets:      repository{tx: tx},
			Gallery:     gallery{tx: tx},
			CachePurges: cachePurges{tx: tx},
		})
	})
}

// cachePurges implements assets.CachePurges within one transaction.
type cachePurges struct {
	tx pgx.Tx
}

func (c cachePurges) Request(ctx context.Context, scope string) error {
	return cachepurge.Enqueue(ctx, c.tx, scope)
}
