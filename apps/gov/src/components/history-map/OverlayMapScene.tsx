import { motion } from 'framer-motion'
import ActiveMapLabel from './ActiveMapLabel'
import HistoryMapLayout from './HistoryMapLayout'
import MapOverlays from './MapOverlays'
import type { HistoryMapOverlaySceneData } from './layers'
import type { HistoryMapSceneProps } from './sceneTypes'
import { useMapFeatureSelection } from './useMapFeatureSelection'

export default function OverlayMapScene({
  layer,
  scene
}: HistoryMapSceneProps & { scene: HistoryMapOverlaySceneData }) {
  const { mapBase, mapSource, overlays, overview } = scene
  const { activeFeatureId, labelFeature, getFeatureControlProps } =
    useMapFeatureSelection(overlays)

  return (
    <HistoryMapLayout
      title={
        <motion.span
          className="block"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.44,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {layer.title}
        </motion.span>
      }
      map={
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.36,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <img
            data-history-map-base
            src={mapBase.src}
            alt={mapBase.alt}
            className="absolute inset-0 h-full w-full object-contain select-none"
            draggable={false}
          />
          <MapOverlays
            overlays={overlays}
            activeOverlayId={activeFeatureId}
            getOverlayControlProps={getFeatureControlProps}
          />
          <ActiveMapLabel feature={labelFeature} />
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
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {overview.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </motion.div>
    </HistoryMapLayout>
  )
}
