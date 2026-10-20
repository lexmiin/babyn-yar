package data

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/apperr"
)

var (
	ErrRecordNotFound = apperr.ErrNotFound
	ErrEditConflict   = apperr.ErrEditConflict
)

type Models struct {
	Victims       VictimModel
	GalleryImages GalleryModel
	CachePurges   CachePurgeRequestModel
}

func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Victims:       VictimModel{DB: db},
		GalleryImages: GalleryModel{DB: db},
		CachePurges:   CachePurgeRequestModel{DB: db},
	}
}
