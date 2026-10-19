package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/config"
	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/lex-unix/babyn-yar/internal/publications"
	publicationspg "github.com/lex-unix/babyn-yar/internal/publications/postgres"
	"github.com/lex-unix/babyn-yar/internal/users"
	userspg "github.com/lex-unix/babyn-yar/internal/users/postgres"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
	"golang.org/x/crypto/bcrypt"
)

type apiTest struct {
	db     *pgxpool.Pool
	server *httptest.Server
	users  *users.Service
}

func newAPITest(t *testing.T) *apiTest {
	t.Helper()
	db := newTestDatabase(t)

	cfg := config.Config{Env: "test"}
	// The lowest bcrypt cost keeps sign-ins fast; the cost is not under test.
	userService := users.NewService(
		userspg.UnitOfWork{DB: db},
		userspg.NewUserRepository(db),
		users.WithPasswordCost(bcrypt.MinCost),
	)
	app := &application{
		config:             cfg,
		models:             data.NewModels(db),
		users:              userService,
		userQueries:        userspg.Queries{DB: db},
		publications:       publications.NewService(publicationspg.UnitOfWork{DB: db}),
		publicationQueries: publicationspg.Queries{DB: db},
		sessionStore:       sessions.NewCookieStore([]byte("test-session-secret")),
		logger:             slog.New(slog.NewJSONHandler(io.Discard, nil)),
	}

	server := httptest.NewServer(app.routes())
	t.Cleanup(server.Close)

	return &apiTest{db: db, server: server, users: userService}
}

// testPostgres is the Postgres server shared by every test in the package.
// TestMain starts it and migrates the template each test's database is
// cloned from.
var testPostgres struct {
	admin *pgxpool.Pool
	url   url.URL
}

var testDatabaseSeq atomic.Int64

const templateDatabase = "babyn_yar_template"

func TestMain(m *testing.M) {
	os.Exit(runTests(m))
}

// runTests returns instead of exiting so its deferred cleanup runs.
func runTests(m *testing.M) int {
	ctx := context.Background()
	container, err := postgres.Run(
		ctx,
		"postgres:16-alpine",
		postgres.WithDatabase(templateDatabase),
		postgres.WithUsername("postgres"),
		postgres.WithPassword("postgres"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(time.Minute),
		),
	)
	defer func() {
		if err := testcontainers.TerminateContainer(container); err != nil {
			fmt.Fprintln(os.Stderr, "terminate postgresql test container:", err)
		}
	}()
	if err != nil {
		fmt.Fprintln(os.Stderr, "start postgresql test container:", err)
		return 1
	}

	if err := prepareTestPostgres(ctx, container); err != nil {
		fmt.Fprintln(os.Stderr, "prepare postgresql test template:", err)
		return 1
	}
	defer testPostgres.admin.Close()

	return m.Run()
}

func prepareTestPostgres(ctx context.Context, container *postgres.PostgresContainer) error {
	dsn, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		return err
	}
	base, err := url.Parse(dsn)
	if err != nil {
		return err
	}
	testPostgres.url = *base

	template, err := openTestPool(templateDatabase)
	if err != nil {
		return err
	}
	err = applyTestMigrations(ctx, template)
	template.Close()
	if err != nil {
		return err
	}

	testPostgres.admin, err = openTestPool("postgres")
	if err != nil {
		return err
	}
	// Postgres cannot clone a database that has connections, so refuse them.
	_, err = testPostgres.admin.Exec(ctx, `ALTER DATABASE `+templateDatabase+` WITH ALLOW_CONNECTIONS false`)
	return err
}

func applyTestMigrations(ctx context.Context, db *pgxpool.Pool) error {
	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		return errors.New("MIGRATIONS_DIR should be set for tests")
	}
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read repository migrations: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".up.sql") {
			continue
		}
		migration, err := os.ReadFile(filepath.Join(migrationsDir, entry.Name()))
		if err != nil {
			return fmt.Errorf("read migration %s: %w", entry.Name(), err)
		}
		if _, err := db.Exec(ctx, string(migration)); err != nil {
			return fmt.Errorf("apply migration %s: %w", entry.Name(), err)
		}
	}
	return nil
}

func openTestPool(database string) (*pgxpool.Pool, error) {
	dsn := testPostgres.url
	dsn.Path = "/" + database

	cfg := config.Config{Env: "test"}
	cfg.DB.DSN = dsn.String()
	return openDB(cfg)
}

// newTestDatabase returns a migrated database of the test's own, cloned from
// the template and dropped when the test ends.
func newTestDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()

	name := fmt.Sprintf("test_%d", testDatabaseSeq.Add(1))
	_, err := testPostgres.admin.Exec(t.Context(), `CREATE DATABASE `+name+` TEMPLATE `+templateDatabase)
	require.NoError(t, err, "clone the migrated template database")

	db, err := openTestPool(name)
	require.NoError(t, err, "open the test database")
	t.Cleanup(func() {
		db.Close()
		_, err := testPostgres.admin.Exec(context.Background(), `DROP DATABASE `+name+` WITH (FORCE)`)
		assert.NoError(t, err, "drop the test database")
	})
	return db
}
