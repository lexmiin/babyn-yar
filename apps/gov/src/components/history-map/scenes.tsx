import { LAYER_FOUR_POI_SCENE } from './layerFour'
import {
  HISTORY_MAP_LAYERS,
  LAYER_ONE_FEATURE_SCENE,
  LAYER_THREE_FEATURE_SCENE,
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
    data: LAYER_TWO_FEATURE_SCENE
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
    id: 'postwar-features',
    layer: HISTORY_MAP_LAYERS.postwar,
    kind: 'features',
    data: LAYER_THREE_FEATURE_SCENE
  },
  {
    id: 'present-day-pois',
    layer: HISTORY_MAP_LAYERS.presentDay,
    kind: 'pois',
    data: LAYER_FOUR_POI_SCENE
  }
]
