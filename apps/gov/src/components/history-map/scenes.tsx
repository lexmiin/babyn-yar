import type { Language } from '@babyn-yar/i18n'
import { getBefore1941Scenes } from './before1941'
import { getOccupationScenes } from './occupation'
import { getPostwarScenes } from './postwar'
import { getPresentDayScenes } from './presentDay'
import { uk } from './content/uk'
import { en } from './content/en'
import type { HistoryMapScene } from './sceneTypes'

export function getHistoryMapScenes(
  lang: Language
): readonly HistoryMapScene[] {
  const text = lang === 'en' ? en : uk
  return [
    ...getBefore1941Scenes(text.before1941),
    ...getOccupationScenes(text.occupation),
    ...getPostwarScenes(text.postwar),
    ...getPresentDayScenes(text.presentDay, lang)
  ]
}
