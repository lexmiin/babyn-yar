package publications

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestPublicationRecordsChanges(t *testing.T) {
	createdOn := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	editedOn := time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC)
	fields := TranslationFields{Title: "Подія", Content: json.RawMessage(`{}`)}

	publication := New(KindEvent, Ukrainian, createdOn, fields, 7)
	require.NoError(t, publication.AddTranslation(English, createdOn, TranslationFields{Title: "Event"}, 8))
	require.NoError(t, publication.UpdateTranslation(Ukrainian, editedOn, TranslationFields{Title: "Оновлена подія"}))
	require.NoError(t, publication.RemoveTranslation(English))

	// Each event keeps the data as it was when the change was made, even
	// though English is gone and Ukrainian has changed since.
	assert.Equal(t, []PublicationEvent{
		PublicationCreated{},
		TranslationAdded{Translation: Translation{Locale: Ukrainian, PublisherID: 7, TranslationFields: TranslationFields{
			Title: "Подія", Content: json.RawMessage(`{}`), Documents: []string{},
		}}},
		TranslationAdded{Translation: Translation{Locale: English, PublisherID: 8, TranslationFields: TranslationFields{
			Title: "Event", Documents: []string{},
		}}},
		TranslationUpdated{Locale: Ukrainian, Fields: TranslationFields{Title: "Оновлена подія", Documents: []string{}}},
		TranslationRemoved{Locale: English},
	}, publication.PullEvents())
	assert.False(t, publication.HasChanges())

	assert.Equal(t, editedOn, publication.OccurredOn)
	require.Len(t, publication.Translations, 1)
	translation := publication.Translations[0]
	assert.Equal(t, "Оновлена подія", translation.Title)
	assert.Equal(t, int64(7), translation.PublisherID, "edits keep the original publisher")
	assert.Equal(t, []string{}, translation.Documents)
}

func TestRemovingTheFinalTranslationRemovesThePublication(t *testing.T) {
	occurredOn := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	publication := New(KindBook, Ukrainian, occurredOn, TranslationFields{Title: "Книга"}, 7)
	publication.PullEvents()

	require.NoError(t, publication.RemoveTranslation(Ukrainian))
	assert.ErrorIs(t, publication.AddTranslation(Ukrainian, occurredOn, TranslationFields{Title: "Книга"}, 7), apperr.ErrNotFound,
		"a removed publication cannot be repopulated")
	assert.Empty(t, publication.Translations)
	assert.Equal(t, []PublicationEvent{
		TranslationRemoved{Locale: Ukrainian},
		PublicationRemoved{},
	}, publication.PullEvents())
}

func TestPublicationRejectsInvalidTranslationChanges(t *testing.T) {
	occurredOn := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	publication := New(KindEvent, Ukrainian, occurredOn, TranslationFields{Title: "Подія"}, 7)
	publication.PullEvents()

	assert.ErrorIs(t, publication.AddTranslation(Ukrainian, occurredOn, TranslationFields{}, 8), ErrDuplicateLocale)
	assert.ErrorIs(t, publication.UpdateTranslation(English, occurredOn, TranslationFields{}), apperr.ErrNotFound)
	assert.ErrorIs(t, publication.RemoveTranslation(English), apperr.ErrNotFound)

	assert.False(t, publication.HasChanges())
	require.Len(t, publication.Translations, 1)
	assert.Equal(t, "Подія", publication.Translations[0].Title)
}
