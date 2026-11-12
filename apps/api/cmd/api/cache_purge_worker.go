package main

import (
	"context"
	"errors"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/lex-unix/babyn-yar/internal/cachepurge"
)

const (
	cachePurgeBatchSize = 30
	// The SQL row lock exists only while Claim runs. This lease makes a claimed
	// purge temporarily invisible and lets another worker recover it after a crash.
	cachePurgeLease        = 30 * time.Second
	cachePurgePollInterval = 2 * time.Second
	cachePurgeMaxRetry     = 15 * time.Minute
	cachePurgeErrorLimit   = 2000
	// The worker polls every few seconds and retries failed purges, so an
	// outage would otherwise send Sentry the same error over and over.
	cachePurgeReportInterval = time.Hour
)

// errorReportThrottle decides which failures of a polling loop to report. A
// failure is reported when its message differs from the last one reported, or
// when the interval has passed since that report.
type errorReportThrottle struct {
	interval   time.Duration
	message    string
	reportedAt time.Time
}

func (t *errorReportThrottle) allow(err error, now time.Time) bool {
	message := err.Error()
	if message == t.message && now.Sub(t.reportedAt) < t.interval {
		return false
	}
	t.message = message
	t.reportedAt = now
	return true
}

type cachePurger interface {
	PurgePrefixes(context.Context, []string) error
}

type nopCachePurger struct{}

func (nopCachePurger) PurgePrefixes(context.Context, []string) error {
	return nil
}

func (app *application) runCachePurgeWorker(ctx context.Context) {
	app.logger.Info("cache purge outbox worker started")
	defer app.logger.Info("cache purge outbox worker stopped")

	reports := errorReportThrottle{interval: cachePurgeReportInterval}

	for {
		processed, err := app.processCachePurgeBatch(ctx)
		if err != nil && !errors.Is(err, context.Canceled) {
			app.logger.Error("cache purge worker failed", "err", err)
			if reports.allow(err, time.Now()) {
				sentry.CaptureException(err)
			}
		}
		if ctx.Err() != nil {
			return
		}
		if processed {
			continue
		}

		timer := time.NewTimer(cachePurgePollInterval)
		select {
		case <-ctx.Done():
			timer.Stop()
			return
		case <-timer.C:
		}
	}
}

func (app *application) processCachePurgeBatch(ctx context.Context) (bool, error) {
	purges, err := app.models.CachePurges.Claim(
		ctx,
		cachePurgeBatchSize,
		cachePurgeLease,
	)
	if err != nil {
		return false, err
	}
	if len(purges) == 0 {
		return false, nil
	}

	ids := make([]int64, 0, len(purges))
	prefixes := make([]string, 0, len(purges)*2)
	seenPrefixes := make(map[string]struct{}, len(purges)*2)
	maxAttempts := 0
	for _, purge := range purges {
		ids = append(ids, purge.ID)
		if purge.Attempts > maxAttempts {
			maxAttempts = purge.Attempts
		}
	}

	for _, purge := range purges {
		scopePrefixes, err := cachepurge.ScopePrefixes(
			app.config.Cloudflare.PublicSiteURL,
			purge.Scope,
		)
		if err != nil {
			return true, app.retryCachePurges(ctx, ids, maxAttempts, err)
		}
		for _, prefix := range scopePrefixes {
			if _, exists := seenPrefixes[prefix]; exists {
				continue
			}
			seenPrefixes[prefix] = struct{}{}
			prefixes = append(prefixes, prefix)
		}
	}

	if err := app.cachePurger.PurgePrefixes(ctx, prefixes); err != nil {
		return true, app.retryCachePurges(ctx, ids, maxAttempts, err)
	}
	if err := app.models.CachePurges.Complete(ctx, ids); err != nil {
		return true, err
	}

	app.logger.Info(
		"purged cache prefixes",
		"purges", len(purges),
		"prefixes", len(prefixes),
	)
	return true, nil
}

func (app *application) retryCachePurges(ctx context.Context, ids []int64, attempts int, cause error) error {
	delay := cachePurgeRetryDelay(attempts)
	message := cause.Error()
	messageRunes := []rune(message)
	if len(messageRunes) > cachePurgeErrorLimit {
		message = string(messageRunes[:cachePurgeErrorLimit])
	}
	if err := app.models.CachePurges.Retry(ctx, ids, delay, message); err != nil {
		return errors.Join(cause, err)
	}
	return cause
}

func cachePurgeRetryDelay(attempts int) time.Duration {
	delay := 5 * time.Second
	for attempt := 1; attempt < attempts && delay < cachePurgeMaxRetry; attempt++ {
		delay *= 2
		if delay > cachePurgeMaxRetry {
			return cachePurgeMaxRetry
		}
	}
	return delay
}
