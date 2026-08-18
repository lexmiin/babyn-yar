package data

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"time"
	"unicode/utf8"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/validator"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrDuplicateEmail = errors.New("duplicate email")
	ErrLastAdmin      = errors.New("at least one admin must remain")
	AnonymousUser     = &User{}
)

type User struct {
	ID          int64       `json:"id"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	FullName    string      `json:"fullName"`
	Email       string      `json:"email"`
	Password    password    `json:"-"`
	Version     int         `json:"-"`
	Permissions Permissions `json:"permissions"`
}

type password struct {
	plaintext *string
	hash      []byte
}

type UserModel struct {
	DB *pgxpool.Pool
}

func (u *User) IsAnonymous() bool {
	return u == AnonymousUser
}

func (p *password) Set(plaintextPassword string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(plaintextPassword), 12)
	if err != nil {
		return err
	}

	p.plaintext = &plaintextPassword
	p.hash = hash

	return nil
}

func (p *password) Matches(plaintextPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(p.hash, []byte(plaintextPassword))
	if err != nil {
		switch {
		case errors.Is(err, bcrypt.ErrMismatchedHashAndPassword):
			return false, nil
		default:
			return false, err
		}
	}
	return true, nil
}

func SeedInitialUser(db *pgxpool.Pool, fullName, email, password string) error {
	user := &User{
		FullName: fullName,
		Email:    email,
	}

	err := user.Password.Set(password)
	if err != nil {
		return err
	}

	query := `
		INSERT INTO users (full_name, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at`

	args := []any{user.FullName, user.Email, user.Password.hash}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err = db.QueryRow(ctx, query, args...).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				return ErrDuplicateEmail
			default:
				return err
			}
		}
		return err
	}

	query = `
		INSERT INTO users_permissions
		SELECT $1, permissions.id FROM permissions WHERE permissions.name = ANY($2)`

	ctx, cancel = context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err = db.Exec(ctx, query, user.ID, []string{"admin"})
	if err != nil {
		return err
	}

	return nil
}

func ValidateEmail(v *validator.Validator, email string) {
	v.Check(email != "", "email", "must be provided")
	address, err := mail.ParseAddress(email)
	v.Check(err == nil && address.Address == email, "email", "must be a valid email address")
}

func ValidatePasswordPlaintext(v *validator.Validator, password string) {
	v.Check(password != "", "password", "must be provided")
	v.Check(len(password) >= 8, "password", "must be at least 8 characters long")
	v.Check(len(password) <= 72, "password", "must not be more than 72 characters long")
	v.Check(isPrintableASCII(password), "password", "must contain only printable ASCII characters")
}

func isPrintableASCII(value string) bool {
	for _, character := range []byte(value) {
		if character < 0x20 || character > 0x7e {
			return false
		}
	}
	return true
}

func ValidateUser(v *validator.Validator, user *User) {
	v.Check(utf8.RuneCountInString(user.FullName) >= 3, "fullName", "must be at least 3 characters long")
	v.Check(len(user.FullName) <= 500, "fullName", "must not be more than 500 bytes long")

	ValidateEmail(v, user.Email)

	if user.Password.plaintext != nil {
		ValidatePasswordPlaintext(v, *user.Password.plaintext)
	}

	if user.Password.hash == nil {
		panic("missing password hash for user")
	}
}

func (m UserModel) Insert(user *User) error {
	query := `
		INSERT INTO users (full_name, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at`

	args := []any{user.FullName, user.Email, user.Password.hash}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRow(ctx, query, args...).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				return ErrDuplicateEmail
			default:
				return err
			}
		}
		return err
	}

	return nil
}

func (m UserModel) GetByEmail(email string) (*User, error) {
	query := `
		SELECT u.id, u.created_at, u.updated_at, u.full_name, u.email, u.password_hash, u.version, array_agg(p.name) as permissions
		FROM users u
		INNER JOIN users_permissions up ON u.id = up.user_id
		INNER JOIN permissions p ON up.permission_id = p.id
		WHERE u.email = $1
		GROUP BY u.id`

	var user User

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.FullName,
		&user.Email,
		&user.Password.hash,
		&user.Version,
		&user.Permissions,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &user, nil
}

func (m UserModel) GetByID(id int64) (*User, error) {
	if id < 1 {
		return nil, ErrRecordNotFound
	}

	query := `
		SELECT u.id, u.created_at, u.updated_at, u.full_name, u.email, u.password_hash, u.version, array_agg(p.name) as permissions
		FROM users u
		INNER JOIN users_permissions up ON u.id = up.user_id
		INNER JOIN permissions p ON up.permission_id = p.id
		WHERE u.id = $1
		GROUP BY u.id`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var user User
	err := m.DB.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.FullName,
		&user.Email,
		&user.Password.hash,
		&user.Version,
		&user.Permissions,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &user, nil
}

func (m UserModel) GetAll(filters Filters) ([]*User, Metadata, error) {
	query := fmt.Sprintf(`
		SELECT count(*) OVER(), u.id, u.created_at, u.updated_at, u.full_name, u.email, array_agg(p.name) as permissions
		FROM users u
		INNER JOIN users_permissions up ON u.id = up.user_id
		INNER JOIN permissions p ON up.permission_id = p.id
		GROUP BY u.id
		ORDER BY %s %s, id ASC
		LIMIT $1 OFFSET $2`, filters.sortColumn(), filters.sortDirection())

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	args := []any{filters.limit(), filters.offset()}

	rows, err := m.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, Metadata{}, err
	}

	totalRecords := 0
	users, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*User, error) {
		var user User
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
		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return users, metadata, nil
}

func (m UserModel) Update(user *User) error {
	query := `
		UPDATE users
		SET full_name = $1, email = $2, password_hash = $3, updated_at = now(), version = version + 1
		WHERE id = $4 AND version = $5
		RETURNING version`

	args := []any{
		user.FullName,
		user.Email,
		user.Password.hash,
		user.ID,
		user.Version,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	err := m.DB.QueryRow(ctx, query, args...).Scan(&user.Version)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrDuplicateEmail
		}

		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return ErrEditConflict
		default:
			return err
		}
	}
	return nil
}

func (m UserModel) UpdatePassword(userID int64, plaintextPassword string) error {
	var password password
	err := password.Set(plaintextPassword)
	if err != nil {
		return err
	}

	query := `
		UPDATE users
		SET password_hash = $1, updated_at = now(), version = version + 1
		WHERE id = $2`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := m.DB.Exec(ctx, query, password.hash, userID)
	if err != nil {
		return err
	}
	if result.RowsAffected() == 0 {
		return ErrRecordNotFound
	}

	return nil
}

func (m UserModel) UpdateByAdmin(user *User, permission *string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var adminPermissionID int64
	if permission != nil {
		// Role-removing mutations lock the same row so concurrent requests cannot
		// both observe an admin and then remove the last two administrators.
		err = tx.QueryRow(ctx, `SELECT id FROM permissions WHERE name = 'admin' FOR UPDATE`).Scan(&adminPermissionID)
		if err != nil {
			return err
		}
	}

	err = tx.QueryRow(ctx, `
		UPDATE users
		SET full_name = $1, email = $2, updated_at = now(), version = version + 1
		WHERE id = $3 AND version = $4
		RETURNING updated_at, version`, user.FullName, user.Email, user.ID, user.Version).Scan(&user.UpdatedAt, &user.Version)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrDuplicateEmail
		}
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrEditConflict
		}
		return err
	}

	if permission != nil {
		if *permission != "admin" {
			var remainingAdmins int
			err = tx.QueryRow(ctx, `
				SELECT count(*)
				FROM users_permissions
				WHERE permission_id = $1 AND user_id <> $2`, adminPermissionID, user.ID).Scan(&remainingAdmins)
			if err != nil {
				return err
			}
			if remainingAdmins < 1 {
				return ErrLastAdmin
			}
		}

		_, err = tx.Exec(ctx, `DELETE FROM users_permissions WHERE user_id = $1`, user.ID)
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `
			INSERT INTO users_permissions (user_id, permission_id)
			SELECT $1, id FROM permissions WHERE name = $2`, user.ID, *permission)
		if err != nil {
			return err
		}
		user.Permissions = Permissions{*permission}
	}

	if err = tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

func (m UserModel) Delete(id int64) error {
	if id < 1 {
		return ErrRecordNotFound
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	var adminPermissionID int64
	err = tx.QueryRow(ctx, `SELECT id FROM permissions WHERE name = 'admin' FOR UPDATE`).Scan(&adminPermissionID)
	if err != nil {
		return err
	}

	var remainingAdmins int
	err = tx.QueryRow(ctx, `
		SELECT count(*)
		FROM users_permissions
		WHERE permission_id = $1 AND user_id <> $2`, adminPermissionID, id).Scan(&remainingAdmins)
	if err != nil {
		return err
	}
	if remainingAdmins < 1 {
		return ErrLastAdmin
	}

	result, err := tx.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()

	if rowsAffected == 0 {
		return ErrRecordNotFound
	}

	return tx.Commit(ctx)
}
