package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/database"
	"github.com/lex-unix/babyn-yar/internal/pagination"
	"github.com/lex-unix/babyn-yar/internal/users"
)

const selectUser = `
	SELECT u.id, u.created_at, u.updated_at, u.full_name, u.email, u.password_hash, u.version, array_agg(p.name) as permissions
	FROM users u
	INNER JOIN users_permissions up ON u.id = up.user_id
	INNER JOIN permissions p ON up.permission_id = p.id`

// Queries holds the user reads that need no use case.
type Queries struct {
	DB *pgxpool.Pool
}

func (q Queries) GetByID(ctx context.Context, id int64) (*users.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	return getUserByID(ctx, q.DB, id)
}

func (q Queries) GetAll(ctx context.Context, filters pagination.Filters) ([]*users.User, pagination.Metadata, error) {
	query := fmt.Sprintf(`
		SELECT count(*) OVER(), u.id, u.created_at, u.updated_at, u.full_name, u.email, array_agg(p.name) as permissions
		FROM users u
		INNER JOIN users_permissions up ON u.id = up.user_id
		INNER JOIN permissions p ON up.permission_id = p.id
		WHERE u.deleted_at IS NULL
		GROUP BY u.id
		ORDER BY %s %s, id ASC
		LIMIT $1 OFFSET $2`, filters.SortColumn(), filters.SortDirection())

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	args := []any{filters.Limit(), filters.Offset()}

	rows, err := q.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, pagination.Metadata{}, err
	}

	totalRecords := 0
	all, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*users.User, error) {
		var user users.User
		err := row.Scan(
			&totalRecords,
			&user.ID,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.FullName,
			&user.Email,
			&user.Permissions,
		)
		return &user, err
	})

	if err != nil {
		return nil, pagination.Metadata{}, err
	}

	metadata := pagination.CalculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return all, metadata, nil
}

// Permissions returns the permissions the user holds.
func (q Queries) Permissions(ctx context.Context, userID int64) (users.Permissions, error) {
	query := `
		SELECT permissions.name
		FROM permissions
		INNER JOIN users_permissions ON users_permissions.permission_id = permissions.id
		INNER JOIN users ON users_permissions.user_id = users.id
		WHERE users.id = $1 AND users.deleted_at IS NULL`

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	rows, err := q.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var permissions users.Permissions

	for rows.Next() {
		var permission string
		err := rows.Scan(&permission)
		if err != nil {
			return nil, err
		}

		permissions = append(permissions, permission)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return permissions, nil
}

// userRepository implements users.UserRepository. Each call has its own
// deadline, since calls made outside the unit of work get none from it.
type userRepository struct {
	db database.DBTX
}

// NewUserRepository returns a user repository whose writes each commit on
// their own. Use the unit of work when several writes must commit together.
func NewUserRepository(db *pgxpool.Pool) users.UserRepository {
	return userRepository{db: db}
}

func (r userRepository) Get(ctx context.Context, id int64) (*users.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	return getUserByID(ctx, r.db, id)
}

func (r userRepository) GetByEmail(ctx context.Context, email string) (*users.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	return scanUser(r.db.QueryRow(ctx, selectUser+` WHERE u.email = $1 AND u.deleted_at IS NULL GROUP BY u.id`, email))
}

func (r userRepository) Insert(ctx context.Context, user *users.User) error {
	query := `
		INSERT INTO users (full_name, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at, version`

	args := []any{user.FullName, user.Email, user.Password.Hash()}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	err := r.db.QueryRow(ctx, query, args...).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt, &user.Version)
	return userWriteError(err)
}

func (r userRepository) Update(ctx context.Context, user *users.User) error {
	query := `
		UPDATE users
		SET full_name = $1, email = $2, password_hash = $3, updated_at = now(), version = version + 1
		WHERE id = $4 AND version = $5
		RETURNING updated_at, version`

	args := []any{
		user.FullName,
		user.Email,
		user.Password.Hash(),
		user.ID,
		user.Version,
	}

	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	err := r.db.QueryRow(ctx, query, args...).Scan(&user.UpdatedAt, &user.Version)
	if errors.Is(err, pgx.ErrNoRows) {
		return apperr.ErrEditConflict
	}
	return userWriteError(err)
}

func (r userRepository) Delete(ctx context.Context, id int64) error {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// The row stays so the user's publications keep their publisher.
	result, err := r.db.Exec(ctx, `
		UPDATE users
		SET deleted_at = now(), updated_at = now(), version = version + 1
		WHERE id = $1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return apperr.ErrNotFound
	}
	return nil
}

func getUserByID(ctx context.Context, q database.DBTX, id int64) (*users.User, error) {
	if id < 1 {
		return nil, apperr.ErrNotFound
	}
	return scanUser(q.QueryRow(ctx, selectUser+` WHERE u.id = $1 AND u.deleted_at IS NULL GROUP BY u.id`, id))
}

func scanUser(row pgx.Row) (*users.User, error) {
	var user users.User
	var passwordHash []byte
	err := row.Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.FullName,
		&user.Email,
		&passwordHash,
		&user.Version,
		&user.Permissions,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperr.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	user.Password = users.PasswordFromHash(passwordHash)
	return &user, nil
}

func userWriteError(err error) error {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return users.ErrDuplicateEmail
	}
	return err
}
