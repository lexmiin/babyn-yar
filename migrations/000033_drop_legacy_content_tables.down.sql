CREATE TABLE events (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  lang text NOT NULL,
  cover text NOT NULL,
  user_id bigint NOT NULL REFERENCES users(id),
  occured_on date NOT NULL,
  documents text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE victim_testimonies (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  documents text[] NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id),
  occured_on date NOT NULL
);

CREATE TABLE books (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  documents text[] NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id),
  occured_on date NOT NULL
);

CREATE TABLE holocaust_documents (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id),
  occured_on date NOT NULL
);

CREATE TABLE media_articles (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  occured_on date NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id)
);

CREATE TABLE partners (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  occured_on date NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id)
);

CREATE TABLE legal_documents (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  occured_on date NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id),
  documents text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE development_concepts (
  id bigserial PRIMARY KEY,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  occured_on date NOT NULL DEFAULT NOW(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  lang text NOT NULL,
  cover text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  user_id bigint NOT NULL REFERENCES users(id)
);

CREATE TABLE event_translations (
  id bigserial PRIMARY KEY,
  english_id bigint NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ukrainian_id bigint NOT NULL REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE media_articles_translations (
  id bigserial PRIMARY KEY,
  english_id bigint NOT NULL REFERENCES media_articles(id) ON DELETE CASCADE,
  ukrainian_id bigint NOT NULL REFERENCES media_articles(id) ON DELETE CASCADE
);

CREATE TABLE partners_translations (
  id bigserial PRIMARY KEY,
  english_id bigint NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  ukrainian_id bigint NOT NULL REFERENCES partners(id) ON DELETE CASCADE
);

CREATE TABLE books_translations (
  id bigserial PRIMARY KEY,
  english_id bigint NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  ukrainian_id bigint NOT NULL REFERENCES books(id) ON DELETE CASCADE
);

CREATE TABLE holocaust_documents_translations (
  id bigserial PRIMARY KEY,
  english_id bigint NOT NULL REFERENCES holocaust_documents(id) ON DELETE CASCADE,
  ukrainian_id bigint NOT NULL REFERENCES holocaust_documents(id) ON DELETE CASCADE
);

DO $$
DECLARE
  legacy_kind text;
  legacy_table text;
  has_documents boolean;
BEGIN
  FOR legacy_kind, legacy_table, has_documents IN
    SELECT * FROM (VALUES
      ('event', 'events', true),
      ('book', 'books', true),
      ('holocaust_document', 'holocaust_documents', false),
      ('legal_document', 'legal_documents', true),
      ('victim_testimony', 'victim_testimonies', true),
      ('media_article', 'media_articles', false),
      ('partner', 'partners', false),
      ('development_concept', 'development_concepts', false)
    ) AS legacy_tables(kind, table_name, includes_documents)
  LOOP
    EXECUTE format(
      'INSERT INTO %I (
        id, created_at, updated_at, title, description, content, lang, cover,
        version, user_id, occured_on%s
      )
      SELECT
        translation.id,
        translation.created_at,
        translation.updated_at,
        translation.title,
        translation.description,
        translation.content::text,
        CASE translation.locale WHEN ''uk'' THEN ''ua'' ELSE translation.locale END,
        translation.cover,
        publication.version,
        translation.publisher_id,
        publication.occurred_on%s
      FROM publication_translations translation
      JOIN publications publication ON publication.id = translation.publication_id
      WHERE publication.kind = $1',
      legacy_table,
      CASE WHEN has_documents THEN ', documents' ELSE '' END,
      CASE WHEN has_documents THEN ', translation.documents' ELSE '' END
    ) USING legacy_kind;

    EXECUTE format(
      'SELECT setval(
        pg_get_serial_sequence(%L, ''id''),
        COALESCE((SELECT max(id) FROM %I), 1),
        EXISTS (SELECT 1 FROM %I)
      )',
      legacy_table,
      legacy_table,
      legacy_table
    );
  END LOOP;
END;
$$;

INSERT INTO event_translations (english_id, ukrainian_id)
SELECT english.id, ukrainian.id
FROM publications publication
JOIN publication_translations english
  ON english.publication_id = publication.id AND english.locale = 'en'
JOIN publication_translations ukrainian
  ON ukrainian.publication_id = publication.id AND ukrainian.locale = 'uk'
WHERE publication.kind = 'event';

INSERT INTO books_translations (english_id, ukrainian_id)
SELECT english.id, ukrainian.id
FROM publications publication
JOIN publication_translations english
  ON english.publication_id = publication.id AND english.locale = 'en'
JOIN publication_translations ukrainian
  ON ukrainian.publication_id = publication.id AND ukrainian.locale = 'uk'
WHERE publication.kind = 'book';

INSERT INTO holocaust_documents_translations (english_id, ukrainian_id)
SELECT english.id, ukrainian.id
FROM publications publication
JOIN publication_translations english
  ON english.publication_id = publication.id AND english.locale = 'en'
JOIN publication_translations ukrainian
  ON ukrainian.publication_id = publication.id AND ukrainian.locale = 'uk'
WHERE publication.kind = 'holocaust_document';

INSERT INTO media_articles_translations (english_id, ukrainian_id)
SELECT english.id, ukrainian.id
FROM publications publication
JOIN publication_translations english
  ON english.publication_id = publication.id AND english.locale = 'en'
JOIN publication_translations ukrainian
  ON ukrainian.publication_id = publication.id AND ukrainian.locale = 'uk'
WHERE publication.kind = 'media_article';

INSERT INTO partners_translations (english_id, ukrainian_id)
SELECT english.id, ukrainian.id
FROM publications publication
JOIN publication_translations english
  ON english.publication_id = publication.id AND english.locale = 'en'
JOIN publication_translations ukrainian
  ON ukrainian.publication_id = publication.id AND ukrainian.locale = 'uk'
WHERE publication.kind = 'partner';
