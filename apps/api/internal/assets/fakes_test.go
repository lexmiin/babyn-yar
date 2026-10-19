package assets

import (
	"context"
	"errors"
	"io"
	"maps"
	"slices"
)

var errFake = errors.New("fake failure")

// fakeStore is an in-memory database. fakeUnitOfWork runs each unit of work on
// a copy and keeps it only when the unit of work succeeds.
type fakeStore struct {
	assets     map[int64]Asset
	gallery    map[int64]bool
	purges     []string
	nextID     int64
	failInsert bool
}

func newFakeStore() *fakeStore {
	return &fakeStore{assets: map[int64]Asset{}, gallery: map[int64]bool{}}
}

func (s *fakeStore) clone() *fakeStore {
	c := *s
	c.assets = maps.Clone(s.assets)
	c.gallery = maps.Clone(s.gallery)
	c.purges = slices.Clone(s.purges)
	return &c
}

// add stores an asset as if it had been uploaded.
func (s *fakeStore) add(filename string) int64 {
	s.nextID++
	s.assets[s.nextID] = Asset{ID: s.nextID, Filename: filename}
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
	return nil
}

type fakeRepository struct {
	store *fakeStore
}

func (r fakeRepository) Lock(_ context.Context, ids []int64) ([]*Asset, error) {
	var locked []*Asset
	for _, id := range ids {
		if asset, ok := r.store.assets[id]; ok {
			locked = append(locked, &asset)
		}
	}
	return locked, nil
}

func (r fakeRepository) Insert(_ context.Context, batch []*Asset) error {
	for _, asset := range batch {
		if r.store.failInsert {
			return errFake
		}
		r.store.nextID++
		asset.ID = r.store.nextID
		r.store.assets[asset.ID] = *asset
	}
	return nil
}

func (r fakeRepository) Delete(_ context.Context, ids []int64) error {
	for _, id := range ids {
		delete(r.store.assets, id)
		delete(r.store.gallery, id)
	}
	return nil
}

type fakeGallery struct {
	store *fakeStore
}

func (g fakeGallery) Shows(_ context.Context, ids []int64) (bool, error) {
	return slices.ContainsFunc(ids, func(id int64) bool { return g.store.gallery[id] }), nil
}

type fakeCachePurges struct {
	store *fakeStore
}

func (c fakeCachePurges) Request(_ context.Context, scope string) error {
	c.store.purges = append(c.store.purges, scope)
	return nil
}

// fakeFiles stores file contents by name.
type fakeFiles struct {
	contents   map[string]string
	failUpload string
	failDelete bool
}

func newFakeFiles(names ...string) *fakeFiles {
	f := &fakeFiles{contents: map[string]string{}}
	for _, name := range names {
		f.contents[name] = ""
	}
	return f
}

func (f *fakeFiles) Upload(file io.ReadSeeker, name, _ string) (string, error) {
	if name == f.failUpload {
		return "", errFake
	}
	content, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}
	f.contents[name] = string(content)
	return "https://files.example.com/" + name, nil
}

func (f *fakeFiles) Exists(name string) (bool, error) {
	_, ok := f.contents[name]
	return ok, nil
}

func (f *fakeFiles) Delete(names []string) error {
	if f.failDelete {
		return errFake
	}
	for _, name := range names {
		delete(f.contents, name)
	}
	return nil
}

func (f *fakeFiles) names() []string {
	return slices.Sorted(maps.Keys(f.contents))
}
