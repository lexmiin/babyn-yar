CREATE TABLE publications (
  id bigserial PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN (
    'event',
    'book',
    'holocaust_document',
    'legal_document',
    'victim_testimony',
    'media_article',
    'partner',
    'development_concept'
  )),
  occurred_on date NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);

CREATE TABLE publication_translations (
  id bigserial PRIMARY KEY,
  publication_id bigint NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
  locale text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  content jsonb NOT NULL,
  cover text NOT NULL,
  documents text[] NOT NULL DEFAULT '{}',
  publisher_id bigint NOT NULL REFERENCES users(id),
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  UNIQUE (publication_id, locale)
);

CREATE FUNCTION reject_publication_kind_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.kind IS DISTINCT FROM OLD.kind THEN
    RAISE EXCEPTION 'publication kind is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER publications_kind_is_immutable
BEFORE UPDATE OF kind ON publications
FOR EACH ROW
EXECUTE FUNCTION reject_publication_kind_change();

CREATE FUNCTION reject_publication_translation_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.publication_id IS DISTINCT FROM OLD.publication_id THEN
    RAISE EXCEPTION 'publication translation publication is immutable';
  END IF;
  IF NEW.publisher_id IS DISTINCT FROM OLD.publisher_id THEN
    RAISE EXCEPTION 'publication translation publisher is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER publication_translation_fields_are_immutable
BEFORE UPDATE OF publication_id, publisher_id ON publication_translations
FOR EACH ROW
EXECUTE FUNCTION reject_publication_translation_immutable_fields();

CREATE TEMPORARY TABLE legacy_publication_source ON COMMIT DROP AS
SELECT
  'event'::text AS kind,
  id AS legacy_id,
  occured_on AS occurred_on,
  created_at,
  updated_at,
  title,
  description,
  content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END AS locale,
  cover,
  documents,
  user_id AS publisher_id
FROM events
UNION ALL
SELECT
  'book', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, documents, user_id
FROM books
UNION ALL
SELECT
  'holocaust_document', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, ARRAY[]::text[], user_id
FROM holocaust_documents
UNION ALL
SELECT
  'legal_document', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, documents, user_id
FROM legal_documents
UNION ALL
SELECT
  'victim_testimony', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, documents, user_id
FROM victim_testimonies
UNION ALL
SELECT
  'media_article', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, ARRAY[]::text[], user_id
FROM media_articles
UNION ALL
SELECT
  'partner', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, ARRAY[]::text[], user_id
FROM partners
UNION ALL
SELECT
  'development_concept', id, occured_on, created_at, updated_at, title, description, content,
  CASE lang WHEN 'ua' THEN 'uk' ELSE lang END,
  cover, ARRAY[]::text[], user_id
FROM development_concepts;

CREATE UNIQUE INDEX ON legacy_publication_source (kind, legacy_id);

CREATE TEMPORARY TABLE legacy_publication_pair ON COMMIT DROP AS
SELECT 'event'::text AS kind, id AS relationship_id, ukrainian_id, english_id
FROM event_translations
UNION ALL
SELECT 'book', id, ukrainian_id, english_id
FROM books_translations
UNION ALL
SELECT 'holocaust_document', id, ukrainian_id, english_id
FROM holocaust_documents_translations
UNION ALL
SELECT 'media_article', id, ukrainian_id, english_id
FROM media_articles_translations
UNION ALL
SELECT 'partner', id, ukrainian_id, english_id
FROM partners_translations;

DO $$
DECLARE
  legacy_record record;
BEGIN
  FOR legacy_record IN
    SELECT kind, legacy_id, content
    FROM legacy_publication_source
    ORDER BY kind, legacy_id
  LOOP
    BEGIN
      PERFORM legacy_record.content::jsonb;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION '% legacy ID % has malformed JSON: %',
        legacy_record.kind,
        legacy_record.legacy_id,
        SQLERRM;
    END;
  END LOOP;

  SELECT pair.kind, pair.ukrainian_id, pair.english_id
  INTO legacy_record
  FROM legacy_publication_pair pair
  LEFT JOIN legacy_publication_source uk
    ON uk.kind = pair.kind AND uk.legacy_id = pair.ukrainian_id
  LEFT JOIN legacy_publication_source en
    ON en.kind = pair.kind AND en.legacy_id = pair.english_id
  WHERE uk.legacy_id IS NULL OR en.legacy_id IS NULL
  ORDER BY pair.kind, pair.relationship_id
  LIMIT 1;

  IF legacy_record.kind IS NOT NULL THEN
    RAISE EXCEPTION '% legacy IDs % and % have a missing reference',
      legacy_record.kind,
      legacy_record.ukrainian_id,
      legacy_record.english_id;
  END IF;

  SELECT kind, legacy_id
  INTO legacy_record
  FROM (
    SELECT kind, ukrainian_id AS legacy_id FROM legacy_publication_pair
    UNION ALL
    SELECT kind, english_id FROM legacy_publication_pair
  ) pair_members
  GROUP BY kind, legacy_id
  HAVING count(*) > 1
  ORDER BY kind, legacy_id
  LIMIT 1;

  IF legacy_record.kind IS NOT NULL THEN
    RAISE EXCEPTION '% legacy ID % is reused across translation pair members',
      legacy_record.kind,
      legacy_record.legacy_id;
  END IF;

  SELECT pair.kind, pair.ukrainian_id, pair.english_id, uk.locale
  INTO legacy_record
  FROM legacy_publication_pair pair
  JOIN legacy_publication_source uk
    ON uk.kind = pair.kind AND uk.legacy_id = pair.ukrainian_id
  JOIN legacy_publication_source en
    ON en.kind = pair.kind AND en.legacy_id = pair.english_id
  WHERE uk.locale = en.locale
  ORDER BY pair.kind, pair.relationship_id
  LIMIT 1;

  IF legacy_record.kind IS NOT NULL THEN
    RAISE EXCEPTION '% legacy IDs % and % have duplicate locale %',
      legacy_record.kind,
      legacy_record.ukrainian_id,
      legacy_record.english_id,
      legacy_record.locale;
  END IF;
END;
$$;

CREATE TEMPORARY TABLE legacy_publication_map (
  kind text NOT NULL,
  legacy_id bigint NOT NULL,
  publication_id bigint NOT NULL,
  PRIMARY KEY (kind, legacy_id)
) ON COMMIT DROP;

WITH pairs AS MATERIALIZED (
  SELECT
    pair.kind,
    pair.ukrainian_id,
    pair.english_id,
    nextval(pg_get_serial_sequence('publications', 'id')) AS publication_id,
    uk.occurred_on,
    LEAST(uk.created_at, en.created_at) AS created_at,
    GREATEST(uk.updated_at, en.updated_at) AS updated_at
  FROM legacy_publication_pair pair
  JOIN legacy_publication_source uk
    ON uk.kind = pair.kind AND uk.legacy_id = pair.ukrainian_id
  JOIN legacy_publication_source en
    ON en.kind = pair.kind AND en.legacy_id = pair.english_id
), inserted_publications AS (
  INSERT INTO publications (id, kind, occurred_on, created_at, updated_at, version)
  SELECT publication_id, kind, occurred_on, created_at, updated_at, 1
  FROM pairs
  RETURNING id
)
INSERT INTO legacy_publication_map (kind, legacy_id, publication_id)
SELECT pairs.kind, pairs.ukrainian_id, pairs.publication_id
FROM pairs
JOIN inserted_publications ON inserted_publications.id = pairs.publication_id
UNION ALL
SELECT pairs.kind, pairs.english_id, pairs.publication_id
FROM pairs
JOIN inserted_publications ON inserted_publications.id = pairs.publication_id;

WITH unpaired AS MATERIALIZED (
  SELECT
    source.kind,
    source.legacy_id,
    nextval(pg_get_serial_sequence('publications', 'id')) AS publication_id,
    source.occurred_on,
    source.created_at,
    source.updated_at
  FROM legacy_publication_source source
  WHERE NOT EXISTS (
    SELECT 1
    FROM legacy_publication_map mapped
    WHERE mapped.kind = source.kind AND mapped.legacy_id = source.legacy_id
  )
), inserted_publications AS (
  INSERT INTO publications (id, kind, occurred_on, created_at, updated_at, version)
  SELECT publication_id, kind, occurred_on, created_at, updated_at, 1
  FROM unpaired
  RETURNING id
)
INSERT INTO legacy_publication_map (kind, legacy_id, publication_id)
SELECT unpaired.kind, unpaired.legacy_id, unpaired.publication_id
FROM unpaired
JOIN inserted_publications ON inserted_publications.id = unpaired.publication_id;

INSERT INTO publication_translations (
  publication_id,
  locale,
  title,
  description,
  content,
  cover,
  documents,
  publisher_id,
  created_at,
  updated_at
)
SELECT
  mapped.publication_id,
  source.locale,
  source.title,
  source.description,
  source.content::jsonb,
  source.cover,
  source.documents,
  source.publisher_id,
  source.created_at,
  source.updated_at
FROM legacy_publication_source source
JOIN legacy_publication_map mapped
  ON mapped.kind = source.kind AND mapped.legacy_id = source.legacy_id;

DO $$
DECLARE
  checked_kind text;
  source_count bigint;
  publication_count bigint;
  translation_count bigint;
  relationship_count bigint;
  migrated_relationship_count bigint;
BEGIN
  FOR checked_kind IN
    SELECT kind
    FROM (VALUES
      ('event'),
      ('book'),
      ('holocaust_document'),
      ('legal_document'),
      ('victim_testimony'),
      ('media_article'),
      ('partner'),
      ('development_concept')
    ) kinds(kind)
  LOOP
    SELECT count(*) INTO source_count
    FROM legacy_publication_source
    WHERE kind = checked_kind;

    SELECT count(*) INTO relationship_count
    FROM legacy_publication_pair
    WHERE kind = checked_kind;

    SELECT count(*) INTO publication_count
    FROM publications
    WHERE kind = checked_kind;

    IF publication_count <> source_count - relationship_count THEN
      RAISE EXCEPTION '% migration count mismatch: % expected publications, % publication rows',
        checked_kind,
        source_count - relationship_count,
        publication_count;
    END IF;

    SELECT count(*) INTO translation_count
    FROM publication_translations translation
    JOIN publications publication ON publication.id = translation.publication_id
    WHERE publication.kind = checked_kind;

    IF translation_count <> source_count THEN
      RAISE EXCEPTION '% migration count mismatch: % source rows, % translation rows',
        checked_kind,
        source_count,
        translation_count;
    END IF;

    SELECT count(*) INTO migrated_relationship_count
    FROM legacy_publication_pair pair
    JOIN legacy_publication_map uk
      ON uk.kind = pair.kind AND uk.legacy_id = pair.ukrainian_id
    JOIN legacy_publication_map en
      ON en.kind = pair.kind AND en.legacy_id = pair.english_id
    WHERE pair.kind = checked_kind
      AND uk.publication_id = en.publication_id;

    IF migrated_relationship_count <> relationship_count THEN
      RAISE EXCEPTION '% relationship count mismatch: % source pairs, % migrated pairs',
        checked_kind,
        relationship_count,
        migrated_relationship_count;
    END IF;
  END LOOP;
END;
$$;

CREATE FUNCTION ensure_publication_has_translation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM publication_translations
    WHERE publication_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'publication % must have at least one translation', NEW.id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER publication_requires_translation
AFTER INSERT ON publications
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION ensure_publication_has_translation();

CREATE FUNCTION delete_publication_after_final_translation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM publication_translations
    WHERE publication_id = OLD.publication_id
  ) THEN
    DELETE FROM publications WHERE id = OLD.publication_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER final_translation_deletes_publication
AFTER DELETE ON publication_translations
FOR EACH ROW
EXECUTE FUNCTION delete_publication_after_final_translation();
