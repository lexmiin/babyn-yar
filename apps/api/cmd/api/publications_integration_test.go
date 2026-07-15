package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"maps"
	"net/http"
	"net/http/cookiejar"
	"sort"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestReadPublicationsThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	ctx := context.Background()

	var publisherID int64
	err := testAPI.db.QueryRow(ctx, `
		INSERT INTO users (full_name, email, password_hash)
		VALUES ('Publication Publisher', 'publications@example.com', '\\x00')
		RETURNING id
	`).Scan(&publisherID)
	require.NoError(t, err)

	multilingualEventID := seedPublication(t, testAPI, publisherID, publicationSeed{
		kind:       "event",
		occurredOn: "2024-01-10",
		translations: []publicationTranslationSeed{
			{locale: "uk", title: "Перша подія", createdAt: "2024-01-03T10:00:00Z", content: `{"type":"doc","content":[{"type":"paragraph"}]}`, documents: []string{"https://example.com/uk.pdf"}},
			{locale: "en", title: "First event", createdAt: "2024-01-04T10:00:00Z", content: `{"type":"doc","content":[{"type":"heading"}]}`, documents: []string{"https://example.com/en.pdf"}},
		},
	})
	laterOccurredEventID := seedPublication(t, testAPI, publisherID, publicationSeed{
		kind:       "event",
		occurredOn: "2024-02-20",
		translations: []publicationTranslationSeed{
			{locale: "uk", title: "Друга подія", createdAt: "2024-01-02T10:00:00Z", content: `{}`, documents: []string{}},
		},
	})
	ukrainianBookID := seedPublication(t, testAPI, publisherID, publicationSeed{
		kind:       "book",
		occurredOn: "2024-03-30",
		translations: []publicationTranslationSeed{
			{locale: "uk", title: "Перша книга", createdAt: "2024-01-01T10:00:00Z", content: `{}`, documents: []string{}},
		},
	})

	t.Run("collection returns the requested translation page without detail fields", func(t *testing.T) {
		response, err := http.Get(testAPI.server.URL + "/v1/publications?kind=event&locale=uk&title=%D0%BF%D0%BE%D0%B4%D1%96%D1%8F&sort=-occurred_on&page=1&page_size=1")
		require.NoError(t, err)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			Publications []struct {
				ID         int64           `json:"id"`
				Kind       string          `json:"kind"`
				Locale     string          `json:"locale"`
				Title      string          `json:"title"`
				CreatedAt  string          `json:"createdAt"`
				OccurredOn string          `json:"occurredOn"`
				Content    json.RawMessage `json:"content"`
				Documents  json.RawMessage `json:"documents"`
			} `json:"publications"`
			Metadata struct {
				CurrentPage  int `json:"currentPage"`
				PageSize     int `json:"pageSize"`
				TotalRecords int `json:"totalRecords"`
			} `json:"metadata"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		require.Len(t, body.Publications, 1)
		publication := body.Publications[0]
		assert.Equal(t, laterOccurredEventID, publication.ID)
		assert.Equal(t, "event", publication.Kind)
		assert.Equal(t, "uk", publication.Locale)
		assert.Equal(t, "Друга подія", publication.Title)
		assert.NotEmpty(t, publication.CreatedAt)
		assert.NotEmpty(t, publication.OccurredOn)
		assert.Empty(t, publication.Content, "collection rows must omit localized content")
		assert.Empty(t, publication.Documents, "collection rows must omit documents")
		assert.Equal(t, 1, body.Metadata.CurrentPage)
		assert.Equal(t, 1, body.Metadata.PageSize)
		assert.Equal(t, 2, body.Metadata.TotalRecords)
	})

	t.Run("creation sorting uses translation timestamps", func(t *testing.T) {
		response, err := http.Get(testAPI.server.URL + "/v1/publications?kind=event&locale=uk&sort=created_at&page_size=10")
		require.NoError(t, err)
		defer response.Body.Close()

		var body struct {
			Publications []struct {
				ID int64 `json:"id"`
			} `json:"publications"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		require.Len(t, body.Publications, 2)
		assert.Equal(t, laterOccurredEventID, body.Publications[0].ID)
		assert.Equal(t, multilingualEventID, body.Publications[1].ID)
	})

	t.Run("pagination totals count translation rows", func(t *testing.T) {
		response, err := http.Get(testAPI.server.URL + "/v1/publications?kind=event&page=1&page_size=2")
		require.NoError(t, err)
		defer response.Body.Close()

		var body struct {
			Publications []json.RawMessage `json:"publications"`
			Metadata     struct {
				LastPage     int `json:"lastPage"`
				TotalRecords int `json:"totalRecords"`
			} `json:"metadata"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Len(t, body.Publications, 2)
		assert.Equal(t, 2, body.Metadata.LastPage)
		assert.Equal(t, 3, body.Metadata.TotalRecords)
	})

	t.Run("detail returns localized JSON content and ordered documents", func(t *testing.T) {
		response, err := http.Get(fmt.Sprintf("%s/v1/publications/%d?kind=event&locale=en", testAPI.server.URL, multilingualEventID))
		require.NoError(t, err)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			Publication struct {
				ID        int64           `json:"id"`
				Kind      string          `json:"kind"`
				Locale    string          `json:"locale"`
				Title     string          `json:"title"`
				Content   json.RawMessage `json:"content"`
				Documents []string        `json:"documents"`
			} `json:"publication"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, multilingualEventID, body.Publication.ID)
		assert.Equal(t, "event", body.Publication.Kind)
		assert.Equal(t, "en", body.Publication.Locale)
		assert.Equal(t, "First event", body.Publication.Title)
		assert.JSONEq(t, `{"type":"doc","content":[{"type":"heading"}]}`, string(body.Publication.Content))
		assert.Equal(t, []string{"https://example.com/en.pdf"}, body.Publication.Documents)
	})

	for name, url := range map[string]string{
		"missing publication translation": fmt.Sprintf("%s/v1/publications/%d?kind=event&locale=en", testAPI.server.URL, laterOccurredEventID),
		"publication kind mismatch":       fmt.Sprintf("%s/v1/publications/%d?kind=event&locale=uk", testAPI.server.URL, ukrainianBookID),
	} {
		t.Run(name+" returns 404", func(t *testing.T) {
			response, err := http.Get(url)
			require.NoError(t, err)
			defer response.Body.Close()
			assert.Equal(t, http.StatusNotFound, response.StatusCode)
		})
	}
}

func TestWritePublicationsThroughHTTP(t *testing.T) {
	testAPI := newAPITest(t)
	publisherClient, publisherID := authenticatedPublicationClient(t, testAPI, "Original Publisher", "publisher@example.com")

	createCommand := publicationCommand{
		Kind:        "event",
		Locale:      "uk",
		OccurredOn:  "2024-04-01T00:00:00Z",
		Title:       "Нова подія",
		Description: "Опис",
		Content:     json.RawMessage(`{"type":"doc","content":[{"type":"paragraph"}]}`),
		Cover:       "https://example.com/cover.jpg",
		Documents:   []string{"https://example.com/first.pdf", "https://example.com/second.pdf"},
	}

	t.Run("writes require authentication", func(t *testing.T) {
		response := createPublicationRequest(t, testAPI, http.DefaultClient, createCommand)
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnauthorized, response.StatusCode)
	})

	t.Run("invalid initial creation leaves no empty publication", func(t *testing.T) {
		invalidCommand := createCommand
		invalidCommand.Title = ""
		response := createPublicationRequest(t, testAPI, publisherClient, invalidCommand)
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

		var count int
		require.NoError(t, testAPI.db.QueryRow(context.Background(), `SELECT count(*) FROM publications`).Scan(&count))
		assert.Zero(t, count)
	})

	t.Run("document values must be URLs", func(t *testing.T) {
		invalidCommand := createCommand
		invalidCommand.Documents = []string{"not a URL"}
		response := createPublicationRequest(t, testAPI, publisherClient, invalidCommand)
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)
	})

	var created publicationResponse
	t.Run("creates a publication with its initial translation", func(t *testing.T) {
		response := createPublicationRequest(t, testAPI, publisherClient, createCommand)
		defer response.Body.Close()
		require.Equal(t, http.StatusCreated, response.StatusCode)

		created = decodePublicationResponse(t, response)
		assert.Equal(t, "event", created.Kind)
		assert.Equal(t, "uk", created.Locale)
		assert.Equal(t, int32(1), created.PublicationVersion)
		assert.Equal(t, publisherID, created.Publisher.ID)
		assert.JSONEq(t, `{"type":"doc","content":[{"type":"paragraph"}]}`, string(created.Content))
		assert.Equal(t, []string{"https://example.com/first.pdf", "https://example.com/second.pdf"}, created.Documents)
	})

	differentKindID := seedPublication(t, testAPI, publisherID, publicationSeed{
		kind:       "book",
		occurredOn: "2024-05-01",
		translations: []publicationTranslationSeed{
			{locale: "uk", title: "Книга", createdAt: "2024-01-01T00:00:00Z", content: `{}`, documents: []string{}},
		},
	})
	eventWithEnglishID := seedPublication(t, testAPI, publisherID, publicationSeed{
		kind:       "event",
		occurredOn: "2024-05-02",
		translations: []publicationTranslationSeed{
			{locale: "en", title: "Already English", createdAt: "2024-01-01T00:00:00Z", content: `{}`, documents: []string{}},
		},
	})

	t.Run("selector query only returns same-kind publications missing the locale", func(t *testing.T) {
		response, err := http.Get(testAPI.server.URL + "/v1/publications?kind=event&missing_locale=en&page_size=50")
		require.NoError(t, err)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		var body struct {
			Publications []struct {
				ID int64 `json:"id"`
			} `json:"publications"`
		}
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		ids := make([]int64, 0, len(body.Publications))
		for _, publication := range body.Publications {
			ids = append(ids, publication.ID)
		}
		assert.Contains(t, ids, created.ID)
		assert.NotContains(t, ids, differentKindID)
		assert.NotContains(t, ids, eventWithEnglishID)
	})

	addCommand := publicationCommand{
		Locale:             "en",
		OccurredOn:         created.OccurredOn,
		PublicationVersion: created.PublicationVersion,
		Title:              "New event",
		Description:        "Description",
		Content:            json.RawMessage(`{"type":"doc","content":[]}`),
		Cover:              "https://example.com/en-cover.jpg",
		Documents:          []string{"https://example.com/en-1.pdf", "https://example.com/en-2.pdf"},
	}
	var english publicationResponse
	t.Run("adding a translation advances the aggregate version even when shared fields are unchanged", func(t *testing.T) {
		response := addPublicationTranslationRequest(t, testAPI, publisherClient, created.ID, addCommand)
		defer response.Body.Close()
		require.Equal(t, http.StatusCreated, response.StatusCode)

		english = decodePublicationResponse(t, response)
		assert.Equal(t, "en", english.Locale)
		assert.Equal(t, "2024-04-01", english.OccurredOn[:10])
		assert.Equal(t, int32(2), english.PublicationVersion)

		ukrainian := getPublication(t, testAPI, created.ID, "event", "uk")
		assert.Equal(t, "2024-04-01", ukrainian.OccurredOn[:10])
		assert.Equal(t, created.Title, ukrainian.Title)
		assert.Equal(t, created.Cover, ukrainian.Cover)
		assert.JSONEq(t, string(created.Content), string(ukrainian.Content))
		assert.Equal(t, created.Documents, ukrainian.Documents)
	})

	t.Run("duplicate locale rolls back the shared change", func(t *testing.T) {
		duplicateCommand := addCommand
		duplicateCommand.OccurredOn = "2024-04-03T00:00:00Z"
		duplicateCommand.PublicationVersion = english.PublicationVersion
		response := addPublicationTranslationRequest(t, testAPI, publisherClient, created.ID, duplicateCommand)
		defer response.Body.Close()
		assert.Equal(t, http.StatusUnprocessableEntity, response.StatusCode)

		current := getPublication(t, testAPI, created.ID, "event", "en")
		assert.Equal(t, "2024-04-01", current.OccurredOn[:10])
		assert.Equal(t, int32(2), current.PublicationVersion)
	})

	editorClient, editorID := authenticatedPublicationClient(t, testAPI, "Later Editor", "editor@example.com")
	assert.NotEqual(t, publisherID, editorID)

	localizedEditCommand := publicationCommand{
		OccurredOn:         english.OccurredOn,
		PublicationVersion: english.PublicationVersion,
		Title:              "Updated event",
		Description:        english.Description,
		Content:            english.Content,
		Cover:              english.Cover,
		Documents:          english.Documents,
	}
	var localizedEdit publicationResponse
	var translationUpdatedAfterLocalized string
	t.Run("update requires an expected version header", func(t *testing.T) {
		url := fmt.Sprintf("%s/v1/publications/%d/translations/en", testAPI.server.URL, created.ID)
		response := publicationJSONRequest(t, editorClient, http.MethodPatch, url, localizedEditCommand)
		defer response.Body.Close()
		assert.Equal(t, http.StatusBadRequest, response.StatusCode)
	})

	t.Run("localized edit advances the aggregate and translation versions", func(t *testing.T) {
		var publicationUpdatedBefore, translationUpdatedBefore string
		require.NoError(t, testAPI.db.QueryRow(context.Background(), `
			SELECT p.updated_at::text, pt.updated_at::text
			FROM publications p
			JOIN publication_translations pt ON pt.publication_id = p.id
			WHERE p.id = $1 AND pt.locale = 'en'
		`, created.ID).Scan(&publicationUpdatedBefore, &translationUpdatedBefore))

		response := updatePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "en", localizedEditCommand)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		localizedEdit = decodePublicationResponse(t, response)
		assert.Equal(t, int32(3), localizedEdit.PublicationVersion)
		assert.Equal(t, publisherID, localizedEdit.Publisher.ID, "later editors must not replace the original publisher")

		var publicationUpdatedAfter string
		require.NoError(t, testAPI.db.QueryRow(context.Background(), `
			SELECT p.updated_at::text, pt.updated_at::text
			FROM publications p
			JOIN publication_translations pt ON pt.publication_id = p.id
			WHERE p.id = $1 AND pt.locale = 'en'
		`, created.ID).Scan(&publicationUpdatedAfter, &translationUpdatedAfterLocalized))
		assert.NotEqual(t, publicationUpdatedBefore, publicationUpdatedAfter)
		assert.NotEqual(t, translationUpdatedBefore, translationUpdatedAfterLocalized)
	})

	sharedEditCommand := localizedEditCommand
	sharedEditCommand.OccurredOn = "2024-04-04T00:00:00Z"
	sharedEditCommand.PublicationVersion = localizedEdit.PublicationVersion
	sharedEditCommand.Title = localizedEdit.Title
	var sharedEdit publicationResponse
	t.Run("shared edit advances both versions despite unchanged localized fields", func(t *testing.T) {
		response := updatePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "en", sharedEditCommand)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		sharedEdit = decodePublicationResponse(t, response)
		assert.Equal(t, int32(4), sharedEdit.PublicationVersion)

		ukrainian := getPublication(t, testAPI, created.ID, "event", "uk")
		assert.Equal(t, "2024-04-04", ukrainian.OccurredOn[:10])
		assert.Equal(t, created.Title, ukrainian.Title)
		assert.Equal(t, created.Cover, ukrainian.Cover)
		assert.JSONEq(t, string(created.Content), string(ukrainian.Content))
		assert.Equal(t, created.Documents, ukrainian.Documents)

		var translationUpdatedAfterShared string
		require.NoError(t, testAPI.db.QueryRow(context.Background(), `
			SELECT updated_at::text FROM publication_translations WHERE publication_id = $1 AND locale = 'en'
		`, created.ID).Scan(&translationUpdatedAfterShared))
		assert.NotEqual(t, translationUpdatedAfterLocalized, translationUpdatedAfterShared)
	})

	combinedEditCommand := sharedEditCommand
	combinedEditCommand.OccurredOn = "2024-04-06T00:00:00Z"
	combinedEditCommand.PublicationVersion = sharedEdit.PublicationVersion
	combinedEditCommand.Title = "Combined update"
	var combinedEdit publicationResponse
	t.Run("combined edit advances both versions", func(t *testing.T) {
		response := updatePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "en", combinedEditCommand)
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		combinedEdit = decodePublicationResponse(t, response)
		assert.Equal(t, int32(5), combinedEdit.PublicationVersion)
	})

	t.Run("stale publication rejects the localized change", func(t *testing.T) {
		staleCommand := combinedEditCommand
		staleCommand.PublicationVersion = 4
		staleCommand.Title = "Must also roll back"
		response := updatePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "en", staleCommand)
		defer response.Body.Close()
		assert.Equal(t, http.StatusConflict, response.StatusCode)

		current := getPublication(t, testAPI, created.ID, "event", "en")
		assert.Equal(t, "Combined update", current.Title)
	})

	immutableFields := []struct {
		name   string
		mutate func(*publicationCommand)
	}{
		{name: "publication kind", mutate: func(command *publicationCommand) { command.Kind = "book" }},
		{name: "locale", mutate: func(command *publicationCommand) { command.Locale = "uk" }},
	}
	for _, testCase := range immutableFields {
		t.Run("edit rejects immutable "+testCase.name, func(t *testing.T) {
			command := combinedEditCommand
			command.PublicationVersion = combinedEdit.PublicationVersion
			testCase.mutate(&command)
			response := updatePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "en", command)
			defer response.Body.Close()
			assert.Equal(t, http.StatusBadRequest, response.StatusCode)
		})
	}

	t.Run("deleting one locale preserves the publication and deleting the final locale removes it", func(t *testing.T) {
		response := deletePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "en")
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)

		assert.True(t, publicationExists(t, testAPI, created.ID))
		remaining := getPublication(t, testAPI, created.ID, "event", "uk")
		assert.Equal(t, int32(6), remaining.PublicationVersion)

		response = deletePublicationTranslationRequest(t, testAPI, editorClient, created.ID, "uk")
		defer response.Body.Close()
		require.Equal(t, http.StatusOK, response.StatusCode)
		assert.False(t, publicationExists(t, testAPI, created.ID))
	})

	t.Run("competing edits serialize and reject one stale command", func(t *testing.T) {
		publicationID := seedPublication(t, testAPI, publisherID, publicationSeed{
			kind:       "event",
			occurredOn: "2024-06-01",
			translations: []publicationTranslationSeed{
				{locale: "uk", title: "Конкурентна подія", createdAt: "2024-01-01T00:00:00Z", content: `{}`, documents: []string{}},
			},
		})
		current := getPublication(t, testAPI, publicationID, "event", "uk")
		baseCommand := publicationCommand{
			OccurredOn:         current.OccurredOn,
			PublicationVersion: current.PublicationVersion,
			Description:        current.Description,
			Content:            current.Content,
			Cover:              current.Cover,
			Documents:          current.Documents,
		}
		firstCommand := baseCommand
		firstCommand.Title = "Перше редагування"
		secondCommand := baseCommand
		secondCommand.Title = "Друге редагування"
		url := fmt.Sprintf("%s/v1/publications/%d/translations/uk", testAPI.server.URL, publicationID)

		statuses := concurrentPublicationRequests(t, publisherClient,
			publicationRequestSpec{method: http.MethodPatch, url: url, expectedVersion: current.PublicationVersion, body: firstCommand},
			publicationRequestSpec{method: http.MethodPatch, url: url, expectedVersion: current.PublicationVersion, body: secondCommand},
		)
		assert.Equal(t, []int{http.StatusOK, http.StatusConflict}, statuses)

		current = getPublication(t, testAPI, publicationID, "event", "uk")
		assert.Contains(t, []string{"Перше редагування", "Друге редагування"}, current.Title)
	})

	t.Run("competing locale deletions both succeed", func(t *testing.T) {
		publicationID := seedPublication(t, testAPI, publisherID, publicationSeed{
			kind:       "event",
			occurredOn: "2024-07-01",
			translations: []publicationTranslationSeed{
				{locale: "uk", title: "Подія", createdAt: "2024-01-01T00:00:00Z", content: `{}`, documents: []string{}},
				{locale: "en", title: "Event", createdAt: "2024-01-01T00:00:00Z", content: `{}`, documents: []string{}},
			},
		})

		baseURL := fmt.Sprintf("%s/v1/publications/%d/translations", testAPI.server.URL, publicationID)
		statuses := concurrentPublicationRequests(t, publisherClient,
			publicationRequestSpec{method: http.MethodDelete, url: baseURL + "/uk"},
			publicationRequestSpec{method: http.MethodDelete, url: baseURL + "/en"},
		)
		assert.Equal(t, []int{http.StatusOK, http.StatusOK}, statuses)
		assert.False(t, publicationExists(t, testAPI, publicationID))
	})
}

func TestCreatePublicationAcceptsSupportedKinds(t *testing.T) {
	testAPI := newAPITest(t)
	client, _ := authenticatedPublicationClient(t, testAPI, "Publisher", "publisher-kinds@example.com")

	supportedKinds := []string{
		"event",
		"book",
		"holocaust_document",
		"victim_testimony",
		"media_article",
		"partner",
		"development_concept",
		"legal_document",
	}
	for _, kind := range supportedKinds {
		t.Run(kind, func(t *testing.T) {
			command := publicationCommand{
				Kind:        kind,
				Locale:      "uk",
				OccurredOn:  "2024-06-01T00:00:00Z",
				Title:       "Публікація",
				Description: "Опис",
				Content:     json.RawMessage(`{"type":"doc","content":[]}`),
				Cover:       "https://example.com/cover.jpg",
				Documents:   []string{},
			}
			response := createPublicationRequest(t, testAPI, client, command)
			defer response.Body.Close()
			require.Equal(t, http.StatusCreated, response.StatusCode)

			publication := decodePublicationResponse(t, response)
			assert.Equal(t, kind, publication.Kind)
		})
	}
}

type publicationResponse struct {
	ID                 int64           `json:"id"`
	Kind               string          `json:"kind"`
	Locale             string          `json:"locale"`
	OccurredOn         string          `json:"occurredOn"`
	Title              string          `json:"title"`
	Description        string          `json:"description"`
	Content            json.RawMessage `json:"content"`
	Cover              string          `json:"cover"`
	Documents          []string        `json:"documents"`
	PublicationVersion int32           `json:"publicationVersion"`
	Publisher          struct {
		ID int64 `json:"id"`
	} `json:"publisher"`
}

type publicationCommand struct {
	Kind               string          `json:"kind,omitempty"`
	Locale             string          `json:"locale,omitempty"`
	OccurredOn         string          `json:"occurredOn"`
	PublicationVersion int32           `json:"-"`
	Title              string          `json:"title"`
	Description        string          `json:"description"`
	Content            json.RawMessage `json:"content"`
	Cover              string          `json:"cover"`
	Documents          []string        `json:"documents"`
}

func createPublicationRequest(
	t *testing.T,
	testAPI *apiTest,
	client *http.Client,
	command publicationCommand,
) *http.Response {
	t.Helper()
	return publicationJSONRequest(t, client, http.MethodPost, testAPI.server.URL+"/v1/publications", command)
}

func addPublicationTranslationRequest(
	t *testing.T,
	testAPI *apiTest,
	client *http.Client,
	publicationID int64,
	command publicationCommand,
) *http.Response {
	t.Helper()
	url := fmt.Sprintf("%s/v1/publications/%d/translations", testAPI.server.URL, publicationID)
	return publicationVersionedJSONRequest(t, client, http.MethodPost, url, command.PublicationVersion, command)
}

func updatePublicationTranslationRequest(
	t *testing.T,
	testAPI *apiTest,
	client *http.Client,
	publicationID int64,
	locale string,
	command publicationCommand,
) *http.Response {
	t.Helper()
	url := fmt.Sprintf("%s/v1/publications/%d/translations/%s", testAPI.server.URL, publicationID, locale)
	return publicationVersionedJSONRequest(t, client, http.MethodPatch, url, command.PublicationVersion, command)
}

func deletePublicationTranslationRequest(
	t *testing.T,
	testAPI *apiTest,
	client *http.Client,
	publicationID int64,
	locale string,
) *http.Response {
	t.Helper()
	url := fmt.Sprintf("%s/v1/publications/%d/translations/%s", testAPI.server.URL, publicationID, locale)
	return publicationJSONRequest(t, client, http.MethodDelete, url, nil)
}

func authenticatedPublicationClient(t *testing.T, testAPI *apiTest, fullName, email string) (*http.Client, int64) {
	t.Helper()
	require.NoError(t, data.SeedInitialUser(testAPI.db, fullName, email, "password123"))

	var userID int64
	require.NoError(t, testAPI.db.QueryRow(context.Background(), `SELECT id FROM users WHERE email = $1`, email).Scan(&userID))
	jar, err := cookiejar.New(nil)
	require.NoError(t, err)
	client := &http.Client{Jar: jar}
	response := publicationJSONRequest(t, client, http.MethodPost, testAPI.server.URL+"/v1/users/login", map[string]any{
		"email": email, "password": "password123",
	})
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)
	return client, userID
}

func publicationJSONRequest(t *testing.T, client *http.Client, method, url string, body any) *http.Response {
	return publicationJSONRequestWithHeaders(t, client, method, url, nil, body)
}

func publicationVersionedJSONRequest(t *testing.T, client *http.Client, method, url string, expectedVersion int32, body any) *http.Response {
	return publicationJSONRequestWithHeaders(t, client, method, url, http.Header{
		expectedVersionHeader: []string{fmt.Sprint(expectedVersion)},
	}, body)
}

func publicationJSONRequestWithHeaders(t *testing.T, client *http.Client, method, url string, headers http.Header, body any) *http.Response {
	t.Helper()
	var encoded bytes.Buffer
	if body != nil {
		require.NoError(t, json.NewEncoder(&encoded).Encode(body))
	}
	request, err := http.NewRequest(method, url, &encoded)
	require.NoError(t, err)
	request.Header.Set("Content-Type", "application/json")
	maps.Copy(request.Header, headers)
	response, err := client.Do(request)
	require.NoError(t, err)
	return response
}

func decodePublicationResponse(t *testing.T, response *http.Response) publicationResponse {
	t.Helper()
	var body struct {
		Publication publicationResponse `json:"publication"`
	}
	require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
	return body.Publication
}

func getPublication(t *testing.T, testAPI *apiTest, id int64, kind, locale string) publicationResponse {
	t.Helper()
	response, err := http.Get(fmt.Sprintf("%s/v1/publications/%d?kind=%s&locale=%s", testAPI.server.URL, id, kind, locale))
	require.NoError(t, err)
	defer response.Body.Close()
	require.Equal(t, http.StatusOK, response.StatusCode)
	return decodePublicationResponse(t, response)
}

func publicationExists(t *testing.T, testAPI *apiTest, publicationID int64) bool {
	t.Helper()
	var exists bool
	err := testAPI.db.QueryRow(
		context.Background(),
		`SELECT EXISTS (SELECT 1 FROM publications WHERE id = $1)`,
		publicationID,
	).Scan(&exists)
	require.NoError(t, err)
	return exists
}

type publicationRequestSpec struct {
	method          string
	url             string
	expectedVersion int32
	body            any
}

func concurrentPublicationRequests(t *testing.T, client *http.Client, specs ...publicationRequestSpec) []int {
	t.Helper()
	requests := make([]*http.Request, 0, len(specs))
	for _, spec := range specs {
		var encoded bytes.Buffer
		if spec.body != nil {
			require.NoError(t, json.NewEncoder(&encoded).Encode(spec.body))
		}
		request, err := http.NewRequest(spec.method, spec.url, &encoded)
		require.NoError(t, err)
		request.Header.Set("Content-Type", "application/json")
		if spec.expectedVersion > 0 {
			request.Header.Set(expectedVersionHeader, fmt.Sprint(spec.expectedVersion))
		}
		requests = append(requests, request)
	}

	start := make(chan struct{})
	type result struct {
		status int
		err    error
	}
	results := make(chan result, len(requests))
	for _, request := range requests {
		go func() {
			<-start
			response, err := client.Do(request)
			if err != nil {
				results <- result{err: err}
				return
			}
			response.Body.Close()
			results <- result{status: response.StatusCode}
		}()
	}
	close(start)

	statuses := make([]int, 0, len(requests))
	for range requests {
		result := <-results
		require.NoError(t, result.err)
		statuses = append(statuses, result.status)
	}
	sort.Ints(statuses)
	return statuses
}

type publicationSeed struct {
	kind         string
	occurredOn   string
	translations []publicationTranslationSeed
}

type publicationTranslationSeed struct {
	locale    string
	title     string
	createdAt string
	content   string
	documents []string
}

func seedPublication(t *testing.T, testAPI *apiTest, publisherID int64, seed publicationSeed) int64 {
	t.Helper()
	ctx := context.Background()
	tx, err := testAPI.db.Begin(ctx)
	require.NoError(t, err)
	defer tx.Rollback(ctx)

	var publicationID int64
	err = tx.QueryRow(ctx, `
		INSERT INTO publications (kind, occurred_on)
		VALUES ($1, $2)
		RETURNING id
	`, seed.kind, seed.occurredOn).Scan(&publicationID)
	require.NoError(t, err)

	for _, translation := range seed.translations {
		_, err = tx.Exec(ctx, `
			INSERT INTO publication_translations (
				publication_id, locale, title, description, content, cover,
				documents, publisher_id, created_at, updated_at
			)
			VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $9)
		`, publicationID, translation.locale, translation.title, "Description for "+translation.title,
			translation.content, "https://example.com/cover.jpg", translation.documents, publisherID, translation.createdAt)
		require.NoError(t, err)
	}
	require.NoError(t, tx.Commit(ctx))

	return publicationID
}
