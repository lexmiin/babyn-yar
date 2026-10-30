import {
  Layer3DigitalMapStr1,
  Layer3DigitalMapStr2,
  Layer3Karer,
  Layer3Perekach,
  Layer3Pulpa,
  Layer3Damba,
  Layer3Razliv,
  Layer3Lager,
  Layer3Sirec,
  Layer3Park2,
  Layer3Point4,
  Layer3Park,
  Layer3Point1,
  Layer3Point3,
  Layer3Point2,
  Layer3DevelopmentArea
} from './generated/Layer3Svgs'
import { MAP_ASPECT_RATIO, type MapPoint } from './mapGeometry'
import type { MapImageSource } from './mapTypes'
import type { HistoryMapScene } from './sceneTypes'
import type { HistoryMapCopy } from './content/uk'

export function getPostwarScenes(
  text: HistoryMapCopy['postwar'],
  image: MapImageSource
) {
  const period = { id: 'postwar' }
  // The Kurenivka flood spread from the failed earthen dam.
  const damBreach: MapPoint = [561, 237]
  const mapBase = {
    id: 'postwar',
    alt: text['postwar.alt'],
    image
  } as const

  return [
    {
      id: 'postwar-map',
      period: { ...period, title: text['postwar-map.title'] },
      kind: 'overlays',
      data: {
        mapBase,
        mapSource: text['postwar-map.mapSource'],
        listLabel: text['postwar-map.listLabel'],
        overlays: [
          {
            id: 'postwar-street-1',
            label: text['postwar-street-1.label'],
            mapLabel: { anchor: [587, 558] },
            extraLabels: [
              {
                label: text['postwar-street-1.extraLabels.label'],
                mapLabel: { anchor: [294, 495] }
              }
            ],
            delay: 0.18,
            duration: 0.5,
            Component: Layer3DigitalMapStr1
          },
          {
            id: 'postwar-street-2',
            label: text['postwar-street-2.label'],
            mapLabel: { anchor: [103, 359] },
            delay: 0.42,
            duration: 0.5,
            Component: Layer3DigitalMapStr2
          }
        ],
        overview: text['postwar-map.overview']
      }
    },
    {
      id: 'postwar-video',
      period: { ...period, title: text['postwar-video.title'] },
      kind: 'video',
      data: {
        aspectRatio: MAP_ASPECT_RATIO,
        src: import.meta.env.DEV
          ? '/assets/layer-3-video.mp4'
          : 'https://static.babynyar.work/layer-3-video.mp4',
        caption: text['postwar-video.caption'],
        overview: text['postwar-video.overview']
      }
    },
    {
      id: 'postwar-flood',
      period: { ...period, title: text['postwar-flood.title'] },
      kind: 'features',
      data: {
        mapBase,
        mapSource: text['postwar-flood.mapSource'],
        featureLabel: text['postwar-flood.featureLabel'],
        features: [
          {
            id: 'layer3-karer',
            delay: 0.24,
            duration: 0.35,
            label: text['layer3-karer.label'],
            description: text['layer3-karer.description'],
            mapLabel: {
              anchor: [255, 141],
              lines: text['layer3-karer.lines'],
              width: 230
            },
            Component: Layer3Karer
          },
          {
            id: 'layer3-perekach',
            delay: 0.68,
            duration: 0.35,
            label: text['layer3-perekach.label'],
            description: text['layer3-perekach.description'],
            mapLabel: {
              anchor: [424, 164],
              lines: text['layer3-perekach.lines'],
              width: 230
            },
            Component: Layer3Perekach
          },
          {
            id: 'layer3-pulpa',
            delay: 1.4,
            duration: 0.65,
            label: text['layer3-pulpa.label'],
            description: text['layer3-pulpa.description'],
            mapLabel: {
              anchor: [497, 283],
              lines: text['layer3-pulpa.lines'],
              width: 210
            },
            Component: Layer3Pulpa
          },
          {
            id: 'layer3-damba',
            delay: 1.04,
            duration: 0.35,
            label: text['layer3-damba.label'],
            description: text['layer3-damba.description'],
            mapLabel: { anchor: damBreach },
            fill: 'solid',
            Component: Layer3Damba
          },
          {
            id: 'layer3-razliv',
            delay: 2.05,
            duration: 0.8,
            label: text['layer3-razliv.label'],
            description: text['layer3-razliv.description'],
            mapLabel: { anchor: [790, 160] },
            fill: 'flood',
            floodReveal: { origin: damBreach, radius: 370 },
            Component: Layer3Razliv
          }
        ],
        routes: [],
        backgroundOverlays: [],
        symbols: [],
        overview: text.floodOverview,
        featureInitialDelay: 0.25
      }
    },
    {
      id: 'postwar-development',
      period: { ...period, title: text['postwar-development.title'] },
      kind: 'features',
      data: {
        mapBase,
        mapSource: text['postwar-development.mapSource'],
        featureLabel: text['postwar-development.featureLabel'],
        features: [
          {
            id: 'layer3-lager',
            delay: 0.24,
            duration: 0.35,
            label: text['layer3-lager.label'],
            mapZIndex: 1,
            description: text['layer3-lager.description'],
            mapLabel: {
              anchor: [211, 514],
              lines: text['layer3-lager.lines'],
              width: 250
            },
            Component: Layer3Lager
          },
          {
            id: 'layer3-sirec',
            delay: 0.88,
            duration: 0.35,
            label: text['layer3-sirec.label'],
            description: text['layer3-sirec.description'],
            mapLabel: {
              anchor: [250, 366],
              lines: text['layer3-sirec.lines'],
              width: 230
            },
            Component: Layer3Sirec
          },
          {
            id: 'layer3-park-2',
            delay: 1.24,
            duration: 0.35,
            label: text['layer3-park-2.label'],
            description: text['layer3-park-2.description'],
            mapLabel: { anchor: [122, 651] },
            Component: Layer3Park2
          },
          {
            id: 'layer3-point-4',
            isPoint: true,
            delay: 1.56,
            duration: 0.35,
            label: text['layer3-point-4.label'],
            description: text['layer3-point-4.description'],
            mapLabel: {
              anchor: [164, 611],
              lines: text['layer3-point-4.lines'],
              width: 250
            },
            Component: Layer3Point4
          },
          {
            id: 'layer3-park',
            delay: 2.04,
            duration: 0.35,
            label: text['layer3-park.label'],
            description: text['layer3-park.description'],
            mapLabel: {
              anchor: [374, 399],
              lines: text['layer3-park.lines'],
              width: 210
            },
            Component: Layer3Park
          },
          {
            id: 'layer3-point-1',
            isPoint: true,
            delay: 2.14,
            duration: 0.35,
            label: text['layer3-point-1.label'],
            description: text['layer3-point-1.description'],
            mapLabel: {
              anchor: [365, 409],
              lines: text['layer3-point-1.lines'],
              width: 220
            },
            Component: Layer3Point1
          },
          {
            id: 'layer3-point-2',
            isPoint: true,
            delay: 2.78,
            duration: 0.35,
            label: text['layer3-point-2.label'],
            description: text['layer3-point-2.description'],
            mapLabel: {
              anchor: [470, 496],
              lines: text['layer3-point-2.lines'],
              width: 225
            },
            Component: Layer3Point3
          },
          {
            id: 'layer3-point-3',
            isPoint: true,
            delay: 3.38,
            duration: 0.35,
            label: text['layer3-point-3.label'],
            description: text['layer3-point-3.description'],
            mapLabel: { anchor: [343, 454] },
            Component: Layer3Point2
          }
        ],
        routes: [],
        backgroundOverlays: [
          {
            id: 'layer3-development-area',
            delay: 0.48,
            duration: 0.35,
            Component: Layer3DevelopmentArea
          }
        ],
        symbols: [],
        overview: text['postwar-development.overview'],
        featureInitialDelay: 0.25
      }
    }
  ] as const satisfies readonly HistoryMapScene[]
}
