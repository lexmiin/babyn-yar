package publications

import (
	"context"
	"errors"
	"time"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

// Service holds the write operations on publications. Each one validates its
// command and reports field-level problems as a *validator.Validator error.
type Service struct {
	uow UnitOfWork
}

func NewService(uow UnitOfWork) *Service {
	return &Service{uow: uow}
}

type CreatePublication struct {
	Kind        string
	Locale      string
	OccurredOn  time.Time
	PublisherID int64
	TranslationFields
}

// Create creates a publication with its first translation and returns its ID.
func (s *Service) Create(ctx context.Context, cmd CreatePublication) (int64, error) {
	v := validator.New()
	kind := Kind(cmd.Kind)
	v.Check(kind.Valid(), "kind", "must be supported publication kind")
	locale := Locale(cmd.Locale)
	checkLocale(v, locale)
	ValidateTranslation(v, cmd.OccurredOn, cmd.TranslationFields)
	if err := v.Err(); err != nil {
		return 0, err
	}

	p := New(kind, locale, cmd.OccurredOn, cmd.TranslationFields, cmd.PublisherID)
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		return s.save(ctx, repos, p)
	})
	if err != nil {
		return 0, err
	}
	return p.ID, nil
}

type AddTranslation struct {
	PublicationID   int64
	ExpectedVersion int32
	Locale          string
	OccurredOn      time.Time
	PublisherID     int64
	TranslationFields
}

func (s *Service) AddTranslation(ctx context.Context, cmd AddTranslation) error {
	v := validator.New()
	locale := Locale(cmd.Locale)
	checkLocale(v, locale)
	ValidateTranslation(v, cmd.OccurredOn, cmd.TranslationFields)
	if err := v.Err(); err != nil {
		return err
	}

	err := s.edit(ctx, cmd.PublicationID, &cmd.ExpectedVersion, func(p *Publication) error {
		return p.AddTranslation(locale, cmd.OccurredOn, cmd.TranslationFields, cmd.PublisherID)
	})
	if errors.Is(err, ErrDuplicateLocale) {
		v.AddError("locale", "publication already has this locale")
		return v.Err()
	}
	return err
}

type UpdateTranslation struct {
	PublicationID   int64
	ExpectedVersion int32
	Locale          string
	OccurredOn      time.Time
	TranslationFields
}

func (s *Service) UpdateTranslation(ctx context.Context, cmd UpdateTranslation) error {
	v := validator.New()
	locale := Locale(cmd.Locale)
	checkLocale(v, locale)
	ValidateTranslation(v, cmd.OccurredOn, cmd.TranslationFields)
	if err := v.Err(); err != nil {
		return err
	}

	return s.edit(ctx, cmd.PublicationID, &cmd.ExpectedVersion, func(p *Publication) error {
		return p.UpdateTranslation(locale, cmd.OccurredOn, cmd.TranslationFields)
	})
}

// RemoveTranslation removes one translation whatever the publication's
// version. Removing the final translation removes the publication.
func (s *Service) RemoveTranslation(ctx context.Context, publicationID int64, locale string) error {
	if !Locale(locale).Valid() {
		return apperr.ErrNotFound
	}

	return s.edit(ctx, publicationID, nil, func(p *Publication) error {
		return p.RemoveTranslation(Locale(locale))
	})
}

// edit applies change to the loaded publication and saves it. A nil
// expectedVersion accepts whatever version the publication has.
func (s *Service) edit(ctx context.Context, id int64, expectedVersion *int32, change func(*Publication) error) error {
	return s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		p, err := repos.Publications.Load(ctx, id)
		if err != nil {
			return err
		}
		if expectedVersion != nil && p.Version != *expectedVersion {
			return apperr.ErrEditConflict
		}
		if err := change(p); err != nil {
			return err
		}
		return s.save(ctx, repos, p)
	})
}

// save persists p and requests a cache purge for its kind in the same unit of
// work, so every change to the public pages reaches the cache.
func (s *Service) save(ctx context.Context, repos Repositories, p *Publication) error {
	if !p.HasChanges() {
		return nil
	}
	if err := repos.Publications.Save(ctx, p); err != nil {
		return err
	}
	return repos.CachePurges.Request(ctx, p.Kind.Scope())
}

func checkLocale(v *validator.Validator, locale Locale) {
	v.Check(locale.Valid(), "locale", "must be supported locale")
}
