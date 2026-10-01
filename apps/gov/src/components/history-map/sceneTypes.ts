import type {
  HistoryMapFeatureSceneData,
  HistoryMapPeriod,
  HistoryMapOverlaySceneData,
  HistoryMapPoiSceneData,
  HistoryMapVideoSceneData
} from './mapTypes'

export type HistoryMapScene = {
  id: string
  period: HistoryMapPeriod
} & (
  | { kind: 'features'; data: HistoryMapFeatureSceneData }
  | { kind: 'overlays'; data: HistoryMapOverlaySceneData }
  | { kind: 'video'; data: HistoryMapVideoSceneData }
  | { kind: 'pois'; data: HistoryMapPoiSceneData }
)
