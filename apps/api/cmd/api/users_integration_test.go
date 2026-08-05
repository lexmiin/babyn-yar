package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/data"
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
			User data.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "Original Publisher", body.User.FullName)
		assert.Equal(t, "original-publisher@example.com", body.User.Email)
		assert.Equal(t, data.Permissions{"publisher"}, body.User.Permissions)
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
			User data.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "Updated Publisher", body.User.FullName)
		assert.Equal(t, "original-publisher@example.com", body.User.Email)
		assert.Equal(t, data.Permissions{"publisher"}, body.User.Permissions)
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
			User data.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, "Promoted Publisher", body.User.FullName)
		assert.Equal(t, "promoted-publisher@example.com", body.User.Email)
		assert.Equal(t, data.Permissions{"admin"}, body.User.Permissions)
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
		models := data.NewModels(testAPI.db)
		user, err := models.Users.GetByID(publisherID)
		require.NoError(t, err)
		_, err = testAPI.db.Exec(t.Context(), `UPDATE users SET version = version + 1 WHERE id = $1`, publisherID)
		require.NoError(t, err)

		user.FullName = "Stale Update"
		err = models.Users.UpdateByAdmin(user, nil)
		assert.ErrorIs(t, err, data.ErrEditConflict)
	})
}

func TestDeleteUsersPreservesAnAdmin(t *testing.T) {
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

	deleteURL := fmt.Sprintf("%s/v1/users?ids=%d,%d", testAPI.server.URL, adminID, publisherID)
	response := publicationJSONRequest(t, adminClient, http.MethodDelete, deleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

	models := data.NewModels(testAPI.db)
	_, err := models.Users.GetByID(adminID)
	require.NoError(t, err)
	_, err = models.Users.GetByID(publisherID)
	require.NoError(t, err, "bulk deletion must be atomic")

	_, secondAdminID := createAuthenticatedUser(
		t,
		testAPI,
		"Remaining Administrator",
		"remaining-admin@example.com",
		"admin",
	)
	response = publicationJSONRequest(t, adminClient, http.MethodDelete, deleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)

	_, err = models.Users.GetByID(adminID)
	assert.ErrorIs(t, err, data.ErrRecordNotFound)
	_, err = models.Users.GetByID(publisherID)
	assert.ErrorIs(t, err, data.ErrRecordNotFound)
	_, err = models.Users.GetByID(secondAdminID)
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
	user := &data.User{FullName: fullName, Email: email}
	require.NoError(t, user.Password.Set("password123"))
	models := data.NewModels(testAPI.db)
	require.NoError(t, models.Users.Insert(user))
	require.NoError(t, models.Permissions.AddForUser(user.ID, permission))

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
