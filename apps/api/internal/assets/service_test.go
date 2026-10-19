package assets

import (
	"io"
	"log/slog"
	"strings"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func newTestService(files *fakeFiles) (*Service, *fakeStore) {
	store := newFakeStore()
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	return NewService(fakeUnitOfWork{store: store}, files, logger), store
}

func file(name, content string) File {
	return File{Name: name, Content: strings.NewReader(content)}
}

func fieldErrors(t *testing.T, err error) map[string]string {
	t.Helper()
	var v *validator.Validator
	require.ErrorAs(t, err, &v)
	return v.Errors
}

func TestUpload(t *testing.T) {
	t.Run("files are stored and recorded with their sniffed content type", func(t *testing.T) {
		files := newFakeFiles()
		s, store := newTestService(files)
		uploaded, err := s.Upload(t.Context(), []File{file("a.png", "\x89PNG\r\n\x1a\n"), file("b.txt", "")})
		require.NoError(t, err)

		require.Len(t, uploaded, 2)
		assert.Equal(t, "image/png", uploaded[0].ContentType)
		assert.Equal(t, "text/plain; charset=utf-8", uploaded[1].ContentType)
		assert.Equal(t, "https://files.example.com/a.png", uploaded[0].URL)
		assert.Equal(t, uploaded[0].Filename, store.assets[uploaded[0].ID].Filename)
		assert.Equal(t, "\x89PNG\r\n\x1a\n", files.contents["a.png"], "content is uploaded from its start")
	})

	t.Run("taken or repeated names reject the batch before anything is stored", func(t *testing.T) {
		files := newFakeFiles("taken.png")
		s, store := newTestService(files)
		_, err := s.Upload(t.Context(), []File{file("new.png", "x"), file("taken.png", "x"), file("new.png", "y")})

		errs := fieldErrors(t, err)
		assert.Equal(t, "already exists", errs["taken.png"])
		assert.Equal(t, "is repeated", errs["new.png"])
		assert.Equal(t, []string{"taken.png"}, files.names())
		assert.Empty(t, store.assets)
	})

	t.Run("an empty batch is invalid", func(t *testing.T) {
		s, _ := newTestService(newFakeFiles())
		_, err := s.Upload(t.Context(), nil)
		assert.Contains(t, fieldErrors(t, err), "assets")
	})

	t.Run("a failed upload removes the files already stored", func(t *testing.T) {
		files := newFakeFiles()
		files.failUpload = "b.png"
		s, store := newTestService(files)
		_, err := s.Upload(t.Context(), []File{file("a.png", "x"), file("b.png", "x")})

		assert.ErrorIs(t, err, errFake)
		assert.Empty(t, files.names())
		assert.Empty(t, store.assets)
	})

	t.Run("a failed insert records nothing and removes the stored files", func(t *testing.T) {
		files := newFakeFiles()
		s, store := newTestService(files)
		store.failInsert = true
		_, err := s.Upload(t.Context(), []File{file("a.png", "x"), file("b.png", "x")})

		assert.ErrorIs(t, err, errFake)
		assert.Empty(t, files.names())
		assert.Empty(t, store.assets)
	})
}

func TestDelete(t *testing.T) {
	t.Run("existing assets and their files are removed and unknown ids ignored", func(t *testing.T) {
		files := newFakeFiles("a.png", "b.png", "c.png")
		s, store := newTestService(files)
		a, b := store.add("a.png"), store.add("b.png")
		c := store.add("c.png")

		require.NoError(t, s.Delete(t.Context(), []int64{a, b, 99}))
		assert.Equal(t, []string{"c.png"}, files.names())
		assert.Contains(t, store.assets, c)
		assert.Len(t, store.assets, 1)
		assert.Empty(t, store.purges, "nothing in the gallery changed")
	})

	t.Run("deleting a gallery image purges the gallery", func(t *testing.T) {
		s, store := newTestService(newFakeFiles("a.png", "b.png"))
		a, b := store.add("a.png"), store.add("b.png")
		store.gallery[b] = true

		require.NoError(t, s.Delete(t.Context(), []int64{a, b}))
		assert.Equal(t, []string{GalleryScope}, store.purges)
	})

	t.Run("no existing assets is not found and touches no files", func(t *testing.T) {
		files := newFakeFiles("a.png")
		s, _ := newTestService(files)

		assert.ErrorIs(t, s.Delete(t.Context(), []int64{99}), apperr.ErrNotFound)
		assert.Equal(t, []string{"a.png"}, files.names())
	})

	t.Run("no ids is invalid", func(t *testing.T) {
		s, _ := newTestService(newFakeFiles())
		assert.Contains(t, fieldErrors(t, s.Delete(t.Context(), nil)), "ids")
	})

	t.Run("a failed file deletion still deletes the assets", func(t *testing.T) {
		files := newFakeFiles("a.png")
		files.failDelete = true
		s, store := newTestService(files)
		a := store.add("a.png")

		require.NoError(t, s.Delete(t.Context(), []int64{a}))
		assert.Empty(t, store.assets)
	})
}
