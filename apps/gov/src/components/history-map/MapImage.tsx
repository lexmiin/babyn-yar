import { createContext, useContext } from 'react'
import type { HistoryMapBase } from './layers'

export type MapImageSource = {
  src: string
  srcSet: string
  width: number
  height: number
}

export type MapImages = Record<HistoryMapBase['id'], MapImageSource>

export const MapImagesContext = createContext<MapImages | null>(null)

// Matches the main padding, map grid columns and 1600px layout cap.
export const MAP_IMAGE_SIZES =
  '(min-width: 1774px) 1046px, (min-width: 1280px) calc(68.6275vw - 171.57px), (min-width: 1024px) calc(68.6275vw - 160.59px), (min-width: 768px) calc(68.6275vw - 127.65px), calc(100vw - 44px)'

export default function MapImage({ mapBase }: { mapBase: HistoryMapBase }) {
  const images = useContext(MapImagesContext)
  if (!images) throw new Error('MapImage requires MapImagesContext')

  return (
    <img
      {...images[mapBase.id]}
      sizes={MAP_IMAGE_SIZES}
      data-history-map-base
      alt={mapBase.alt}
      decoding="async"
      className="absolute inset-0 h-full w-full object-contain select-none"
      draggable={false}
    />
  )
}
