package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"testing"
	"time"

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

	models := data.NewModels(testAPI.db)
	_, err := models.Users.GetByID(adminID)
	require.NoError(t, err)

	publisherDeleteURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, publisherID)
	response = publicationJSONRequest(t, adminClient, http.MethodDelete, publisherDeleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)

	_, err = models.Users.GetByID(publisherID)
	assert.ErrorIs(t, err, data.ErrRecordNotFound)

	secondAdminClient, secondAdminID := createAuthenticatedUser(
		t,
		testAPI,
		"Remaining Administrator",
		"remaining-admin@example.com",
		"admin",
	)
	response = publicationJSONRequest(t, adminClient, http.MethodDelete, adminDeleteURL, nil)
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)

	_, err = models.Users.GetByID(adminID)
	assert.ErrorIs(t, err, data.ErrRecordNotFound)
	_, err = models.Users.GetByID(secondAdminID)
	require.NoError(t, err)

	// The deleted admin still has a historical role but cannot keep the last
	// active admin's deletion or demotion from being rejected.
	secondAdminURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, secondAdminID)
	response = publicationJSONRequest(t, secondAdminClient, http.MethodDelete, secondAdminURL, nil)
	response.Body.Close()
	require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
	response = publicationJSONRequest(t, secondAdminClient, http.MethodPatch, secondAdminURL, map[string]string{
		"permission": "publisher",
	})
	response.Body.Close()
	require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
	_, err = models.Users.GetByID(secondAdminID)
	require.NoError(t, err)
}

func TestSoftDeleteUserThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	adminClient, adminID := authenticatedPublicationClient(t, testAPI, "Active Administrator", "active-admin@example.com")
	deletedClient, deletedID := createAuthenticatedUser(t, testAPI, "Historical Publisher", "deleted-admin@example.com", "admin")
	models := data.NewModels(testAPI.db)
	staleUser, err := models.Users.GetByID(deletedID)
	require.NoError(t, err)
	publicationID := seedPublication(t, testAPI, deletedID, publicationSeed{
		kind: "event", occurredOn: "2024-07-01",
		translations: []publicationTranslationSeed{
			{locale: "uk", title: "Подія", createdAt: "2024-01-01T00:00:00Z", content: `{"type":"doc"}`, documents: []string{"https://example.com/uk.pdf"}},
			{locale: "en", title: "Event", createdAt: "2024-01-01T00:00:00Z", content: `{"type":"doc"}`, documents: []string{"https://example.com/en.pdf"}},
		},
	})
	userURL := fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, deletedID)
	response := publicationJSONRequest(t, adminClient, http.MethodDelete, userURL, nil)
	response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)

	t.Run("the user row and email remain reserved", func(t *testing.T) {
		var deletedAt time.Time
		var email string
		var version int
		err := testAPI.db.QueryRow(t.Context(), `SELECT deleted_at, email, version FROM users WHERE id = $1`, deletedID).Scan(&deletedAt, &email, &version)
		require.NoError(t, err)
		assert.False(t, deletedAt.IsZero())
		assert.Equal(t, staleUser.Email, email)
		assert.Equal(t, staleUser.Version+1, version)
	})

	t.Run("publications retain both translations and publisher attribution", func(t *testing.T) {
		response := publicationJSONRequest(t, http.DefaultClient, http.MethodGet, testAPI.server.URL+"/v1/publications?kind=event", nil)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)
		var list struct {
			Publications []data.PublicationSummary `json:"publications"`
			Metadata     data.Metadata             `json:"metadata"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&list))
		require.Len(t, list.Publications, 2)
		assert.Equal(t, 2, list.Metadata.TotalRecords)
		for _, publication := range list.Publications {
			assert.Equal(t, publicationID, publication.ID)
			assert.Equal(t, data.Publisher{ID: deletedID, FullName: staleUser.FullName}, publication.Publisher)
			url := fmt.Sprintf("%s/v1/publications/%d?kind=event&locale=%s", testAPI.server.URL, publicationID, publication.Locale)
			response := publicationJSONRequest(t, http.DefaultClient, http.MethodGet, url, nil)
			require.Equal(t, http.StatusOK, response.StatusCode)
			var detail struct {
				Publication data.PublicationDetail `json:"publication"`
			}
			require.NoError(t, json.NewDecoder(response.Body).Decode(&detail))
			response.Body.Close()
			assert.Equal(t, publication.Publisher, detail.Publication.Publisher)
			assert.JSONEq(t, `{"type":"doc"}`, string(detail.Publication.Content))
			assert.Equal(t, []string{"https://example.com/" + publication.Locale + ".pdf"}, detail.Publication.Documents)
		}
	})

	t.Run("lists and authentication exclude the deleted user", func(t *testing.T) {
		// Keep copies of the stale cookie to exercise recovery on public routes.
		sessionURL := *response.Request.URL
		sessionURL.Path = "/"
		staleCookies := deletedClient.Jar.Cookies(&sessionURL)
		require.NotEmpty(t, staleCookies)
		for _, request := range []publicationRequestSpec{
			{method: http.MethodGet, url: testAPI.server.URL + "/v1/publications?kind=event"},
			{method: http.MethodPost, url: testAPI.server.URL + "/v1/users/login", body: map[string]string{
				"email": "active-admin@example.com", "password": "password123",
			}},
		} {
			jar, err := cookiejar.New(nil)
			require.NoError(t, err)
			jar.SetCookies(&sessionURL, staleCookies)
			client := &http.Client{Jar: jar}
			response := publicationJSONRequest(t, client, request.method, request.url, request.body)
			assert.Equal(t, http.StatusOK, response.StatusCode)
			response.Body.Close()
			response = publicationJSONRequest(t, client, http.MethodGet, testAPI.server.URL+"/v1/users/me", nil)
			if request.method == http.MethodPost {
				assert.Equal(t, http.StatusOK, response.StatusCode)
			} else {
				assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
			}
			response.Body.Close()
		}

		response := publicationJSONRequest(t, adminClient, http.MethodGet, testAPI.server.URL+"/v1/users", nil)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)
		var list struct {
			Users    []data.User   `json:"users"`
			Metadata data.Metadata `json:"metadata"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&list))
		require.Len(t, list.Users, 1)
		assert.Equal(t, adminID, list.Users[0].ID)
		assert.Equal(t, 1, list.Metadata.TotalRecords)
		_, err := models.Users.GetByID(deletedID)
		assert.ErrorIs(t, err, data.ErrRecordNotFound)
		_, err = models.Users.GetByEmail(staleUser.Email)
		assert.ErrorIs(t, err, data.ErrRecordNotFound)
		permissions, err := models.Permissions.GetAllForUser(deletedID)
		require.NoError(t, err)
		assert.Empty(t, permissions)
		assert.Equal(t, http.StatusUnauthorized, loginStatus(t, testAPI, staleUser.Email, "password123"))
		response = publicationJSONRequest(t, deletedClient, http.MethodGet, testAPI.server.URL+"/v1/users/me", nil)
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
	})

	t.Run("deleted users cannot be modified or deleted again", func(t *testing.T) {
		for _, request := range []publicationRequestSpec{
			{method: http.MethodDelete, url: userURL},
			{method: http.MethodPatch, url: userURL, body: map[string]string{"fullName": "Changed Name"}},
			{method: http.MethodPatch, url: userURL + "/password", body: map[string]string{"password": "new-password"}},
			{method: http.MethodDelete, url: testAPI.server.URL + "/v1/users/999999"},
		} {
			response := publicationJSONRequest(t, adminClient, request.method, request.url, request.body)
			assert.Equal(t, http.StatusNotFound, response.StatusCode)
			response.Body.Close()
		}
		assert.ErrorIs(t, models.Users.Update(staleUser), data.ErrEditConflict)
		permission := "admin"
		assert.ErrorIs(t, models.Users.UpdateByAdmin(staleUser, &permission), data.ErrEditConflict)
		assert.ErrorIs(t, models.Users.UpdatePassword(deletedID, "new-password"), data.ErrRecordNotFound)
	})

	t.Run("reserved emails give a clear error on creation and updates", func(t *testing.T) {
		for _, request := range []publicationRequestSpec{
			{method: http.MethodPost, url: testAPI.server.URL + "/v1/users/register", body: map[string]string{
				"fullName": "Replacement User", "email": staleUser.Email, "password": "password123", "permission": "admin",
			}},
			{method: http.MethodPatch, url: testAPI.server.URL + "/v1/users", body: map[string]string{"email": staleUser.Email}},
			{method: http.MethodPatch, url: fmt.Sprintf("%s/v1/users/%d", testAPI.server.URL, adminID), body: map[string]string{
				"email": staleUser.Email, "permission": "publisher",
			}},
		} {
			response := publicationJSONRequest(t, adminClient, request.method, request.url, request.body)
			require.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
			var body struct {
				Error map[string]string `json:"error"`
			}
			require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
			response.Body.Close()
			assert.Equal(t, "This email belongs to a deactivated account.", body.Error["email"])
		}
		admin, err := models.Users.GetByID(adminID)
		require.NoError(t, err)
		assert.Equal(t, "active-admin@example.com", admin.Email)
		assert.Equal(t, data.Permissions{"admin"}, admin.Permissions)
	})
}

func TestConcurrentAdminRemovalPreservesAnActiveAdmin(t *testing.T) {
	for _, demote := range []bool{false, true} {
		t.Run(fmt.Sprintf("demote=%t", demote), func(t *testing.T) {
			testAPI := newAPITest(t)
			_, firstID := authenticatedPublicationClient(t, testAPI, "First Admin", "first-admin@example.com")
			_, secondID := authenticatedPublicationClient(t, testAPI, "Second Admin", "second-admin@example.com")
			models := data.NewModels(testAPI.db)
			secondUser, err := models.Users.GetByID(secondID)
			require.NoError(t, err)
			start := make(chan struct{})
			results := make(chan error, 2)
			go func() {
				<-start
				results <- models.Users.Delete(firstID)
			}()
			go func() {
				<-start
				if demote {
					permission := "publisher"
					results <- models.Users.UpdateByAdmin(secondUser, &permission)
				} else {
					results <- models.Users.Delete(secondID)
				}
			}()
			close(start)
			firstErr, secondErr := <-results, <-results
			if firstErr == nil {
				assert.ErrorIs(t, secondErr, data.ErrLastAdmin)
			} else {
				assert.ErrorIs(t, firstErr, data.ErrLastAdmin)
				assert.NoError(t, secondErr)
			}
			var activeAdmins int
			err = testAPI.db.QueryRow(t.Context(), `
				SELECT count(*) FROM users u
				JOIN users_permissions up ON up.user_id = u.id
				JOIN permissions p ON p.id = up.permission_id
				WHERE u.deleted_at IS NULL AND p.name = 'admin'`).Scan(&activeAdmins)
			require.NoError(t, err)
			assert.Equal(t, 1, activeAdmins)
		})
	}
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
