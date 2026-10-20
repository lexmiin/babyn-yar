-- Earlier code addresses objects by file name and knows no statuses, so it
-- would delete the wrong objects of assets stored under UUID keys and leave
-- unfinished ones behind. Refuse to roll back while any such asset remains.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM assets WHERE status <> 'ready' OR storage_key <> file_name) THEN
    RAISE EXCEPTION 'assets stored under UUID keys or not ready; reconcile them before rolling back';
  END IF;
END $$;

DROP INDEX IF EXISTS assets_unsettled_idx;

ALTER TABLE assets
  DROP COLUMN status_changed_at,
  DROP COLUMN status,
  DROP COLUMN storage_key;
