package main

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestErrorReportThrottle(t *testing.T) {
	start := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	outage := errors.New("cloudflare unavailable")
	throttle := errorReportThrottle{interval: time.Hour}

	assert.True(t, throttle.allow(outage, start), "first failure")
	assert.False(t, throttle.allow(outage, start.Add(30*time.Minute)), "same failure within the interval")
	assert.True(t, throttle.allow(errors.New("database unavailable"), start.Add(31*time.Minute)), "different failure")
	assert.False(t, throttle.allow(errors.New("database unavailable"), start.Add(32*time.Minute)), "repeat of the new failure")
	assert.True(t, throttle.allow(errors.New("database unavailable"), start.Add(92*time.Minute)), "same failure after the interval")
}
