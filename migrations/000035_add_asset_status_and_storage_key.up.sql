-- Existing objects are stored under their file names; new uploads use UUIDs.
ALTER TABLE assets
  ADD COLUMN storage_key text,
  ADD COLUMN status text NOT NULL DEFAULT 'ready'
    CHECK (status IN ('pending', 'ready', 'deleting')),
  ADD COLUMN status_changed_at timestamp with time zone NOT NULL DEFAULT NOW();

UPDATE assets SET storage_key = file_name;

ALTER TABLE assets
  ALTER COLUMN storage_key SET NOT NULL,
  ALTER COLUMN status DROP DEFAULT,
  ADD CONSTRAINT assets_storage_key_key UNIQUE (storage_key);

CREATE INDEX assets_unsettled_idx
ON assets (status_changed_at)
WHERE status <> 'ready';
