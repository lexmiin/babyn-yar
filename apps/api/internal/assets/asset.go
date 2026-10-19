// Package assets holds uploaded files and the rules for adding and removing
// them.
package assets

import (
	"errors"
	"io"
	"net/http"
	"time"
)

// Asset is an uploaded file. Its file name is also its key in file storage.
type Asset struct {
	ID          int64     `json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	URL         string    `json:"url"`
	Filename    string    `json:"fileName"`
	ContentType string    `json:"contentType"`
}

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
