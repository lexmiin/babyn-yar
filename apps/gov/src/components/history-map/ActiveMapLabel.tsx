import { AnimatePresence, motion } from 'motion/react'
import { toMapPercent, type MapPoint } from './mapGeometry'
import type { HistoryMapFeature } from './mapTypes'

type LabelledMapFeature = Pick<HistoryMapFeature, 'label' | 'mapLabel'>

function labelPosition(anchor: MapPoint) {
  const { x, y } = toMapPercent(anchor)
  return {
    left: `clamp(min(35%, 8.5rem), ${x}%, calc(100% - min(35%, 8.5rem)))`,
    top: `max(4rem, ${y}%)`
  }
}

export default function ActiveMapLabel({
  feature
}: {
  feature: LabelledMapFeature | null
}) {
  return (
    <AnimatePresence>
      {feature && (
        <motion.div
          key={feature.label}
          aria-hidden="true"
          className="pointer-events-none absolute z-30 w-[min(70%,17rem)] -translate-x-1/2 -translate-y-full pb-3"
          style={labelPosition(feature.mapLabel.anchor)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="mx-auto w-fit rounded-xl border border-neutral-900 bg-white px-3 py-1 text-center text-xs leading-tight font-bold text-neutral-950 xl:text-sm">
            {feature.label}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
