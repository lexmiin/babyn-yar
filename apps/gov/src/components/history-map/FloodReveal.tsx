import { useId, type ReactNode } from 'react'
import { motion, type Transition } from 'framer-motion'
import { MAP_VIEW_BOX, MAP_VIEW_BOX_ATTRIBUTE } from './mapGeometry'

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
      viewBox={MAP_VIEW_BOX_ATTRIBUTE}
      className="pointer-events-none absolute inset-0 h-full w-full"
      focusable="false"
    >
      <defs>
        <filter
          id={`${id}-edge`}
          x={MAP_VIEW_BOX.minX}
          y={MAP_VIEW_BOX.minY}
          width={MAP_VIEW_BOX.width}
          height={MAP_VIEW_BOX.height}
          filterUnits="userSpaceOnUse"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <mask
          id={`${id}-flow`}
          x={MAP_VIEW_BOX.minX}
          y={MAP_VIEW_BOX.minY}
          width={MAP_VIEW_BOX.width}
          height={MAP_VIEW_BOX.height}
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
