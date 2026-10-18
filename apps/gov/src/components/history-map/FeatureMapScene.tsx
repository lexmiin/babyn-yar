import { useHistoryMapTranslations } from './language'
import MapImage from './MapImage'
import FloodReveal from './FloodReveal'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition
} from 'framer-motion'
import {
  ENTER_EASE,
  EXIT_EASE,
  SCENE_TITLE_MOTION,
  SCENE_MAP_MOTION,
  SCENE_TEXT_MOTION
} from './sceneMotion'
import { useId } from 'react'
import ActiveMapLabel from './ActiveMapLabel'
import HistoryMapLayout from './HistoryMapLayout'
import MapOverlays from './MapOverlays'
import { MAP_ASPECT_RATIO, MAP_VIEW_BOX_ATTRIBUTE } from './mapGeometry'
import {
  type HistoryMapFeature,
  type HistoryMapFeatureSceneData,
  type HistoryMapPeriod,
  type HistoryMapRoute,
  type HistoryMapSymbol
} from './mapTypes'
import {
  useMapFeatureSelection,
  type GetFeatureControlProps
} from './useMapFeatureSelection'
import { FOCUS_GLOW, glowClass, territoryFillClass } from './mapHighlight'

const FEATURE_INITIAL_DELAY_MS = 250
const FEATURE_STAGGER_MS = 220
const FEATURE_EXIT_DURATION_MS = 320
const FEATURE_EXIT_STAGGER_MS = 55

function getFeatureTransition(
  { delay, duration = 0.44 }: Pick<HistoryMapFeature, 'delay' | 'duration'>,
  index = 0,
  initialDelayMs = FEATURE_INITIAL_DELAY_MS
): Transition {
  return {
    duration,
    delay: delay ?? (initialDelayMs + index * FEATURE_STAGGER_MS) / 1000,
    ease: ENTER_EASE
  }
}

function getFeatureExitTransition(
  index: number,
  featureCount: number
): Transition {
  return {
    duration: FEATURE_EXIT_DURATION_MS / 1000,
    delay: ((featureCount - index - 1) * FEATURE_EXIT_STAGGER_MS) / 1000,
    ease: EXIT_EASE
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
  getFeatureControlProps: GetFeatureControlProps
  initialDelayMs: number
}) {
  const shouldReduceMotion = useReducedMotion()

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
          const {
            id,
            isPoint,
            mapLabel,
            mapZIndex,
            fill,
            floodReveal,
            Component
          } = feature
          const isActive = activeFeatureId === id
          const revealFlood = floodReveal && !shouldReduceMotion
          const controlProps = getFeatureControlProps(feature)

          const overlay = (
            <>
              <Component
                {...controlProps}
                className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer transition-[filter] duration-150 outline-none ${FOCUS_GLOW} [&_circle]:pointer-events-none [&_path]:pointer-events-auto [&_polygon]:pointer-events-auto ${territoryFillClass(
                  isActive,
                  fill
                )}`}
              />
              {isPoint && (
                <svg
                  viewBox={MAP_VIEW_BOX_ATTRIBUTE}
                  aria-hidden="true"
                  focusable="false"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <circle
                    data-history-map-point-hit-target
                    cx={mapLabel.anchor[0]}
                    cy={mapLabel.anchor[1]}
                    r="16"
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth="16"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="all"
                    className="cursor-pointer"
                    onMouseEnter={controlProps.onMouseEnter}
                    onMouseLeave={controlProps.onMouseLeave}
                    onClick={controlProps.onClick}
                  />
                </svg>
              )}
            </>
          )

          return (
            <motion.div
              key={id}
              className="pointer-events-none absolute inset-0"
              style={{ zIndex: mapZIndex }}
              variants={{
                hidden: {
                  opacity: revealFlood ? 1 : 0
                },
                visible: {
                  opacity: 1,
                  transition: {
                    ...getFeatureTransition(feature, index, initialDelayMs)
                  }
                },
                exit: {
                  opacity: 0,
                  transition: getFeatureExitTransition(index, features.length)
                }
              }}
            >
              {revealFlood ? (
                <FloodReveal
                  origin={floodReveal.origin}
                  radius={floodReveal.radius}
                  transition={getFeatureTransition(
                    feature,
                    index,
                    initialDelayMs
                  )}
                >
                  {overlay}
                </FloodReveal>
              ) : (
                overlay
              )}
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
  getFeatureControlProps: GetFeatureControlProps
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
            ease: EXIT_EASE
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
          timing={route.timing}
          className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none ${glowClass(
            isActive
          )}`}
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
  getFeatureControlProps: GetFeatureControlProps
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
            ease: EXIT_EASE
          }
        }}
        transition={{
          duration,
          delay,
          ease: ENTER_EASE
        }}
      >
        <Component
          {...getFeatureControlProps(symbol)}
          className={`pointer-events-none absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none [&_path]:pointer-events-auto [&_polyline]:pointer-events-auto ${glowClass(
            isActive
          )}`}
        />
      </motion.div>
    )
  })
}

export default function FeatureMapScene({
  period,
  scene: {
    mapBase,
    mapSource,
    featureLabel,
    features,
    featureInitialDelay,
    routes,
    backgroundOverlays,
    symbols,
    overview
  }
}: {
  period: HistoryMapPeriod
  scene: HistoryMapFeatureSceneData
}) {
  const t = useHistoryMapTranslations()
  const featureListHeadingId = useId()
  const featureDetailsId = useId()
  const selectableFeatures = [...features, ...routes, ...symbols]
  const listedFeatures = [
    ...features,
    ...symbols.map(symbol => ({ ...symbol, duration: symbol.duration ?? 0.32 }))
  ]
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
      {...SCENE_MAP_MOTION}
    >
      <MapImage mapBase={mapBase} />

      <div className="pointer-events-none absolute inset-0">
        <MapOverlays overlays={backgroundOverlays} />
      </div>
      <FeatureOverlay
        features={features}
        activeFeatureId={activeFeatureId}
        getFeatureControlProps={getFeatureControlProps}
        initialDelayMs={featureInitialDelay * 1000}
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
            key={period.id}
            className="block"
            {...SCENE_TITLE_MOTION}
            transition={getFeatureTransition({})}
            exit={{
              opacity: 0,
              y: -10,
              transition: {
                duration: FEATURE_EXIT_DURATION_MS / 1000,
                ease: EXIT_EASE
              }
            }}
          >
            {period.title}
          </motion.span>
        </AnimatePresence>
      }
      map={map}
      mapAspectRatio={MAP_ASPECT_RATIO}
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
            {listedFeatures.map((feature, index) => (
              <motion.li
                key={feature.id}
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={getFeatureTransition(
                  feature,
                  index,
                  featureInitialDelay * 1000
                )}
              >
                <span aria-hidden="true">—</span>
                <span>{feature.label}</span>
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
          ? t('historyMap.selected').replace('{title}', activeFeature.label)
          : t('historyMap.overview')}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          id={featureDetailsId}
          key={activeFeature?.id ?? 'period-overview'}
          className="space-y-5"
          {...SCENE_TEXT_MOTION}
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
