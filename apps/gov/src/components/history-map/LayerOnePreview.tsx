import { useState } from 'react'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import {
  Layer1Bratske,
  Layer1Envang,
  Layer1Jew,
  Layer1Karamske,
  Layer1Kirill,
  Layer1Luk,
  Layer1Magomet,
  Layer1Maria,
  Layer1Voisko
} from './generated/Layer1Svgs'

type Territory = {
  id: string
  label: string
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

type TerritoryStyle = CSSProperties & {
  '--territory-fill': string
  '--territory-fill-duration': string
  '--territory-fill-opacity': number
}

const TERRITORIES: Territory[] = [
  { id: 'kirill', label: 'Кирилівське', Component: Layer1Kirill },
  { id: 'jew', label: 'Єврейське', Component: Layer1Jew },
  { id: 'voisko', label: 'Військове', Component: Layer1Voisko },
  { id: 'karamske', label: 'Караїмське', Component: Layer1Karamske },
  { id: 'magomet', label: 'Магометанське', Component: Layer1Magomet },
  { id: 'maria', label: 'Маріавітське', Component: Layer1Maria },
  { id: 'bratske', label: 'Братське', Component: Layer1Bratske },
  {
    id: 'envang',
    label: 'Євангельських християн',
    Component: Layer1Envang
  },
  { id: 'luk', label: 'Лук’янівське', Component: Layer1Luk }
]

export default function LayerOnePreview() {
  const [lockedTerritory, setLockedTerritory] = useState<string | null>(null)
  const [previewTerritory, setPreviewTerritory] = useState<string | null>(null)
  const [showAllActive, setShowAllActive] = useState(false)
  const activeTerritory = previewTerritory ?? lockedTerritory

  return (
    <section className="mx-auto max-w-[1600px] pb-8">
      <header className="mb-8 max-w-3xl">
        <p className="mb-3 font-mono text-xs tracking-[0.18em] text-neutral-500 uppercase">
          Layer 01 · alignment preview
        </p>
        <h1 className="text-4xl leading-none font-bold tracking-[-0.035em] md:text-6xl">
          Бабин Яр до 1941 року
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
          Базова карта та дев’ять територій у спільній системі координат.
          Наведіть курсор, сфокусуйте або натисніть назву, щоб перевірити
          окремий контур.
        </p>
      </header>

      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_18rem] xl:gap-10">
        <figure className="min-w-0">
          <div className="relative isolate aspect-[894.14/783.2] w-full overflow-hidden bg-[#d3d2ce] ring-1 ring-black/15">
            <img
              src="/assets/base_map.png"
              alt="Історична карта території Бабиного Яру"
              className="absolute inset-0 h-full w-full object-contain select-none"
              draggable={false}
            />

            {TERRITORIES.map(({ id, label, Component }) => {
              const isActive = showAllActive || activeTerritory === id
              const style: TerritoryStyle = {
                '--territory-fill': isActive ? '#941f37' : '#fff',
                '--territory-fill-duration': '180ms',
                '--territory-fill-opacity': isActive ? 0.48 : 0.3
              }

              return (
                <Component
                  key={id}
                  aria-label={label}
                  aria-hidden="true"
                  focusable="false"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={style}
                />
              )
            })}
          </div>
          <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 font-mono text-[11px] leading-relaxed text-neutral-500 uppercase">
            <span>Source: BY_DigitalMaps.png</span>
            <span>ViewBox: 0 0 894.14 783.2</span>
          </figcaption>
        </figure>

        <aside className="border-t border-black pt-4 lg:sticky lg:top-28">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-bold">Території кладовищ</h2>
            <span className="font-mono text-xs text-neutral-500">09</span>
          </div>

          <button
            type="button"
            aria-pressed={showAllActive}
            onClick={() => {
              setShowAllActive(current => !current)
              setLockedTerritory(null)
            }}
            className="mb-4 w-full border border-black px-4 py-3 text-left text-sm font-bold transition-colors hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            {showAllActive ? 'Показати нейтральні' : 'Підсвітити всі'}
          </button>

          <ol className="divide-y divide-black/15 border-y border-black/15">
            {TERRITORIES.map(({ id, label }, index) => {
              const isActive = !showAllActive && activeTerritory === id

              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={lockedTerritory === id}
                    onClick={() => {
                      setShowAllActive(false)
                      setLockedTerritory(current =>
                        current === id ? null : id
                      )
                    }}
                    onMouseEnter={() => setPreviewTerritory(id)}
                    onMouseLeave={() => setPreviewTerritory(null)}
                    onFocus={() => setPreviewTerritory(id)}
                    onBlur={() => setPreviewTerritory(null)}
                    className={`group flex w-full items-center gap-3 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isActive ? 'text-[#941f37]' : 'text-black hover:text-[#941f37]'}`}
                  >
                    <span className="w-5 shrink-0 font-mono text-[10px] text-neutral-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="grow font-medium">{label}</span>
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full border border-current transition-colors ${isActive ? 'bg-[#941f37]' : 'bg-transparent group-hover:bg-[#941f37]'}`}
                    />
                  </button>
                </li>
              )
            })}
          </ol>

          <p className="mt-4 text-xs leading-relaxed text-neutral-500">
            Натискання фіксує вибір. Повторне натискання повертає загальний
            вигляд.
          </p>
        </aside>
      </div>
    </section>
  )
}
