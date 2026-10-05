import type { Language } from '@babyn-yar/i18n'
import { PRESENT_DAY_POI_CONTENT, type PlaceId } from '@/data/places'

export function getLocalizedPlace(id: PlaceId, lang: Language) {
  const place = PRESENT_DAY_POI_CONTENT[id]
  const localized = lang === 'en' && 'en' in place ? place.en : undefined

  return {
    semanticId: place.semanticId,
    title: localized?.title ?? place.title,
    description: localized?.description ?? place.description,
    image: { ...place.image, alt: localized?.alt ?? place.image.alt }
  }
}
