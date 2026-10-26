import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import type { HistoryMapScene } from './sceneTypes'

/** Maps scroll progress through the track to a scene, kept in sync with the URL hash. */
export function useActiveHistoryStep(scenes: readonly HistoryMapScene[]) {
  const stepCount = scenes.length
  const trackRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState(() =>
    Math.max(
      0,
      scenes.findIndex(scene => `#${scene.id}` === window.location.hash)
    )
  )
  const { scrollY, scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end']
  })

  const syncHash = useCallback(
    (step: number) => {
      const track = trackRef.current
      if (!track) return

      // Content above the maps (the timeline) has no scene, so it has no hash.
      const hash =
        track.getBoundingClientRect().top > 0 ? '' : `#${scenes[step].id}`
      if (window.location.hash !== hash) {
        window.history.replaceState(
          window.history.state,
          '',
          `${window.location.pathname}${window.location.search}${hash}`
        )
      }
    },
    [scenes]
  )

  useMotionValueEvent(scrollYProgress, 'change', progress => {
    const nextStep = Math.min(
      Math.max(Math.floor(progress * stepCount), 0),
      stepCount - 1
    )
    setActiveStep(current => (current === nextStep ? current : nextStep))
    syncHash(nextStep)
  })

  // Progress stays at 0 above the maps, so watch the page scroll to clear the
  // hash once the first scene scrolls back down out of view.
  useMotionValueEvent(scrollY, 'change', () => {
    const track = trackRef.current
    if (window.location.hash && track && track.getBoundingClientRect().top > 0)
      syncHash(0)
  })

  const scrollToStep = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      const track = trackRef.current
      if (!track) return

      // Land inside the scene's scroll range, away from rounding boundaries.
      const progress = (index + 0.1) / stepCount
      const top =
        window.scrollY +
        track.getBoundingClientRect().top +
        progress * (track.offsetHeight - window.innerHeight)
      window.scrollTo({ top, behavior })
    },
    [stepCount]
  )

  useLayoutEffect(() => {
    function scrollToScene() {
      const index = scenes.findIndex(
        scene => `#${scene.id}` === window.location.hash
      )
      if (index < 0 || !trackRef.current) return

      scrollToStep(index, 'instant')
      setActiveStep(index)
    }

    scrollToScene()
    window.addEventListener('hashchange', scrollToScene)
    return () => window.removeEventListener('hashchange', scrollToScene)
  }, [scenes, scrollToStep])

  return { activeStep, trackRef, scrollToStep }
}
