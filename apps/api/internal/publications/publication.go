// Package publications holds publications, their translations and the rules
// for changing them.
package publications

import (
	"encoding/json"
	"errors"
	"net/url"
	"slices"
	"strings"
	"time"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

var ErrDuplicateLocale = errors.New("publication already has this locale")

// Kind is the immutable classification of a publication.
type Kind string

const (
	KindEvent              Kind = "event"
	KindBook               Kind = "book"
	KindHolocaustDocument  Kind = "holocaust_document"
	KindVictimTestimony    Kind = "victim_testimony"
	KindMediaArticle       Kind = "media_article"
	KindPartner            Kind = "partner"
	KindDevelopmentConcept Kind = "development_concept"
	KindLegalDocument      Kind = "legal_document"
)

func (k Kind) Valid() bool {
	return slices.Contains([]Kind{
		KindEvent, KindBook, KindHolocaustDocument, KindVictimTestimony,
		KindMediaArticle, KindPartner, KindDevelopmentConcept, KindLegalDocument,
	}, k)
}

// Scope is the cache purge scope of the public pages that list this kind.
func (k Kind) Scope() string {
	return string(k)
}

type Locale string

const (
	Ukrainian Locale = "uk"
	English   Locale = "en"
)

func (l Locale) Valid() bool {
	return l == Ukrainian || l == English
}

// PublicationEvent records a change to a publication that Repository.Save must
// persist. Each event carries the data it writes, so a later change in the
// same save cannot alter what an earlier one persists.
type PublicationEvent interface{ isPublicationEvent() }

type PublicationCreated struct{}

type TranslationAdded struct{ Translation Translation }

type TranslationUpdated struct {
	Locale Locale
	Fields TranslationFields
}

type TranslationRemoved struct{ Locale Locale }

// PublicationRemoved follows the removal of the final translation: a
// publication cannot exist without one.
type PublicationRemoved struct{}

func (PublicationCreated) isPublicationEvent() {}
func (TranslationAdded) isPublicationEvent()   {}
func (TranslationUpdated) isPublicationEvent() {}
func (TranslationRemoved) isPublicationEvent() {}
func (PublicationRemoved) isPublicationEvent() {}

// Publication is a language-independent work represented by one translation
// per locale.
type Publication struct {
	ID           int64
	Kind         Kind
	OccurredOn   time.Time
	Version      int32
	Translations []Translation
	removed      bool
	events       []PublicationEvent
}

// Translation is a publication's representation in one locale. Its publisher
// is whoever added it; later edits keep the publisher.
type Translation struct {
	Locale      Locale
	PublisherID int64
	TranslationFields
}

type TranslationFields struct {
	Title       string
	Description string
	Content     json.RawMessage
	Cover       string
	Documents   []string
}

func New(kind Kind, locale Locale, occurredOn time.Time, fields TranslationFields, publisherID int64) *Publication {
	p := &Publication{Kind: kind}
	p.events = append(p.events, PublicationCreated{})
	// A new publication has no translations, so the locale cannot be a duplicate.
	_ = p.AddTranslation(locale, occurredOn, fields, publisherID)
	return p
}

func (p *Publication) Translation(locale Locale) (*Translation, bool) {
	for i := range p.Translations {
		if p.Translations[i].Locale == locale {
			return &p.Translations[i], true
		}
	}
	return nil, false
}

func (p *Publication) AddTranslation(locale Locale, occurredOn time.Time, fields TranslationFields, publisherID int64) error {
	if p.removed {
		return apperr.ErrNotFound
	}
	if _, ok := p.Translation(locale); ok {
		return ErrDuplicateLocale
	}

	translation := Translation{
		Locale:            locale,
		PublisherID:       publisherID,
		TranslationFields: fields.normalized(),
	}
	p.Translations = append(p.Translations, translation)
	p.OccurredOn = occurredOn
	p.events = append(p.events, TranslationAdded{Translation: translation})
	return nil
}

func (p *Publication) UpdateTranslation(locale Locale, occurredOn time.Time, fields TranslationFields) error {
	translation, ok := p.Translation(locale)
	if !ok {
		return apperr.ErrNotFound
	}

	translation.TranslationFields = fields.normalized()
	p.OccurredOn = occurredOn
	p.events = append(p.events, TranslationUpdated{Locale: locale, Fields: translation.TranslationFields})
	return nil
}

// RemoveTranslation removes one locale. Removing the final translation
// removes the publication for good: it cannot gain a translation again.
func (p *Publication) RemoveTranslation(locale Locale) error {
	index := slices.IndexFunc(p.Translations, func(translation Translation) bool {
		return translation.Locale == locale
	})
	if index < 0 {
		return apperr.ErrNotFound
	}

	p.Translations = slices.Delete(p.Translations, index, index+1)
	p.events = append(p.events, TranslationRemoved{Locale: locale})
	if len(p.Translations) == 0 {
		p.removed = true
		p.events = append(p.events, PublicationRemoved{})
	}
	return nil
}

func (p *Publication) HasChanges() bool {
	return len(p.events) > 0
}

// PullEvents returns the changes recorded since the last call and clears them.
func (p *Publication) PullEvents() []PublicationEvent {
	events := p.events
	p.events = nil
	return events
}

func (f TranslationFields) normalized() TranslationFields {
	if f.Documents == nil {
		f.Documents = []string{}
	}
	return f
}

func ValidateTranslation(v *validator.Validator, occurredOn time.Time, fields TranslationFields) {
	v.Check(!occurredOn.IsZero(), "occurredOn", "must be a valid date")
	v.Check(fields.Title != "", "title", "must not be empty")
	v.Check(fields.Description != "", "description", "must not be empty")
	v.Check(len(fields.Content) > 0 && json.Valid(fields.Content), "content", "must be valid JSON")
	v.Check(fields.Cover != "", "cover", "must not be empty")
	for _, document := range fields.Documents {
		v.Check(validDocumentURL(document), "documents", "must contain valid HTTPS URLs")
	}
}

func validDocumentURL(document string) bool {
	parsed, err := url.ParseRequestURI(document)
	return err == nil && strings.EqualFold(parsed.Scheme, "https") && parsed.Host != ""
}
