import type { ImageMetadata } from 'astro'
import type { Language } from '@babyn-yar/i18n'
import type { AstroComponentFactory } from 'astro/runtime/server/index.js'
import type { PlaceId } from '@/data/places'
import { getLocalizedPlace } from './sharedPlaces'
import JewishCemeteryOffice from './content/JewishCemeteryOffice.astro'
import JewishCemeteryEntrance from './content/JewishCemeteryEntrance.astro'
import Menorah from './content/Menorah.astro'
import Lapidarium from './content/Lapidarium.astro'
import RomaWagon from './content/RomaWagon.astro'
import ChildrenMonument from './content/ChildrenMonument.astro'
import childrenMonumentImage from '@/assets/places-guide/06-children.webp'
import OlenaTelihaMonument from './content/OlenaTelihaMonument.astro'
import olenaTelihaMonumentImage from '@/assets/places-guide/07-olena-teliha.webp'
import OunMemorialCross from './content/OunMemorialCross.astro'
import SovietMonument from './content/SovietMonument.astro'
import TetianaMarkusMonument from './content/TetianaMarkusMonument.astro'
import KurenivkaMemorial from './content/KurenivkaMemorial.astro'
import AuthenticRavine from './content/AuthenticRavine.astro'
import authenticRavineImage from '@/assets/places-guide/12-authentic-ravine.webp'
import TankRepairWorkshop from './content/TankRepairWorkshop.astro'
import tankRepairWorkshopImage from '@/assets/places-guide/13-tank-workshop.webp'
import AntiTankDitch from './content/AntiTankDitch.astro'
import antiTankDitchImage from '@/assets/history-map/pois/21-anti-tank-ditch.webp'
import BelongingsArea from './content/BelongingsArea.astro'
import belongingsAreaImage from '@/assets/history-map/pois/22-belongings-area.webp'
import MissileShadow from './content/MissileShadow.astro'
import missileShadowImage from '@/assets/places-guide/16-missile-shadow.webp'
import ThinRedLine from './content/ThinRedLine.astro'
import thinRedLineImage from '@/assets/places-guide/17-thin-red-line.webp'

type GuideEntry = {
  id: `poi-${string}`
  semanticId: string
  title: string
  alt: string
  en: { title: string; alt: string }
  image: ImageMetadata
  Content: AstroComponentFactory
}

type SharedPlaceAssignment = {
  id: GuideEntry['id']
  placeKey: PlaceId
  image?: ImageMetadata
  Content: AstroComponentFactory
}

const sharedImages = import.meta.glob<ImageMetadata>(
  '../../assets/history-map/pois/*.webp',
  { eager: true, import: 'default' }
)

function getSharedImage(src: string) {
  const image = sharedImages[src.replace('/assets/', '../../assets/')]
  if (!image) throw new Error(`Missing places guide image: ${src}`)
  return image
}

const sharedPlaces: readonly SharedPlaceAssignment[] = [
  {
    id: 'poi-01',
    placeKey: '16',
    Content: JewishCemeteryOffice
  },
  {
    id: 'poi-02',
    placeKey: '15',
    Content: JewishCemeteryEntrance
  },
  { id: 'poi-03', placeKey: '06', Content: Menorah },
  { id: 'poi-04', placeKey: '09', Content: Lapidarium },
  { id: 'poi-05', placeKey: '13', Content: RomaWagon },
  {
    id: 'poi-06',
    placeKey: '05',
    image: childrenMonumentImage,
    Content: ChildrenMonument
  },
  {
    id: 'poi-07',
    placeKey: '14',
    image: olenaTelihaMonumentImage,
    Content: OlenaTelihaMonument
  },
  {
    id: 'poi-08',
    placeKey: '02',
    Content: OunMemorialCross
  },
  {
    id: 'poi-09',
    placeKey: '01',
    Content: SovietMonument
  },
  {
    id: 'poi-10',
    placeKey: '04',
    Content: TetianaMarkusMonument
  },
  {
    id: 'poi-11',
    placeKey: '11',
    Content: KurenivkaMemorial
  }
]

// Entry order defines the thumbnail strip, place list, and previous/next navigation.
const entries: readonly GuideEntry[] = [
  ...sharedPlaces.map(({ placeKey, image, ...entry }) => {
    const place = getLocalizedPlace(placeKey, 'uk')
    const english = getLocalizedPlace(placeKey, 'en')
    return {
      ...entry,
      semanticId: place.semanticId,
      title: place.title,
      alt: place.image.alt,
      en: { title: english.title, alt: english.image.alt },
      image: image ?? getSharedImage(place.image.src)
    }
  }),
  {
    id: 'poi-12',
    semanticId: 'memory-road-authentic-ravine',
    title: 'Автентичний Яр. Частина Бабиного Яру, що збереглася з 1941 року',
    alt: 'Збережені схили Бабиного Яру серед дерев',
    en: {
      title: 'Authentic Ravine. A Part of Babyn Yar Preserved Since 1941',
      alt: 'Preserved slopes of Babyn Yar among trees'
    },
    image: authenticRavineImage,
    Content: AuthenticRavine
  },
  {
    id: 'poi-13',
    semanticId: 'memory-road-tank-repair-workshop',
    title: 'Танко-ремонтний цех',
    alt: 'Будівля супермаркету «Сільпо» на місці танко-ремонтного цеху',
    en: {
      title: 'Tank Repair Workshop',
      alt: 'The Silpo supermarket building at the tank repair workshop site'
    },
    image: tankRepairWorkshopImage,
    Content: TankRepairWorkshop
  },
  {
    id: 'poi-14',
    semanticId: 'memory-road-anti-tank-ditch',
    title: 'Протитанковий рів',
    alt: 'Сучасний вигляд місця протитанкового рову',
    en: {
      title: 'Anti-Tank Ditch',
      alt: 'Present-day view of the anti-tank ditch site'
    },
    image: antiTankDitchImage,
    Content: AntiTankDitch
  },
  {
    id: 'poi-15',
    semanticId: 'memory-road-belongings-area',
    title:
      'Майданчик, де євреї залишали речі перед масовим вбивством 29-30 вересня 1941 року',
    alt: 'Сучасний вигляд майданчика, де євреїв змушували залишати речі',
    en: {
      title:
        'Site Where Jews Left Their Belongings Before the Mass Killing of 29–30 September 1941',
      alt: 'Present-day view of the site where Jews were forced to leave their belongings'
    },
    image: belongingsAreaImage,
    Content: BelongingsArea
  },
  {
    id: 'poi-16',
    semanticId: 'memory-road-missile-shadow',
    title: 'ТІНЬ РАКЕТИ',
    alt: 'Мистецький об’єкт «Тінь ракети» на тротуарі біля Київської телевежі',
    en: {
      title: 'MISSILE SHADOW',
      alt: 'The Missile Shadow artwork across the pavement near the Kyiv TV Tower'
    },
    image: missileShadowImage,
    Content: MissileShadow
  },
  {
    id: 'poi-17',
    semanticId: 'memory-road-thin-red-line',
    title: 'ТОНКА ЧЕРВОНА ЛІНІЯ',
    alt: 'Дерева, обв’язані червоною ниткою, у мистецькому об’єкті «Тонка червона лінія»',
    en: {
      title: 'THE THIN RED LINE',
      alt: 'Trees wrapped in red yarn as part of The Thin Red Line artwork'
    },
    image: thinRedLineImage,
    Content: ThinRedLine
  }
]

export function getPlacesGuideEntries(lang: Language) {
  return entries.map(entry => {
    const localized = lang === 'en' ? entry.en : entry
    return {
      id: entry.id,
      semanticId: entry.semanticId,
      title: localized.title,
      alt: localized.alt,
      image: entry.image,
      Content: entry.Content
    }
  })
}
