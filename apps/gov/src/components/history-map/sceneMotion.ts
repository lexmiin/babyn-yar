import type { MotionProps } from 'motion/react'

export const ENTER_EASE = [0.22, 1, 0.36, 1] as const
export const EXIT_EASE = [0.64, 0, 0.78, 0] as const

// Every scene remounts on each step, so these play even within one period.
export const SCENE_TITLE_MOTION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.44, ease: ENTER_EASE }
} as const satisfies MotionProps

export const SCENE_MAP_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.36, ease: ENTER_EASE }
} as const satisfies MotionProps

export const SCENE_TEXT_MOTION = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: ENTER_EASE }
} as const satisfies MotionProps
