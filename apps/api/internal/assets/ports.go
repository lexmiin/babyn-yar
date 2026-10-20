package assets

import (
	"context"
	"io"
	"time"
)

type Repository interface {
	// InsertPending records the assets as pending and sets their IDs and
	// creation times.
	InsertPending(ctx context.Context, assets []*Asset) error
	// MarkReady makes the pending assets among ids ready and returns how many
	// it changed. An asset the sweeper has claimed is no longer pending.
	MarkReady(ctx context.Context, ids []int64) (int, error)
	// MarkDeleting makes the ready assets among ids deleting and returns them.
	MarkDeleting(ctx context.Context, ids []int64) ([]*Asset, error)
	// ClaimStale marks up to limit assets that have been pending or deleting
	// for longer than staleAfter as deleting, restarts their clock so no one
	// else claims them meanwhile, and returns them.
	ClaimStale(ctx context.Context, staleAfter time.Duration, limit int) ([]*Asset, error)
	// Claim makes the assets among ids that are not ready deleting, restarts
	// their clock, and returns them.
	Claim(ctx context.Context, ids []int64) ([]*Asset, error)
	// Remove deletes the rows of the deleting assets among ids.
	Remove(ctx context.Context, ids []int64) error
}

type Gallery interface {
	// Remove takes the assets out of the gallery and reports whether it showed
	// any of them.
	Remove(ctx context.Context, ids []int64) (bool, error)
}

type CachePurges interface {
	// Request asks for the public pages under scope to be purged once the unit
	// of work commits.
	Request(ctx context.Context, scope string) error
}

// Objects stores asset contents. It is outside the unit of work, so the
// service records an asset before its object exists and removes the object
// before the asset's row.
type Objects interface {
	// Upload stores body under key. Browsers save it as filename.
	Upload(ctx context.Context, key string, body io.ReadSeeker, contentType, filename string) error
	URL(key string) string
	// Delete removes the objects under keys; missing objects are not an error.
	Delete(ctx context.Context, keys []string) error
}

// Repositories are bound to a single unit of work.
type Repositories struct {
	Assets      Repository
	Gallery     Gallery
	CachePurges CachePurges
}

// UnitOfWork is needed for every asset change: a batch commits together, and
// a deletion commits with its gallery change and cache purge request.
type UnitOfWork interface {
	// Do runs fn in one transaction. It commits when fn returns nil and rolls
	// back otherwise. Use only repos inside fn.
	Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error
}
