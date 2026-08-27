package data

import (
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrRecordNotFound             = errors.New("record not found")
	ErrEditConflict               = errors.New("edit conflict")
	ErrIncompleteCopy             = errors.New("not all records were added")
	ErrDuplicatePublicationLocale = errors.New("publication already has this locale")
)

type Models struct {
	Victims       VictimModel
	Assets        AssetModel
	Users         UserModel
	Permissions   PermissionModel
	GalleryImages GalleryModel
	Publications  PublicationModel
	CachePurges   CachePurgeRequestModel
}

func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Victims:       VictimModel{DB: db},
		Assets:        AssetModel{DB: db},
		Users:         UserModel{DB: db},
		Permissions:   PermissionModel{DB: db},
		GalleryImages: GalleryModel{DB: db},
		Publications:  PublicationModel{DB: db},
		CachePurges:   CachePurgeRequestModel{DB: db},
	}
}
