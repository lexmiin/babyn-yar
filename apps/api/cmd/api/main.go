package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/boj/redistore/v2"
	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/config"
	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/lex-unix/babyn-yar/internal/storage"
)

const (
	version     = "1.0.0"
	sessionName = "user-session"
)

type application struct {
	config       config.Config
	models       data.Models
	storage      storage.Storage
	sessionStore sessions.Store
	logger       *slog.Logger
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))

	if err := run(logger); err != nil {
		logger.Error("application failed", "err", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.NewConfig()
	if err != nil {
		return err
	}

	db, err := openDB(cfg)
	if err != nil {
		return err
	}

	defer db.Close()

	logger.Info("database connection pool established")

	store, err := newSessionStore(cfg)
	if err != nil {
		return err
	}
	defer store.Close()

	logger.Info("redis store initialized")

	storageHandler, err := storage.NewS3Handler(cfg)
	if err != nil {
		return err
	}

	logger.Info("storage handler initialized")

	if cfg.Seed {
		err := data.SeedInitialUser(
			db,
			os.Getenv("SEED_USER_NAME"),
			os.Getenv("SEED_USER_EMAIL"),
			os.Getenv("SEED_USER_PASSWORD"),
		)
		if err != nil {
			return err
		}
		logger.Info("initialized new user")
	}

	app := &application{
		config:       cfg,
		models:       data.NewModels(db),
		storage:      storageHandler,
		sessionStore: store,
		logger:       logger,
	}

	err = app.serve()
	if err != nil {
		return err
	}

	return nil
}

func openDB(cfg config.Config) (*pgxpool.Pool, error) {
	db, err := pgxpool.New(context.Background(), cfg.DB.DSN)
	if err != nil {
		return nil, err
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.Ping(ctx)
	if err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func newSessionStore(cfg config.Config) (*redistore.RediStore, error) {
	store, err := redistore.NewStore(
		redistore.KeysFromStrings(cfg.SessionStore.Secret),
		redistore.WithAddress("tcp", cfg.SessionStore.DSN),
		redistore.WithPassword(cfg.SessionStore.Password),
		redistore.WithPoolSize(cfg.SessionStore.MaxIdleConns),
	)
	if err != nil {
		return nil, err
	}

	store.Options.Secure = cfg.Env != "development"
	store.Options.SameSite = http.SameSiteLaxMode
	store.Options.HttpOnly = true

	return store, nil
}
