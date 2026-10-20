package users

import "context"

type UserRepository interface {
	// Get returns apperr.ErrNotFound when the user does not exist.
	Get(ctx context.Context, id int64) (*User, error)
	// GetByEmail returns apperr.ErrNotFound when no user has the email.
	GetByEmail(ctx context.Context, email string) (*User, error)
	// Insert sets the user's ID, timestamps and version, and returns
	// ErrDuplicateEmail when the email is taken.
	Insert(ctx context.Context, user *User) error
	// Update saves the user's details and password, and advances the version.
	// It returns apperr.ErrEditConflict when the stored version differs from
	// user.Version, and ErrDuplicateEmail when the email is taken.
	Update(ctx context.Context, user *User) error
	// Delete marks the user deleted, hiding them from every other method while
	// their publications keep them as publisher. It returns apperr.ErrNotFound
	// when the user does not exist or is already deleted.
	Delete(ctx context.Context, id int64) error
}

type RosterRepository interface {
	// Load returns the current roster and holds every other Load until the
	// unit of work ends, so role changes apply one after another.
	Load(ctx context.Context) (*Roster, error)
	Save(ctx context.Context, r *Roster) error
}

// Repositories are bound to a single unit of work.
type Repositories struct {
	Users  UserRepository
	Roster RosterRepository
}

// UnitOfWork is for changes that must commit together, and for every use of
// the roster. A single read or a version-checked write can use a repository
// directly.
type UnitOfWork interface {
	// Do runs fn in one transaction. It commits when fn returns nil and rolls
	// back otherwise. Use only repos inside fn.
	Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error
}
