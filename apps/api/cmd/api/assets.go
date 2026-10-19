package main

import (
	"net/http"

	"github.com/lex-unix/babyn-yar/internal/assets"
	assetspg "github.com/lex-unix/babyn-yar/internal/assets/postgres"
	"github.com/lex-unix/babyn-yar/internal/pagination"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

// assetUploadMemory is how much of an upload is held in memory; the rest
// goes to temporary files.
const assetUploadMemory = 512

func (app *application) createAssetsHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(assetUploadMemory); err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	headers := r.MultipartForm.File["assets"]
	files := make([]assets.File, 0, len(headers))
	for _, header := range headers {
		content, err := header.Open()
		if err != nil {
			app.serverErrorResponse(w, r, err)
			return
		}
		defer content.Close()
		files = append(files, assets.File{Name: header.Filename, Content: content})
	}

	uploaded, err := app.assets.Upload(r.Context(), files)
	if err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusCreated, envelope{"assets": uploaded}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) listAssetsHandler(w http.ResponseWriter, r *http.Request) {
	var input struct {
		assetspg.ListFilter
		pagination.Filters
	}

	v := validator.New()
	qs := r.URL.Query()

	input.Filename = app.readString(qs, "filename", "")
	input.ContentType = app.readString(qs, "content_type", "")
	input.Filters.Page = app.readInt(qs, "page", 1, v)
	input.Filters.PageSize = app.readInt(qs, "page_size", 10, v)
	input.Filters.Sort = app.readString(qs, "sort", "-created_at")
	input.Filters.SortSafelist = []string{"created_at", "file_name", "-created_at", "-file_name"}

	pagination.Validate(v, input.Filters)
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	list, metadata, err := app.assetQueries.List(r.Context(), input.ListFilter, input.Filters)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"assets": list, "metadata": metadata}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) deleteAssetsHandler(w http.ResponseWriter, r *http.Request) {
	v := validator.New()
	ids := app.readIntList(r.URL.Query(), "ids", v)
	if !v.Valid() {
		app.failedValidationResponse(w, r, v.Errors)
		return
	}

	if err := app.assets.Delete(r.Context(), ids); err != nil {
		app.useCaseErrorResponse(w, r, err)
		return
	}

	if err := app.writeJSON(w, http.StatusOK, envelope{"message": "assets successfully deleted"}, nil); err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
