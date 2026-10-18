import type { HistoryMapBase } from './mapTypes'

// Matches the main padding, map grid columns and 1600px layout cap.
export const MAP_IMAGE_SIZES =
  '(min-width: 1774px) 1046px, (min-width: 1280px) calc(68.6275vw - 171.57px), (min-width: 1024px) calc(68.6275vw - 160.59px), (min-width: 768px) calc(68.6275vw - 127.65px), calc(100vw - 44px)'

export default function MapImage({ mapBase }: { mapBase: HistoryMapBase }) {
  return (
    <img
      {...mapBase.image}
      sizes={MAP_IMAGE_SIZES}
      data-history-map-base
      alt={mapBase.alt}
      decoding="async"
      className="absolute inset-0 h-full w-full object-contain select-none"
      draggable={false}
    />
  )
}
