import { Layer4Borders } from './generated/Layer4Svgs'
import { Layer5LivingMemory, Layer5MissileStrike } from './generated/Layer5Svgs'
import type { HistoryMapAssets, MapImageSource } from './mapTypes'
import type { HistoryMapScene } from './sceneTypes'
import type { HistoryMapCopy } from './content/uk'

export function getWartimeScenes(
  text: HistoryMapCopy['wartime'],
  images: { map: MapImageSource; pois: HistoryMapAssets['pois'] }
) {
  const positions = [
    {
      id: 'living-memory',
      center: [527, 433],
      image: '/assets/history-map/pois/23-living-memory.webp'
    },
    {
      id: 'missile-strike',
      center: [460, 568],
      image: '/assets/history-map/pois/24-missile-strike.webp'
    }
  ] as const

  return [
    {
      id: 'wartime-pois',
      period: { id: 'wartime', title: text.title },
      kind: 'pois',
      data: {
        mapBase: {
          id: 'presentDay',
          alt: text.mapAlt,
          image: images.map
        },
        mapSource: text.mapSource,
        BorderComponent: Layer4Borders,
        overlays: [
          { id: 'living-memory', delay: 0.62, Component: Layer5LivingMemory },
          { id: 'missile-strike', delay: 0.68, Component: Layer5MissileStrike }
        ],
        pois: positions.map(({ id, center, image }) => {
          const source = images.pois[image]
          if (!source)
            throw new Error(`Missing history map POI image: ${image}`)
          const { title, description, alt } = text.pois[id]
          return {
            id: `wartime-poi-${id}`,
            center,
            title,
            description,
            image: { ...source, alt }
          }
        }),
        overview: text.overview
      }
    }
  ] as const satisfies readonly HistoryMapScene[]
}
