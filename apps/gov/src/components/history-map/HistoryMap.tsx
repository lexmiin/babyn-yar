import { useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll
} from 'framer-motion'
import LayerOne from './LayerOne'
import LayerThree from './LayerThree'
import LayerTwo from './LayerTwo'

const LAYERS = [LayerOne, LayerTwo, LayerThree] as const

export default function HistoryMap() {
  const trackRef = useRef<HTMLElement>(null)
  const [activeLayer, setActiveLayer] = useState(0)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end']
  })

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    const nextLayer = Math.min(
      Math.max(Math.floor(progress * LAYERS.length), 0),
      LAYERS.length - 1
    )
    setActiveLayer(current => (current === nextLayer ? current : nextLayer))
  })

  const ActiveLayer = LAYERS[activeLayer]

  return (
    <section ref={trackRef} className="relative min-h-[360svh]">
      <div className="md:sticky md:top-28">
        <div aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={activeLayer} exit={{}}>
              <ActiveLayer />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
