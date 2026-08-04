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
