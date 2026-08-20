import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition
} from 'framer-motion'
import { useId } from 'react'
import ActiveMapLabel from './ActiveMapLabel'
import HistoryMapLayout from './HistoryMapLayout'
import MapOverlays from './MapOverlays'
import {
  type HistoryMapFeature,
  type HistoryMapFeatureSceneData,
  type HistoryMapLayer,
  type HistoryMapRoute,
  type HistoryMapSymbol
} from './layers'
import { useMapFeatureSelection } from './useMapFeatureSelection'

const FEATURE_INITIAL_DELAY_MS = 250
const FEATURE_STAGGER_MS = 220
const FEATURE_EXIT_DURATION_MS = 320
const FEATURE_EXIT_STAGGER_MS = 55

function getFeatureTransition(
  index: number,
  initialDelayMs = FEATURE_INITIAL_DELAY_MS
): Transition {
  return {
    duration: 0.44,
    delay: (initialDelayMs + index * FEATURE_STAGGER_MS) / 1000,
    ease: [0.22, 1, 0.36, 1]
  }
}

function getFeatureExitTransition(
  index: number,
  featureCount: number
): Transition {
  return {
    duration: FEATURE_EXIT_DURATION_MS / 1000,
    delay: ((featureCount - index - 1) * FEATURE_EXIT_STAGGER_MS) / 1000,
    ease: [0.64, 0, 0.78, 0]
  }
}

function FeatureOverlay({
  features,
  activeFeatureId,
  getFeatureControlProps,
  initialDelayMs
}: {
  features: readonly HistoryMapFeature[]
  activeFeatureId: string | null
  getFeatureControlProps: ReturnType<
    typeof useMapFeatureSelection
  >['getFeatureControlProps']
  initialDelayMs: number
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="features"
        data-history-map-overlay
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
        {features.map((feature, index) => {
          const { id, mapZIndex, Component } = feature
          const isActive = activeFeatureId === id

          return (
            <motion.div
              key={id}
              className="pointer-events-none absolute inset-0"
              style={{ zIndex: mapZIndex }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: getFeatureTransition(index, initialDelayMs)
                },
                exit: {
                  opacity: 0,
                  transition: getFeatureExitTransition(index, features.length)
                }
              }}
            >
              <Component
                {...getFeatureControlProps(feature)}
                className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer transition-[filter] duration-150 focus-visible:drop-shadow-[0_0_5px_#fff] focus-visible:outline-none [&_circle]:pointer-events-auto [&_path]:pointer-events-auto [&_polygon]:pointer-events-auto ${
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

function RouteOverlay({
  routes,
  activeFeatureId,
  getFeatureControlProps
}: {
  routes: readonly HistoryMapRoute[]
  activeFeatureId: string | null
  getFeatureControlProps: ReturnType<
    typeof useMapFeatureSelection
  >['getFeatureControlProps']
}) {
  const shouldReduceMotion = useReducedMotion()

  return routes.map(route => {
    const { id, Component } = route
    const isActive = activeFeatureId === id

    return (
      <motion.div
        key={id}
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: {
            duration: 0.2,
            delay: 0,
            ease: [0.64, 0, 0.78, 0]
          }
        }}
        transition={{
          duration: 0.24,
          delay: 0.2
        }}
      >
        <Component
          {...getFeatureControlProps(route)}
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
  activeFeatureId,
  getFeatureControlProps
}: {
  symbols: readonly HistoryMapSymbol[]
  activeFeatureId: string | null
  getFeatureControlProps: ReturnType<
    typeof useMapFeatureSelection
  >['getFeatureControlProps']
}) {
  return symbols.map(symbol => {
    const { id, delay, duration = 0.32, Component } = symbol
    const isActive = activeFeatureId === id

    return (
      <motion.div
        key={id}
        className="pointer-events-none absolute inset-0"
        initial={{
          opacity: 0,
          scale: 0.96
        }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.96,
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
          {...getFeatureControlProps(symbol)}
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

export default function FeatureMapScene({
  layer,
  scene: {
    mapBase,
    mapSource,
    featureLabel,
    features,
    featureInitialDelayMs,
    routes,
    backgroundOverlays,
    symbols,
    overview
  }
}: {
  layer: HistoryMapLayer
  scene: HistoryMapFeatureSceneData
}) {
  const featureListHeadingId = useId()
  const featureDetailsId = useId()
  const selectableFeatures = [...features, ...routes, ...symbols]
  const listedFeatures = [...features, ...symbols]
  const {
    activeFeature,
    activeFeatureId,
    labelFeature,
    getFeatureControlProps
  } = useMapFeatureSelection(selectableFeatures, featureDetailsId)
  const showLabelFeature = labelFeature?.showLabel !== false

  const map = (
    <motion.div
      key="feature-map"
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.36,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <img
        data-history-map-base
        src={mapBase.src}
        alt={mapBase.alt}
        className="absolute inset-0 h-full w-full object-contain select-none"
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0">
        <MapOverlays overlays={backgroundOverlays} />
      </div>
      <FeatureOverlay
        features={features}
        activeFeatureId={activeFeatureId}
        getFeatureControlProps={getFeatureControlProps}
        initialDelayMs={featureInitialDelayMs}
      />
      <div className="pointer-events-none absolute inset-0">
        <RouteOverlay
          routes={routes}
          activeFeatureId={activeFeatureId}
          getFeatureControlProps={getFeatureControlProps}
        />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <SymbolOverlay
          symbols={symbols}
          activeFeatureId={activeFeatureId}
          getFeatureControlProps={getFeatureControlProps}
        />
      </div>
      <ActiveMapLabel feature={showLabelFeature ? labelFeature : null} />
    </motion.div>
  )

  return (
    <HistoryMapLayout
      title={
        <AnimatePresence mode="wait">
          <motion.span
            key={layer.id}
            className="block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getFeatureTransition(0)}
            exit={{
              opacity: 0,
              y: -10,
              transition: {
                duration: FEATURE_EXIT_DURATION_MS / 1000,
                ease: [0.64, 0, 0.78, 0]
              }
            }}
          >
            {layer.title}
          </motion.span>
        </AnimatePresence>
      }
      map={map}
      mapAspectRatio={mapBase.aspectRatio}
      mapSource={mapSource}
      belowMap={
        <section aria-labelledby={featureListHeadingId} className="mt-7">
          <h2
            id={featureListHeadingId}
            className="text-xl leading-tight font-bold"
          >
            {featureLabel}
          </h2>
          <ul className="mt-3 grid gap-x-8 gap-y-1 text-base leading-snug sm:grid-cols-2 lg:text-lg">
            {listedFeatures.map(({ id, label }, index) => (
              <motion.li
                key={id}
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={getFeatureTransition(index)}
              >
                <span aria-hidden="true">—</span>
                <span>{label}</span>
              </motion.li>
            ))}
          </ul>
        </section>
      }
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activeFeature
          ? `Вибрано: ${activeFeature.label}`
          : 'Огляд історичного періоду'}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          id={featureDetailsId}
          key={activeFeature?.id ?? 'period-overview'}
          className="space-y-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1]
          }}
          exit={{
            opacity: 0,
            y: -10,
            transition: {
              duration: 0.2,
              ease: [0.64, 0, 0.78, 0]
            }
          }}
        >
          {activeFeature ? (
            <>
              {activeFeature.showLabel !== false && (
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
