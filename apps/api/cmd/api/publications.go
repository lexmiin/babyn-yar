package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/lex-unix/babyn-yar/internal/pagination"
	"github.com/lex-unix/babyn-yar/internal/publications"
	publicationspg "github.com/lex-unix/babyn-yar/internal/publications/postgres"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

const expectedVersionHeader = "X-Expected-Version"

type publicationTranslationInput struct {
	Title       string          `json:"title"`
	Description string          `json:"description"`
	Content     json.RawMessage `json:"content"`
	Cover       string          `json:"cover"`
	Documents   []string        `json:"documents"`
}

func readExpectedVersion(r *http.Request) (int32, error) {
	version, err := strconv.ParseInt(r.Header.Get(expectedVersionHeader), 10, 32)
	if err != nil || version < 1 {
		return 0, fmt.Errorf("%s header must be a positive integer", expectedVersionHeader)
	}
	return int32(version), nil
}

func (input publicationTranslationInput) fields() publications.TranslationFields {
	return publications.TranslationFields{
		Title:       input.Title,
		Description: input.Description,
		Content:     input.Content,
		Cover:       input.Cover,
		Documents:   input.Documents,
	}
}

func (app *application) listPublicationsHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		publicationspg.ListFilter
		pagination.Filters
	}

	v := validator.New()
	qs := r.URL.Query()

	input.Kind = publications.Kind(app.readString(qs, "kind", ""))
	input.Locale = publications.Locale(app.readString(qs, "locale", ""))
	input.MissingLocale = publications.Locale(app.readString(qs, "missing_locale", ""))
	input.Title = app.readString(qs, "title", "")
	input.Filters.Page = app.readInt(qs, "page", 1, v)
	input.Filters.PageSize = app.readInt(qs, "page_size", 10, v)
	input.Filters.Sort = app.readString(qs, "sort", "-created_at")
	input.Filters.SortSafelist = []string{"created_at", "-created_at", "occurred_on", "-occurred_on"}

	if input.Kind != "" {
		v.Check(input.Kind.Valid(), "kind", "must be supported publication kind")
	}

	if input.Locale != "" {
		v.Check(input.Locale.Valid(), "locale", "must be supported locale")
	}

	if input.MissingLocale != "" {
		v.Check(input.MissingLocale.Valid(), "locale", "must be supported locale")
	}

	pagination.Validate(v, input.Filters)
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	summaries, metadata, err := app.publicationQueries.List(r.Context(), input.ListFilter, input.Filters)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"publications": summaries, "metadata": metadata}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) createPublicationHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Kind       string    `json:"kind"`
		Locale     string    `json:"locale"`
		OccurredOn time.Time `json:"occurredOn"`
		publicationTranslationInput
	}
	if err := app.readJSON(w, r, &input); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	id, err := app.publications.Create(r.Context(), publications.CreatePublication{
		Kind:              input.Kind,
		Locale:            input.Locale,
		OccurredOn:        input.OccurredOn,
		PublisherID:       app.contextGetUser(r).ID,
		TranslationFields: input.fields(),
	})
	if err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}

	app.writePublicationResponse(w, r, http.StatusCreated, id, publications.Locale(input.Locale))
}

func (app *application) addPublicationTranslationHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	expectedVersion, err := readExpectedVersion(r)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	var input struct {
		Locale     string    `json:"locale"`
		OccurredOn time.Time `json:"occurredOn"`
		publicationTranslationInput
	}
	if err := app.readJSON(w, r, &input); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	err = app.publications.AddTranslation(r.Context(), publications.AddTranslation{
		PublicationID:     id,
		ExpectedVersion:   expectedVersion,
		Locale:            input.Locale,
		OccurredOn:        input.OccurredOn,
		PublisherID:       app.contextGetUser(r).ID,
		TranslationFields: input.fields(),
	})
	if err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}

	app.writePublicationResponse(w, r, http.StatusCreated, id, publications.Locale(input.Locale))
}

func (app *application) updatePublicationTranslationHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	expectedVersion, err := readExpectedVersion(r)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	var input struct {
		OccurredOn time.Time `json:"occurredOn"`
		publicationTranslationInput
	}

	if err := app.readJSON(w, r, &input); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	locale := chi.URLParam(r, "locale")

	err = app.publications.UpdateTranslation(r.Context(), publications.UpdateTranslation{
		PublicationID:     id,
		ExpectedVersion:   expectedVersion,
		Locale:            locale,
		OccurredOn:        input.OccurredOn,
		TranslationFields: input.fields(),
	})
	if err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}

	app.writePublicationResponse(w, r, http.StatusOK, id, publications.Locale(locale))
}

func (app *application) deletePublicationTranslationHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	if err := app.publications.RemoveTranslation(r.Context(), id, chi.URLParam(r, "locale")); err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"message": "publication translation successfully deleted"}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) showPublicationHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	qs := r.URL.Query()
	kind := publications.Kind(app.readString(qs, "kind", ""))
	locale := publications.Locale(app.readString(qs, "locale", ""))
	if !kind.Valid() || !locale.Valid() {
		app.notFoundResponse(w, r)
		return
	}

	detail, err := app.publicationQueries.Detail(r.Context(), id, locale)
	if err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}
	if detail.Kind != kind {
		app.notFoundResponse(w, r)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"publication": detail}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

// writePublicationResponse responds to a write with the translation as it now
// is. A created translation also gets its Location.
func (app *application) writePublicationResponse(w http.ResponseWriter, r *http.Request, status int, id int64, locale publications.Locale) {
	detail, err := app.publicationQueries.Detail(r.Context(), id, locale)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	headers := make(http.Header)
	if status == http.StatusCreated {
		headers.Set("Location", fmt.Sprintf("/v1/publications/%d?kind=%s&locale=%s", detail.ID, detail.Kind, detail.Locale))
	}
	if err := app.writeJSON(w, status, envelope{"publication": detail}, headers); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
