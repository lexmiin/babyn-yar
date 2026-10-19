package assets

import (
	"context"
	"io"
)

type Repository interface {
	// Lock returns the assets among ids that exist and holds every other
	// change to them until the unit of work ends.
	Lock(ctx context.Context, ids []int64) ([]*Asset, error)
	// Insert sets each asset's ID and creation time.
	Insert(ctx context.Context, assets []*Asset) error
	Delete(ctx context.Context, ids []int64) error
}

type Gallery interface {
	// Shows reports whether the gallery shows any of the assets.
	Shows(ctx context.Context, ids []int64) (bool, error)
}

type CachePurges interface {
	// Request asks for the public pages under scope to be purged once the unit
	// of work commits.
	Request(ctx context.Context, scope string) error
}

// Files stores asset contents under their file names. It is outside the unit
// of work, so the service orders its calls around the commit.
type Files interface {
	// Upload stores file under name and returns its public URL.
	Upload(file io.ReadSeeker, name, contentType string) (string, error)
	Exists(name string) (bool, error)
	Delete(names []string) error
}

// Repositories are bound to a single unit of work.
type Repositories struct {
	Assets      Repository
	Gallery     Gallery
	CachePurges CachePurges
}

// UnitOfWork is needed for every asset change: a batch commits together, and
// a deletion commits with its cache purge request.
type UnitOfWork interface {
	// Do runs fn in one transaction. It commits when fn returns nil and rolls
	// back otherwise. Use only repos inside fn.
	Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error
}
