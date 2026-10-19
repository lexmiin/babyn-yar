package users

import (
	"context"
	"errors"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

var ErrInvalidCredentials = errors.New("invalid credentials")

// Service holds the write operations on users. Each one validates its command
// and reports field-level problems as a *validator.Validator error.
type Service struct {
	uow   UnitOfWork
	users UserRepository
}

// NewService takes users for operations that need no unit of work.
func NewService(uow UnitOfWork, users UserRepository) *Service {
	return &Service{uow: uow, users: users}
}

type RegisterUser struct {
	FullName string
	Email    string
	Password string
	Role     string
}

// Register creates a user with a single role.
func (s *Service) Register(ctx context.Context, cmd RegisterUser) (*User, error) {
	v := validator.New()
	ValidatePasswordPlaintext(v, cmd.Password)
	role := Role(cmd.Role)
	v.Check(role.Valid(), "permission", "must be admin or publisher")
	if err := v.Err(); err != nil {
		return nil, err
	}

	user := &User{FullName: cmd.FullName, Email: cmd.Email}
	// Hash before the unit of work so the roster stays locked only briefly.
	if err := user.Password.Set(cmd.Password); err != nil {
		return nil, err
	}
	if ValidateUser(v, user); !v.Valid() {
		return nil, v.Err()
	}

	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		r, err := repos.Roster.Load(ctx)
		if err != nil {
			return err
		}
		if err := repos.Users.Insert(ctx, user); err != nil {
			return err
		}
		if err := r.Assign(user.ID, role); err != nil {
			return err
		}
		return repos.Roster.Save(ctx, r)
	})
	if errors.Is(err, ErrDuplicateEmail) {
		v.AddError("email", "a user with this email already exists")
		return nil, v.Err()
	}
	if err != nil {
		return nil, err
	}

	user.Permissions = Permissions{string(role)}
	return user, nil
}

// Authenticate returns the user with the email when the password matches, and
// ErrInvalidCredentials otherwise.
func (s *Service) Authenticate(ctx context.Context, email, password string) (*User, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if errors.Is(err, apperr.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}

	match, err := user.Password.Matches(password)
	if err != nil {
		return nil, err
	}
	if !match {
		return nil, ErrInvalidCredentials
	}
	return user, nil
}

// UpdateProfile changes a user's own details. Nil fields are left unchanged.
type UpdateProfile struct {
	UserID   int64
	FullName *string
	Email    *string
	Password *string
}

func (s *Service) UpdateProfile(ctx context.Context, cmd UpdateProfile) (*User, error) {
	v := validator.New()
	var password *Password
	if cmd.Password != nil {
		if ValidatePasswordPlaintext(v, *cmd.Password); !v.Valid() {
			return nil, v.Err()
		}
		password = &Password{}
		if err := password.Set(*cmd.Password); err != nil {
			return nil, err
		}
	}

	user, err := s.users.Get(ctx, cmd.UserID)
	if err != nil {
		return nil, err
	}

	applyDetails(user, cmd.FullName, cmd.Email)
	if password != nil {
		user.Password = *password
	}
	if ValidateUser(v, user); !v.Valid() {
		return nil, v.Err()
	}

	// Update's version check rejects edits made since Get, so no unit of work
	// is needed.
	err = s.users.Update(ctx, user)
	if errors.Is(err, ErrDuplicateEmail) {
		v.AddError("email", "a user with this email already exists")
		return nil, v.Err()
	}
	if err != nil {
		return nil, err
	}
	return user, nil
}

// AdminUpdateUser changes another user's details and role. Nil fields are
// left unchanged.
type AdminUpdateUser struct {
	UserID   int64
	FullName *string
	Email    *string
	Role     *string
}

func (s *Service) AdminUpdate(ctx context.Context, cmd AdminUpdateUser) (*User, error) {
	v := validator.New()
	var role *Role
	if cmd.Role != nil {
		role = new(Role(*cmd.Role))
		v.Check(role.Valid(), "permission", "must be admin or publisher")
	}

	var user *User
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		var err error
		user, err = repos.Users.Get(ctx, cmd.UserID)
		if err != nil {
			return err
		}

		applyDetails(user, cmd.FullName, cmd.Email)
		if ValidateUser(v, user); !v.Valid() {
			return v.Err()
		}

		if role != nil {
			r, err := repos.Roster.Load(ctx)
			if err != nil {
				return err
			}
			if err := r.Assign(user.ID, *role); err != nil {
				return err
			}
			if err := repos.Roster.Save(ctx, r); err != nil {
				return err
			}
			user.Permissions = Permissions{string(*role)}
		}

		return repos.Users.Update(ctx, user)
	})
	switch {
	case errors.Is(err, ErrDuplicateEmail):
		v.AddError("email", "a user with this email already exists")
		return nil, v.Err()
	case errors.Is(err, ErrLastAdmin):
		v.AddError("permission", "at least one administrator must remain")
		return nil, v.Err()
	case err != nil:
		return nil, err
	}
	return user, nil
}

// ResetPassword replaces another user's password. Their existing sessions
// stay signed in.
func (s *Service) ResetPassword(ctx context.Context, userID int64, plaintext string) error {
	v := validator.New()
	if ValidatePasswordPlaintext(v, plaintext); !v.Valid() {
		return v.Err()
	}
	var password Password
	if err := password.Set(plaintext); err != nil {
		return err
	}

	user, err := s.users.Get(ctx, userID)
	if err != nil {
		return err
	}
	user.Password = password
	return s.users.Update(ctx, user)
}

// Delete removes a user unless they are the last administrator.
func (s *Service) Delete(ctx context.Context, userID int64) error {
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		r, err := repos.Roster.Load(ctx)
		if err != nil {
			return err
		}
		if err := r.Remove(userID); err != nil {
			return err
		}
		if err := repos.Roster.Save(ctx, r); err != nil {
			return err
		}
		return repos.Users.Delete(ctx, userID)
	})
	if errors.Is(err, ErrLastAdmin) {
		v := validator.New()
		v.AddError("id", "at least one administrator must remain")
		return v.Err()
	}
	return err
}

func applyDetails(user *User, fullName, email *string) {
	if fullName != nil {
		user.FullName = *fullName
	}
	if email != nil {
		user.Email = *email
	}
}
