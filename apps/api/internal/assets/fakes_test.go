package assets

import (
	"context"
	"errors"
	"io"
	"maps"
	"slices"
	"time"
)

var errFake = errors.New("fake failure")

// fakeStore is an in-memory database. fakeUnitOfWork runs each unit of work on
// a copy and keeps it only when the unit of work succeeds.
type fakeStore struct {
	assets  map[int64]Asset
	status  map[int64]Status
	stale   map[int64]bool
	gallery map[int64]bool
	purges  []string
	nextID  int64
	// loseReadyReply makes the unit of work that makes assets ready commit
	// and then fail, as when the connection drops before the reply.
	loseReadyReply bool
	replyLost      bool
}

func newFakeStore() *fakeStore {
	return &fakeStore{
		assets:  map[int64]Asset{},
		status:  map[int64]Status{},
		stale:   map[int64]bool{},
		gallery: map[int64]bool{},
	}
}

func (s *fakeStore) clone() *fakeStore {
	c := *s
	c.assets = maps.Clone(s.assets)
	c.status = maps.Clone(s.status)
	c.stale = maps.Clone(s.stale)
	c.gallery = maps.Clone(s.gallery)
	c.purges = slices.Clone(s.purges)
	return &c
}

// add stores an asset with its object key as if it had reached status.
func (s *fakeStore) add(key string, status Status) int64 {
	s.nextID++
	s.assets[s.nextID] = Asset{ID: s.nextID, Key: key}
	s.status[s.nextID] = status
	return s.nextID
}

type fakeUnitOfWork struct {
	store *fakeStore
}

func (u fakeUnitOfWork) Do(ctx context.Context, fn func(ctx context.Context, repos Repositories) error) error {
	work := u.store.clone()
	repos := Repositories{Assets: fakeRepository{work}, Gallery: fakeGallery{work}, CachePurges: fakeCachePurges{work}}
	if err := fn(ctx, repos); err != nil {
		return err
	}
	*u.store = *work
	if u.store.replyLost {
		u.store.replyLost = false
		return errFake
	}
	return nil
}

type fakeRepository struct {
	store *fakeStore
}

func (r fakeRepository) InsertPending(_ context.Context, batch []*Asset) error {
	for _, asset := range batch {
		r.store.nextID++
		asset.ID = r.store.nextID
		r.store.assets[asset.ID] = *asset
		r.store.status[asset.ID] = Pending
	}
	return nil
}

func (r fakeRepository) MarkReady(_ context.Context, ids []int64) (int, error) {
	r.store.replyLost = r.store.loseReadyReply
	return len(r.change(ids, Pending, Ready)), nil
}

func (r fakeRepository) MarkDeleting(_ context.Context, ids []int64) ([]*Asset, error) {
	return r.change(ids, Ready, Deleting), nil
}

// ClaimStale treats the assets in store.stale as having waited too long.
func (r fakeRepository) ClaimStale(_ context.Context, _ time.Duration, limit int) ([]*Asset, error) {
	var claimed []*Asset
	for _, id := range slices.Sorted(maps.Keys(r.store.stale)) {
		if len(claimed) == limit {
			break
		}
		if r.store.status[id] == Ready {
			continue
		}
		delete(r.store.stale, id)
		r.store.status[id] = Deleting
		asset := r.store.assets[id]
		claimed = append(claimed, &asset)
	}
	return claimed, nil
}

func (r fakeRepository) Claim(_ context.Context, ids []int64) ([]*Asset, error) {
	var claimed []*Asset
	for _, id := range ids {
		if status, ok := r.store.status[id]; ok && status != Ready {
			r.store.status[id] = Deleting
			asset := r.store.assets[id]
			claimed = append(claimed, &asset)
		}
	}
	return claimed, nil
}

func (r fakeRepository) Remove(_ context.Context, ids []int64) error {
	for _, id := range ids {
		if r.store.status[id] == Deleting {
			delete(r.store.assets, id)
			delete(r.store.status, id)
		}
	}
	return nil
}

func (r fakeRepository) change(ids []int64, from, to Status) []*Asset {
	var changed []*Asset
	for _, id := range ids {
		if r.store.status[id] == from {
			r.store.status[id] = to
			asset := r.store.assets[id]
			changed = append(changed, &asset)
		}
	}
	return changed
}

type fakeGallery struct {
	store *fakeStore
}

func (g fakeGallery) Remove(_ context.Context, ids []int64) (bool, error) {
	shown := false
	for _, id := range ids {
		shown = shown || g.store.gallery[id]
		delete(g.store.gallery, id)
	}
	return shown, nil
}

type fakeCachePurges struct {
	store *fakeStore
}

func (c fakeCachePurges) Request(_ context.Context, scope string) error {
	c.store.purges = append(c.store.purges, scope)
	return nil
}

// fakeObjects stores object contents and file names by key.
type fakeObjects struct {
	contents    map[string]string
	filenames   map[string]string
	failUpload  string
	failDelete  bool
	afterUpload func(key string)
}

func newFakeObjects(keys ...string) *fakeObjects {
	o := &fakeObjects{contents: map[string]string{}, filenames: map[string]string{}}
	for _, key := range keys {
		o.contents[key] = ""
	}
	return o
}

func (o *fakeObjects) Upload(_ context.Context, key string, body io.ReadSeeker, _, filename string) error {
	if filename == o.failUpload {
		return errFake
	}
	content, err := io.ReadAll(body)
	if err != nil {
		return err
	}
	o.contents[key] = string(content)
	o.filenames[key] = filename
	if o.afterUpload != nil {
		o.afterUpload(key)
	}
	return nil
}

func (o *fakeObjects) URL(key string) string {
	return "https://files.example.com/" + key
}

func (o *fakeObjects) Delete(_ context.Context, keys []string) error {
	if o.failDelete {
		return errFake
	}
	for _, key := range keys {
		delete(o.contents, key)
	}
	return nil
}

func (o *fakeObjects) keys() []string {
	return slices.Sorted(maps.Keys(o.contents))
}
