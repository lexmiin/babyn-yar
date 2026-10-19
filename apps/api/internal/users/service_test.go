package users

import (
	"testing"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestService() (*Service, *fakeStore) {
	store := newFakeStore()
	return NewService(fakeUnitOfWork{store: store}, fakeUsers{store}), store
}

func fieldErrors(t *testing.T, err error) map[string]string {
	t.Helper()
	var v *validator.Validator
	require.ErrorAs(t, err, &v)
	return v.Errors
}

func TestRegister(t *testing.T) {
	t.Run("unknown roles are rejected without storing the user", func(t *testing.T) {
		s, store := newTestService()
		_, err := s.Register(t.Context(), RegisterUser{
			FullName: "Unknown Role", Email: "unknown@example.com", Password: testPassword, Role: "owner",
		})
		assert.Contains(t, fieldErrors(t, err), "permission")
		assert.Empty(t, store.users)
	})

	t.Run("a taken email is a field error", func(t *testing.T) {
		s, store := newTestService()
		store.add(t, "Existing User", "taken@example.com", Admin)
		_, err := s.Register(t.Context(), RegisterUser{
			FullName: "Second User", Email: "taken@example.com", Password: testPassword, Role: "publisher",
		})
		assert.Equal(t, map[string]string{"email": "a user with this email already exists"}, fieldErrors(t, err))
		assert.Len(t, store.users, 1)
	})

	t.Run("the user gets the single role", func(t *testing.T) {
		s, store := newTestService()
		user, err := s.Register(t.Context(), RegisterUser{
			FullName: "New Publisher", Email: "new@example.com", Password: testPassword, Role: "publisher",
		})
		require.NoError(t, err)
		assert.Equal(t, Permissions{"publisher"}, user.Permissions)
		assert.Equal(t, Publisher, store.roles[user.ID])
	})
}

func TestAuthenticate(t *testing.T) {
	s, store := newTestService()
	id := store.add(t, "Signed In", "signed-in@example.com", Publisher)

	user, err := s.Authenticate(t.Context(), "signed-in@example.com", testPassword)
	require.NoError(t, err)
	assert.Equal(t, id, user.ID)

	_, err = s.Authenticate(t.Context(), "signed-in@example.com", "wrong-password")
	assert.ErrorIs(t, err, ErrInvalidCredentials)
	_, err = s.Authenticate(t.Context(), "nobody@example.com", testPassword)
	assert.ErrorIs(t, err, ErrInvalidCredentials)
}

func TestUpdateProfile(t *testing.T) {
	s, store := newTestService()
	id := store.add(t, "Original Name", "original@example.com", Publisher)
	store.add(t, "Other User", "other@example.com", Admin)

	_, err := s.UpdateProfile(t.Context(), UpdateProfile{UserID: id, Email: new("other@example.com")})
	assert.Contains(t, fieldErrors(t, err), "email")

	user, err := s.UpdateProfile(t.Context(), UpdateProfile{UserID: id, FullName: new("Updated Name")})
	require.NoError(t, err)
	assert.Equal(t, "Updated Name", user.FullName)
	assert.Equal(t, "original@example.com", store.user(t, id).Email)
}

func TestAdminUpdate(t *testing.T) {
	t.Run("the last admin cannot be demoted and nothing changes", func(t *testing.T) {
		s, store := newTestService()
		adminID := store.add(t, "Only Admin", "admin@example.com", Admin)

		_, err := s.AdminUpdate(t.Context(), AdminUpdateUser{
			UserID: adminID, FullName: new("Renamed Admin"), Role: new("publisher"),
		})
		assert.Equal(t, map[string]string{"permission": "at least one administrator must remain"}, fieldErrors(t, err))
		assert.Equal(t, "Only Admin", store.user(t, adminID).FullName)
		assert.Equal(t, Admin, store.roles[adminID])
	})

	t.Run("invalid details and roles are reported together", func(t *testing.T) {
		s, store := newTestService()
		id := store.add(t, "Publisher", "publisher@example.com", Publisher)

		_, err := s.AdminUpdate(t.Context(), AdminUpdateUser{
			UserID: id, Email: new("not-an-email"), Role: new("owner"),
		})
		errs := fieldErrors(t, err)
		assert.Contains(t, errs, "email")
		assert.Contains(t, errs, "permission")
	})

	t.Run("a second admin can be demoted", func(t *testing.T) {
		s, store := newTestService()
		store.add(t, "First Admin", "first@example.com", Admin)
		secondID := store.add(t, "Second Admin", "second@example.com", Admin)

		user, err := s.AdminUpdate(t.Context(), AdminUpdateUser{UserID: secondID, Role: new("publisher")})
		require.NoError(t, err)
		assert.Equal(t, Permissions{"publisher"}, user.Permissions)
		assert.Equal(t, Publisher, store.roles[secondID])
	})

	t.Run("missing users are not found", func(t *testing.T) {
		s, _ := newTestService()
		_, err := s.AdminUpdate(t.Context(), AdminUpdateUser{UserID: 99, FullName: new("Missing User")})
		assert.ErrorIs(t, err, apperr.ErrNotFound)
	})
}

func TestResetPassword(t *testing.T) {
	s, store := newTestService()
	id := store.add(t, "Forgetful User", "forgetful@example.com", Publisher)

	assert.Contains(t, fieldErrors(t, s.ResetPassword(t.Context(), id, "short")), "password")
	assert.ErrorIs(t, s.ResetPassword(t.Context(), 99, "new-password"), apperr.ErrNotFound)

	require.NoError(t, s.ResetPassword(t.Context(), id, "new-password"))
	_, err := s.Authenticate(t.Context(), "forgetful@example.com", "new-password")
	assert.NoError(t, err)
}

func TestDelete(t *testing.T) {
	s, store := newTestService()
	firstID := store.add(t, "First Admin", "first@example.com", Admin)
	publisherID := store.add(t, "Publisher", "publisher@example.com", Publisher)

	assert.Equal(t, map[string]string{"id": "at least one administrator must remain"}, fieldErrors(t, s.Delete(t.Context(), firstID)))
	store.user(t, firstID)

	require.NoError(t, s.Delete(t.Context(), publisherID))
	assert.NotContains(t, store.users, publisherID)
	assert.NotContains(t, store.roles, publisherID)

	assert.ErrorIs(t, s.Delete(t.Context(), 99), apperr.ErrNotFound)
}
