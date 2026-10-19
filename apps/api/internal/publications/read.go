package publications

import (
	"encoding/json"
	"time"
)

// Summary is one translation of a publication as lists show it.
type Summary struct {
	ID                 int64     `json:"id"`
	Kind               Kind      `json:"kind"`
	Locale             Locale    `json:"locale"`
	OccurredOn         time.Time `json:"occurredOn"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	Cover              string    `json:"cover"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
	PublicationVersion int32     `json:"publicationVersion"`
	Publisher          Publisher `json:"publisher"`
}

type Publisher struct {
	ID       int64  `json:"id"`
	FullName string `json:"fullName"`
}

// Detail is one translation of a publication with its full content.
type Detail struct {
	Summary
	Content   json.RawMessage `json:"content"`
	Documents []string        `json:"documents"`
}
