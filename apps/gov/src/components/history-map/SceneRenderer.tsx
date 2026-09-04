import FeatureMapScene from './FeatureMapScene'
import OverlayMapScene from './OverlayMapScene'
import PoiMapScene from './PoiMapScene'
import VideoMapScene from './VideoMapScene'
import type { HistoryMapScene } from './sceneTypes'

export default function SceneRenderer({ scene }: { scene: HistoryMapScene }) {
  switch (scene.kind) {
    case 'features':
      return <FeatureMapScene layer={scene.layer} scene={scene.data} />
    case 'overlays':
      return <OverlayMapScene layer={scene.layer} scene={scene.data} />
    case 'video':
      return <VideoMapScene layer={scene.layer} scene={scene.data} />
    case 'pois':
      return <PoiMapScene layer={scene.layer} scene={scene.data} />
    default: {
      const unhandledScene: never = scene
      throw new Error(
        `Unhandled history map scene: ${JSON.stringify(unhandledScene)}`
      )
    }
  }
}
