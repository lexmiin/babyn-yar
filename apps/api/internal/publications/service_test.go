package publications

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var testOccurredOn = time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC)

func validFields(title string) TranslationFields {
	return TranslationFields{
		Title:       title,
		Description: "Опис",
		Content:     json.RawMessage(`{"type":"doc"}`),
		Cover:       "https://example.com/cover.jpg",
	}
}

func newTestService() (*Service, *fakeStore) {
	store := newFakeStore()
	return NewService(fakeUnitOfWork{store: store}), store
}

func fieldErrors(t *testing.T, err error) map[string]string {
	t.Helper()
	var v *validator.Validator
	require.ErrorAs(t, err, &v)
	return v.Errors
}

func TestCreate(t *testing.T) {
	t.Run("invalid commands store nothing", func(t *testing.T) {
		s, store := newTestService()
		_, err := s.Create(t.Context(), CreatePublication{Kind: "poem", Locale: "de", TranslationFields: validFields("")})
		errs := fieldErrors(t, err)
		for _, field := range []string{"kind", "locale", "occurredOn", "title"} {
			assert.Contains(t, errs, field)
		}
		assert.Empty(t, store.publications)
		assert.Empty(t, store.purges)
	})

	t.Run("a publication starts with one translation and purges its kind", func(t *testing.T) {
		s, store := newTestService()
		id, err := s.Create(t.Context(), CreatePublication{
			Kind: "book", Locale: "uk", OccurredOn: testOccurredOn, PublisherID: 7, TranslationFields: validFields("Книга"),
		})
		require.NoError(t, err)

		p := store.publication(t, id)
		assert.Equal(t, int32(1), p.Version)
		require.Len(t, p.Translations, 1)
		assert.Equal(t, int64(7), p.Translations[0].PublisherID)
		assert.Equal(t, []string{"book"}, store.purges)
	})
}

func TestAddTranslation(t *testing.T) {
	newPublication := func() (*Service, *fakeStore, int64) {
		s, store := newTestService()
		id := store.add(KindEvent, Translation{Locale: Ukrainian, PublisherID: 7, TranslationFields: validFields("Подія")})
		return s, store, id
	}
	command := func(id int64, version int32, locale string) AddTranslation {
		return AddTranslation{
			PublicationID: id, ExpectedVersion: version, Locale: locale,
			OccurredOn: testOccurredOn, PublisherID: 8, TranslationFields: validFields("Event"),
		}
	}

	t.Run("stale versions conflict and purge nothing", func(t *testing.T) {
		s, store, id := newPublication()
		assert.ErrorIs(t, s.AddTranslation(t.Context(), command(id, 2, "en")), apperr.ErrEditConflict)
		assert.Len(t, store.publication(t, id).Translations, 1)
		assert.Empty(t, store.purges)
	})

	t.Run("a translated locale is a field error", func(t *testing.T) {
		s, _, id := newPublication()
		err := s.AddTranslation(t.Context(), command(id, 1, "uk"))
		assert.Equal(t, map[string]string{"locale": "publication already has this locale"}, fieldErrors(t, err))
	})

	t.Run("missing publications are not found", func(t *testing.T) {
		s, _, _ := newPublication()
		assert.ErrorIs(t, s.AddTranslation(t.Context(), command(99, 1, "en")), apperr.ErrNotFound)
	})

	t.Run("the translation is added by its publisher", func(t *testing.T) {
		s, store, id := newPublication()
		require.NoError(t, s.AddTranslation(t.Context(), command(id, 1, "en")))

		p := store.publication(t, id)
		assert.Equal(t, int32(2), p.Version)
		translation, ok := p.Translation(English)
		require.True(t, ok)
		assert.Equal(t, int64(8), translation.PublisherID)
		assert.Equal(t, []string{"event"}, store.purges)
	})
}

func TestUpdateTranslation(t *testing.T) {
	s, store := newTestService()
	id := store.add(KindEvent, Translation{Locale: Ukrainian, PublisherID: 7, TranslationFields: validFields("Подія")})

	err := s.UpdateTranslation(t.Context(), UpdateTranslation{
		PublicationID: id, ExpectedVersion: 1, Locale: "en", OccurredOn: testOccurredOn, TranslationFields: validFields("Event"),
	})
	assert.ErrorIs(t, err, apperr.ErrNotFound)
	assert.Empty(t, store.purges)

	require.NoError(t, s.UpdateTranslation(t.Context(), UpdateTranslation{
		PublicationID: id, ExpectedVersion: 1, Locale: "uk", OccurredOn: testOccurredOn, TranslationFields: validFields("Оновлена подія"),
	}))
	p := store.publication(t, id)
	translation, ok := p.Translation(Ukrainian)
	require.True(t, ok)
	assert.Equal(t, "Оновлена подія", translation.Title)
	assert.Equal(t, int64(7), translation.PublisherID)
	assert.Equal(t, []string{"event"}, store.purges)
}

func TestRemoveTranslation(t *testing.T) {
	s, store := newTestService()
	id := store.add(KindPartner,
		Translation{Locale: Ukrainian, TranslationFields: validFields("Партнер")},
		Translation{Locale: English, TranslationFields: validFields("Partner")},
	)

	assert.ErrorIs(t, s.RemoveTranslation(t.Context(), id, "de"), apperr.ErrNotFound)
	assert.ErrorIs(t, s.RemoveTranslation(t.Context(), 99, "en"), apperr.ErrNotFound)
	assert.Empty(t, store.purges)

	require.NoError(t, s.RemoveTranslation(t.Context(), id, "en"))
	assert.Len(t, store.publication(t, id).Translations, 1)
	assert.ErrorIs(t, s.RemoveTranslation(t.Context(), id, "en"), apperr.ErrNotFound)

	require.NoError(t, s.RemoveTranslation(t.Context(), id, "uk"))
	assert.NotContains(t, store.publications, id, "removing the final translation removes the publication")
	assert.Equal(t, []string{"partner", "partner"}, store.purges)
}
