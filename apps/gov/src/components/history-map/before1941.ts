import {
  Layer1Jew,
  Layer1Karamske,
  Layer1Magomet,
  Layer1Kirill,
  Layer1Voisko,
  Layer1Bratske,
  Layer1Maria,
  Layer1Envang,
  Layer1Luk
} from './generated/Layer1Svgs'
import type { MapImageSource } from './mapTypes'
import type { HistoryMapScene } from './sceneTypes'
import type { HistoryMapCopy } from './content/uk'

export function getBefore1941Scenes(
  text: HistoryMapCopy['before1941'],
  image: MapImageSource
) {
  const period = { id: 'before-1941', title: text['before-1941.title'] }
  const mapBase = {
    id: 'before1941',
    alt: text['before1941.alt'],
    image
  } as const
  const overview = text.overview

  return [
    {
      id: 'before-1941-features',
      period,
      kind: 'features',
      data: {
        mapBase,
        mapSource: text['before-1941-features.mapSource'],
        featureLabel: text['before-1941-features.featureLabel'],
        features: [
          {
            id: 'jewish-cemetery',
            label: text['jewish-cemetery.label'],
            description: text['jewish-cemetery.description'],
            mapLabel: {
              anchor: [667, 414],
              lines: text['jewish-cemetery.lines'],
              width: 248
            },
            Component: Layer1Jew
          },
          {
            id: 'karaite-cemetery',
            label: text['karaite-cemetery.label'],
            description: text['karaite-cemetery.description'],
            mapLabel: { anchor: [410, 431] },
            Component: Layer1Karamske
          },
          {
            id: 'muslim-cemetery',
            label: text['muslim-cemetery.label'],
            description: text['muslim-cemetery.description'],
            mapLabel: {
              anchor: [333, 413],
              lines: text['muslim-cemetery.lines']
            },
            Component: Layer1Magomet
          },
          {
            id: 'kyrylivske-cemetery',
            label: text['kyrylivske-cemetery.label'],
            description: text['kyrylivske-cemetery.description'],
            mapLabel: {
              anchor: [700, 197],
              lines: text['kyrylivske-cemetery.lines'],
              width: 248
            },
            Component: Layer1Kirill
          },
          {
            id: 'military-cemetery',
            label: text['military-cemetery.label'],
            description: text['military-cemetery.description'],
            mapLabel: { anchor: [507, 625] },
            Component: Layer1Voisko
          },
          {
            id: 'bratske-cemetery',
            label: text['bratske-cemetery.label'],
            description: text['bratske-cemetery.description'],
            mapLabel: { anchor: [340, 607] },
            Component: Layer1Bratske
          },
          {
            id: 'mariavite-cemetery',
            label: text['mariavite-cemetery.label'],
            description: text['mariavite-cemetery.description'],
            mapLabel: { anchor: [440, 580] },
            Component: Layer1Maria
          },
          {
            id: 'evangelical-cemetery',
            label: text['evangelical-cemetery.label'],
            description: text['evangelical-cemetery.description'],
            mapLabel: {
              anchor: [270, 555],
              lines: text['evangelical-cemetery.lines']
            },
            Component: Layer1Envang
          },
          {
            id: 'lukianivske-cemetery',
            label: text['lukianivske-cemetery.label'],
            description: text['lukianivske-cemetery.description'],
            mapLabel: { anchor: [319, 761] },
            Component: Layer1Luk
          }
        ],
        routes: [],
        backgroundOverlays: [],
        symbols: [],
        overview,
        featureInitialDelay: 0.25
      }
    }
  ] as const satisfies readonly HistoryMapScene[]
}
