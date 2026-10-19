package data

import (
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/apperr"
)

var (
	ErrRecordNotFound             = apperr.ErrNotFound
	ErrEditConflict               = apperr.ErrEditConflict
	ErrIncompleteCopy             = errors.New("not all records were added")
	ErrDuplicatePublicationLocale = errors.New("publication already has this locale")
)

type Models struct {
	Victims       VictimModel
	Assets        AssetModel
	GalleryImages GalleryModel
	Publications  PublicationModel
	CachePurges   CachePurgeRequestModel
}

func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Victims:       VictimModel{DB: db},
		Assets:        AssetModel{DB: db},
		GalleryImages: GalleryModel{DB: db},
		Publications:  PublicationModel{DB: db},
		CachePurges:   CachePurgeRequestModel{DB: db},
	}
}
