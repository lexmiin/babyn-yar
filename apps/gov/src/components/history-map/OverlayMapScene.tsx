import MapImage from './MapImage'
import { motion } from 'framer-motion'
import {
  SCENE_TITLE_MOTION,
  SCENE_MAP_MOTION,
  SCENE_TEXT_MOTION
} from './sceneMotion'
import ActiveMapLabel from './ActiveMapLabel'
import HistoryMapLayout from './HistoryMapLayout'
import MapOverlays from './MapOverlays'
import { MAP_ASPECT_RATIO } from './mapGeometry'
import type { HistoryMapPeriod, HistoryMapOverlaySceneData } from './mapTypes'
import { useMapFeatureSelection } from './useMapFeatureSelection'

export default function OverlayMapScene({
  period,
  scene
}: {
  period: HistoryMapPeriod
  scene: HistoryMapOverlaySceneData
}) {
  const { mapBase, mapSource, overlays, overview } = scene
  const { activeFeatureId, labelFeature, getFeatureControlProps } =
    useMapFeatureSelection(overlays)

  return (
    <HistoryMapLayout
      title={
        <motion.span className="block" {...SCENE_TITLE_MOTION}>
          {period.title}
        </motion.span>
      }
      map={
        <motion.div className="absolute inset-0" {...SCENE_MAP_MOTION}>
          <MapImage mapBase={mapBase} />
          <MapOverlays
            overlays={overlays}
            activeOverlayId={activeFeatureId}
            getOverlayControlProps={getFeatureControlProps}
          />
          <ActiveMapLabel feature={labelFeature} />
          {labelFeature?.extraLabels?.map(label => (
            <ActiveMapLabel key={label.label} feature={label} />
          ))}
        </motion.div>
      }
      mapAspectRatio={MAP_ASPECT_RATIO}
      mapSource={mapSource}
    >
      <motion.div className="space-y-5" {...SCENE_TEXT_MOTION}>
        {overview.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </motion.div>
    </HistoryMapLayout>
  )
}
