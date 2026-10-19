package assets

import (
	"context"
	"log/slog"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/lex-unix/babyn-yar/internal/validator"
)

// Service holds the write operations on assets. Each one validates its input
// and reports field-level problems as a *validator.Validator error.
type Service struct {
	uow    UnitOfWork
	files  Files
	logger *slog.Logger
}

func NewService(uow UnitOfWork, files Files, logger *slog.Logger) *Service {
	return &Service{uow: uow, files: files, logger: logger}
}

// Upload stores every file and records it as an asset, or does neither. A
// file name already in storage, or repeated in the batch, rejects the batch.
func (s *Service) Upload(ctx context.Context, files []File) ([]*Asset, error) {
	v := validator.New()
	v.Check(len(files) > 0, "assets", "must contain at least one file")
	seen := make(map[string]bool, len(files))
	for _, file := range files {
		if seen[file.Name] {
			v.AddError(file.Name, "is repeated")
			continue
		}
		seen[file.Name] = true

		exists, err := s.files.Exists(file.Name)
		if err != nil {
			return nil, err
		}
		v.Check(!exists, file.Name, "already exists")
	}
	if err := v.Err(); err != nil {
		return nil, err
	}

	assets := make([]*Asset, 0, len(files))
	err := s.upload(files, &assets)
	if err == nil {
		err = s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
			return repos.Assets.Insert(ctx, assets)
		})
	}
	if err != nil {
		s.removeFiles(ctx, filenames(assets))
		return nil, err
	}
	return assets, nil
}

// upload appends each stored file to assets, so a failure leaves only what
// was stored.
func (s *Service) upload(files []File, assets *[]*Asset) error {
	for _, file := range files {
		contentType, err := detectContentType(file.Content)
		if err != nil {
			return err
		}
		url, err := s.files.Upload(file.Content, file.Name, contentType)
		if err != nil {
			return err
		}
		*assets = append(*assets, &Asset{URL: url, Filename: file.Name, ContentType: contentType})
	}
	return nil
}

// Delete removes the assets among ids that exist. It returns
// apperr.ErrNotFound when none do. Files are removed after the commit: a
// stray file is harmless, but an asset whose file is gone is not.
func (s *Service) Delete(ctx context.Context, ids []int64) error {
	v := validator.New()
	v.Check(len(ids) > 0, "ids", "must not be empty")
	if err := v.Err(); err != nil {
		return err
	}

	var deleted []*Asset
	err := s.uow.Do(ctx, func(ctx context.Context, repos Repositories) error {
		var err error
		deleted, err = repos.Assets.Lock(ctx, ids)
		if err != nil {
			return err
		}
		if len(deleted) == 0 {
			return apperr.ErrNotFound
		}

		ids := make([]int64, len(deleted))
		for i, asset := range deleted {
			ids[i] = asset.ID
		}
		// The gallery check follows the lock, so no image can join the
		// gallery between the check and the deletion.
		shown, err := repos.Gallery.Shows(ctx, ids)
		if err != nil {
			return err
		}
		if err := repos.Assets.Delete(ctx, ids); err != nil {
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

	s.removeFiles(ctx, filenames(deleted))
	return nil
}

// removeFiles deletes files from storage. A failure only leaves stray
// files, so it is logged rather than returned.
func (s *Service) removeFiles(ctx context.Context, names []string) {
	if len(names) == 0 {
		return
	}
	if err := s.files.Delete(names); err != nil {
		s.logger.ErrorContext(ctx, "asset files not deleted", "files", names, "err", err)
	}
}

func filenames(assets []*Asset) []string {
	names := make([]string, len(assets))
	for i, asset := range assets {
		names[i] = asset.Filename
	}
	return names
}
