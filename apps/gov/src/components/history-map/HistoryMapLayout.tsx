import { useId, type ReactNode, type WheelEvent } from 'react'

type HistoryMapLayoutProps = {
  title: ReactNode
  map: ReactNode
  mapAspectRatio: string
  mapSource: string
  belowMap?: ReactNode
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
  title,
  map,
  mapAspectRatio,
  mapSource,
  belowMap,
  children
}: HistoryMapLayoutProps) {
  const titleId = useId()

  return (
    <div className="mx-auto max-w-[1600px] md:pb-20">
      <div
        role="region"
        aria-labelledby={titleId}
        tabIndex={0}
        data-history-map-scroll-container
        onWheel={handOffScrollAtBoundary}
        className="grid max-h-[calc(100dvh-9rem)] [scrollbar-width:none] items-start gap-y-10 overflow-y-auto pr-3 md:grid-cols-[minmax(0,1.75fr)_minmax(15rem,0.8fr)] md:gap-x-8 lg:gap-x-12 xl:gap-x-16 [&::-webkit-scrollbar]:hidden"
      >
        <div className="min-w-0">
          <h1
            id={titleId}
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

          {belowMap}
        </div>

        <aside
          aria-label="Історична довідка"
          className="text-base leading-[1.38] md:mt-[4.25rem] lg:text-lg"
        >
          {children}
        </aside>
      </div>
    </div>
  )
}
