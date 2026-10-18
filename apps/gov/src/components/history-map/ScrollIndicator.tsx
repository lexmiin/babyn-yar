import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function ScrollIndicator({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="scroll-indicator"
          data-history-map-scroll-indicator
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-center text-neutral-900 md:bottom-6"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          exit={{
            opacity: 0,
            y: 4,
            transition: { duration: 0.2, repeat: 0 }
          }}
          transition={{
            opacity: { duration: 0.24 },
            y: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          <span className="grid size-8 place-items-center rounded-full border border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-sm md:size-[42px]">
            <ArrowDown
              aria-hidden="true"
              className="block size-5 md:size-7"
              strokeWidth={1.7}
            />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
