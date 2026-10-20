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

func TestUserWritesThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	adminClient, _ := authenticatedPublicationClient(t, testAPI, "User Administrator", "user-admin@example.com")
	userURL := func(id int64) string {
		return fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, id)
	}
	decodeUser := func(t *testing.T, response *http.Response) users.User {
		t.Helper()
		var body struct {
			User users.User `json:"user"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		return body.User
	}

	var publisher users.User
	t.Run("registering creates the user with the single role", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPost, testAPI.server.URL+"/v1/users/register", map[string]string{
			"fullName":   "New Publisher",
			"email":      "new-publisher@example.com",
			"password":   "password123",
			"permission": "publisher",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusCreated, response.StatusCode)

		publisher = decodeUser(t, response)
		assert.Equal(t, users.Permissions{"publisher"}, publisher.Permissions)
		assert.Equal(t, http.StatusOK, loginStatus(t, testAPI, "new-publisher@example.com", "password123"))
	})

	t.Run("an admin replaces the editable fields and the single role", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, userURL(publisher.ID), map[string]any{
			"fullName":   "Promoted Publisher",
			"email":      "promoted-publisher@example.com",
			"permission": "admin",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		updated := decodeUser(t, response)
		assert.Equal(t, "Promoted Publisher", updated.FullName)
		assert.Equal(t, "promoted-publisher@example.com", updated.Email)
		assert.Equal(t, users.Permissions{"admin"}, updated.Permissions)
	})

	t.Run("an admin can replace the password", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPatch, userURL(publisher.ID)+"/password", map[string]string{
			"password": "new-password",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		assert.Equal(t, http.StatusUnauthorized, loginStatus(t, testAPI, "promoted-publisher@example.com", "password123"))
		assert.Equal(t, http.StatusOK, loginStatus(t, testAPI, "promoted-publisher@example.com", "new-password"))
	})

	t.Run("stale versions are rejected", func(t *testing.T) {
		user, err := userspg.Queries{DB: testAPI.db}.GetByID(t.Context(), publisher.ID)
		require.NoError(t, err)
		_, err = testAPI.db.Exec(t.Context(), `UPDATE users SET version = version + 1 WHERE id = $1`, publisher.ID)
		require.NoError(t, err)

		user.FullName = "Stale Update"
		err = userspg.NewUserRepository(testAPI.db).Update(t.Context(), user)
		assert.ErrorIs(t, err, apperr.ErrEditConflict)
	})

	t.Run("deleting a user removes them and their role but keeps their publications", func(t *testing.T) {
		publicationID := seedPublication(t, testAPI, publisher.ID, publicationSeed{
			kind:       "event",
			occurredOn: "2024-04-01",
			translations: []publicationTranslationSeed{{
				locale:    "uk",
				title:     "Подія видавця",
				createdAt: "2024-04-01T00:00:00Z",
				content:   `{"type":"doc"}`,
				documents: []string{},
			}},
		})

		response := publicationJSONRequest(t, adminClient, http.MethodDelete, userURL(publisher.ID), nil)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		_, err := userspg.Queries{DB: testAPI.db}.GetByID(t.Context(), publisher.ID)
		assert.ErrorIs(t, err, apperr.ErrNotFound)
		var roles int
		require.NoError(t, testAPI.db.QueryRow(t.Context(), `
			SELECT count(*) FROM users_permissions WHERE user_id = $1`, publisher.ID).Scan(&roles))
		assert.Zero(t, roles)
		assert.Equal(t, http.StatusUnauthorized, loginStatus(t, testAPI, "promoted-publisher@example.com", "new-password"))

		published := getPublication(t, testAPI, publicationID, "event", "uk")
		assert.Equal(t, publisher.ID, published.Publisher.ID)
		assert.Equal(t, "Promoted Publisher", published.Publisher.FullName)
	})

	t.Run("a deleted user's email can be registered again", func(t *testing.T) {
		response := publicationJSONRequest(t, adminClient, http.MethodPost, testAPI.server.URL+"/v1/users/register", map[string]string{
			"fullName":   "Returning Publisher",
			"email":      "promoted-publisher@example.com",
			"password":   "password123",
			"permission": "publisher",
		})
		defer response.Body.Close()
		require.Equal(t, http.StatusCreated, response.StatusCode)
		assert.Equal(t, http.StatusOK, loginStatus(t, testAPI, "promoted-publisher@example.com", "password123"))
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
