import {
  Layer2Zone1,
  Layer2Zone3,
  Layer2Zone2,
  Layer2Zone4
} from './generated/Layer2Zones'
import { Layer2Way2, Layer2Way1 } from './generated/Layer2Routes'
import {
  Layer2Blockpost,
  Layer2Tank1,
  Layer2Tank2
} from './generated/Layer2StaticSvgs'
import type { MapImageSource } from './mapTypes'
import type { HistoryMapScene } from './sceneTypes'
import type { HistoryMapCopy } from './content/uk'

export function getOccupationScenes(
  text: HistoryMapCopy['occupation'],
  image: MapImageSource
) {
  const period = { id: 'occupation', title: text['occupation.title'] }
  const mapBase = {
    id: 'occupation',
    alt: text['occupation.alt'],
    aspectRatio: '894.14 / 783.2',
    image
  } as const

  return [
    {
      id: 'occupation-features',
      period,
      kind: 'features',
      data: {
        mapBase,
        mapSource: text['occupation-features.mapSource'],
        featureLabel: text['occupation-features.featureLabel'],
        features: [
          {
            id: 'layer2-zone-1',
            label: text['layer2-zone-1.label'],
            delay: 2.7,
            description: text['layer2-zone-1.description'],
            mapLabel: {
              anchor: [185, 454],
              lines: text['layer2-zone-1.lines'],
              width: 230
            },
            Component: Layer2Zone1
          },
          {
            id: 'layer2-zone-3',
            label: text['layer2-zone-3.label'],
            delay: 2.1,
            description: text['layer2-zone-3.description'],
            mapLabel: {
              anchor: [565, 595],
              lines: text['layer2-zone-3.lines'],
              width: 220
            },
            Component: Layer2Zone3
          }
        ],
        routes: [
          {
            id: 'layer2-way-2',
            label: text['layer2-way-2.label'],
            showLabel: false,
            description: text['layer2-way-2.description'],
            mapLabel: { anchor: [427, 626] },
            Component: Layer2Way2,
            timing: {
              segments: [{ delay: 0.15, duration: 1.08 }],
              arrowheads: [1.23]
            }
          }
        ],
        backgroundOverlays: [],
        symbols: [
          {
            id: 'layer2-blockpost',
            label: text['layer2-blockpost.label'],
            description: text['layer2-blockpost.description'],
            mapLabel: { anchor: [722, 619] },
            delay: 1.6,
            Component: Layer2Blockpost
          },
          {
            id: 'layer2-tank-1',
            label: text['layer2-tank-1.label'],
            description: text['layer2-tank-1.description'],
            mapLabel: {
              anchor: [785, 667],
              lines: text['layer2-tank-1.lines'],
              width: 280
            },
            delay: 1.75,
            Component: Layer2Tank1
          }
        ],
        overview: text['occupation-features.overview'],
        featureInitialDelay: 0.52
      }
    },
    {
      id: 'occupation-features-part-2',
      period,
      kind: 'features',
      data: {
        mapBase,
        mapSource: text['occupation-features-part-2.mapSource'],
        featureLabel: text['occupation-features-part-2.featureLabel'],
        features: [
          {
            id: 'layer2-zone-2',
            label: text['layer2-zone-2.label'],
            description: text['layer2-zone-2.description'],
            mapLabel: { anchor: [42, 424] },
            Component: Layer2Zone2
          },
          {
            id: 'layer2-zone-4',
            label: text['layer2-zone-4.label'],
            description: text['layer2-zone-4.description'],
            mapLabel: {
              anchor: [630, 82],
              lines: text['layer2-zone-4.lines'],
              width: 250
            },
            Component: Layer2Zone4
          }
        ],
        routes: [
          {
            id: 'layer2-way-1',
            label: text['layer2-way-1.label'],
            showLabel: false,
            description: text['layer2-way-1.description'],
            mapLabel: { anchor: [298, 492] },
            Component: Layer2Way1,
            timing: {
              segments: [
                { delay: 2.45, duration: 0.38 },
                { delay: 2.45, duration: 0.92 },
                { delay: 3.19, duration: 0.3 },
                { delay: 2.93, duration: 0.24 },
                { delay: 3.13, duration: 0.22 },
                { delay: 3.13, duration: 0.22 }
              ],
              arrowheads: [3.49, 3.35, 3.35]
            }
          }
        ],
        backgroundOverlays: [],
        symbols: [
          {
            id: 'layer2-tank-2',
            label: text['layer2-tank-2.label'],
            description: text['layer2-tank-2.description'],
            mapLabel: {
              anchor: [90, 666],
              lines: text['layer2-tank-2.lines'],
              width: 295
            },
            delay: 4.3,
            Component: Layer2Tank2
          }
        ],
        overview: text['occupation-features-part-2.overview'],
        featureInitialDelay: 0.52
      }
    }
  ] as const satisfies readonly HistoryMapScene[]
}
