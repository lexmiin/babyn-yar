package users

import (
	"context"
	"maps"
	"sync"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/stretchr/testify/require"
)

const testPassword = "password123"

// testPasswordHash is computed once because bcrypt is deliberately slow.
var testPasswordHash = sync.OnceValue(func() []byte {
	var password Password
	if err := password.Set(testPassword); err != nil {
		panic(err)
	}
	return password.Hash()
})

// fakeStore is an in-memory database. fakeUnitOfWork runs each unit of work on
// a copy and keeps it only when the unit of work succeeds.
type fakeStore struct {
	users  map[int64]User
	roles  map[int64]Role
	nextID int64
}

func newFakeStore() *fakeStore {
	return &fakeStore{users: map[int64]User{}, roles: map[int64]Role{}}
}

func (s *fakeStore) clone() *fakeStore {
	return &fakeStore{users: maps.Clone(s.users), roles: maps.Clone(s.roles), nextID: s.nextID}
}

func (s *fakeStore) add(t *testing.T, fullName, email string, role Role) int64 {
	t.Helper()
	s.nextID++
	s.users[s.nextID] = User{
		ID:       s.nextID,
		FullName: fullName,
		Email:    email,
		Password: PasswordFromHash(testPasswordHash()),
		Version:  1,
	}
	s.roles[s.nextID] = role
	return s.nextID
}

func (s *fakeStore) user(t *testing.T, id int64) User {
	t.Helper()
	user, ok := s.users[id]
	require.True(t, ok, "user %d should exist", id)
	return user
}

type fakeUnitOfWork struct {
	store *fakeStore
}

func (u fakeUnitOfWork) Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error {
	work := u.store.clone()
	if err := fn(ctx, Repositories{Users: fakeUsers{work}, Roster: fakeRoster{work}}); err != nil {
		return err
	}
	*u.store = *work
	return nil
}

type fakeUsers struct {
	store *fakeStore
}

func (r fakeUsers) Get(_ context.Context, id int64) (*User, error) {
	user, ok := r.store.users[id]
	if !ok {
		return nil, apperr.ErrNotFound
	}
	user.Permissions = Permissions{string(r.store.roles[id])}
	return &user, nil
}

func (r fakeUsers) GetByEmail(ctx context.Context, email string) (*User, error) {
	for id, user := range r.store.users {
		if user.Email == email {
			return r.Get(ctx, id)
		}
	}
	return nil, apperr.ErrNotFound
}

func (r fakeUsers) Insert(_ context.Context, user *User) error {
	if r.emailTaken(user.Email, 0) {
		return ErrDuplicateEmail
	}
	r.store.nextID++
	user.ID = r.store.nextID
	user.Version = 1
	r.store.users[user.ID] = *user
	return nil
}

func (r fakeUsers) Update(_ context.Context, user *User) error {
	stored, ok := r.store.users[user.ID]
	if !ok || stored.Version != user.Version {
		return apperr.ErrEditConflict
	}
	if r.emailTaken(user.Email, user.ID) {
		return ErrDuplicateEmail
	}
	user.Version++
	r.store.users[user.ID] = *user
	return nil
}

func (r fakeUsers) Delete(_ context.Context, id int64) error {
	if _, ok := r.store.users[id]; !ok {
		return apperr.ErrNotFound
	}
	delete(r.store.users, id)
	return nil
}

func (r fakeUsers) emailTaken(email string, exceptID int64) bool {
	for id, user := range r.store.users {
		if id != exceptID && user.Email == email {
			return true
		}
	}
	return false
}

type fakeRoster struct {
	store *fakeStore
}

func (r fakeRoster) Load(context.Context) (*Roster, error) {
	var adminIDs []int64
	for id, role := range r.store.roles {
		if role == Admin {
			adminIDs = append(adminIDs, id)
		}
	}
	return NewRoster(adminIDs...), nil
}

func (r fakeRoster) Save(_ context.Context, ros *Roster) error {
	for _, event := range ros.PullEvents() {
		switch event := event.(type) {
		case RoleAssigned:
			r.store.roles[event.UserID] = event.Role
		case UserRemoved:
			delete(r.store.roles, event.UserID)
		}
	}
	return nil
}
