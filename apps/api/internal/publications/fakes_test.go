package publications

import (
	"context"
	"maps"
	"slices"
	"testing"

	"github.com/lex-unix/babyn-yar/internal/apperr"
	"github.com/stretchr/testify/require"
)

// fakeStore is an in-memory database. fakeUnitOfWork runs each unit of work on
// a copy and keeps it only when the unit of work succeeds.
type fakeStore struct {
	publications map[int64]Publication
	purges       []string
	nextID       int64
}

func newFakeStore() *fakeStore {
	return &fakeStore{publications: map[int64]Publication{}}
}

func (s *fakeStore) clone() *fakeStore {
	c := &fakeStore{publications: maps.Clone(s.publications), purges: slices.Clone(s.purges), nextID: s.nextID}
	for id, p := range c.publications {
		c.publications[id] = clonePublication(p)
	}
	return c
}

// add stores a publication with its translations as if it had been saved.
func (s *fakeStore) add(kind Kind, translations ...Translation) int64 {
	s.nextID++
	s.publications[s.nextID] = Publication{ID: s.nextID, Kind: kind, Version: 1, Translations: translations}
	return s.nextID
}

func (s *fakeStore) publication(t *testing.T, id int64) Publication {
	t.Helper()
	p, ok := s.publications[id]
	require.True(t, ok, "publication %d should exist", id)
	return p
}

func clonePublication(p Publication) Publication {
	p.Translations = slices.Clone(p.Translations)
	p.events = nil
	return p
}

type fakeUnitOfWork struct {
	store *fakeStore
}

func (u fakeUnitOfWork) Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error {
	work := u.store.clone()
	if err := fn(ctx, Repositories{Publications: fakeRepository{work}, CachePurges: fakeCachePurges{work}}); err != nil {
		return err
	}
	*u.store = *work
	return nil
}

type fakeRepository struct {
	store *fakeStore
}

func (r fakeRepository) Load(_ context.Context, id int64) (*Publication, error) {
	p, ok := r.store.publications[id]
	if !ok {
		return nil, apperr.ErrNotFound
	}
	p = clonePublication(p)
	return &p, nil
}

func (r fakeRepository) Save(_ context.Context, p *Publication) error {
	events := p.PullEvents()
	if _, created := events[0].(PublicationCreated); created {
		r.store.nextID++
		p.ID = r.store.nextID
		p.Version = 1
		r.store.publications[p.ID] = clonePublication(*p)
		return nil
	}

	if r.store.publications[p.ID].Version != p.Version {
		return apperr.ErrEditConflict
	}
	if _, removed := events[len(events)-1].(PublicationRemoved); removed {
		delete(r.store.publications, p.ID)
		return nil
	}
	p.Version++
	r.store.publications[p.ID] = clonePublication(*p)
	return nil
}

type fakeCachePurges struct {
	store *fakeStore
}

func (c fakeCachePurges) Request(_ context.Context, scope string) error {
	c.store.purges = append(c.store.purges, scope)
	return nil
}
