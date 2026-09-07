import { useId, type ReactNode } from 'react'
import { motion, type Transition } from 'framer-motion'

export default function FloodReveal({
  transition,
  children
}: {
  transition: Transition
  children: ReactNode
}) {
  const id = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 894.14 783.2"
      className="pointer-events-none absolute inset-0 h-full w-full"
      focusable="false"
    >
      <defs>
        <filter
          id={`${id}-edge`}
          x="0"
          y="0"
          width="894.14"
          height="783.2"
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <mask
          id={`${id}-flow`}
          x="0"
          y="0"
          width="894.14"
          height="783.2"
          maskUnits="userSpaceOnUse"
        >
          {/* Spread from the breach within the existing flood boundary. */}
          <motion.circle
            cx={561}
            cy={237}
            fill="white"
            filter={`url(#${id}-edge)`}
            variants={{
              hidden: { r: 0 },
              visible: {
                r: 370,
                transition: { ...transition, ease: 'linear' }
              }
            }}
          />
        </mask>
      </defs>
      <g mask={`url(#${id}-flow)`}>{children}</g>
    </svg>
  )
}
