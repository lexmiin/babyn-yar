import type { ReactNode } from 'react'

type HistoryMapLayoutProps = {
  title: string
  map: ReactNode
  mapAspectRatio: string
  mapSource: string
  territoryLabel: string
  territories: readonly string[]
  children: ReactNode
}

export default function HistoryMapLayout({
  title,
  map,
  mapAspectRatio,
  mapSource,
  territoryLabel,
  territories,
  children
}: HistoryMapLayoutProps) {
  return (
    <section
      aria-labelledby="history-map-title"
      className="mx-auto max-w-[1600px] pb-12 md:pb-20"
    >
      <div className="grid items-start gap-y-10 md:grid-cols-[minmax(0,1.75fr)_minmax(15rem,0.8fr)] md:gap-x-8 lg:gap-x-12 xl:gap-x-16">
        <div className="min-w-0">
          <h1
            id="history-map-title"
            className="mb-4 text-[clamp(2.25rem,4vw,4.5rem)] leading-[0.92] font-bold tracking-[-0.035em]"
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
              {territories.map(territory => (
                <li key={territory} className="flex gap-2">
                  <span aria-hidden="true">—</span>
                  <span>{territory}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="text-base leading-[1.38] md:sticky md:top-28 md:mt-[4.25rem] lg:text-lg">
          {children}
        </aside>
      </div>
    </section>
  )
}
