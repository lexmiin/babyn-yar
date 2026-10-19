// Package apperr holds the errors every feature reports the same way.
package apperr

import "errors"

var (
	ErrNotFound     = errors.New("record not found")
	ErrEditConflict = errors.New("edit conflict")
)
