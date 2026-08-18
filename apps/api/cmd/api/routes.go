package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (app *application) routes() http.Handler {
	router := chi.NewRouter()

	router.Use(app.enableCORS())
	router.Use(app.authenticate)

	router.Get("/v1/healthcheck", app.healthcheckHandler)

	// publications
	router.Get("/v1/publications", app.listPublicationsHandler)
	router.Get("/v1/publications/{id}", app.showPublicationHandler)
	router.Post("/v1/publications", app.requireAuthenticatedUser(app.createPublicationHandler))
	router.Post("/v1/publications/{id}/translations", app.requireAuthenticatedUser(app.addPublicationTranslationHandler))
	router.Patch("/v1/publications/{id}/translations/{locale}", app.requireAuthenticatedUser(app.updatePublicationTranslationHandler))
	router.Delete("/v1/publications/{id}/translations/{locale}", app.requireAuthenticatedUser(app.deletePublicationTranslationHandler))

	// victims
	router.Get("/v1/victims", app.listVictimsHandler)

	// assets
	router.Get("/v1/assets", app.requireAuthenticatedUser(app.listAssetsHandler))
	router.Post("/v1/assets", app.requireAuthenticatedUser(app.createAssetsHandler))
	router.Delete("/v1/assets", app.requireAuthenticatedUser(app.deleteAssetsHandler))

	// users
	router.Post("/v1/users/register", app.requirePermission("admin", app.registerUserHandler))
	router.Post("/v1/users/login", app.loginUserHandler)
	router.Get("/v1/users/me", app.requireAuthenticatedUser(app.meHandler))
	router.Get("/v1/users", app.requirePermission("admin", app.listUsersHandler))
	router.Patch("/v1/users", app.requireAuthenticatedUser(app.updateUserHandler))
	router.Patch("/v1/users/{id}", app.requirePermission("admin", app.adminUpdateUserHandler))
	router.Patch("/v1/users/{id}/password", app.requirePermission("admin", app.resetUserPasswordHandler))
	router.Delete("/v1/users/{id}", app.requirePermission("admin", app.deleteUserHandler))

	// gallery
	router.Get("/v1/gallery", app.listGalleryImagesHandler)
	router.Post("/v1/gallery", app.requireAuthenticatedUser(app.createGalleryImageHandler))
	router.Delete("/v1/gallery/{id}", app.requireAuthenticatedUser(app.deleteGalleryImageHandler))

	return router
}
