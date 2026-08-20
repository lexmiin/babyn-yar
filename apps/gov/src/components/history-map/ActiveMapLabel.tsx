import { AnimatePresence, motion } from 'framer-motion'
import type { HistoryMapFeature } from './layers'

const MAP_VIEW_BOX = '0 0 894.14 783.2'
const LABEL_X = 29
const LABEL_WIDTH = 204
const LABEL_LINE_GAP = 14
const LABEL_HEIGHT = 24
const LABEL_TEXT_LINE_HEIGHT = 14
const ACTIVE_LABEL_Y = 176

type LabelledMapFeature = Pick<HistoryMapFeature, 'label' | 'mapLabel'>

export default function ActiveMapLabel({
  feature
}: {
  feature: LabelledMapFeature | null
}) {
  const labelLines = feature ? (feature.mapLabel.lines ?? [feature.label]) : []
  const labelHeight =
    LABEL_HEIGHT + Math.max(labelLines.length - 1, 0) * LABEL_TEXT_LINE_HEIGHT
  const labelWidth = feature?.mapLabel.width ?? LABEL_WIDTH
  const labelLineStartX = LABEL_X + labelWidth + LABEL_LINE_GAP
  const labelY = ACTIVE_LABEL_Y - labelHeight / 2

  return (
    <>
      <AnimatePresence mode="wait">
        {feature && (
          <motion.div
            key={feature.label}
            aria-hidden="true"
            className="pointer-events-none absolute top-[22.5%] left-[3.25%] z-10 flex min-h-7 w-[min(70%,17rem)] items-center justify-center rounded-full border border-neutral-900 bg-white px-3 py-1 text-center text-xs leading-tight font-bold text-neutral-950 xl:hidden"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {feature.label}
          </motion.div>
        )}
      </AnimatePresence>
      <svg
        viewBox={MAP_VIEW_BOX}
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 hidden h-full w-full xl:block"
      >
        <AnimatePresence mode="wait">
          {feature && (
            <motion.g
              key={feature.label}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <line
                x1={labelLineStartX}
                y1={ACTIVE_LABEL_Y}
                x2={feature.mapLabel.anchor[0]}
                y2={feature.mapLabel.anchor[1]}
                stroke="white"
                strokeWidth="1.35"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={labelLineStartX}
                cy={ACTIVE_LABEL_Y}
                r="4.2"
                fill="white"
              />
              <circle
                cx={feature.mapLabel.anchor[0]}
                cy={feature.mapLabel.anchor[1]}
                r="4.2"
                fill="white"
              />
              <rect
                x={LABEL_X}
                y={labelY}
                width={labelWidth}
                height={labelHeight}
                rx={labelHeight / 2}
                fill="white"
                stroke="#181818"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={LABEL_X + labelWidth / 2}
                y={ACTIVE_LABEL_Y}
                fill="#111"
                fontFamily="Roboto, sans-serif"
                fontSize={labelLines.length > 1 ? 13.5 : 15}
                fontWeight="700"
                textAnchor="middle"
              >
                {labelLines.map((line, index) => (
                  <tspan
                    key={line}
                    x={LABEL_X + labelWidth / 2}
                    y={
                      ACTIVE_LABEL_Y +
                      (index - (labelLines.length - 1) / 2) *
                        LABEL_TEXT_LINE_HEIGHT
                    }
                    dominantBaseline="central"
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </>
  )
}
