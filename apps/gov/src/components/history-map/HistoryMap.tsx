import { useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll
} from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { HISTORY_MAP_SCENES } from './scenes'

const SCROLL_HEIGHT_PER_STAGE = 120

function useActiveHistoryStep(stepCount: number) {
  const trackRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end']
  })

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    const nextStep = Math.min(
      Math.max(Math.floor(progress * stepCount), 0),
      stepCount - 1
    )
    setActiveStep(current => (current === nextStep ? current : nextStep))
  })

  return { activeStep, trackRef }
}

export default function HistoryMap() {
  const { activeStep, trackRef } = useActiveHistoryStep(
    HISTORY_MAP_SCENES.length
  )
  const scene = HISTORY_MAP_SCENES[activeStep]
  const Scene = scene.Component

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={trackRef}
        className="relative"
        style={{
          minHeight: `${HISTORY_MAP_SCENES.length * SCROLL_HEIGHT_PER_STAGE}svh`
        }}
      >
        <div className="sticky top-[7.5rem] md:top-28">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {`Етап ${activeStep + 1} з ${HISTORY_MAP_SCENES.length}: ${scene.layer.title}`}
          </div>
          <div>
            <AnimatePresence mode="wait" initial={false}>
              <Scene key={scene.id} layer={scene.layer} />
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {activeStep < HISTORY_MAP_SCENES.length - 1 && (
              <motion.div
                key="scroll-indicator"
                data-history-map-scroll-indicator
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center text-neutral-900 md:bottom-6"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: [0, 6, 0] }}
                exit={{
                  opacity: 0,
                  y: 4,
                  transition: { duration: 0.2, repeat: 0 }
                }}
                transition={{
                  opacity: { duration: 0.24 },
                  y: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                }}
              >
                <span className="grid size-8 place-items-center rounded-full border border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-sm md:size-[42px]">
                  <ArrowDown
                    aria-hidden="true"
                    className="block size-5 md:size-7"
                    strokeWidth={1.7}
                  />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </MotionConfig>
  )
}
