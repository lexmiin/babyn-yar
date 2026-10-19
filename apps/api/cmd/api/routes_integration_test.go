package main

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProtectedRoutesRequirePermission(t *testing.T) {
	testAPI := newAPITest(t)
	publisherClient, _ := createAuthenticatedUser(t, testAPI, "Route Publisher", "route-publisher@example.com", "publisher")

	routes := []struct {
		method    string
		path      string
		adminOnly bool
	}{
		{http.MethodPost, "/v1/publications", false},
		{http.MethodPost, "/v1/publications/1/translations", false},
		{http.MethodPatch, "/v1/publications/1/translations/uk", false},
		{http.MethodDelete, "/v1/publications/1/translations/uk", false},
		{http.MethodGet, "/v1/assets", false},
		{http.MethodPost, "/v1/assets", false},
		{http.MethodDelete, "/v1/assets", false},
		{http.MethodPost, "/v1/gallery", false},
		{http.MethodDelete, "/v1/gallery/1", false},
		{http.MethodGet, "/v1/users/me", false},
		{http.MethodPatch, "/v1/users", false},
		{http.MethodPost, "/v1/users/register", true},
		{http.MethodGet, "/v1/users", true},
		{http.MethodPatch, "/v1/users/1", true},
		{http.MethodPatch, "/v1/users/1/password", true},
		{http.MethodDelete, "/v1/users/1", true},
	}
	for _, route := range routes {
		t.Run(route.method+" "+route.path, func(t *testing.T) {
			status := func(client *http.Client) int {
				response := publicationJSONRequest(t, client, route.method, testAPI.server.URL+route.path, nil)
				response.Body.Close()
				return response.StatusCode
			}

			assert.Equal(t, http.StatusUnauthorized, status(http.DefaultClient))
			if route.adminOnly {
				assert.Equal(t, http.StatusForbidden, status(publisherClient))
			} else {
				// The request has no body, so any status other than an
				// authorization failure means the publisher got through.
				assert.NotContains(t, []int{http.StatusUnauthorized, http.StatusForbidden}, status(publisherClient))
			}
		})
	}
}
