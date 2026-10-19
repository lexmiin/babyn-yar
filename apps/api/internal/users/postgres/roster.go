package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/lex-unix/babyn-yar/internal/users"
)

// rosterRepository implements users.RosterRepository. It must run inside a
// transaction, or Load's lock is released as soon as it is taken.
type rosterRepository struct {
	tx pgx.Tx
}

// Load locks the roster for the rest of the transaction and returns its
// current state. Every change to a user's role, including deleting the user,
// must go through a roster loaded this way.
func (repo rosterRepository) Load(ctx context.Context) (*users.Roster, error) {
	tx := repo.tx
	var adminPermissionID int64
	err := tx.QueryRow(ctx, `SELECT id FROM permissions WHERE name = 'admin' FOR UPDATE`).Scan(&adminPermissionID)
	if err != nil {
		return nil, err
	}

	// Under READ COMMITTED this statement takes a fresh snapshot after the lock,
	// so it sees every committed role change.
	rows, err := tx.Query(ctx, `SELECT user_id FROM users_permissions WHERE permission_id = $1`, adminPermissionID)
	if err != nil {
		return nil, err
	}
	adminIDs, err := pgx.CollectRows(rows, pgx.RowTo[int64])
	if err != nil {
		return nil, err
	}

	return users.NewRoster(adminIDs...), nil
}

// Save persists the changes recorded on r since it was loaded.
func (repo rosterRepository) Save(ctx context.Context, r *users.Roster) error {
	tx := repo.tx
	for _, event := range r.PullEvents() {
		var err error
		switch event := event.(type) {
		case users.RoleAssigned:
			err = assignRole(ctx, tx, event.UserID, event.Role)
		case users.UserRemoved:
			_, err = tx.Exec(ctx, `DELETE FROM users_permissions WHERE user_id = $1`, event.UserID)
		default:
			err = fmt.Errorf("unhandled roster event %T", event)
		}
		if err != nil {
			return err
		}
	}
	return nil
}

func assignRole(ctx context.Context, tx pgx.Tx, userID int64, role users.Role) error {
	_, err := tx.Exec(ctx, `DELETE FROM users_permissions WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	result, err := tx.Exec(ctx, `
		INSERT INTO users_permissions (user_id, permission_id)
		SELECT $1, id FROM permissions WHERE name = $2`, userID, string(role))
	if err != nil {
		return err
	}
	if result.RowsAffected() != 1 {
		return fmt.Errorf("role %q is not defined", role)
	}
	return nil
}
