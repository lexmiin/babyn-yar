import { useLayoutEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
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
