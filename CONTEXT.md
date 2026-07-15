# Babyn Yar

The domain language shared by the Babyn Yar publishing and public-facing applications.

## Language

**Publication**:
A language-independent work identified by its kind and represented by one or more publication translations. A publication cannot exist without a translation.

**Publication Kind**:
The immutable classification of a publication as an event, book, Holocaust document, legal document, victim testimony, media article, partner, or development concept.
_Avoid_: Publication type, content type

**Publication Translation**:
The localized representation of a publication for one supported locale, with its own publisher and editorial history. A publication has at most one translation for each locale.
_Avoid_: Counterpart, localized version

**Publisher**:
The administrative user who originally creates or publishes a publication translation. Later edits do not change its publisher.
_Avoid_: Author, creator, editor
