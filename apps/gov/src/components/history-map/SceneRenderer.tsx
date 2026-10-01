import FeatureMapScene from './FeatureMapScene'
import OverlayMapScene from './OverlayMapScene'
import PoiMapScene from './PoiMapScene'
import VideoMapScene from './VideoMapScene'
import type { MapImageSource } from './MapImage'
import type { HistoryMapScene } from './sceneTypes'

export default function SceneRenderer({
  scene,
  poiImages
}: {
  scene: HistoryMapScene
  poiImages: Record<string, MapImageSource>
}) {
  switch (scene.kind) {
    case 'features':
      return <FeatureMapScene period={scene.period} scene={scene.data} />
    case 'overlays':
      return <OverlayMapScene period={scene.period} scene={scene.data} />
    case 'video':
      return <VideoMapScene period={scene.period} scene={scene.data} />
    case 'pois':
      return (
        <PoiMapScene
          period={scene.period}
          scene={scene.data}
          images={poiImages}
        />
      )
    default: {
      const unhandledScene: never = scene
      throw new Error(
        `Unhandled history map scene: ${JSON.stringify(unhandledScene)}`
      )
    }
  }
}
