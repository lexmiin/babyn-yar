import { toClientPoint } from './mapGeometry'
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

  const target = toClientPoint(poi.center, map)
  const nearby = pois.filter(candidate => {
    if (candidate.id === poi.id) return true
    const { x, y } = toClientPoint(candidate.center, map)
    return Math.abs(x - target.x) < 28 && Math.abs(y - target.y) < 28
  })

  if (pointer.type === 'touch') {
    return {
      choices: nearby,
      selectedPoi: nearby.length === 1 ? poi : null
    }
  }

  const { x: clickX, y: clickY } = pointer
  function distance(candidate: HistoryMapPoi) {
    const { x, y } = toClientPoint(candidate.center, map)
    return Math.hypot(clickX - x, clickY - y)
  }

  // A later marker's hit target can cover the visible marker being clicked.
  const closest = nearby.reduce((best, candidate) =>
    distance(candidate) < distance(best) ? candidate : best
  )
  return { choices: [closest], selectedPoi: closest }
}
