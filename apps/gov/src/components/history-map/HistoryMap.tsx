import { useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import HistoryMapLayer from './HistoryMapLayer'
import { HISTORY_MAP_LAYERS } from './layers'

function useActiveHistoryLayer(layerCount: number) {
  const trackRef = useRef<HTMLElement>(null)
  const [activeLayer, setActiveLayer] = useState(0)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end']
  })

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    const nextLayer = Math.min(
      Math.max(Math.floor(progress * layerCount), 0),
      layerCount - 1
    )
    setActiveLayer(current => (current === nextLayer ? current : nextLayer))
  })

  return { activeLayer, trackRef }
}

export default function HistoryMap() {
  const { activeLayer, trackRef } = useActiveHistoryLayer(
    HISTORY_MAP_LAYERS.length
  )

  return (
    <section ref={trackRef} className="relative min-h-[360svh]">
      <div className="sticky top-[7.5rem] md:top-28">
        <div aria-live="polite">
          <HistoryMapLayer
            layer={HISTORY_MAP_LAYERS[activeLayer]}
            layerKey={activeLayer}
          />
        </div>
      </div>
    </section>
  )
}
