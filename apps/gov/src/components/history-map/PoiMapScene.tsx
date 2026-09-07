import MapImage from './MapImage'
import { Popover } from '@base-ui/react/popover'
import { motion, type Transition } from 'framer-motion'
import { X } from 'lucide-react'
import HistoryMapLayout from './HistoryMapLayout'
import {
  LAYER_FOUR_POI_VIEW_BOX,
  type HistoryMapPoiPosition
} from './generated/Layer4PoiPositions'
import type {
  HistoryMapLayer,
  HistoryMapPoi,
  HistoryMapPoiSceneData
} from './layers'

const OVERLAY_ENTER_EASE = [0.22, 1, 0.36, 1] as const
const OVERLAY_EXIT_EASE = [0.64, 0, 0.78, 0] as const
const BORDER_ENTER_DELAY_MS = 120
const BORDER_ENTER_DURATION_MS = 500
const BORDER_EXIT_DURATION_MS = 180
const POI_INITIAL_DELAY_MS = BORDER_ENTER_DELAY_MS + BORDER_ENTER_DURATION_MS
const POI_STAGGER_MS = 60
const POI_EXIT_DURATION_MS = 180
const POI_EXIT_STAGGER_MS = 18

function getPoiEnterTransition(index: number): Transition {
  return {
    duration: 0.32,
    delay: (POI_INITIAL_DELAY_MS + index * POI_STAGGER_MS) / 1000,
    ease: OVERLAY_ENTER_EASE
  }
}

function getPoiExitTransition(index: number, poiCount: number): Transition {
  return {
    duration: POI_EXIT_DURATION_MS / 1000,
    delay: ((poiCount - index - 1) * POI_EXIT_STAGGER_MS) / 1000,
    ease: OVERLAY_EXIT_EASE
  }
}

function getPoiExitSequenceDurationMs(poiCount: number) {
  return POI_EXIT_DURATION_MS + (poiCount - 1) * POI_EXIT_STAGGER_MS
}

function mapPosition([x, y]: HistoryMapPoiPosition['center']) {
  const { minX, minY, width, height } = LAYER_FOUR_POI_VIEW_BOX

  return {
    left: `${((x - minX) / width) * 100}%`,
    top: `${((y - minY) / height) * 100}%`
  }
}

function PoiPopover({
  poi,
  index,
  poiCount
}: {
  poi: HistoryMapPoi
  index: number
  poiCount: number
}) {
  return (
    <Popover.Root>
      <motion.div
        style={mapPosition(poi.center)}
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 focus-within:z-20"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{
          opacity: 0,
          scale: 0.7,
          transition: getPoiExitTransition(index, poiCount)
        }}
        transition={getPoiEnterTransition(index)}
      >
        <Popover.Trigger
          aria-label={`Інформація про об’єкт: ${poi.title}`}
          className="group grid size-7 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span
            aria-hidden="true"
            className="grid size-3.5 place-items-center rounded-full border border-white transition-transform duration-150 group-hover:scale-125 group-data-[popup-open]:scale-125"
          >
            <span className="size-2 rounded-full bg-white transition-colors duration-150 group-data-[popup-open]:bg-[#ec2125]" />
          </span>
        </Popover.Trigger>
      </motion.div>

      <Popover.Portal>
        <Popover.Backdrop className="fixed inset-0 z-40 bg-neutral-950/45 opacity-100 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none sm:hidden" />
        <Popover.Positioner
          side="top"
          sideOffset={8}
          collisionAvoidance={{
            side: 'flip',
            align: 'shift',
            fallbackAxisSide: 'end'
          }}
          className="z-50 outline-none max-sm:!fixed max-sm:!inset-4 max-sm:!flex max-sm:!h-auto max-sm:!w-auto max-sm:!transform-none max-sm:!items-center max-sm:!justify-center"
        >
          <Popover.Popup className="max-h-[calc(100dvh-2rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow-xl transition-[opacity,transform] duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-reduce:transition-none max-sm:w-full max-sm:max-w-md">
            <img
              src={poi.image.src}
              alt={poi.image.alt}
              width={1800}
              height={1200}
              loading="lazy"
              className="aspect-[3/2] w-full shrink-0 object-cover"
            />
            <div className="relative space-y-2 p-4 pr-12">
              <Popover.Title className="text-lg leading-tight font-bold sm:text-xl">
                {poi.title}
              </Popover.Title>
              <Popover.Description className="text-base leading-relaxed text-neutral-700">
                {poi.description}
              </Popover.Description>
              <Popover.Close
                aria-label="Закрити інформацію про об’єкт"
                className="absolute top-3 right-3 grid size-8 cursor-pointer place-items-center rounded-full text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
              >
                <X aria-hidden="true" className="size-5" />
              </Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default function PoiMapScene({
  layer,
  scene
}: {
  layer: HistoryMapLayer
  scene: HistoryMapPoiSceneData
}) {
  const { mapBase, mapSource, BorderComponent, pois, overview } = scene

  return (
    <HistoryMapLayout
      title={
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
        >
          {layer.title}
        </motion.span>
      }
      map={
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.36,
              delay:
                (getPoiExitSequenceDurationMs(pois.length) +
                  BORDER_EXIT_DURATION_MS) /
                1000,
              ease: OVERLAY_EXIT_EASE
            }
          }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <MapImage mapBase={mapBase} />
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: BORDER_EXIT_DURATION_MS / 1000,
                delay: getPoiExitSequenceDurationMs(pois.length) / 1000,
                ease: OVERLAY_EXIT_EASE
              }
            }}
            transition={{
              duration: BORDER_ENTER_DURATION_MS / 1000,
              delay: BORDER_ENTER_DELAY_MS / 1000,
              ease: OVERLAY_ENTER_EASE
            }}
          >
            <BorderComponent
              aria-hidden="true"
              focusable="false"
              className="absolute inset-0 h-full w-full object-contain select-none"
            />
          </motion.div>
          {pois.map((poi, index) => (
            <PoiPopover
              key={poi.id}
              poi={poi}
              index={index}
              poiCount={pois.length}
            />
          ))}
        </motion.div>
      }
      mapAspectRatio={mapBase.aspectRatio}
      mapSource={mapSource}
    >
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {overview.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </motion.div>
    </HistoryMapLayout>
  )
}
