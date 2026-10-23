import { motion } from 'motion/react'
import {
  SCENE_TITLE_MOTION,
  SCENE_MAP_MOTION,
  SCENE_TEXT_MOTION
} from './sceneMotion'
import HistoryMapLayout from './HistoryMapLayout'
import type { HistoryMapPeriod, HistoryMapVideoSceneData } from './mapTypes'

export default function VideoMapScene({
  period,
  scene
}: {
  period: HistoryMapPeriod
  scene: HistoryMapVideoSceneData
}) {
  const { aspectRatio, src, caption, overview } = scene

  return (
    <HistoryMapLayout
      title={
        <motion.span className="block" {...SCENE_TITLE_MOTION}>
          {period.title}
        </motion.span>
      }
      map={
        <motion.video
          data-history-map-video
          src={src}
          aria-label={caption}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          playsInline
          controls
          preload="metadata"
          {...SCENE_MAP_MOTION}
        />
      }
      mapAspectRatio={aspectRatio}
      mapSource={caption}
    >
      <motion.div className="space-y-5" {...SCENE_TEXT_MOTION}>
        {overview.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </motion.div>
    </HistoryMapLayout>
  )
}
