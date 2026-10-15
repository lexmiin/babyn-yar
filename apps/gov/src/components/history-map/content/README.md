History map copy comes from [ТЕКСТИ ПРОЕКТУ ЛАНДШАФТ БАБИНОГО ЯРУ_UA&EN](https://docs.google.com/document/d/1O1k0TwrQ8lV0iUtt9yD_ZLFRgFFQWmlk1e1LVSKlULo/edit), read on 2026-10-15. All six tabs were used: introduction/timeline, before 1941, occupation, postwar, independent Ukraine, and 2022–present.

`uk.ts` preserves the existing Ukrainian map copy and defines the content shape. `en.ts` supplies the document's English overviews and labels. `landscape.ts` contains introduction and timeline copy. Geometry, images, scene IDs and animation timings stay in the scene factories. The existing present-day scene includes both independent Ukraine and 2022–present; no new scenes were added. English prose follows the document where it differs from the existing Ukrainian text. Obvious spacing and spelling errors were corrected.

Missing English descriptions retain Ukrainian, rather than introducing unreviewed historical prose:

- All cemetery descriptions in `before1941`.
- All feature, route and symbol descriptions in `occupation`.
- All feature descriptions in `postwar`.
- Present-day places `03`, `07`, `08`, `10`, `12`, `17`, `18` and `19` in `src/data/places.ts`. Their English names come from the document; other place translations reuse existing content.

Replace the explicit `uk` description references in `en.ts`, or add a place's `en.description` in `src/data/places.ts`, when approved copy is available. English map-label line breaks are authored separately from Ukrainian ones; their anchors and widths remain shared.

Build `@babyn-yar/i18n` when its dictionary changes.
