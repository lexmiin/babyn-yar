import { useId } from 'react'

/** A static list of the scene's map objects, shown below the map. */
export default function MapObjectList({
  heading,
  labels
}: {
  heading: string
  labels: readonly string[]
}) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="mt-7">
      <h2 id={headingId} className="text-xl leading-tight font-bold">
        {heading}
      </h2>
      <ul className="mt-3 gap-x-8 text-base leading-snug sm:columns-2 lg:text-lg">
        {labels.map(label => (
          <li key={label} className="flex break-inside-avoid gap-2 pb-1">
            <span aria-hidden="true">—</span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
