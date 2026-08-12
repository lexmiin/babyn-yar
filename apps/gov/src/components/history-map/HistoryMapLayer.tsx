import { useState, type KeyboardEvent, type ReactNode } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition
} from 'framer-motion'
import HistoryMapLayout from './HistoryMapLayout'
import type { HistoryMapTerritory } from './layers'

const TERRITORY_INITIAL_DELAY_MS = 250
const TERRITORY_STAGGER_MS = 220
const TERRITORY_EXIT_DURATION_MS = 320
const TERRITORY_EXIT_STAGGER_MS = 55
const MAP_VIEW_BOX = '0 0 894.14 783.2'
const LABEL_X = 29
const LABEL_WIDTH = 204
const LABEL_LINE_START_X = 247
const LABEL_HEIGHT = 24
const ACTIVE_LABEL_Y = 176

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
  const [activeTerritoryIndex, setActiveTerritoryIndex] = useState<
    number | null
  >(null)

  function toggleTerritory(index: number) {
    setActiveTerritoryIndex(current => (current === index ? null : index))
  }

  function handleTerritoryKeyDown(
    event: KeyboardEvent<SVGSVGElement>,
    index: number
  ) {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    toggleTerritory(index)
  }

  const activeTerritory =
    activeTerritoryIndex === null ? null : territories[activeTerritoryIndex]
  const activeLabelIsTwoLines = Boolean(activeTerritory?.mapLabel.lines)
  const activeLabelHeight = activeLabelIsTwoLines ? 39 : LABEL_HEIGHT
  const activeLabelY = ACTIVE_LABEL_Y - activeLabelHeight / 2

  const map = (
    <>
      <img
        src={baseMapSrc}
        alt={mapAlt}
        className="absolute inset-0 h-full w-full object-contain select-none"
        draggable={false}
      />
      {territories.map(({ label, Component }, index) => {
        const isActive = activeTerritoryIndex === index

        return (
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
              focusable="false"
              role="button"
              tabIndex={0}
              aria-label={`${isActive ? 'Сховати' : 'Показати'} підпис: ${label}`}
              aria-pressed={isActive}
              onPointerDown={event =>
                event.currentTarget.focus({ preventScroll: true })
              }
              onClick={event => {
                event.currentTarget.focus({ preventScroll: true })
                toggleTerritory(index)
              }}
              onKeyDown={event => handleTerritoryKeyDown(event, index)}
              className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer transition-[filter] duration-150 focus-visible:drop-shadow-[0_0_5px_#fff] focus-visible:outline-none [&_path]:pointer-events-auto [&_polygon]:pointer-events-auto ${
                isActive
                  ? '[--territory-fill-opacity:.48] [--territory-fill:#941f37]'
                  : '[--territory-fill-opacity:.3] [--territory-fill:#fff] hover:[--territory-fill-opacity:.48] hover:[--territory-fill:#941f37]'
              }`}
            />
          </motion.div>
        )
      })}
      <AnimatePresence mode="wait">
        {activeTerritory && (
          <motion.div
            key={activeTerritory.label}
            aria-live="polite"
            className="pointer-events-none absolute top-[22.5%] left-[3.25%] z-10 flex min-h-7 w-[min(70%,17rem)] items-center justify-center rounded-full border border-neutral-900 bg-white px-3 py-1 text-center text-xs leading-tight font-bold text-neutral-950 xl:hidden"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.18,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {activeTerritory.label}
          </motion.div>
        )}
      </AnimatePresence>
      <svg
        viewBox={MAP_VIEW_BOX}
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 hidden h-full w-full xl:block"
      >
        <AnimatePresence mode="wait">
          {activeTerritory && (
            <motion.g
              key={activeTerritory.label}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -5 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.18,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <line
                x1={LABEL_LINE_START_X}
                y1={ACTIVE_LABEL_Y}
                x2={activeTerritory.mapLabel.anchor[0]}
                y2={activeTerritory.mapLabel.anchor[1]}
                stroke="white"
                strokeWidth="1.35"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={LABEL_LINE_START_X}
                cy={ACTIVE_LABEL_Y}
                r="4.2"
                fill="white"
              />
              <circle
                cx={activeTerritory.mapLabel.anchor[0]}
                cy={activeTerritory.mapLabel.anchor[1]}
                r="4.2"
                fill="white"
              />
              <rect
                x={LABEL_X}
                y={activeLabelY}
                width={LABEL_WIDTH}
                height={activeLabelHeight}
                rx={activeLabelHeight / 2}
                fill="white"
                stroke="#181818"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={LABEL_X + LABEL_WIDTH / 2}
                y={ACTIVE_LABEL_Y}
                fill="#111"
                fontFamily="Roboto, sans-serif"
                fontSize={activeLabelIsTwoLines ? 13.5 : 15}
                fontWeight="700"
                textAnchor="middle"
              >
                {activeTerritory.mapLabel.lines ? (
                  <>
                    <tspan x={LABEL_X + LABEL_WIDTH / 2} dy="-2.5">
                      {activeTerritory.mapLabel.lines[0]}
                    </tspan>
                    <tspan x={LABEL_X + LABEL_WIDTH / 2} dy="14">
                      {activeTerritory.mapLabel.lines[1]}
                    </tspan>
                  </>
                ) : (
                  <tspan dominantBaseline="central">
                    {activeTerritory.label}
                  </tspan>
                )}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </>
  )

  return (
    <HistoryMapLayout
      title={
        <motion.span
          className="block"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTerritoryTransition(0, shouldReduceMotion)}
          exit={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : -10,
            transition: {
              duration: shouldReduceMotion
                ? 0
                : TERRITORY_EXIT_DURATION_MS / 1000,
              ease: [0.64, 0, 0.78, 0]
            }
          }}
        >
          {title}
        </motion.span>
      }
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTerritory?.label ?? 'period-overview'}
          aria-live="polite"
          className="space-y-5"
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.28,
            ease: [0.22, 1, 0.36, 1]
          }}
          exit={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : -10,
            transition: {
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: [0.64, 0, 0.78, 0]
            }
          }}
        >
          {activeTerritory ? (
            <>
              <h2 className="text-2xl leading-tight font-bold lg:text-3xl">
                {activeTerritory.label}
              </h2>
              {activeTerritory.description.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </>
          ) : (
            children
          )}
        </motion.div>
      </AnimatePresence>
    </HistoryMapLayout>
  )
}
