import { useEffect } from 'react'
import { MAP_IMAGE_SIZES } from './MapImage'
import type { HistoryMapBase, MapImageSource } from './mapTypes'
import type { HistoryMapScene } from './sceneTypes'

function getMapBase(scene: HistoryMapScene): HistoryMapBase | undefined {
  return scene.kind === 'video' ? undefined : scene.data.mapBase
}

async function decodeMap(source: MapImageSource, priority: 'auto' | 'low') {
  const image = new Image()
  image.fetchPriority = priority
  image.sizes = MAP_IMAGE_SIZES
  image.srcset = source.srcSet
  image.src = source.src
  await image.decode().catch(() => {})
}

/** Decodes the next distinct base map ahead of the scroll position. */
export function usePreloadNextMap(
  scenes: readonly HistoryMapScene[],
  activeStep: number
) {
  const currentMap = getMapBase(scenes[activeStep])
  const nextMap = scenes
    .slice(activeStep + 1)
    .map(getMapBase)
    .find(mapBase => mapBase && mapBase.id !== currentMap?.id)

  useEffect(() => {
    if (!nextMap) return
    let cancelled = false

    async function preloadNextMap() {
      // Let the visible map finish before spending bandwidth on the next one.
      if (currentMap) await decodeMap(currentMap.image, 'auto')
      if (!cancelled && nextMap) await decodeMap(nextMap.image, 'low')
    }
    void preloadNextMap()
    return () => {
      cancelled = true
    }
  }, [currentMap, nextMap])
}
