DROP TRIGGER IF EXISTS publications_kind_is_immutable ON publications;
DROP FUNCTION IF EXISTS reject_publication_kind_change();
DROP TABLE IF EXISTS publication_translations;
DROP TABLE IF EXISTS publications;
DROP FUNCTION IF EXISTS ensure_publication_has_translation();
DROP FUNCTION IF EXISTS reject_publication_translation_immutable_fields();
DROP FUNCTION IF EXISTS delete_publication_after_final_translation();
