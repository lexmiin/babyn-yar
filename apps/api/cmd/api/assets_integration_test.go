package main

import (
	"context"
	"io"
	"log/slog"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/assets"
	assetspg "github.com/lex-unix/babyn-yar/internal/assets/postgres"
	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/lex-unix/babyn-yar/internal/pagination"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// memoryObjects stands in for object storage, which is not under test.
type memoryObjects map[string]bool

func (o memoryObjects) Upload(_ context.Context, key string, _ io.ReadSeeker, _, _ string) error {
	o[key] = true
	return nil
}

func (o memoryObjects) URL(key string) string { return "https://files.example.com/" + key }

func (o memoryObjects) Delete(_ context.Context, keys []string) error {
	for _, key := range keys {
		delete(o, key)
	}
	return nil
}

func TestAssetsOnPostgres(t *testing.T) {
	db := newTestDatabase(t)
	ctx := context.Background()
	objects := memoryObjects{}
	service := assets.NewService(assetspg.UnitOfWork{DB: db}, objects, slog.New(slog.NewTextHandler(io.Discard, nil)))
	queries := assetspg.Queries{DB: db}
	gallery := data.GalleryModel{DB: db}

	uploaded, err := service.Upload(ctx, []assets.File{
		{Name: "photo.png", Content: strings.NewReader("\x89PNG\r\n\x1a\n")},
		{Name: "notes.txt", Content: strings.NewReader("notes")},
		{Name: "photo.png", Content: strings.NewReader("\x89PNG\r\n\x1a\n")},
	})
	require.NoError(t, err)
	require.Len(t, uploaded, 3)
	photo, notes, galleryImage := uploaded[0], uploaded[1], uploaded[2]

	var pendingID int64
	err = db.QueryRow(ctx, `
		INSERT INTO assets (url, file_name, content_type, storage_key, status)
		VALUES ('https://files.example.com/pending', 'pending.png', 'image/png', 'pending', 'pending')
		RETURNING id
	`).Scan(&pendingID)
	require.NoError(t, err)
	objects["pending"] = true

	t.Run("list shows ready assets, filtered by content type and sorted by name", func(t *testing.T) {
		list, metadata, err := queries.List(ctx, assetspg.ListFilter{ContentType: "IMAGE"}, pagination.Filters{
			Page: 1, PageSize: 10, Sort: "file_name", SortSafelist: []string{"file_name"},
		})
		require.NoError(t, err)
		assert.Equal(t, 2, metadata.TotalRecords)
		require.Len(t, list, 2)
		assert.ElementsMatch(t, []int64{photo.ID, galleryImage.ID}, []int64{list[0].ID, list[1].ID})
	})

	t.Run("only ready assets join the gallery", func(t *testing.T) {
		err := gallery.Insert(&data.GalleryImage{ID: pendingID, URL: "https://files.example.com/pending"})
		assert.ErrorIs(t, err, data.ErrRecordNotFound)
		require.NoError(t, gallery.Insert(&data.GalleryImage{ID: galleryImage.ID, URL: galleryImage.URL}))
		_, err = db.Exec(ctx, `DELETE FROM cache_purge_requests`)
		require.NoError(t, err)
	})

	t.Run("deleting assets outside the gallery requests no purge", func(t *testing.T) {
		require.NoError(t, service.Delete(ctx, []int64{notes.ID}))
		assert.Zero(t, cachePurgeCount(t, db))
		assert.False(t, objects[notes.Key])
		assert.Equal(t, 0, assetRows(t, db, notes.ID))
	})

	t.Run("deleting a gallery image takes it out of the gallery and purges it", func(t *testing.T) {
		require.NoError(t, service.Delete(ctx, []int64{photo.ID, galleryImage.ID, pendingID}))

		images, err := gallery.GetAll()
		require.NoError(t, err)
		assert.Empty(t, images)
		var scope string
		require.NoError(t, db.QueryRow(ctx, `SELECT scope FROM cache_purge_requests`).Scan(&scope))
		assert.Equal(t, assets.GalleryScope, scope)
		assert.Equal(t, 0, assetRows(t, db, photo.ID, galleryImage.ID))
		assert.Equal(t, 1, assetRows(t, db, pendingID), "pending assets are not deleted on request")
	})

	t.Run("the sweeper removes assets only once they are stale", func(t *testing.T) {
		removed, err := service.Sweep(ctx, 10)
		require.NoError(t, err)
		assert.Zero(t, removed)

		_, err = db.Exec(ctx, `UPDATE assets SET status_changed_at = NOW() - interval '2 hours' WHERE id = $1`, pendingID)
		require.NoError(t, err)
		removed, err = service.Sweep(ctx, 10)
		require.NoError(t, err)
		assert.Equal(t, 1, removed)
		assert.Equal(t, 0, assetRows(t, db, pendingID))
		assert.False(t, objects["pending"])
	})
}

func assetRows(t *testing.T, db *pgxpool.Pool, ids ...int64) int {
	t.Helper()
	var count int
	err := db.QueryRow(context.Background(), `SELECT count(*) FROM assets WHERE id = ANY($1)`, ids).Scan(&count)
	require.NoError(t, err)
	return count
}
