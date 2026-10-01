import type { ComponentType, SVGProps } from 'react'
import type {
  HistoryMapRouteProps,
  HistoryMapRouteTiming
} from './generated/Layer2Routes'

/**
 * A selectable historical object, such as a cemetery or flood-affected area.
 * Selection shows its description beside the map. Features also appear in the
 * object list below the map and can use the scene's default entrance stagger.
 */
export type HistoryMapFeature = {
  id: string
  label: string
  isPoint?: boolean
  showLabel?: boolean
  // Entrance timing in seconds; omitted values use the scene stagger.
  delay?: number
  duration?: number
  description: readonly string[]
  mapZIndex?: number
  mapLabel: {
    anchor: readonly [x: number, y: number]
    lines?: readonly string[]
    width?: number
  }
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * A selectable route with separate reveal timing for its strokes and arrowheads.
 * Selection shows its historical description, but routes are omitted from the
 * object list below the map. All authored timing is in seconds.
 */
export type HistoryMapRoute = Omit<HistoryMapFeature, 'Component'> & {
  timing: HistoryMapRouteTiming
  Component: ComponentType<HistoryMapRouteProps>
}

/**
 * A timed SVG drawing over the base map, such as development-area shading.
 * Contains artwork and reveal timing, without a label or historical description.
 * Used for background decoration, or extended into a
 * {@link HistoryMapSelectableOverlay} for labels and selection highlighting.
 */
export type HistoryMapOverlay = {
  id: string
  delay: number
  duration?: number
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

/**
 * An overlay with hover/focus labels and a selectable highlight, such as a street.
 * Selection keeps the period overview visible: there is no object description
 * or entry in the object list below the map.
 */
type HistoryMapSelectableOverlay = HistoryMapOverlay & {
  label: string
  mapLabel: HistoryMapFeature['mapLabel']
  extraLabels?: readonly Pick<HistoryMapFeature, 'label' | 'mapLabel'>[]
}

/**
 * An icon or line marking a historical object, such as a checkpoint or ditch.
 * Selectable and listed like a feature, with an explicit entrance delay like
 * an overlay.
 */
export type HistoryMapSymbol = HistoryMapFeature & HistoryMapOverlay

export type HistoryMapBase = {
  id: 'before1941' | 'occupation' | 'postwar' | 'presentDay'
  alt: string
  aspectRatio: string
}

export type HistoryMapPeriod = {
  id: string
  title: string
}

export type HistoryMapFeatureSceneData = {
  mapBase: HistoryMapBase
  mapSource: string
  featureLabel: string
  features: readonly HistoryMapFeature[]
  // Default entrance delay in seconds.
  featureInitialDelay: number
  routes: readonly HistoryMapRoute[]
  backgroundOverlays: readonly HistoryMapOverlay[]
  symbols: readonly HistoryMapSymbol[]
  overview: readonly string[]
}

export type HistoryMapOverlaySceneData = {
  mapBase: HistoryMapBase
  mapSource: string
  overlays: readonly HistoryMapSelectableOverlay[]
  overview: readonly string[]
}

export type HistoryMapVideoSceneData = {
  aspectRatio: string
  src: string
  caption: string
  overview: readonly string[]
}

/** A present-day place whose map marker opens a popover with its photo and text. */
export type HistoryMapPoi = {
  id: string
  title: string
  description: string
  center: readonly [x: number, y: number]
  image: {
    src: string
    alt: string
  }
}

export type HistoryMapPoiSceneData = {
  mapBase: HistoryMapBase
  mapSource: string
  BorderComponent: ComponentType<SVGProps<SVGSVGElement>>
  pois: readonly HistoryMapPoi[]
  overview: readonly string[]
}
