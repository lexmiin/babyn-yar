package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lex-unix/babyn-yar/internal/config"
	"github.com/lex-unix/babyn-yar/internal/data"
	"github.com/lex-unix/babyn-yar/internal/jsonlog"
	"github.com/lex-unix/babyn-yar/internal/storage"
	"gopkg.in/boj/redistore.v1"
)

const (
	version     = "1.0.0"
	sessionName = "user-session"
)

type application struct {
	config       config.Config
	models       data.Models
	storage      *storage.S3Handler
	sessionStore sessions.Store
	logger       *jsonlog.Logger
}

func main() {
	if err := run(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.NewConfig()
	if err != nil {
		return err
	}

	logger := jsonlog.New(os.Stdout, jsonlog.LevelInfo)

	db, err := openDB(cfg)
	if err != nil {
		return err
	}

	defer db.Close()

	logger.PrintInfo("database connection pool established", nil)

	store, err := newSessionStore(cfg)
	if err != nil {
		return err
	}
	defer store.Close()

	logger.PrintInfo("redis store initialized", nil)

	storageHandler, err := storage.NewS3Handler(cfg)
	if err != nil {
		return err
	}

	logger.PrintInfo("storage handler initialized", nil)

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
		logger.PrintInfo("initialized new user", nil)
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
	store, err := redistore.NewRediStore(
		cfg.SessionStore.MaxIdleConns,
		"tcp",
		cfg.SessionStore.DSN,
		cfg.SessionStore.Password,
		[]byte(cfg.SessionStore.Secret))
	if err != nil {
		log.Fatal(err)
	}

	store.Options.Secure = cfg.Env != "development"
	store.Options.SameSite = http.SameSiteLaxMode
	store.Options.HttpOnly = true

	return store, nil
}
