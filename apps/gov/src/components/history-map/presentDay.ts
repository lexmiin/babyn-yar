import { LAYER_FOUR_POI_POSITIONS } from './generated/Layer4PoiPositions'
import { Layer4Borders } from './generated/Layer4Svgs'
import { getLocalizedPlace } from '../../data/places'
import type {
  HistoryMapAssets,
  HistoryMapPoiSceneData,
  MapImageSource
} from './mapTypes'
import type { HistoryMapScene } from './sceneTypes'
import type { HistoryMapCopy } from './content/uk'
import type { Language } from '@babyn-yar/i18n'

export function getPresentDayScenes(
  text: HistoryMapCopy['presentDay'],
  lang: Language,
  images: { map: MapImageSource; pois: HistoryMapAssets['pois'] }
) {
  const poiScene = {
    mapBase: {
      id: 'presentDay',
      alt: text['presentDay.alt'],
      image: images.map
    },
    mapSource: text['present-day-pois.mapSource'],
    BorderComponent: Layer4Borders,
    pois: LAYER_FOUR_POI_POSITIONS.map(({ id, center }) => {
      const { title, description, image } = getLocalizedPlace(id, lang)
      const source = images.pois[image.src]
      if (!source)
        throw new Error(`Missing history map POI image: ${image.src}`)
      return {
        id: `layer4-poi-${id}`,
        center,
        title,
        description,
        image: { ...source, alt: image.alt }
      }
    }),
    overview: text['present-day-pois.overview']
  } as const satisfies HistoryMapPoiSceneData

  return [
    {
      id: 'present-day-pois',
      period: {
        id: 'present-day',
        title: text['present-day.title']
      },
      kind: 'pois',
      data: poiScene
    }
  ] as const satisfies readonly HistoryMapScene[]
}
