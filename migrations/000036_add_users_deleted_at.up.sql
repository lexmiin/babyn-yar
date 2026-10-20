-- Deleted users stay behind so the content they published keeps its author.
ALTER TABLE users ADD COLUMN deleted_at timestamp(0) with time zone;

-- A deleted user's email may be registered again.
ALTER TABLE users DROP CONSTRAINT users_email_key;

CREATE UNIQUE INDEX users_email_key
ON users (email)
WHERE deleted_at IS NULL;
