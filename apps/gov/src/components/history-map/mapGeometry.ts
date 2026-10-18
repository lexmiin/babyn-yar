// Kept free of imports: scripts/generate-history-map-pois.mjs loads this file
// with Node's type stripping to check the POI SVGs against it.

/** The coordinate space shared by every base map and layer SVG. */
export const MAP_VIEW_BOX = {
  minX: 0,
  minY: 0,
  width: 894.14,
  height: 783.2
} as const

const { minX, minY, width, height } = MAP_VIEW_BOX

export const MAP_VIEW_BOX_ATTRIBUTE = `${minX} ${minY} ${width} ${height}`
export const MAP_ASPECT_RATIO = `${width} / ${height}`

export type MapPoint = readonly [x: number, y: number]

/** Position within the map as percentages of its width and height. */
export function toMapPercent([x, y]: MapPoint) {
  return {
    x: ((x - minX) / width) * 100,
    y: ((y - minY) / height) * 100
  }
}

/** Position in client pixels for a map rendered into `rect`. */
export function toClientPoint(
  [x, y]: MapPoint,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
) {
  return {
    x: rect.left + ((x - minX) * rect.width) / width,
    y: rect.top + ((y - minY) * rect.height) / height
  }
}
