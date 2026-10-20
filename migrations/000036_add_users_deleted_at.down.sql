DROP INDEX users_email_key;

-- Fails when a deleted user's email has been registered again.
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE users DROP COLUMN deleted_at;
