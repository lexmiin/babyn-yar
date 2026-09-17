import type { LayerFourPoiId } from './layerFour'

type PublishedGuideAssignment = {
  id: `poi-${string}`
  contentKey: LayerFourPoiId
}

type PendingGuideAssignment = {
  id: `poi-${string}`
  semanticId: string
  assignedTitle: string
  description?: string
  image?: {
    src: string
    alt: string
  }
  en?: {
    title: string
    description?: string
    alt?: string
  }
}

export type PlacesGuideAssignment =
  PublishedGuideAssignment | PendingGuideAssignment

export const PLACES_GUIDE_ASSIGNMENTS: readonly PlacesGuideAssignment[] = [
  { id: 'poi-01', contentKey: '16' },
  { id: 'poi-02', contentKey: '15' },
  { id: 'poi-03', contentKey: '06' },
  { id: 'poi-04', contentKey: '09' },
  { id: 'poi-05', contentKey: '13' },
  { id: 'poi-06', contentKey: '05' },
  { id: 'poi-07', contentKey: '14' },
  { id: 'poi-08', contentKey: '02' },
  { id: 'poi-09', contentKey: '01' },
  { id: 'poi-10', contentKey: '04' },
  { id: 'poi-11', contentKey: '11' },
  {
    id: 'poi-12',
    semanticId: 'memory-road-authentic-ravine',
    assignedTitle:
      'Автентичний Яр. Частина Бабиного Яру, що збереглася з 1941 року',
    description:
      'Ця місцевість не зазнала глобальних змін з часів початку масових розстрілів 1941 року в Бабиному Яру.',
    en: {
      title: 'Authentic Ravine. A Part of Babyn Yar Preserved Since 1941',
      description:
        'This area has not undergone major changes since the beginning of the mass shootings at Babyn Yar in 1941.'
    }
  },
  {
    id: 'poi-13',
    semanticId: 'memory-road-tank-repair-workshop',
    assignedTitle: 'Танко-ремонтний цех',
    description:
      'В цьому приміщенні примусово ночували євреї у ніч з 29 на 30 вересня 1941 року. Зараз це приміщення супермаркету “Сільпо”.',
    en: {
      title: 'Tank Repair Workshop',
      description:
        'Jews were forced to spend the night in this building on the night of 29–30 September 1941. The building now houses a Silpo supermarket.'
    }
  },
  {
    id: 'poi-14',
    semanticId: 'memory-road-anti-tank-ditch',
    assignedTitle: 'Протитанковий рів',
    description:
      'Рів був викопаний недалеко від Бабиного Яру радянськими органами влади з метою оборони міста в 1941 році під час Другої світової війни. З жовтня того ж року він став місцем нацистських убивств та захоронень радянських військовополонених та цивільних громадян, зокрема, євреїв.',
    image: {
      src: '/assets/history-map/pois/21-anti-tank-ditch.webp',
      alt: 'Сучасний вигляд місця протитанкового рову'
    },
    en: {
      title: 'Anti-Tank Ditch',
      description:
        'The ditch was dug near Babyn Yar by the Soviet authorities to defend the city in 1941 during the Second World War. From October that year, it became a site of Nazi killings and burials of Soviet prisoners of war and civilians, including Jews.',
      alt: 'Present-day view of the anti-tank ditch site'
    }
  },
  {
    id: 'poi-15',
    semanticId: 'memory-road-belongings-area',
    assignedTitle:
      'Майданчик, де євреї залишали речі перед масовим вбивством 29-30 вересня 1941 року',
    description:
      'Поблизу Лукʼянівського військового кладовища євреїв змушували залишити особисті документи, цінні речі та частину одягу перед розстрілом 29 та 30 вересня 1941 року.',
    image: {
      src: '/assets/history-map/pois/22-belongings-area.webp',
      alt: 'Сучасний вигляд майданчика, де євреїв змушували залишати речі'
    },
    en: {
      title:
        'Site Where Jews Left Their Belongings Before the Mass Killing of 29–30 September 1941',
      description:
        'Near the Lukianivske Military Cemetery, Jews were forced to leave their personal documents, valuables, and some of their clothing before being shot on 29 and 30 September 1941.',
      alt: 'Present-day view of the site where Jews were forced to leave their belongings'
    }
  }
]
