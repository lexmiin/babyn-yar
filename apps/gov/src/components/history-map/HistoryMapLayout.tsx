import { useHistoryMapTranslations } from './language'
import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import MapImage from './MapImage'
import { SCENE_MAP_MOTION } from './sceneMotion'
import type { HistoryMapBase } from './mapTypes'

type FrameMap = {
  mapBase?: HistoryMapBase
  aspectRatio: string
}

type FrameSlots = {
  title: HTMLElement
  map: HTMLElement
  mapSource: HTMLElement
  belowMap: HTMLElement
  aside: HTMLElement
}

const HistoryMapFrameContext = createContext<{
  slots: FrameSlots
  setMap: (map: FrameMap) => void
} | null>(null)

/**
 * The page structure shared by every scene. Scenes remount on each step, but
 * the base map lives here, so it only animates when the map base changes.
 */
export function HistoryMapFrame({ children }: { children: ReactNode }) {
  const t = useHistoryMapTranslations()
  const titleId = useId()
  const [map, setMap] = useState<FrameMap | null>(null)
  const [title, setTitle] = useState<HTMLElement | null>(null)
  const [mapSlot, setMapSlot] = useState<HTMLElement | null>(null)
  const [mapSource, setMapSource] = useState<HTMLElement | null>(null)
  const [belowMap, setBelowMap] = useState<HTMLElement | null>(null)
  const [aside, setAside] = useState<HTMLElement | null>(null)
  const frame = useMemo(
    () =>
      title && mapSlot && mapSource && belowMap && aside
        ? {
            slots: { title, map: mapSlot, mapSource, belowMap, aside },
            setMap
          }
        : null,
    [title, mapSlot, mapSource, belowMap, aside]
  )

  return (
    <div className="mx-auto max-w-[1600px] md:pb-20">
      <div
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
        data-history-map-scroll-container
        className="grid max-h-[calc(100dvh-9rem)] [scrollbar-width:none] items-start gap-y-10 overflow-y-auto pr-3 md:grid-cols-[minmax(0,1.75fr)_minmax(15rem,0.8fr)] md:gap-x-8 lg:gap-x-12 xl:gap-x-16 [&::-webkit-scrollbar]:hidden"
      >
        <div className="min-w-0">
          <h1
            ref={setTitle}
            id={titleId}
            className="mb-4 text-[clamp(1.875rem,3vw,3.25rem)] leading-[0.92] font-bold tracking-[-0.035em]"
          />

          <figure>
            <div
              className="relative isolate w-full overflow-hidden bg-[#1c1c1c]"
              style={{ aspectRatio: map?.aspectRatio }}
            >
              <AnimatePresence>
                {map?.mapBase && (
                  <motion.div
                    key={map.mapBase.id}
                    className="absolute inset-0"
                    {...SCENE_MAP_MOTION}
                  >
                    <MapImage mapBase={map.mapBase} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={setMapSlot} className="absolute inset-0" />
            </div>
            <figcaption
              ref={setMapSource}
              className="mt-2 text-right text-xs leading-snug font-light text-neutral-400 italic"
            />
          </figure>

          <div ref={setBelowMap} />
        </div>

        <aside
          ref={setAside}
          aria-label={t('historyMap.background')}
          className="text-base leading-[1.38] md:mt-[4.25rem] lg:text-lg"
        />
      </div>
      {frame && (
        <HistoryMapFrameContext.Provider value={frame}>
          {children}
        </HistoryMapFrameContext.Provider>
      )}
    </div>
  )
}

type HistoryMapLayoutProps = {
  title: ReactNode
  mapBase?: HistoryMapBase
  map: ReactNode
  mapAspectRatio: string
  mapSource: string
  belowMap?: ReactNode
  children: ReactNode
}

/** Renders a scene into the surrounding {@link HistoryMapFrame}. */
export default function HistoryMapLayout({
  title,
  mapBase,
  map,
  mapAspectRatio,
  mapSource,
  belowMap,
  children
}: HistoryMapLayoutProps) {
  const frame = useContext(HistoryMapFrameContext)
  if (!frame) throw new Error('HistoryMapLayout must be inside HistoryMapFrame')
  const { slots, setMap } = frame

  // Wait for the previous scene to exit before switching the base map.
  useLayoutEffect(() => {
    setMap({ mapBase, aspectRatio: mapAspectRatio })
  }, [setMap, mapBase, mapAspectRatio])

  return (
    <>
      {createPortal(title, slots.title)}
      {createPortal(map, slots.map)}
      {createPortal(mapSource, slots.mapSource)}
      {createPortal(belowMap, slots.belowMap)}
      {createPortal(children, slots.aside)}
    </>
  )
}
