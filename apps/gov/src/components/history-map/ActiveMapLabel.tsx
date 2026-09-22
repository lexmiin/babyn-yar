import { AnimatePresence, motion } from 'framer-motion'
import type { HistoryMapFeature } from './layers'

type LabelledMapFeature = Pick<HistoryMapFeature, 'label' | 'mapLabel'>

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
          style={{
            left: `clamp(min(35%, 8.5rem), ${(feature.mapLabel.anchor[0] / 894.14) * 100}%, calc(100% - min(35%, 8.5rem)))`,
            top: `max(4rem, ${(feature.mapLabel.anchor[1] / 783.2) * 100}%)`
          }}
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
