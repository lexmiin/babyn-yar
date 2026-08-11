import type { ReactNode } from 'react'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import HistoryMapLayout from './HistoryMapLayout'
import type { HistoryMapTerritory } from './layers'

const TERRITORY_INITIAL_DELAY_MS = 250
const TERRITORY_STAGGER_MS = 220
const TERRITORY_EXIT_DURATION_MS = 320
const TERRITORY_EXIT_STAGGER_MS = 55

type HistoryMapLayerProps = {
  title: string
  baseMapSrc: string
  mapAlt: string
  mapAspectRatio: string
  mapSource: string
  territoryLabel: string
  territories: readonly HistoryMapTerritory[]
  children: ReactNode
}

function getTerritoryTransition(
  index: number,
  shouldReduceMotion: boolean | null
): Transition {
  return {
    duration: shouldReduceMotion ? 0 : 0.44,
    delay: shouldReduceMotion
      ? 0
      : (TERRITORY_INITIAL_DELAY_MS + index * TERRITORY_STAGGER_MS) / 1000,
    ease: [0.22, 1, 0.36, 1]
  }
}

function getTerritoryExitTransition(
  index: number,
  territoryCount: number,
  shouldReduceMotion: boolean | null
): Transition {
  return {
    duration: shouldReduceMotion ? 0 : TERRITORY_EXIT_DURATION_MS / 1000,
    delay: shouldReduceMotion
      ? 0
      : ((territoryCount - index - 1) * TERRITORY_EXIT_STAGGER_MS) / 1000,
    ease: [0.64, 0, 0.78, 0]
  }
}

export default function HistoryMapLayer({
  title,
  baseMapSrc,
  mapAlt,
  mapAspectRatio,
  mapSource,
  territoryLabel,
  territories,
  children
}: HistoryMapLayerProps) {
  const shouldReduceMotion = useReducedMotion()

  const map = (
    <>
      <img
        src={baseMapSrc}
        alt={mapAlt}
        className="absolute inset-0 h-full w-full object-contain select-none"
        draggable={false}
      />
      {territories.map(({ label, Component }, index) => (
        <motion.div
          key={label}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={getTerritoryTransition(index, shouldReduceMotion)}
          exit={{
            opacity: 0,
            transition: getTerritoryExitTransition(
              index,
              territories.length,
              shouldReduceMotion
            )
          }}
        >
          <Component
            aria-hidden="true"
            focusable="false"
            className="pointer-events-none absolute inset-0 h-full w-full [--territory-fill-opacity:.3] [--territory-fill:#fff] hover:[--territory-fill-opacity:.48] hover:[--territory-fill:#941f37]"
          />
        </motion.div>
      ))}
    </>
  )

  return (
    <HistoryMapLayout
      title={title}
      map={map}
      mapAspectRatio={mapAspectRatio}
      mapSource={mapSource}
      territoryLabel={territoryLabel}
      territories={territories.map(({ label }) => label)}
      renderTerritory={(territory, index) => (
        <motion.li
          key={territory}
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={getTerritoryTransition(index, shouldReduceMotion)}
        >
          <span aria-hidden="true">—</span>
          <span>{territory}</span>
        </motion.li>
      )}
    >
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={getTerritoryTransition(0, shouldReduceMotion)}
      >
        {children}
      </motion.div>
    </HistoryMapLayout>
  )
}
