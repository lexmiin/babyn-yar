import { motion } from 'framer-motion'
import HistoryMapLayout from './HistoryMapLayout'
import type { HistoryMapVideoSceneData } from './layers'
import type { HistoryMapSceneProps } from './sceneTypes'

export default function VideoMapScene({
  layer,
  scene
}: HistoryMapSceneProps & { scene: HistoryMapVideoSceneData }) {
  const { aspectRatio, src, caption, overview } = scene

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.36,
            ease: [0.22, 1, 0.36, 1]
          }}
        />
      }
      mapAspectRatio={aspectRatio}
      mapSource={caption}
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
