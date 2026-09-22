import { LAYER_FOUR_POI_SCENE } from './layerFour'
import {
  HISTORY_MAP_LAYERS,
  LAYER_ONE_FEATURE_SCENE,
  LAYER_THREE_DEVELOPMENT_SCENE,
  LAYER_THREE_FLOOD_SCENE,
  LAYER_THREE_MAP_SCENE,
  LAYER_THREE_VIDEO_SCENE,
  LAYER_TWO_FEATURE_SCENE
} from './layers'
import type { HistoryMapScene } from './sceneTypes'

export const HISTORY_MAP_SCENES: readonly HistoryMapScene[] = [
  {
    id: 'before-1941-features',
    layer: HISTORY_MAP_LAYERS.before1941,
    kind: 'features',
    data: LAYER_ONE_FEATURE_SCENE
  },
  {
    id: 'occupation-features',
    layer: HISTORY_MAP_LAYERS.occupation,
    kind: 'features',
    data: {
      ...LAYER_TWO_FEATURE_SCENE,
      features: LAYER_TWO_FEATURE_SCENE.features.filter(feature =>
        ['layer2-zone-1', 'layer2-zone-3'].includes(feature.id)
      ),
      routes: LAYER_TWO_FEATURE_SCENE.routes.filter(
        route => route.id === 'layer2-way-2'
      ),
      symbols: LAYER_TWO_FEATURE_SCENE.symbols.filter(
        symbol => symbol.id !== 'layer2-tank-2'
      )
    }
  },
  {
    id: 'occupation-features-part-2',
    layer: HISTORY_MAP_LAYERS.occupation,
    kind: 'features',
    data: {
      ...LAYER_TWO_FEATURE_SCENE,
      features: LAYER_TWO_FEATURE_SCENE.features.filter(feature =>
        ['layer2-zone-2', 'layer2-zone-4'].includes(feature.id)
      ),
      routes: LAYER_TWO_FEATURE_SCENE.routes.filter(
        route => route.id === 'layer2-way-1'
      ),
      symbols: LAYER_TWO_FEATURE_SCENE.symbols.filter(
        symbol => symbol.id === 'layer2-tank-2'
      )
    }
  },
  {
    id: 'postwar-map',
    layer: HISTORY_MAP_LAYERS.postwar,
    kind: 'overlays',
    data: LAYER_THREE_MAP_SCENE
  },
  {
    id: 'postwar-video',
    layer: HISTORY_MAP_LAYERS.postwar,
    kind: 'video',
    data: LAYER_THREE_VIDEO_SCENE
  },
  {
    id: 'postwar-flood',
    layer: HISTORY_MAP_LAYERS.postwar,
    kind: 'features',
    data: LAYER_THREE_FLOOD_SCENE
  },
  {
    id: 'postwar-development',
    layer: HISTORY_MAP_LAYERS.postwar,
    kind: 'features',
    data: LAYER_THREE_DEVELOPMENT_SCENE
  },
  {
    id: 'present-day-pois',
    layer: HISTORY_MAP_LAYERS.presentDay,
    kind: 'pois',
    data: LAYER_FOUR_POI_SCENE
  }
]
