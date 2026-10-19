package publications

import "context"

type Repository interface {
	// Load returns the publication and holds every other Load of it until the
	// unit of work ends, so edits apply one after another. It returns
	// apperr.ErrNotFound when the publication does not exist.
	Load(ctx context.Context, id int64) (*Publication, error)
	// Save persists the changes recorded on p, advances its version and sets
	// its ID when it is new. It returns apperr.ErrEditConflict when the stored
	// version differs from p.Version, and ErrDuplicateLocale when the locale
	// is already translated.
	Save(ctx context.Context, p *Publication) error
}

type CachePurges interface {
	// Request asks for the public pages under scope to be purged once the unit
	// of work commits.
	Request(ctx context.Context, scope string) error
}

// Repositories are bound to a single unit of work.
type Repositories struct {
	Publications Repository
	CachePurges  CachePurges
}

// UnitOfWork is needed for every publication change: Load locks, and each
// change commits together with its cache purge request.
type UnitOfWork interface {
	// Do runs fn in one transaction. It commits when fn returns nil and rolls
	// back otherwise. Use only repos inside fn.
	Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error
}
