package main

import (
	"context"
	"errors"
	"time"
)

const (
	assetSweepBatchSize    = 50
	assetSweepPollInterval = 5 * time.Minute
)

// runAssetSweeper removes assets left pending or deleting, such as uploads
// interrupted by a crash, until ctx is canceled.
func (app *application) runAssetSweeper(ctx context.Context) {
	app.logger.Info("asset sweeper started")
	defer app.logger.Info("asset sweeper stopped")

	for {
		removed, err := app.assets.Sweep(ctx, assetSweepBatchSize)
		if err != nil && !errors.Is(err, context.Canceled) {
			app.logger.Error("asset sweep failed", "err", err)
		}
		if removed > 0 {
			app.logger.Info("swept stale assets", "assets", removed)
		}
		if ctx.Err() != nil {
			return
		}
		if removed == assetSweepBatchSize {
			continue
		}

		timer := time.NewTimer(assetSweepPollInterval)
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
		}
	}
}
