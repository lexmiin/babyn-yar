// Package assets holds uploaded files and the rules for adding and removing
// them.
package assets

import (
	"errors"
	"io"
	"net/http"
	"time"
)

// Asset is an uploaded file. Its file name is for display; its contents are
// stored under Key.
type Asset struct {
	ID          int64     `json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	URL         string    `json:"url"`
	Filename    string    `json:"fileName"`
	ContentType string    `json:"contentType"`
	Key         string    `json:"-"`
}

// Status is where an asset is in its life. Only ready assets are visible; the
// others have a row whose stored object may or may not exist.
type Status string

const (
	// Pending assets are recorded but their objects may not be stored yet.
	Pending Status = "pending"
	Ready   Status = "ready"
	// Deleting assets are hidden and wait for their objects and rows to be
	// removed.
	Deleting Status = "deleting"
)

// StaleAfter is how long an asset can stay pending or deleting before the
// sweeper removes it. It must exceed any upload or deletion in progress, or
// the sweeper takes over work that is still running.
const StaleAfter = time.Hour

// File is a file to upload as an asset.
type File struct {
	Name    string
	Content io.ReadSeeker
}

// GalleryScope is the cache purge scope of the public gallery, which shows
// some image assets.
const GalleryScope = "gallery"

// detectContentType sniffs the content type from the start of content and
// rewinds it.
func detectContentType(content io.ReadSeeker) (string, error) {
	buffer := make([]byte, 512)
	n, err := io.ReadFull(content, buffer)
	if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrUnexpectedEOF) {
		return "", err
	}
	if _, err := content.Seek(0, io.SeekStart); err != nil {
		return "", err
	}
	return http.DetectContentType(buffer[:n]), nil
}
