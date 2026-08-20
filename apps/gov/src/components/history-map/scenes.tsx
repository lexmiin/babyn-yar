import FeatureMapScene from './FeatureMapScene'
import OverlayMapScene from './OverlayMapScene'
import VideoMapScene from './VideoMapScene'
import {
  HISTORY_MAP_LAYERS,
  LAYER_ONE_FEATURE_SCENE,
  LAYER_THREE_FEATURE_SCENE,
  LAYER_THREE_MAP_SCENE,
  LAYER_THREE_VIDEO_SCENE,
  LAYER_TWO_FEATURE_SCENE
} from './layers'
import type { HistoryMapScene, HistoryMapSceneProps } from './sceneTypes'

function LayerOneFeaturesScene(props: HistoryMapSceneProps) {
  return <FeatureMapScene {...props} scene={LAYER_ONE_FEATURE_SCENE} />
}

function LayerTwoFeaturesScene(props: HistoryMapSceneProps) {
  return <FeatureMapScene {...props} scene={LAYER_TWO_FEATURE_SCENE} />
}

function LayerThreeMapScene(props: HistoryMapSceneProps) {
  return <OverlayMapScene {...props} scene={LAYER_THREE_MAP_SCENE} />
}

function LayerThreeVideoScene(props: HistoryMapSceneProps) {
  return <VideoMapScene {...props} scene={LAYER_THREE_VIDEO_SCENE} />
}

function LayerThreeFeaturesScene(props: HistoryMapSceneProps) {
  return <FeatureMapScene {...props} scene={LAYER_THREE_FEATURE_SCENE} />
}

export const HISTORY_MAP_SCENES: readonly HistoryMapScene[] = [
  {
    id: 'before-1941-features',
    layer: HISTORY_MAP_LAYERS.before1941,
    Component: LayerOneFeaturesScene
  },
  {
    id: 'occupation-features',
    layer: HISTORY_MAP_LAYERS.occupation,
    Component: LayerTwoFeaturesScene
  },
  {
    id: 'postwar-map',
    layer: HISTORY_MAP_LAYERS.postwar,
    Component: LayerThreeMapScene
  },
  {
    id: 'postwar-video',
    layer: HISTORY_MAP_LAYERS.postwar,
    Component: LayerThreeVideoScene
  },
  {
    id: 'postwar-features',
    layer: HISTORY_MAP_LAYERS.postwar,
    Component: LayerThreeFeaturesScene
  }
]
