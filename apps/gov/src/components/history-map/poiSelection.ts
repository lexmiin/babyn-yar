import { LAYER_FOUR_POI_VIEW_BOX } from './generated/Layer4PoiPositions'
import type { HistoryMapPoi } from './mapTypes'

/** Touch taps disambiguate overlapping targets; mouse clicks select by distance. */
export function selectPoi(
  poi: HistoryMapPoi,
  pois: readonly HistoryMapPoi[],
  map: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  pointer: { type: string; x: number; y: number } | null
) {
  // Keyboard and assistive-technology activation identify the focused POI.
  if (!pointer) return { choices: [poi], selectedPoi: poi }

  const { minX, minY, width, height } = LAYER_FOUR_POI_VIEW_BOX
  const nearby = pois.filter(
    candidate =>
      candidate.id === poi.id ||
      ((Math.abs(candidate.center[0] - poi.center[0]) * map.width) / width <
        28 &&
        (Math.abs(candidate.center[1] - poi.center[1]) * map.height) / height <
          28)
  )

  if (pointer.type === 'touch') {
    return {
      choices: nearby,
      selectedPoi: nearby.length === 1 ? poi : null
    }
  }

  const { x: clickX, y: clickY } = pointer
  function distance(candidate: HistoryMapPoi) {
    const x = map.left + ((candidate.center[0] - minX) * map.width) / width
    const y = map.top + ((candidate.center[1] - minY) * map.height) / height
    return Math.hypot(clickX - x, clickY - y)
  }

  // A later marker's hit target can cover the visible marker being clicked.
  const closest = nearby.reduce((best, candidate) =>
    distance(candidate) < distance(best) ? candidate : best
  )
  return { choices: [closest], selectedPoi: closest }
}
