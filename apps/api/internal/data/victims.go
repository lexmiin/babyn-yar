package data

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Victim struct {
	ID       int64  `json:"id"`
	Fullname string `json:"fullname"`
	Info     string `json:"info"`
	Version  int32  `json:"version"`
}

type VictimModel struct {
	DB *pgxpool.Pool
}

func (m VictimModel) GetAll(fullname string, info string, filters Filters) ([]*Victim, Metadata, error) {
	// sorting by id here because of mixed langauge in full_name column
	// full_name ordering gives unexpected results
	// because this table probably won't change this is okay
	query := `
		SELECT count(*) OVER(), id, full_name, info, version
		FROM victims
		WHERE (to_tsvector('simple', full_name) @@ plainto_tsquery('simple', $1) OR $1 = '')
		AND (to_tsvector('simple', info) @@ plainto_tsquery('simple', $2) OR $2 = '')
		ORDER BY id
		LIMIT $3 OFFSET $4`
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)

	defer cancel()

	args := []any{fullname, info, filters.limit(), filters.offset()}

	rows, err := m.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, Metadata{}, err
	}
	defer rows.Close()

	totalRecords := 0
	victims, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*Victim, error) {
		var victim Victim
		err := row.Scan(&totalRecords, &victim.ID, &victim.Fullname, &victim.Info, &victim.Version)
		return &victim, err
	})

	if err != nil {
		return nil, Metadata{}, err
	}

	metadata := calculateMetadata(totalRecords, filters.Page, filters.PageSize)

	return victims, metadata, nil
}
