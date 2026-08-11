import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition
} from 'framer-motion'
import HistoryMapLayout from './HistoryMapLayout'
import {
  HISTORY_MAP_BASE,
  type HistoryMapLayerData,
  type HistoryMapFeature,
  type HistoryMapOverlay,
  type HistoryMapRoute,
  type HistoryMapSymbol
} from './layers'
import { useMapFeatureSelection } from './useMapFeatureSelection'

const FEATURE_INITIAL_DELAY_MS = 250
const FEATURE_STAGGER_MS = 220
const FEATURE_EXIT_DURATION_MS = 320
const FEATURE_EXIT_STAGGER_MS = 55
const MAP_VIEW_BOX = '0 0 894.14 783.2'
const LABEL_X = 29
const LABEL_WIDTH = 204
const LABEL_LINE_GAP = 14
const LABEL_HEIGHT = 24
const ACTIVE_LABEL_Y = 176

function getFeatureTransition(
  index: number,
  shouldReduceMotion: boolean | null,
  initialDelayMs = FEATURE_INITIAL_DELAY_MS
): Transition {
  return {
    duration: shouldReduceMotion ? 0 : 0.44,
    delay: shouldReduceMotion
      ? 0
      : (initialDelayMs + index * FEATURE_STAGGER_MS) / 1000,
    ease: [0.22, 1, 0.36, 1]
  }
}

function getFeatureExitTransition(
  index: number,
  featureCount: number,
  shouldReduceMotion: boolean | null
): Transition {
  return {
    duration: shouldReduceMotion ? 0 : FEATURE_EXIT_DURATION_MS / 1000,
    delay: shouldReduceMotion
      ? 0
      : ((featureCount - index - 1) * FEATURE_EXIT_STAGGER_MS) / 1000,
    ease: [0.64, 0, 0.78, 0]
  }
}

function FeatureOverlay({
  layerKey,
  features,
  activeFeatureIndex,
  getFeatureControlProps,
  shouldReduceMotion,
  initialDelayMs
}: {
  layerKey: number
  features: readonly HistoryMapFeature[]
  activeFeatureIndex: number | null
  getFeatureControlProps: ReturnType<
    typeof useMapFeatureSelection
  >['getFeatureControlProps']
  shouldReduceMotion: boolean | null
  initialDelayMs: number
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layerKey}
        data-history-map-overlay={layerKey}
        className="pointer-events-none absolute inset-0"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: {},
          visible: { transition: { when: 'beforeChildren' } },
          exit: { transition: { when: 'afterChildren' } }
        }}
      >
        {features.map(({ label, Component }, index) => {
          const isActive = activeFeatureIndex === index

          return (
            <motion.div
              key={label}
              className="pointer-events-none absolute inset-0"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: getFeatureTransition(
                    index,
                    shouldReduceMotion,
                    initialDelayMs
                  )
                },
                exit: {
                  opacity: 0,
                  transition: getFeatureExitTransition(
                    index,
                    features.length,
                    shouldReduceMotion
                  )
                }
              }}
            >
              <Component
                {...getFeatureControlProps(index)}
                className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer transition-[filter] duration-150 focus-visible:drop-shadow-[0_0_5px_#fff] focus-visible:outline-none [&_path]:pointer-events-auto [&_polygon]:pointer-events-auto ${
                  isActive
                    ? '[--territory-fill-opacity:.48] [--territory-fill:#941f37]'
                    : '[--territory-fill-opacity:.3] [--territory-fill:#fff] hover:[--territory-fill-opacity:.48] hover:[--territory-fill:#941f37]'
                }`}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}

function DecorativeOverlays({
  overlays,
  shouldReduceMotion,
  scaleIn = false
}: {
  overlays: readonly HistoryMapOverlay[]
  shouldReduceMotion: boolean | null
  scaleIn?: boolean
}) {
  return overlays.map(({ id, delay, duration = 0.32, Component }) => (
    <motion.div
      key={id}
      className="pointer-events-none absolute inset-0"
      initial={{ opacity: 0, scale: scaleIn && !shouldReduceMotion ? 0.96 : 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: scaleIn && !shouldReduceMotion ? 0.96 : 1,
        transition: {
          duration: shouldReduceMotion ? 0 : 0.18,
          delay: 0,
          ease: [0.64, 0, 0.78, 0]
        }
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <Component
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full"
      />
    </motion.div>
  ))
}

function RouteOverlay({
  routes,
  featureOffset,
  activeFeatureIndex,
  getFeatureControlProps,
  shouldReduceMotion
}: {
  routes: readonly HistoryMapRoute[]
  featureOffset: number
  activeFeatureIndex: number | null
  getFeatureControlProps: ReturnType<
    typeof useMapFeatureSelection
  >['getFeatureControlProps']
  shouldReduceMotion: boolean | null
}) {
  return routes.map(({ id, Component }, index) => {
    const selectionIndex = featureOffset + index
    const isActive = activeFeatureIndex === selectionIndex

    return (
      <motion.div
        key={id}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: {
            duration: shouldReduceMotion ? 0 : 0.2,
            delay: 0,
            ease: [0.64, 0, 0.78, 0]
          }
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.24,
          delay: shouldReduceMotion ? 0 : 0.2
        }}
      >
        <Component
          {...getFeatureControlProps(selectionIndex)}
          shouldReduceMotion={Boolean(shouldReduceMotion)}
          className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none ${
            isActive
              ? 'drop-shadow-[0_0_5px_rgba(255,255,255,.95)]'
              : 'focus-visible:drop-shadow-[0_0_5px_#fff]'
          }`}
        />
      </motion.div>
    )
  })
}

function SymbolOverlay({
  symbols,
  featureOffset,
  activeFeatureIndex,
  getFeatureControlProps,
  shouldReduceMotion
}: {
  symbols: readonly HistoryMapSymbol[]
  featureOffset: number
  activeFeatureIndex: number | null
  getFeatureControlProps: ReturnType<
    typeof useMapFeatureSelection
  >['getFeatureControlProps']
  shouldReduceMotion: boolean | null
}) {
  return symbols.map(({ id, delay, duration = 0.32, Component }, index) => {
    const selectionIndex = featureOffset + index
    const isActive = activeFeatureIndex === selectionIndex

    return (
      <motion.div
        key={id}
        className="pointer-events-none absolute inset-0"
        initial={{
          opacity: 0,
          scale: shouldReduceMotion ? 1 : 0.96
        }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: shouldReduceMotion ? 1 : 0.96,
          transition: {
            duration: shouldReduceMotion ? 0 : 0.18,
            delay: 0,
            ease: [0.64, 0, 0.78, 0]
          }
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : duration,
          delay: shouldReduceMotion ? 0 : delay,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <Component
          {...getFeatureControlProps(selectionIndex)}
          className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none [&_path]:pointer-events-auto [&_polyline]:pointer-events-auto ${
            isActive
              ? 'drop-shadow-[0_0_5px_rgba(255,255,255,.95)]'
              : 'focus-visible:drop-shadow-[0_0_5px_#fff]'
          }`}
        />
      </motion.div>
    )
  })
}

export default function HistoryMapLayer({
  layerKey,
  layer: {
    title,
    mapSource,
    featureLabel,
    features,
    featureInitialDelayMs = FEATURE_INITIAL_DELAY_MS,
    routes = [],
    backgroundOverlays = [],
    symbols = [],
    overview
  }
}: {
  layerKey: number
  layer: HistoryMapLayerData
}) {
  const shouldReduceMotion = useReducedMotion()
  const selectableFeatures = [...features, ...routes, ...symbols]
  const listedFeatures = [...features, ...symbols]
  const { activeFeature, activeFeatureIndex, getFeatureControlProps } =
    useMapFeatureSelection(selectableFeatures, layerKey)
  const showActiveFeatureLabel = activeFeature?.showLabel !== false
  const activeLabelIsTwoLines = Boolean(activeFeature?.mapLabel.lines)
  const activeLabelHeight = activeLabelIsTwoLines ? 39 : LABEL_HEIGHT
  const activeLabelWidth = activeFeature?.mapLabel.width ?? LABEL_WIDTH
  const activeLabelLineStartX = LABEL_X + activeLabelWidth + LABEL_LINE_GAP
  const activeLabelY = ACTIVE_LABEL_Y - activeLabelHeight / 2

  const map = (
    <>
      <img
        data-history-map-base
        src={HISTORY_MAP_BASE.src}
        alt={HISTORY_MAP_BASE.alt}
        className="absolute inset-0 h-full w-full object-contain select-none"
        draggable={false}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={`background-${layerKey}`}
          className="pointer-events-none absolute inset-0"
        >
          <DecorativeOverlays
            overlays={backgroundOverlays}
            shouldReduceMotion={shouldReduceMotion}
          />
        </motion.div>
      </AnimatePresence>
      <FeatureOverlay
        layerKey={layerKey}
        features={features}
        activeFeatureIndex={activeFeatureIndex}
        getFeatureControlProps={getFeatureControlProps}
        shouldReduceMotion={shouldReduceMotion}
        initialDelayMs={featureInitialDelayMs}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={`routes-${layerKey}`}
          className="pointer-events-none absolute inset-0"
        >
          <RouteOverlay
            routes={routes}
            featureOffset={features.length}
            activeFeatureIndex={activeFeatureIndex}
            getFeatureControlProps={getFeatureControlProps}
            shouldReduceMotion={shouldReduceMotion}
          />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={`symbols-${layerKey}`}
          className="pointer-events-none absolute inset-0"
        >
          <SymbolOverlay
            symbols={symbols}
            featureOffset={features.length + routes.length}
            activeFeatureIndex={activeFeatureIndex}
            getFeatureControlProps={getFeatureControlProps}
            shouldReduceMotion={shouldReduceMotion}
          />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {activeFeature && showActiveFeatureLabel && (
          <motion.div
            key={activeFeature.label}
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
            {activeFeature.label}
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
          {activeFeature && showActiveFeatureLabel && (
            <motion.g
              key={activeFeature.label}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -5 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.18,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <line
                x1={activeLabelLineStartX}
                y1={ACTIVE_LABEL_Y}
                x2={activeFeature.mapLabel.anchor[0]}
                y2={activeFeature.mapLabel.anchor[1]}
                stroke="white"
                strokeWidth="1.35"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={activeLabelLineStartX}
                cy={ACTIVE_LABEL_Y}
                r="4.2"
                fill="white"
              />
              <circle
                cx={activeFeature.mapLabel.anchor[0]}
                cy={activeFeature.mapLabel.anchor[1]}
                r="4.2"
                fill="white"
              />
              <rect
                x={LABEL_X}
                y={activeLabelY}
                width={activeLabelWidth}
                height={activeLabelHeight}
                rx={activeLabelHeight / 2}
                fill="white"
                stroke="#181818"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={LABEL_X + activeLabelWidth / 2}
                y={ACTIVE_LABEL_Y}
                fill="#111"
                fontFamily="Roboto, sans-serif"
                fontSize={activeLabelIsTwoLines ? 13.5 : 15}
                fontWeight="700"
                textAnchor="middle"
              >
                {activeFeature.mapLabel.lines ? (
                  <>
                    <tspan x={LABEL_X + activeLabelWidth / 2} dy="-2.5">
                      {activeFeature.mapLabel.lines[0]}
                    </tspan>
                    <tspan x={LABEL_X + activeLabelWidth / 2} dy="14">
                      {activeFeature.mapLabel.lines[1]}
                    </tspan>
                  </>
                ) : (
                  <tspan dominantBaseline="central">
                    {activeFeature.label}
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
      layerKey={layerKey}
      title={
        <AnimatePresence mode="wait">
          <motion.span
            key={layerKey}
            className="block"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getFeatureTransition(0, shouldReduceMotion)}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -10,
              transition: {
                duration: shouldReduceMotion
                  ? 0
                  : FEATURE_EXIT_DURATION_MS / 1000,
                ease: [0.64, 0, 0.78, 0]
              }
            }}
          >
            {title}
          </motion.span>
        </AnimatePresence>
      }
      map={map}
      mapAspectRatio={HISTORY_MAP_BASE.aspectRatio}
      mapSource={mapSource}
      featureLabel={featureLabel}
      features={listedFeatures.map(({ label }) => label)}
      renderFeature={(feature, index) => (
        <motion.li
          key={`${layerKey}-${feature}`}
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={getFeatureTransition(index, shouldReduceMotion)}
        >
          <span aria-hidden="true">—</span>
          <span>{feature}</span>
        </motion.li>
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${layerKey}-${activeFeature?.label ?? 'period-overview'}`}
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
          {activeFeature ? (
            <>
              {showActiveFeatureLabel && (
                <h2 className="text-2xl leading-tight font-bold lg:text-3xl">
                  {activeFeature.label}
                </h2>
              )}
              {activeFeature.description.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </>
          ) : (
            overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)
          )}
        </motion.div>
      </AnimatePresence>
    </HistoryMapLayout>
  )
}
