package data

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type GalleryImage struct {
	ID        int64     `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	URL       string    `json:"url"`
}

type GalleryModel struct {
	DB *pgxpool.Pool
}

func (m GalleryModel) Insert(img *GalleryImage) error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	err = tx.QueryRow(ctx, `
		INSERT INTO gallery_images (id, url)
		VALUES ($1, $2)
		RETURNING id
	`, img.ID, img.URL).Scan(&img.ID)
	if err != nil {
		return err
	}
	if err := enqueueCachePurge(ctx, tx, "gallery"); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (m GalleryModel) Get(id int64) (*GalleryImage, error) {
	if id < 1 {
		return nil, ErrRecordNotFound
	}

	query := `
		SELECT id, created_at, url
		FROM gallery_images
		WHERE id = $1`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var img GalleryImage
	err := m.DB.QueryRow(ctx, query, id).Scan(
		&img.ID,
		&img.CreatedAt,
		&img.URL,
	)
	if err != nil {
		return nil, err
	}

	return &img, nil
}

func (m GalleryModel) GetAll() ([]*GalleryImage, error) {
	query := `
		SELECT id, created_at, url
		FROM gallery_images
		ORDER BY created_at ASC`

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	rows, err := m.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	imgs, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (*GalleryImage, error) {
		var img GalleryImage
		err := row.Scan(
			&img.ID,
			&img.CreatedAt,
			&img.URL,
		)
		if err != nil {
			return nil, err
		}
		return &img, nil
	})

	if err != nil {
		return nil, err
	}

	return imgs, nil
}

func (m GalleryModel) Delete(id int64) error {
	if id < 1 {
		return ErrRecordNotFound
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	tx, err := m.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	result, err := tx.Exec(ctx, `
		DELETE FROM gallery_images
		WHERE id = $1
	`, id)
	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return ErrRecordNotFound
	}
	if err := enqueueCachePurge(ctx, tx, "gallery"); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
