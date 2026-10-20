package assets

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

var errSwept = errors.New("asset swept before it became ready")

// Service holds the write operations on assets. Each one validates its input
// and reports field-level problems as a *validator.Validator error.
//
// An asset's row exists whenever its object might: the row is recorded before
// the object is stored, and an object is deleted only once its asset is
// claimed as deleting, before the row is removed. Whatever an operation leaves
// pending or deleting, Sweep removes later.
type Service struct {
	uow     UnitOfWork
	objects Objects
	logger  *slog.Logger
}

func NewService(uow UnitOfWork, objects Objects, logger *slog.Logger) *Service {
	return &Service{uow: uow, objects: objects, logger: logger}
}

// Upload stores every file and makes it a ready asset, or makes none of them
// ready. Each file is stored under a new key, so names may repeat.
func (s *Service) Upload(ctx context.Context, files []File) ([]*Asset, error) {
	v := validator.New()
	v.Check(len(files) > 0, "assets", "must contain at least one file")
	if err := v.Err(); err != nil {
		return nil, err
	}

	assets := make([]*Asset, len(files))
	for i, file := range files {
		contentType, err := detectContentType(file.Content)
		if err != nil {
			return nil, err
		}
		key := uuid.NewString()
		assets[i] = &Asset{URL: s.objects.URL(key), Filename: file.Name, ContentType: contentType, Key: key}
	}

	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		return repos.Assets.InsertPending(ctx, assets)
	})
	if err != nil {
		return nil, err
	}

	if err := s.store(ctx, files, assets); err != nil {
		s.discardOrLog(ctx, assets)
		return nil, err
	}
	return assets, nil
}

// storeTimeout bounds storing a batch well below StaleAfter, so the sweeper
// cannot claim a batch while its objects are still being written.
const storeTimeout = 15 * time.Minute

// store uploads each file under its pending asset's key, then makes the
// assets ready together.
func (s *Service) store(ctx context.Context, files []File, assets []*Asset) error {
	ctx, cancel := context.WithTimeout(ctx, storeTimeout)
	defer cancel()

	for i, file := range files {
		asset := assets[i]
		if err := s.objects.Upload(ctx, asset.Key, file.Content, asset.ContentType, file.Name); err != nil {
			return err
		}
	}

	return s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		changed, err := repos.Assets.MarkReady(ctx, idsOf(assets))
		if err != nil {
			return err
		}
		if changed != len(assets) {
			return errSwept
		}
		return nil
	})
}

// Delete hides the ready assets among ids and removes them. It returns
// apperr.ErrNotFound when none are ready.
func (s *Service) Delete(ctx context.Context, ids []int64) error {
	v := validator.New()
	v.Check(len(ids) > 0, "ids", "must not be empty")
	if err := v.Err(); err != nil {
		return err
	}

	var deleting []*Asset
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		var err error
		deleting, err = repos.Assets.MarkDeleting(ctx, ids)
		if err != nil {
			return err
		}
		if len(deleting) == 0 {
			return apperr.ErrNotFound
		}

		shown, err := repos.Gallery.Remove(ctx, idsOf(deleting))
		if err != nil {
			return err
		}
		if shown {
			return repos.CachePurges.Request(ctx, GalleryScope)
		}
		return nil
	})
	if err != nil {
		return err
	}

	if err := s.remove(context.WithoutCancel(ctx), deleting); err != nil {
		s.logger.ErrorContext(ctx, "assets left for the sweeper", "ids", idsOf(deleting), "err", err)
	}
	return nil
}

// Sweep removes up to limit assets left pending or deleting for longer than
// StaleAfter, such as uploads interrupted by a crash, and returns how many it
// removed.
func (s *Service) Sweep(ctx context.Context, limit int) (int, error) {
	var stale []*Asset
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		var err error
		stale, err = repos.Assets.ClaimStale(ctx, StaleAfter, limit)
		return err
	})
	if err != nil || len(stale) == 0 {
		return 0, err
	}

	if err := s.remove(ctx, stale); err != nil {
		return 0, err
	}
	return len(stale), nil
}

// discardOrLog removes the assets of a failed upload, even when its request
// is canceled. It first claims the assets that are not ready, so an asset that
// became ready despite the error keeps its object. A failure is only logged:
// whatever is left stays hidden until Sweep removes it.
func (s *Service) discardOrLog(ctx context.Context, assets []*Asset) {
	ctx = context.WithoutCancel(ctx)
	var claimed []*Asset
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		var err error
		claimed, err = repos.Assets.Claim(ctx, idsOf(assets))
		return err
	})
	if err == nil && len(claimed) > 0 {
		err = s.remove(ctx, claimed)
	}
	if err != nil {
		s.logger.ErrorContext(ctx, "assets left for the sweeper", "ids", idsOf(assets), "err", err)
	}
}

// remove deletes the objects of claimed assets, then their rows.
func (s *Service) remove(ctx context.Context, claimed []*Asset) error {
	keys := make([]string, len(claimed))
	for i, asset := range claimed {
		keys[i] = asset.Key
	}
	if err := s.objects.Delete(ctx, keys); err != nil {
		return err
	}

	return s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		return repos.Assets.Remove(ctx, idsOf(claimed))
	})
}

func idsOf(assets []*Asset) []int64 {
	ids := make([]int64, len(assets))
	for i, asset := range assets {
		ids[i] = asset.ID
	}
	return ids
}
