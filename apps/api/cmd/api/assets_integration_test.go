package main

import (
	"context"
	"io"
	"log/slog"
	"strings"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/assets"
	assetspg "github.com/lex-unix/babyn-yar/internal/assets/postgres"
	"github.com/lex-unix/babyn-yar/internal/pagination"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// memoryFiles stands in for object storage, which is not under test.
type memoryFiles map[string]bool

func (f memoryFiles) Upload(_ io.ReadSeeker, name, _ string) (string, error) {
	f[name] = true
	return "https://files.example.com/" + name, nil
}

func (f memoryFiles) Exists(name string) (bool, error) { return f[name], nil }

func (f memoryFiles) Delete(names []string) error {
	for _, name := range names {
		delete(f, name)
	}
	return nil
}

func TestAssetsOnPostgres(t *testing.T) {
	db := newTestDatabase(t)
	ctx := context.Background()
	files := memoryFiles{}
	service := assets.NewService(assetspg.UnitOfWork{DB: db}, files, slog.New(slog.NewTextHandler(io.Discard, nil)))
	queries := assetspg.Queries{DB: db}

	uploaded, err := service.Upload(ctx, []assets.File{
		{Name: "photo.png", Content: strings.NewReader("\x89PNG\r\n\x1a\n")},
		{Name: "notes.txt", Content: strings.NewReader("notes")},
		{Name: "gallery.png", Content: strings.NewReader("\x89PNG\r\n\x1a\n")},
	})
	require.NoError(t, err)
	require.Len(t, uploaded, 3)
	for _, asset := range uploaded {
		assert.NotZero(t, asset.ID)
		assert.False(t, asset.CreatedAt.IsZero())
	}
	photo, notes, galleryImage := uploaded[0], uploaded[1], uploaded[2]

	t.Run("list filters by content type and sorts by file name", func(t *testing.T) {
		list, metadata, err := queries.List(ctx, assetspg.ListFilter{ContentType: "IMAGE"}, pagination.Filters{
			Page: 1, PageSize: 10, Sort: "file_name", SortSafelist: []string{"file_name"},
		})
		require.NoError(t, err)
		assert.Equal(t, 2, metadata.TotalRecords)
		require.Len(t, list, 2)
		assert.Equal(t, []string{"gallery.png", "photo.png"}, []string{list[0].Filename, list[1].Filename})
	})

	t.Run("deleting assets outside the gallery requests no purge", func(t *testing.T) {
		require.NoError(t, service.Delete(ctx, []int64{notes.ID}))
		assert.Zero(t, cachePurgeCount(t, db))
		assert.False(t, files["notes.txt"])
	})

	t.Run("deleting a gallery image removes it from the gallery and purges it", func(t *testing.T) {
		_, err := db.Exec(ctx, `INSERT INTO gallery_images (id, url) VALUES ($1, $2)`, galleryImage.ID, galleryImage.URL)
		require.NoError(t, err)

		require.NoError(t, service.Delete(ctx, []int64{photo.ID, galleryImage.ID}))

		var remaining, shown int
		require.NoError(t, db.QueryRow(ctx, `SELECT count(*) FROM assets`).Scan(&remaining))
		require.NoError(t, db.QueryRow(ctx, `SELECT count(*) FROM gallery_images`).Scan(&shown))
		assert.Zero(t, remaining)
		assert.Zero(t, shown)
		var scope string
		require.NoError(t, db.QueryRow(ctx, `SELECT scope FROM cache_purge_requests`).Scan(&scope))
		assert.Equal(t, assets.GalleryScope, scope)
	})
}
