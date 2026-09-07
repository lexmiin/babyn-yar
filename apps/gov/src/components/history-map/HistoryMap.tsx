import { useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll
} from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { HISTORY_MAP_SCENES } from './scenes'
import SceneRenderer from './SceneRenderer'
import { MAP_IMAGE_SIZES, MapImagesContext, type MapImages } from './MapImage'

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

export default function HistoryMap({ images }: { images: MapImages }) {
  const { activeStep, trackRef } = useActiveHistoryStep(
    HISTORY_MAP_SCENES.length
  )
  const scene = HISTORY_MAP_SCENES[activeStep]
  const currentMapId =
    scene.kind === 'video' ? undefined : scene.data.mapBase.id
  const nextMapScene = HISTORY_MAP_SCENES.slice(activeStep + 1).find(
    candidate =>
      candidate.kind !== 'video' && candidate.data.mapBase.id !== currentMapId
  )
  const nextMapId =
    nextMapScene && nextMapScene.kind !== 'video'
      ? nextMapScene.data.mapBase.id
      : undefined

  useEffect(() => {
    if (!nextMapId) return
    let cancelled = false

    async function decodeMap(id: keyof MapImages, priority: 'auto' | 'low') {
      const image = new Image()
      image.fetchPriority = priority
      image.sizes = MAP_IMAGE_SIZES
      image.srcset = images[id].srcSet
      image.src = images[id].src
      await image.decode().catch(() => {})
    }

    async function preloadNextMap() {
      // Let the visible map finish before spending bandwidth on the next one.
      if (currentMapId) await decodeMap(currentMapId, 'auto')
      if (!cancelled && nextMapId) await decodeMap(nextMapId, 'low')
    }
    void preloadNextMap()
    return () => {
      cancelled = true
    }
  }, [currentMapId, nextMapId, images])

  return (
    <MapImagesContext.Provider value={images}>
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
                <SceneRenderer key={scene.id} scene={scene} />
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
    </MapImagesContext.Provider>
  )
}
