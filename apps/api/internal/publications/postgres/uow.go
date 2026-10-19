package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/cachepurge"
	"github.com/lex-unix/babyn-yar/internal/database"
	"github.com/lex-unix/babyn-yar/internal/publications"
)

// UnitOfWork implements publications.UnitOfWork with one database transaction.
type UnitOfWork struct {
	DB *pgxpool.Pool
}

func (u UnitOfWork) Do(ctx context.Context, fn func(ctx context.Context, repos publications.Repositories) error) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	return database.WithTx(ctx, u.DB, func(tx pgx.Tx) error {
		return fn(ctx, publications.Repositories{
			Publications: repository{tx: tx},
			CachePurges:  cachePurges{tx: tx},
		})
	})
}

// cachePurges implements publications.CachePurges within one transaction.
type cachePurges struct {
	tx pgx.Tx
}

func (c cachePurges) Request(ctx context.Context, scope string) error {
	return cachepurge.Enqueue(ctx, c.tx, scope)
}
