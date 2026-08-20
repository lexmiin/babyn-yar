import { motion } from 'framer-motion'
import type { SVGProps } from 'react'
import type { HistoryMapOverlay } from './layers'

export default function MapOverlays<T extends HistoryMapOverlay>({
  overlays,
  scaleIn = false,
  activeOverlayId,
  getOverlayControlProps
}: {
  overlays: readonly T[]
  scaleIn?: boolean
  activeOverlayId?: string | null
  getOverlayControlProps?: (overlay: T) => SVGProps<SVGSVGElement>
}) {
  return overlays.map(overlay => {
    const { id, delay, duration = 0.32, Component } = overlay
    const isInteractive = Boolean(getOverlayControlProps)
    const isActive = activeOverlayId === id

    return (
      <motion.div
        key={id}
        data-history-map-overlay
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0, scale: scaleIn ? 0.96 : 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: scaleIn ? 0.96 : 1,
          transition: {
            duration: 0.18,
            delay: 0,
            ease: [0.64, 0, 0.78, 0]
          }
        }}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <Component
          {...(getOverlayControlProps?.(overlay) ?? {
            'aria-hidden': true,
            focusable: 'false'
          })}
          className={`pointer-events-none absolute inset-0 h-full w-full focus-visible:outline-none ${
            isInteractive
              ? `cursor-pointer [&_path]:pointer-events-auto [&_polygon]:pointer-events-auto ${
                  isActive
                    ? '[--territory-fill-opacity:.48] [--territory-fill:#941f37]'
                    : '[--territory-fill-opacity:.3] [--territory-fill:#fff] hover:[--territory-fill-opacity:.48] hover:[--territory-fill:#941f37] focus-visible:[--territory-fill-opacity:.48] focus-visible:[--territory-fill:#941f37]'
                }`
              : ''
          }`}
        />
      </motion.div>
    )
  })
}
