DO $$
BEGIN
  -- Keep deactivation writes from racing the check and column removal.
  LOCK TABLE users IN ACCESS EXCLUSIVE MODE;

  IF EXISTS (SELECT 1 FROM users WHERE deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'cannot roll back user soft deletion while deactivated accounts exist';
  END IF;

  ALTER TABLE users DROP COLUMN deleted_at;
END;
$$;
