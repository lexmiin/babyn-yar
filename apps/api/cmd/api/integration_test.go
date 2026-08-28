package main

import (
	"context"
	"io"
	"log/slog"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/config"
	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

type apiTest struct {
	db     *pgxpool.Pool
	server *httptest.Server
}

func newAPITest(t *testing.T) *apiTest {
	t.Helper()
	db := newTestDatabase(t)
	applyTestMigrations(t, db)

	cfg := config.Config{Env: "test"}
	app := &application{
		config:       cfg,
		models:       data.NewModels(db),
		sessionStore: sessions.NewCookieStore([]byte("test-session-secret")),
		logger:       slog.New(slog.NewJSONHandler(io.Discard, nil)),
	}

	server := httptest.NewServer(app.routes())
	t.Cleanup(server.Close)

	return &apiTest{db: db, server: server}
}

func newTestDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()

	ctx := context.Background()
	postgresContainer, err := postgres.Run(
		ctx,
		"postgres:16-alpine",
		postgres.WithDatabase("babyn_yar_test"),
		postgres.WithUsername("postgres"),
		postgres.WithPassword("postgres"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(time.Minute),
		),
	)
	testcontainers.CleanupContainer(t, postgresContainer)
	require.NoError(t, err, "start isolated postgresql test container")

	dsn, err := postgresContainer.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err, "get postgresql test connection string")

	cfg := config.Config{Env: "test"}
	cfg.DB.DSN = dsn

	db, err := openDB(cfg)
	require.NoError(t, err, "open postgresql test database")
	t.Cleanup(db.Close)
	return db
}

func applyTestMigrations(t *testing.T, db *pgxpool.Pool) {
	t.Helper()
	applyTestMigrationsBefore(t, db, "")
}

func applyTestMigrationsBefore(t *testing.T, db *pgxpool.Pool, before string) {
	t.Helper()

	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	require.NotEmpty(t, migrationsDir, "MIGRATIONS_DIR should be set for tests")
	entries, err := os.ReadDir(migrationsDir)
	require.NoError(t, err, "read repository migrations from %s", migrationsDir)

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".up.sql") {
			continue
		}
		if before != "" && entry.Name() >= before {
			continue
		}

		err = applyTestMigration(t, db, entry.Name())
		require.NoError(t, err, "apply migration %s", entry.Name())
	}
}

func applyTestMigration(t *testing.T, db *pgxpool.Pool, name string) error {
	t.Helper()

	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	require.NotEmpty(t, migrationsDir, "MIGRATIONS_DIR should be set for tests")
	migration, err := os.ReadFile(filepath.Join(migrationsDir, name))
	require.NoError(t, err, "read migration %s", name)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	_, err = db.Exec(ctx, string(migration))
	return err
}
