import type { ComponentType } from 'react'
import type { HistoryMapLayer } from './layers'

export type HistoryMapSceneProps = {
  layer: HistoryMapLayer
}

export type HistoryMapScene = {
  id: string
  layer: HistoryMapLayer
  Component: ComponentType<HistoryMapSceneProps>
}
