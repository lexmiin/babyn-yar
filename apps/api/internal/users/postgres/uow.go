// Package postgres implements the users ports on Postgres.
package postgres

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/database"
	"github.com/lex-unix/babyn-yar/internal/users"
)

// UnitOfWork implements users.UnitOfWork with one database transaction.
type UnitOfWork struct {
	DB *pgxpool.Pool
}

func (u UnitOfWork) Do(ctx context.Context, fn func(ctx context.Context, repos users.Repositories) error) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	return database.WithTx(ctx, u.DB, func(tx pgx.Tx) error {
		return fn(ctx, users.Repositories{
			Users:  userRepository{db: tx},
			Roster: rosterRepository{tx: tx},
		})
	})
}
