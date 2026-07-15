package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/lex-unix/babyn-yar/internal/data"
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

func (input publicationTranslationInput) fields() data.PublicationTranslationFields {
	return data.PublicationTranslationFields{
		Title:       input.Title,
		Description: input.Description,
		Content:     input.Content,
		Cover:       input.Cover,
		Documents:   input.Documents,
	}
}

func (app *application) listPublicationsHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Kind          string
		Locale        string
		MissingLocale string
		Title         string
		data.Filters
	}

	v := validator.New()
	qs := r.URL.Query()

	input.Kind = app.readString(qs, "kind", "")
	input.Locale = app.readString(qs, "locale", "")
	input.MissingLocale = app.readString(qs, "missing_locale", "")
	input.Title = app.readString(qs, "title", "")
	input.Filters.Page = app.readInt(qs, "page", 1, v)
	input.Filters.PageSize = app.readInt(qs, "page_size", 10, v)
	input.Filters.Sort = app.readString(qs, "sort", "-created_at")
	input.Filters.SortSafelist = []string{"created_at", "-created_at", "occurred_on", "-occurred_on"}

	if input.Kind != "" {
		data.ValidatePublicationKind(v, input.Kind)
	}

	if input.Locale != "" {
		data.ValidatePublicationLocale(v, input.Locale)
	}

	if input.MissingLocale != "" {
		data.ValidatePublicationLocale(v, input.MissingLocale)
	}

	data.ValidateFilters(v, input.Filters)
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	publications, metadata, err := app.models.Publications.GetAll(input.Kind, input.Locale, input.MissingLocale, input.Title, input.Filters)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"publications": publications, "metadata": metadata}, nil); err != nil {
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

	v := validator.New()
	data.ValidatePublicationKind(v, input.Kind)
	data.ValidatePublicationLocale(v, input.Locale)
	data.ValidatePublicationTranslation(v, input.OccurredOn, input.fields())
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	publication, err := app.models.Publications.Create(data.CreatePublicationInput{
		Kind:                         input.Kind,
		Locale:                       input.Locale,
		OccurredOn:                   input.OccurredOn,
		PublicationTranslationFields: input.fields(),
	}, app.contextGetUser(r).ID)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	headers := make(http.Header)
	headers.Set("Location", fmt.Sprintf("/v1/publications/%d?kind=%s&locale=%s", publication.ID, publication.Kind, publication.Locale))
	if err := app.writeJSON(w, http.StatusCreated, envelope{"publication": publication}, headers); err != nil {
		app.serverErrorResponse(w, r, err)
	}
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

	v := validator.New()
	data.ValidatePublicationLocale(v, input.Locale)
	data.ValidatePublicationTranslation(v, input.OccurredOn, input.fields())
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	publication, err := app.models.Publications.AddTranslation(id, expectedVersion, data.AddPublicationTranslationInput{
		Locale:                       input.Locale,
		OccurredOn:                   input.OccurredOn,
		PublicationTranslationFields: input.fields(),
	}, app.contextGetUser(r).ID)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.notFoundResponse(w, r)
		case errors.Is(err, data.ErrEditConflict):
			app.editConflictResponse(w, r)
		case errors.Is(err, data.ErrDuplicatePublicationLocale):
			v.AddError("locale", "publication already has this locale")
			app.failedValidationResponse(w, r, v.Errors)
		default:
			app.serverErrorResponse(w, r, err)
		}
		return
	}

	headers := make(http.Header)
	headers.Set("Location", fmt.Sprintf("/v1/publications/%d?kind=%s&locale=%s", publication.ID, publication.Kind, publication.Locale))
	if err := app.writeJSON(w, http.StatusCreated, envelope{"publication": publication}, headers); err != nil {
		app.serverErrorResponse(w, r, err)
	}
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

	v := validator.New()

	data.ValidatePublicationLocale(v, locale)
	data.ValidatePublicationTranslation(v, input.OccurredOn, input.fields())
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	publication, err := app.models.Publications.UpdateTranslation(id, locale, expectedVersion, data.UpdatePublicationTranslationInput{
		OccurredOn: input.OccurredOn, PublicationTranslationFields: input.fields(),
	})
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.notFoundResponse(w, r)
		case errors.Is(err, data.ErrEditConflict):
			app.editConflictResponse(w, r)
		default:
			app.serverErrorResponse(w, r, err)
		}
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"publication": publication}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) deletePublicationTranslationHandler(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIDParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	locale := chi.URLParam(r, "locale")

	v := validator.New()
	if data.ValidatePublicationLocale(v, locale); !v.Valid() {
		app.notFoundResponse(w, r)
		return
	}

	if err := app.models.Publications.DeleteTranslation(id, locale); err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			app.notFoundResponse(w, r)
		} else {
			app.serverErrorResponse(w, r, err)
		}
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
	kind := app.readString(qs, "kind", "")
	locale := app.readString(qs, "locale", "")

	v := validator.New()
	data.ValidatePublicationKind(v, kind)
	data.ValidatePublicationLocale(v, locale)
	if !v.Valid() {
		app.notFoundResponse(w, r)
		return
	}

	publication, err := app.models.Publications.GetByID(id)
	if err != nil {
		if errors.Is(err, data.ErrRecordNotFound) {
			app.notFoundResponse(w, r)
		} else {
			app.serverErrorResponse(w, r, err)
		}
		return
	}
	if publication.Kind != kind {
		app.notFoundResponse(w, r)
		return
	}
	publicationDetail, err := publication.Detail(locale)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"publication": publicationDetail}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
