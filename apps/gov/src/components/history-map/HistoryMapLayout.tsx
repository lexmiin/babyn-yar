import { useLayoutEffect, useRef, type ReactNode, type WheelEvent } from 'react'

type HistoryMapLayoutProps = {
  layerKey: number
  title: ReactNode
  map: ReactNode
  mapAspectRatio: string
  mapSource: string
  territoryLabel: string
  territories: readonly string[]
  renderTerritory?: (territory: string, index: number) => ReactNode
  children: ReactNode
}

function handOffScrollAtBoundary(event: WheelEvent<HTMLDivElement>) {
  if (!window.matchMedia('(min-width: 768px)').matches) return

  const container = event.currentTarget
  const atTop = container.scrollTop <= 0
  const atBottom =
    container.scrollTop + container.clientHeight >= container.scrollHeight - 1

  if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
    event.preventDefault()
    window.scrollBy({ top: event.deltaY })
  }
}

export default function HistoryMapLayout({
  layerKey,
  title,
  map,
  mapAspectRatio,
  mapSource,
  territoryLabel,
  territories,
  renderTerritory,
  children
}: HistoryMapLayoutProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }, [layerKey])

  return (
    <section
      aria-labelledby="history-map-title"
      className="mx-auto max-w-[1600px] md:pb-20"
    >
      <div
        ref={scrollContainerRef}
        tabIndex={0}
        data-history-map-scroll-container
        onWheel={handOffScrollAtBoundary}
        className="grid max-h-[calc(100dvh-9rem)] [scrollbar-width:none] items-start gap-y-10 overflow-y-auto pr-3 md:grid-cols-[minmax(0,1.75fr)_minmax(15rem,0.8fr)] md:gap-x-8 lg:gap-x-12 xl:gap-x-16 [&::-webkit-scrollbar]:hidden"
      >
        <div className="min-w-0">
          <h1
            id="history-map-title"
            className="mb-4 text-[clamp(1.875rem,3vw,3.25rem)] leading-[0.92] font-bold tracking-[-0.035em]"
          >
            {title}
          </h1>

          <figure>
            <div
              className="relative isolate w-full overflow-hidden bg-[#1c1c1c]"
              style={{ aspectRatio: mapAspectRatio }}
            >
              {map}
            </div>
            <figcaption className="mt-2 text-right text-xs leading-snug font-light text-neutral-400 italic">
              {mapSource}
            </figcaption>
          </figure>

          <section aria-labelledby="history-map-territories" className="mt-7">
            <h2
              id="history-map-territories"
              className="text-xl leading-tight font-bold"
            >
              {territoryLabel}
            </h2>
            <ul className="mt-3 grid gap-x-8 gap-y-1 text-base leading-snug sm:grid-cols-2 lg:text-lg">
              {territories.map((territory, index) =>
                renderTerritory ? (
                  renderTerritory(territory, index)
                ) : (
                  <li key={territory} className="flex gap-2">
                    <span aria-hidden="true">—</span>
                    <span>{territory}</span>
                  </li>
                )
              )}
            </ul>
          </section>
        </div>

        <aside className="text-base leading-[1.38] md:mt-[4.25rem] lg:text-lg">
          {children}
        </aside>
      </div>
    </section>
  )
}
