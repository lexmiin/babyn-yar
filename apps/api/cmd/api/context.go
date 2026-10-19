package main

import (
	"context"
	"net/http"

	"github.com/lex-unix/babyn-yar/internal/users"
)

type contextKey string

const userContextKey = contextKey("user")

func (app *application) contextSetUser(r *http.Request, user *users.User) *http.Request {
	ctx := context.WithValue(r.Context(), userContextKey, user)
	return r.WithContext(ctx)
}

func (app *application) contextGetUser(r *http.Request) *users.User {
	user, ok := r.Context().Value(userContextKey).(*users.User)
	if !ok {
		panic("missing user value in request context")
	}

	return user
}
