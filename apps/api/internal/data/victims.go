package data

import (
	"context"
	"time"

	sq "github.com/Masterminds/squirrel"
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
	query := psql.
		Select(
			"count(*) OVER()",
			"id",
			"full_name",
			"info",
			"version",
		).
		From("victims").
		OrderBy("id").
		Limit(uint64(filters.limit())).
		Offset(uint64(filters.offset()))

	if fullname != "" {
		query = query.Where(sq.Expr(
			"to_tsvector('simple', full_name) @@ plainto_tsquery('simple', ?)",
			fullname,
		))
	}

	if info != "" {
		query = query.Where(sq.Expr(
			"to_tsvector('simple', info) @@ plainto_tsquery('simple', ?)",
			info,
		))
	}

	sql, args, err := query.ToSql()
	if err != nil {
		return nil, Metadata{}, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, sql, args...)
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
