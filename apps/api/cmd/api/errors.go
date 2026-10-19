package main

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/users"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

func (app *application) logError(r *http.Request, err error) {
	app.logger.ErrorContext(
		r.Context(),
		"request failed",
		"err", err,
		"request_id", middleware.GetReqID(r.Context()),
		slog.Group(
			"request",
			"method", r.Method,
			"url", r.URL.String(),
		),
	)
}

func (app *application) errorResponse(w http.ResponseWriter, r *http.Request, status int, message any) {
	env := envelope{"error": message}

	err := app.writeJSON(w, status, env, nil)
	if err != nil {
		w.WriteHeader(500)
	}
}

func (app *application) serverErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.logError(r, err)

	message := "the server encountered a problem and could not process your request"
	app.errorResponse(w, r, http.StatusInternalServerError, message)
}

func (app *application) failedValidationResponse(w http.ResponseWriter, r *http.Request, errors map[string]string) {
	app.errorResponse(w, r, http.StatusUnprocessableEntity, errors)
}

func (app *application) badRequestResponse(w http.ResponseWriter, r *http.Request, err error) {
	app.errorResponse(w, r, http.StatusBadRequest, err.Error())
}

func (app *application) notFoundResponse(w http.ResponseWriter, r *http.Request) {
	message := "the requested resource could not be found"
	app.errorResponse(w, r, http.StatusNotFound, message)
}

func (app *application) editConflictResponse(w http.ResponseWriter, r *http.Request) {
	message := "unable to update the record due to an edit conflict, please try again"
	app.errorResponse(w, r, http.StatusConflict, message)
}

func (app *application) invalidCredentialResponse(w http.ResponseWriter, r *http.Request) {
	message := "invalid authentication credentials"
	app.errorResponse(w, r, http.StatusUnauthorized, message)
}

func (app *application) authenticationRequireResponse(w http.ResponseWriter, r *http.Request) {
	message := "you must be authenticated to access this resource"
	app.errorResponse(w, r, http.StatusUnauthorized, message)
}

func (app *application) notPermittedResponse(w http.ResponseWriter, r *http.Request) {
	message := "your user account doesn't have the necessary permissons to access this resource"
	app.errorResponse(w, r, http.StatusForbidden, message)
}

// useCaseErrorResponse writes the response for an error returned by a use case.
func (app *application) useCaseErrorResponse(w http.ResponseWriter, r *http.Request, err error) {
	var v *validator.Validator
	switch {
	case errors.As(err, &v):
		app.failedValidationResponse(w, r, v.Errors)
	case errors.Is(err, apperr.ErrNotFound):
		app.notFoundResponse(w, r)
	case errors.Is(err, apperr.ErrEditConflict):
		app.editConflictResponse(w, r)
	case errors.Is(err, users.ErrInvalidCredentials):
		app.invalidCredentialResponse(w, r)
	default:
		app.serverErrorResponse(w, r, err)
	}
}
