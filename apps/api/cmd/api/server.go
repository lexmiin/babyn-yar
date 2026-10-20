package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"
)

func (app *application) serve() error {
	workerContext, stopWorker := context.WithCancel(context.Background())
	var workers sync.WaitGroup
	workers.Go(func() { app.runCachePurgeWorker(workerContext) })
	workers.Go(func() { app.runAssetSweeper(workerContext) })
	defer func() {
		stopWorker()
		workers.Wait()
	}()

	srv := http.Server{
		Addr:     fmt.Sprintf(":%d", app.config.Port),
		Handler:  app.routes(),
		ErrorLog: slog.NewLogLogger(app.logger.Handler(), slog.LevelError),
	}

	shutdownError := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		s := <-quit

		app.logger.Info("shutting down server", "signal", s.String())

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		shutdownError <- srv.Shutdown(ctx)
	}()

	app.logger.Info(
		"starting server",
		"addr", srv.Addr,
		"env", app.config.Env,
	)

	err := srv.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	err = <-shutdownError
	if err != nil {
		return err
	}

	app.logger.Info("stopped server", "addr", srv.Addr)

	return nil
}
