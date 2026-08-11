import type {
  HistoryMapFeatureSceneData,
  HistoryMapLayer,
  HistoryMapOverlaySceneData,
  HistoryMapPoiSceneData,
  HistoryMapVideoSceneData
} from './layers'

export type HistoryMapScene = {
  id: string
  layer: HistoryMapLayer
} & (
  | { kind: 'features'; data: HistoryMapFeatureSceneData }
  | { kind: 'overlays'; data: HistoryMapOverlaySceneData }
  | { kind: 'video'; data: HistoryMapVideoSceneData }
  | { kind: 'pois'; data: HistoryMapPoiSceneData }
)
