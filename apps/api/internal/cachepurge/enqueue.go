package cachepurge

import (
	"context"
	"fmt"

	"github.com/lex-unix/babyn-yar/internal/database"
)

// Enqueue requests a purge of the public pages under scope. Call it in the
// transaction that changes those pages, so the request commits with the change.
func Enqueue(ctx context.Context, db database.DBTX, scope string) error {
	if _, ok := scopePaths[scope]; !ok {
		return fmt.Errorf("unsupported cache purge scope %q", scope)
	}

	_, err := db.Exec(ctx, `
		INSERT INTO cache_purge_requests (scope)
		VALUES ($1)
	`, scope)
	return err
}
