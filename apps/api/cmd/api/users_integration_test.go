package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"testing"
	"time"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/users"
	userspg "github.com/lex-unix/babyn-yar/internal/users/postgres"
	"github.com/lex-unix/babyn-yar/internal/validator"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestResetUserPasswordThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	adminClient, _ := authenticatedPublicationClient(
		t,
		testAPI,
		"Password Administrator",
		"password-admin@example.com",
	)
	targetClient, targetID := createAuthenticatedUser(
		t,
		testAPI,
		"Password Target",
		"password-target@example.com",
		"publisher",
	)
	resetURL := fmt.Sprintf("%s/v1/users/%d/password", testAPI.server.URL, targetID)

	t.Run("authentication is required", func(t *testing.T) {
		response := publicationJSONRequest(t, http.DefaultClient, http.MethodPatch, resetURL, map[string]string{
			"password": "new-password",
		})
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
	})

	t.Run("admin permission is required", func(t *testing.T) {
		response := publicationJSONRequest(t, targetClient, http.MethodPatch, resetURL, map[string]string{
			"password": "new-password",
		})
		defer response.Body.Close()
		assert.Equal(t, http.StatusForbidden, response.StatusCode)
	})

	t.Run("password must meet the shared policy", func(t *testing.T) {
		for _, password := range []string{"short", "пароль123"} {
			response := publicationJSONRequest(t, adminClient, http.MethodPatch, resetURL, map[string]string{
				"password": password,
			})
			assert.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
			response.Body.Close()
		}
	})

	t.Run("missing users return not found", func(t *testing.T) {
		response := publicationJSONRequest(
			t,
			adminClient,
			http.MethodPatch,
			testAPI.server.URL+"/v1/users/999999/password",
			map[string]string{"password": "new-password"},
		)
		defer response.Body.Close()
		assert.Equal(t, http.StatusNotFound, response.StatusCode)
	})

	t.Run("an admin can replace the password", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, resetURL, map[string]string{
			"password": "new-password",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			Message string `json:"message"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "password successfully reset", body.Message)

		assert.Equal(t, http.StatusUnauthorized, loginStatus(
			t,
			testAPI,
			"password-target@example.com",
			"password123",
		))
		assert.Equal(t, http.StatusOK, loginStatus(
			t,
			testAPI,
			"password-target@example.com",
			"new-password",
		))
	})

	t.Run("existing sessions remain authenticated", func(t *testing.T) {
		response := publicationJSONRequest(t, targetClient, http.MethodGet, testAPI.server.URL+"/v1/users/me", nil)
		defer response.Body.Close()
		assert.Equal(t, http.StatusOK, response.StatusCode)
	})
}

func TestAdminUpdateUserThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	adminClient, adminID := authenticatedPublicationClient(
		t,
		testAPI,
		"User Administrator",
		"user-admin@example.com",
	)
	publisherClient, publisherID := createAuthenticatedUser(
		t,
		testAPI,
		"Original Publisher",
		"original-publisher@example.com",
		"publisher",
	)
	updateURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, publisherID)

	t.Run("authentication is required", func(t *testing.T) {
		response := publicationJSONRequest(t, http.DefaultClient, http.MethodPatch, updateURL, map[string]any{
			"fullName": "Updated Publisher",
		})
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
	})

	t.Run("admin permission is required", func(t *testing.T) {
		response := publicationJSONRequest(t, publisherClient, http.MethodPatch, updateURL, map[string]any{
			"fullName": "Updated Publisher",
		})
		defer response.Body.Close()
		assert.Equal(t, http.StatusForbidden, response.StatusCode)
	})

	t.Run("an empty update preserves the user", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, updateURL, map[string]any{})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			User users.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "Original Publisher", body.User.FullName)
		assert.Equal(t, "original-publisher@example.com", body.User.Email)
		assert.Equal(t, users.Permissions{"publisher"}, body.User.Permissions)
	})

	t.Run("null fields are omitted and invalid values are rejected", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, updateURL, map[string]any{
			"fullName":   nil,
			"email":      "not-an-email",
			"permission": "owner",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

		var body struct {
			Error map[string]string `json:"error"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.NotContains(t, body.Error, "fullName")
		assert.Contains(t, body.Error, "email")
		assert.Contains(t, body.Error, "permission")
	})

	t.Run("missing users return not found", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, testAPI.server.URL+"/v1/users/999999", map[string]any{
			"fullName": "Missing User",
		})
		defer response.Body.Close()
		assert.Equal(t, http.StatusNotFound, response.StatusCode)
	})

	t.Run("partial updates preserve omitted fields", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, updateURL, map[string]any{
			"fullName": "Updated Publisher",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			User users.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "Updated Publisher", body.User.FullName)
		assert.Equal(t, "original-publisher@example.com", body.User.Email)
		assert.Equal(t, users.Permissions{"publisher"}, body.User.Permissions)
	})

	t.Run("all editable fields and the single role are replaced", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, updateURL, map[string]any{
			"fullName":   "Promoted Publisher",
			"email":      "promoted-publisher@example.com",
			"permission": "admin",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			User users.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "Promoted Publisher", body.User.FullName)
		assert.Equal(t, "promoted-publisher@example.com", body.User.Email)
		assert.Equal(t, users.Permissions{"admin"}, body.User.Permissions)
	})

	t.Run("the last admin cannot be demoted", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, updateURL, map[string]any{
			"permission": "admin",
		})
		response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		response = publicationJSONRequest(t, adminClient, http.MethodPatch, updateURL, map[string]any{
			"permission": "publisher",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		adminURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, adminID)
		response = publicationJSONRequest(t, adminClient, http.MethodPatch, adminURL, map[string]any{
			"permission": "publisher",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

		var body struct {
			Error map[string]string `json:"error"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Contains(t, body.Error, "permission")
	})

	t.Run("stale versions are rejected", func(t *testing.T) {
		user, err := userspg.Queries{DB: testAPI.db}.GetByID(t.Context(), publisherID)
		require.NoError(t, err)
		_, err = testAPI.db.Exec(t.Context(), `UPDATE users SET version = version + 1 WHERE id = $1`, publisherID)
		require.NoError(t, err)

		user.FullName = "Stale Update"
		err = userspg.NewUserRepository(testAPI.db).Update(t.Context(), user)
		assert.ErrorIs(t, err, apperr.ErrEditConflict)
	})
}

func TestDeleteUserPreservesAnAdmin(t *testing.T) {
	testAPI := newAPITest(t)
	adminClient, adminID := authenticatedPublicationClient(
		t,
		testAPI,
		"Delete Administrator",
		"delete-admin@example.com",
	)
	_, publisherID := createAuthenticatedUser(
		t,
		testAPI,
		"Delete Publisher",
		"delete-publisher@example.com",
		"publisher",
	)

	adminDeleteURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, adminID)
	response := publicationJSONRequest(t, adminClient, http.MethodDelete, adminDeleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

	queries := userspg.Queries{DB: testAPI.db}
	_, err := queries.GetByID(t.Context(), adminID)
	require.NoError(t, err)

	publisherDeleteURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, publisherID)
	response = publicationJSONRequest(t, adminClient, http.MethodDelete, publisherDeleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)

	_, err = queries.GetByID(t.Context(), publisherID)
	assert.ErrorIs(t, err, apperr.ErrNotFound)

	_, secondAdminID := createAuthenticatedUser(
		t,
		testAPI,
		"Remaining Administrator",
		"remaining-admin@example.com",
		"admin",
	)
	response = publicationJSONRequest(t, adminClient, http.MethodDelete, adminDeleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)

	_, err = queries.GetByID(t.Context(), adminID)
	assert.ErrorIs(t, err, apperr.ErrNotFound)
	_, err = queries.GetByID(t.Context(), secondAdminID)
	require.NoError(t, err)
}

func createAuthenticatedUser(
	t *testing.T,
	testAPI *apiTest,
	fullName string,
	email string,
	permission string,
) (*http.Client, int64) {
	t.Helper()
	user, err := testAPI.users.Register(t.Context(), users.RegisterUser{
		FullName: fullName,
		Email:    email,
		Password: "password123",
		Role:     permission,
	})
	require.NoError(t, err)

	jar, err := cookiejar.New(nil)
	require.NoError(t, err)
	client := &http.Client{Jar: jar}
	response := publicationJSONRequest(t, client, http.MethodPost, testAPI.server.URL+"/v1/users/login", map[string]string{
		"email": email, "password": "password123",
	})
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)
	return client, user.ID
}

func loginStatus(t *testing.T, testAPI *apiTest, email, password string) int {
	t.Helper()
	response := publicationJSONRequest(t, http.DefaultClient, http.MethodPost, testAPI.server.URL+"/v1/users/login", map[string]string{
		"email": email, "password": password,
	})
	defer response.Body.Close()
	return response.StatusCode
}

func TestRegisterUserThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	adminClient, _ := authenticatedPublicationClient(
		t,
		testAPI,
		"Register Administrator",
		"register-admin@example.com",
	)
	registerURL := testAPI.server.URL + "/v1/users/register"

	t.Run("unknown permissions are rejected without creating the user", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPost, registerURL, map[string]string{
			"fullName":   "Unknown Role",
			"email":      "unknown-role@example.com",
			"password":   "password123",
			"permission": "owner",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

		var body struct {
			Error map[string]string `json:"error"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Contains(t, body.Error, "permission")
		assert.Equal(t, http.StatusUnauthorized, loginStatus(t, testAPI, "unknown-role@example.com", "password123"))
	})

	t.Run("the user is created with the single role", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPost, registerURL, map[string]string{
			"fullName":   "New Publisher",
			"email":      "new-publisher@example.com",
			"password":   "password123",
			"permission": "publisher",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusCreated, response.StatusCode)

		var body struct {
			User users.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, users.Permissions{"publisher"}, body.User.Permissions)
		assert.Equal(t, http.StatusOK, loginStatus(t, testAPI, "new-publisher@example.com", "password123"))
	})
}

func TestConcurrentDemotionsPreserveAnAdmin(t *testing.T) {
	testAPI := newAPITest(t)
	_, firstAdminID := authenticatedPublicationClient(t, testAPI, "First Administrator", "first-admin@example.com")
	_, secondAdminID := createAuthenticatedUser(t, testAPI, "Second Administrator", "second-admin@example.com", "admin")

	// Demote the first admin in a transaction that stays open while the second
	// admin is demoted, so the second demotion runs before the first commits.
	tx, err := testAPI.db.Begin(t.Context())
	require.NoError(t, err)
	defer tx.Rollback(t.Context())
	_, err = tx.Exec(t.Context(), `SELECT id FROM permissions WHERE name = 'admin' FOR UPDATE`)
	require.NoError(t, err)
	_, err = tx.Exec(t.Context(), `
		UPDATE users_permissions
		SET permission_id = (SELECT id FROM permissions WHERE name = 'publisher')
		WHERE user_id = $1`, firstAdminID)
	require.NoError(t, err)

	demoted := make(chan error, 1)
	go func() {
		_, err := testAPI.users.AdminUpdate(context.Background(), users.AdminUpdateUser{
			UserID: secondAdminID,
			Role:   new(string(users.Publisher)),
		})
		demoted <- err
	}()

	// The second demotion either waits for the roster lock or, if nothing
	// serialises the two, finishes against the uncommitted state.
	var result error
	finished := false
	require.Eventually(t, func() bool {
		select {
		case result = <-demoted:
			finished = true
			return true
		default:
		}
		var waiting bool
		err := testAPI.db.QueryRow(t.Context(), `
			SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE wait_event_type = 'Lock')`).Scan(&waiting)
		return err == nil && waiting
	}, 5*time.Second, 10*time.Millisecond)

	require.NoError(t, tx.Commit(t.Context()))
	if !finished {
		result = <-demoted
	}
	var v *validator.Validator
	require.ErrorAs(t, result, &v)
	assert.Contains(t, v.Errors, "permission")

	var admins int
	require.NoError(t, testAPI.db.QueryRow(t.Context(), `
		SELECT count(*)
		FROM users_permissions up
		INNER JOIN permissions p ON p.id = up.permission_id
		WHERE p.name = 'admin'`).Scan(&admins))
	assert.Equal(t, 1, admins)
}
