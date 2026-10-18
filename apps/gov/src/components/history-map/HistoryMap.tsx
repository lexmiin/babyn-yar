import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll
} from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { getHistoryMapScenes } from './scenes'
import type { HistoryMapScene } from './sceneTypes'
import { useTranslations, type Language } from '@babyn-yar/i18n'
import { HistoryMapLanguageContext } from './language'
import SceneRenderer from './SceneRenderer'
import { MAP_IMAGE_SIZES } from './MapImage'
import type { HistoryMapBase, MapImageSource, MapImages } from './mapTypes'

const SCROLL_HEIGHT_PER_STAGE = 120

function getMapBase(scene: HistoryMapScene): HistoryMapBase | undefined {
  return scene.kind === 'video' ? undefined : scene.data.mapBase
}

function useActiveHistoryStep(scenes: readonly HistoryMapScene[]) {
  const stepCount = scenes.length
  const trackRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(() =>
    Math.max(
      0,
      scenes.findIndex(scene => `#${scene.id}` === window.location.hash)
    )
  )
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
    const hash = `#${scenes[nextStep].id}`
    if (window.location.hash !== hash) {
      window.history.replaceState(window.history.state, '', hash)
    }
  })

  useLayoutEffect(() => {
    function scrollToScene() {
      const index = scenes.findIndex(
        scene => `#${scene.id}` === window.location.hash
      )
      const track = trackRef.current
      if (index < 0 || !track) return

      // Land inside the scene's scroll range, away from rounding boundaries.
      const progress = (index + 0.1) / stepCount
      const top =
        window.scrollY +
        track.getBoundingClientRect().top +
        progress * (track.offsetHeight - window.innerHeight)
      window.scrollTo({ top, behavior: 'instant' })
      setActiveStep(index)
    }

    scrollToScene()
    window.addEventListener('hashchange', scrollToScene)
    return () => window.removeEventListener('hashchange', scrollToScene)
  }, [stepCount, scenes])

  return { activeStep, trackRef }
}

export default function HistoryMap({
  images,
  poiImages,
  lang
}: {
  lang: Language
  images: MapImages
  poiImages: Record<string, MapImageSource>
}) {
  const scenes = useMemo(
    () => getHistoryMapScenes(lang, { maps: images, pois: poiImages }),
    [lang, images, poiImages]
  )
  const t = useTranslations(lang)
  const { activeStep, trackRef } = useActiveHistoryStep(scenes)
  const scene = scenes[activeStep]
  const currentMap = getMapBase(scene)
  const nextMap = scenes
    .slice(activeStep + 1)
    .map(getMapBase)
    .find(mapBase => mapBase && mapBase.id !== currentMap?.id)

  useEffect(() => {
    if (!nextMap) return
    let cancelled = false

    async function decodeMap(source: MapImageSource, priority: 'auto' | 'low') {
      const image = new Image()
      image.fetchPriority = priority
      image.sizes = MAP_IMAGE_SIZES
      image.srcset = source.srcSet
      image.src = source.src
      await image.decode().catch(() => {})
    }

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

  return (
    <HistoryMapLanguageContext.Provider value={lang}>
      <MotionConfig reducedMotion="user">
        <section
          ref={trackRef}
          className="relative"
          style={{
            minHeight: `${scenes.length * SCROLL_HEIGHT_PER_STAGE}svh`
          }}
        >
          <div className="sticky top-[7.5rem] md:top-28">
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {t('historyMap.step')
                .replace('{current}', String(activeStep + 1))
                .replace('{total}', String(scenes.length))
                .replace('{title}', scene.period.title)}
            </div>
            <div>
              <AnimatePresence mode="wait">
                <SceneRenderer key={scene.id} scene={scene} />
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {activeStep < scenes.length - 1 && (
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
    </HistoryMapLanguageContext.Provider>
  )
}
