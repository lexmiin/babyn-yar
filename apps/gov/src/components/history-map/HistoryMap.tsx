import { useMemo } from 'react'
import { AnimatePresence, MotionConfig } from 'motion/react'
import { getHistoryMapScenes } from './scenes'
import { useTranslations, type Language } from '@babyn-yar/i18n'
import { HistoryMapLanguageContext } from './language'
import SceneRenderer from './SceneRenderer'
import ScrollIndicator from './ScrollIndicator'
import { useActiveHistoryStep } from './useActiveHistoryStep'
import { usePreloadNextMap } from './usePreloadNextMap'
import type { MapImageSource, MapImages } from './mapTypes'

const SCROLL_HEIGHT_PER_STAGE = 120

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
  const { activeStep, trackRef, scrollToStep } = useActiveHistoryStep(scenes)
  const scene = scenes[activeStep]
  usePreloadNextMap(scenes, activeStep)

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
            <ScrollIndicator
              visible={activeStep < scenes.length - 1}
              label={t('historyMap.nextScene')}
              onClick={() =>
                scrollToStep(
                  activeStep + 1,
                  window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'instant'
                    : 'smooth'
                )
              }
            />
          </div>
        </section>
      </MotionConfig>
    </HistoryMapLanguageContext.Provider>
  )
}
