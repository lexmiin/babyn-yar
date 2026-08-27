CREATE TABLE cache_purge_requests (
  id bigserial PRIMARY KEY,
  scope text NOT NULL CHECK (scope IN (
    'gallery',
    'event',
    'book',
    'holocaust_document',
    'legal_document',
    'victim_testimony',
    'media_article',
    'partner',
    'development_concept'
  )),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  available_at timestamp with time zone NOT NULL DEFAULT NOW(),
  leased_until timestamp with time zone,
  last_error text,
  created_at timestamp with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX cache_purge_requests_available_idx
ON cache_purge_requests (available_at, id);
