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

func newTestService(objects *fakeObjects) (*Service, *fakeStore) {
	store := newFakeStore()
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	return NewService(fakeUnitOfWork{store: store}, objects, logger), store
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
	t.Run("files are stored under new keys and become ready", func(t *testing.T) {
		objects := newFakeObjects()
		s, store := newTestService(objects)
		uploaded, err := s.Upload(t.Context(), []File{file("a.png", "\x89PNG\r\n\x1a\n"), file("a.png", "")})
		require.NoError(t, err)

		require.Len(t, uploaded, 2)
		first, second := uploaded[0], uploaded[1]
		assert.NotEqual(t, first.Key, second.Key, "repeated names get their own keys")
		assert.Equal(t, "image/png", first.ContentType)
		assert.Equal(t, "text/plain; charset=utf-8", second.ContentType)
		assert.Equal(t, "https://files.example.com/"+first.Key, first.URL)
		assert.Equal(t, "\x89PNG\r\n\x1a\n", objects.contents[first.Key], "content is uploaded from its start")
		assert.Equal(t, "a.png", objects.filenames[first.Key])
		assert.Equal(t, Ready, store.status[first.ID])
		assert.Equal(t, Ready, store.status[second.ID])
	})

	t.Run("an empty batch is invalid", func(t *testing.T) {
		s, _ := newTestService(newFakeObjects())
		_, err := s.Upload(t.Context(), nil)
		assert.Contains(t, fieldErrors(t, err), "assets")
	})

	t.Run("a failed upload removes the batch's objects and rows", func(t *testing.T) {
		objects := newFakeObjects()
		objects.failUpload = "b.png"
		s, store := newTestService(objects)
		_, err := s.Upload(t.Context(), []File{file("a.png", "x"), file("b.png", "x")})

		assert.ErrorIs(t, err, errFake)
		assert.Empty(t, objects.keys())
		assert.Empty(t, store.assets)
	})

	t.Run("a batch the sweeper claimed mid-upload is removed, not made ready", func(t *testing.T) {
		objects := newFakeObjects()
		s, store := newTestService(objects)
		objects.afterUpload = func(key string) {
			for id, asset := range store.assets {
				if asset.Key == key {
					store.status[id] = Deleting
				}
			}
		}
		_, err := s.Upload(t.Context(), []File{file("a.png", "x"), file("b.png", "x")})

		assert.ErrorIs(t, err, errSwept)
		assert.Empty(t, objects.keys())
		assert.Empty(t, store.assets)
	})

	t.Run("a failed cleanup leaves the batch hidden for the sweeper", func(t *testing.T) {
		objects := newFakeObjects()
		objects.failUpload = "b.png"
		objects.failDelete = true
		s, store := newTestService(objects)
		_, err := s.Upload(t.Context(), []File{file("a.png", "x"), file("b.png", "x")})

		assert.ErrorIs(t, err, errFake)
		require.Len(t, store.status, 2)
		for _, status := range store.status {
			assert.Equal(t, Deleting, status)
		}
	})

	t.Run("a batch that became ready despite an error keeps its objects", func(t *testing.T) {
		objects := newFakeObjects()
		s, store := newTestService(objects)
		store.loseReadyReply = true
		_, err := s.Upload(t.Context(), []File{file("a.png", "x"), file("b.png", "x")})

		assert.ErrorIs(t, err, errFake)
		assert.Len(t, objects.keys(), 2)
		require.Len(t, store.status, 2)
		for _, status := range store.status {
			assert.Equal(t, Ready, status)
		}
	})
}

func TestDelete(t *testing.T) {
	t.Run("ready assets lose their objects and rows; other ids are ignored", func(t *testing.T) {
		objects := newFakeObjects("a", "b", "c", "pending")
		s, store := newTestService(objects)
		a, b := store.add("a", Ready), store.add("b", Ready)
		store.add("c", Ready)
		pending := store.add("pending", Pending)

		require.NoError(t, s.Delete(t.Context(), []int64{a, b, pending, 99}))
		assert.Equal(t, []string{"c", "pending"}, objects.keys())
		assert.NotContains(t, store.assets, a)
		assert.NotContains(t, store.assets, b)
		assert.Equal(t, Pending, store.status[pending])
		assert.Empty(t, store.purges, "nothing in the gallery changed")
	})

	t.Run("deleting a gallery image takes it out of the gallery and purges it", func(t *testing.T) {
		s, store := newTestService(newFakeObjects("a", "b"))
		a, b := store.add("a", Ready), store.add("b", Ready)
		store.gallery[b] = true

		require.NoError(t, s.Delete(t.Context(), []int64{a, b}))
		assert.Empty(t, store.gallery)
		assert.Equal(t, []string{GalleryScope}, store.purges)
	})

	t.Run("no ready assets is not found and touches nothing", func(t *testing.T) {
		objects := newFakeObjects("pending")
		s, store := newTestService(objects)
		pending := store.add("pending", Pending)

		assert.ErrorIs(t, s.Delete(t.Context(), []int64{pending, 99}), apperr.ErrNotFound)
		assert.Equal(t, []string{"pending"}, objects.keys())
		assert.Equal(t, Pending, store.status[pending])
	})

	t.Run("no ids is invalid", func(t *testing.T) {
		s, _ := newTestService(newFakeObjects())
		assert.Contains(t, fieldErrors(t, s.Delete(t.Context(), nil)), "ids")
	})

	t.Run("a failed object deletion leaves the asset hidden for the sweeper", func(t *testing.T) {
		objects := newFakeObjects("a")
		objects.failDelete = true
		s, store := newTestService(objects)
		a := store.add("a", Ready)

		require.NoError(t, s.Delete(t.Context(), []int64{a}))
		assert.Equal(t, Deleting, store.status[a])
	})
}

func TestSweep(t *testing.T) {
	t.Run("stale assets lose their objects and rows; fresh and ready ones stay", func(t *testing.T) {
		objects := newFakeObjects("pending", "deleting", "fresh", "ready")
		s, store := newTestService(objects)
		pending, deleting := store.add("pending", Pending), store.add("deleting", Deleting)
		fresh := store.add("fresh", Pending)
		ready := store.add("ready", Ready)
		store.stale[pending], store.stale[deleting], store.stale[ready] = true, true, true

		removed, err := s.Sweep(t.Context(), 10)
		require.NoError(t, err)
		assert.Equal(t, 2, removed)
		assert.Equal(t, []string{"fresh", "ready"}, objects.keys())
		assert.Equal(t, Pending, store.status[fresh])
		assert.Equal(t, Ready, store.status[ready])
	})

	t.Run("a sweep removes at most limit assets", func(t *testing.T) {
		s, store := newTestService(newFakeObjects())
		for _, key := range []string{"a", "b", "c"} {
			store.stale[store.add(key, Pending)] = true
		}

		removed, err := s.Sweep(t.Context(), 2)
		require.NoError(t, err)
		assert.Equal(t, 2, removed)
		assert.Len(t, store.assets, 1)
	})

	t.Run("a failed object deletion keeps the rows", func(t *testing.T) {
		objects := newFakeObjects("a")
		objects.failDelete = true
		s, store := newTestService(objects)
		a := store.add("a", Pending)
		store.stale[a] = true

		_, err := s.Sweep(t.Context(), 10)
		assert.ErrorIs(t, err, errFake)
		assert.Equal(t, Deleting, store.status[a])
	})
}
