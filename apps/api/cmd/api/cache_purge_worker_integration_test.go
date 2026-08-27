package main

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/config"
	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type recordingCachePurger struct {
	calls [][]string
	err   error
}

func (purger *recordingCachePurger) PurgePrefixes(_ context.Context, prefixes []string) error {
	purger.calls = append(purger.calls, append([]string(nil), prefixes...))
	return purger.err
}

func TestCachePurgeWorkerCompletesSuccessfulBatch(t *testing.T) {
	db := newTestDatabase(t)
	applyTestMigrations(t, db)

	insertCachePurge(t, db, data.CachePurgeRequest{
		Scope: "event",
	})
	insertCachePurge(t, db, data.CachePurgeRequest{
		Scope: "book",
	})
	insertCachePurge(t, db, data.CachePurgeRequest{
		Scope: "event",
	})
	insertCachePurge(t, db, data.CachePurgeRequest{
		Scope: "gallery",
	})

	purger := &recordingCachePurger{}
	app := cachePurgeTestApplication(db, purger)
	processed, err := app.processCachePurgeBatch(context.Background())
	require.NoError(t, err)
	assert.True(t, processed)
	require.Len(t, purger.calls, 1)
	assert.ElementsMatch(t, []string{
		"babynyar.gov.ua/events",
		"babynyar.gov.ua/en/events",
		"babynyar.gov.ua/education/library",
		"babynyar.gov.ua/en/education/library",
		"babynyar.gov.ua/gallery",
		"babynyar.gov.ua/en/gallery",
	}, purger.calls[0])
	assert.Equal(t, 0, cachePurgeCount(t, db))
}

func TestCachePurgeWorkerRetriesFailedBatch(t *testing.T) {
	db := newTestDatabase(t)
	applyTestMigrations(t, db)
	insertCachePurge(t, db, data.CachePurgeRequest{
		Scope: "event",
	})

	purger := &recordingCachePurger{err: errors.New("Cloudflare unavailable")}
	app := cachePurgeTestApplication(db, purger)
	processed, err := app.processCachePurgeBatch(context.Background())
	assert.True(t, processed)
	assert.EqualError(t, err, "Cloudflare unavailable")

	var attempts int
	var leasedUntil *time.Time
	var availableAt time.Time
	var lastError string
	err = db.QueryRow(context.Background(), `
		SELECT attempts, leased_until, available_at, last_error
		FROM cache_purge_requests
	`).Scan(&attempts, &leasedUntil, &availableAt, &lastError)
	require.NoError(t, err)
	assert.Equal(t, 1, attempts)
	assert.Nil(t, leasedUntil)
	assert.True(t, availableAt.After(time.Now()))
	assert.Equal(t, "Cloudflare unavailable", lastError)
}

func TestCachePurgeClaimUsesExpiringLeases(t *testing.T) {
	db := newTestDatabase(t)
	applyTestMigrations(t, db)
	insertCachePurge(t, db, data.CachePurgeRequest{
		Scope: "event",
	})

	cachePurges := data.NewModels(db).CachePurges
	firstClaim, err := cachePurges.Claim(context.Background(), 1, time.Minute)
	require.NoError(t, err)
	require.Len(t, firstClaim, 1)
	assert.Equal(t, 1, firstClaim[0].Attempts)

	secondClaim, err := cachePurges.Claim(context.Background(), 1, time.Minute)
	require.NoError(t, err)
	assert.Empty(t, secondClaim, "another worker must not claim an active lease")

	_, err = db.Exec(context.Background(), `UPDATE cache_purge_requests SET leased_until = NOW() - interval '1 second'`)
	require.NoError(t, err)
	recoveredClaim, err := cachePurges.Claim(context.Background(), 1, time.Minute)
	require.NoError(t, err)
	require.Len(t, recoveredClaim, 1)
	assert.Equal(t, firstClaim[0].ID, recoveredClaim[0].ID)
	assert.Equal(t, 2, recoveredClaim[0].Attempts)
}

func cachePurgeTestApplication(db *pgxpool.Pool, purger cachePurger) *application {
	cfg := config.Config{Env: "test"}
	cfg.Cloudflare.PublicSiteURL = "https://babynyar.gov.ua"
	return &application{
		config:      cfg,
		models:      data.NewModels(db),
		logger:      slog.New(slog.NewTextHandler(io.Discard, nil)),
		cachePurger: purger,
	}
}

func insertCachePurge(t *testing.T, db *pgxpool.Pool, purge data.CachePurgeRequest) {
	t.Helper()
	_, err := db.Exec(context.Background(), `
		INSERT INTO cache_purge_requests (scope)
		VALUES ($1)
	`, purge.Scope)
	require.NoError(t, err)
}

func cachePurgeCount(t *testing.T, db *pgxpool.Pool) int {
	t.Helper()
	var count int
	err := db.QueryRow(context.Background(), `SELECT count(*) FROM cache_purge_requests`).Scan(&count)
	require.NoError(t, err)
	return count
}
