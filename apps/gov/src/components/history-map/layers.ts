import type { ComponentType, SVGProps } from 'react'
import {
  Layer2Way1,
  Layer2Way2,
  type HistoryMapRouteProps
} from './generated/Layer2Routes'
import {
  Layer1Bratske,
  Layer1Envang,
  Layer1Jew,
  Layer1Karamske,
  Layer1Kirill,
  Layer1Luk,
  Layer1Magomet,
  Layer1Maria,
  Layer1Voisko
} from './generated/Layer1Svgs'
import {
  Layer2Blockpost,
  Layer2Border,
  Layer2Tank1,
  Layer2Tank2
} from './generated/Layer2StaticSvgs'
import {
  Layer2Zone1,
  Layer2Zone2,
  Layer2Zone3,
  Layer2Zone4
} from './generated/Layer2Zones'

export type HistoryMapFeature = {
  id: string
  label: string
  description: readonly string[]
  mapLabel: {
    anchor: readonly [x: number, y: number]
    lines?: readonly [string, string]
  }
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

export type HistoryMapRoute = Omit<HistoryMapFeature, 'Component'> & {
  Component: ComponentType<HistoryMapRouteProps>
}

export type HistoryMapOverlay = {
  id: string
  delay: number
  duration?: number
  Component: ComponentType<SVGProps<SVGSVGElement>>
}

export type HistoryMapLayerData = {
  title: string
  mapSource: string
  featureLabel: string
  features: readonly HistoryMapFeature[]
  featureInitialDelayMs?: number
  routes?: readonly HistoryMapRoute[]
  backgroundOverlays?: readonly HistoryMapOverlay[]
  symbols?: readonly HistoryMapOverlay[]
  overview: readonly string[]
}

const LAYER_ONE_FEATURES: readonly HistoryMapFeature[] = [
  {
    id: 'jewish-cemetery',
    label: 'Єврейське кладовище',
    description: [
      'Тимчасовий текст про єврейське кладовище. Тут буде коротка історія об’єкта, його розташування та значення для території Бабиного Яру.',
      'Після отримання фінальних матеріалів цей абзац буде замінено на перевірений історичний опис.'
    ],
    mapLabel: { anchor: [667, 414] },
    Component: Layer1Jew
  },
  {
    id: 'karaite-cemetery',
    label: 'Караїмське кладовище',
    description: [
      'Тимчасовий текст про караїмське кладовище. У цьому блоці з’явиться інформація про час заснування, межі території та збережені історичні свідчення.',
      'Фінальний текст уточнить зв’язок цього місця з історією Бабиного Яру до 1941 року.'
    ],
    mapLabel: { anchor: [410, 431] },
    Component: Layer1Karamske
  },
  {
    id: 'muslim-cemetery',
    label: 'Магометанське кладовище',
    description: [
      'Тимчасовий опис магометанського кладовища. Тут буде розміщено перевірені дані про громаду, поховання та зміни меж об’єкта.',
      'Цей текст є тимчасовим і потребує заміни після отримання матеріалів від дослідницької команди.'
    ],
    mapLabel: { anchor: [333, 413] },
    Component: Layer1Magomet
  },
  {
    id: 'kyrylivske-cemetery',
    label: 'Кирилівське кладовище',
    description: [
      'Тимчасовий текст про Кирилівське кладовище. У фінальній версії тут буде описано його походження та зв’язок із Кирилівською лікарнею й гаєм.',
      'Другий абзац розкриє долю території та пояснить, як читати її межі на історичній карті.'
    ],
    mapLabel: { anchor: [700, 197] },
    Component: Layer1Kirill
  },
  {
    id: 'military-cemetery',
    label: 'Військове кладовище',
    description: [
      'Тимчасовий текст про Військове кладовище. У цьому місці буде додано інформацію про період використання території та відомі поховання.',
      'Поки текст не затверджено, цей абзац показує майбутній обсяг і ритм опису.'
    ],
    mapLabel: { anchor: [507, 625] },
    Component: Layer1Voisko
  },
  {
    id: 'bratske-cemetery',
    label: 'Братське кладовище',
    description: [
      'Тимчасовий опис Братського кладовища. Тут з’являться дати, контекст виникнення та відомості про людей, похованих на цій ділянці.',
      'Фінальний опис також пояснить, як об’єкт співвідноситься з сусідніми кладовищами на карті.'
    ],
    mapLabel: { anchor: [340, 607] },
    Component: Layer1Bratske
  },
  {
    id: 'mariavite-cemetery',
    label: 'Маріавітське кладовище',
    description: [
      'Тимчасовий текст про Маріавітське кладовище. Цей блок опише громаду, для якої було створено кладовище, і зміни цієї території з часом.',
      'Наразі це демонстраційний текст, створений для перевірки перемикання й компонування панелі.'
    ],
    mapLabel: { anchor: [440, 580] },
    Component: Layer1Maria
  },
  {
    id: 'evangelical-cemetery',
    label: 'Кладовище євангельських християн',
    description: [
      'Тимчасовий опис кладовища євангельських християн. Фінальний текст розповість про походження ділянки та її місце серед інших некрополів.',
      'Другий абзац буде присвячений збереженим джерелам і подальшій долі цього місця.'
    ],
    mapLabel: {
      anchor: [270, 555],
      lines: ['Кладовище євангельських', 'християн']
    },
    Component: Layer1Envang
  },
  {
    id: 'lukianivske-cemetery',
    label: 'Лук’янівське кладовище',
    description: [
      'Тимчасовий текст про Лук’янівське кладовище. Тут буде описано його розвиток, масштаб та зв’язок з міським середовищем Києва.',
      'Після погодження контенту тимчасовий опис замінять на точний історичний текст із посиланнями на джерела.'
    ],
    mapLabel: { anchor: [319, 761] },
    Component: Layer1Luk
  }
]

// The client has not yet supplied the semantic zone/file mapping or approved
// detail copy. Keep these stable technical IDs and provisional labels isolated
// here so the content can be replaced without touching rendering behavior.
const LAYER_TWO_FEATURES: readonly HistoryMapFeature[] = [
  {
    id: 'layer2-zone-1',
    label: 'Зона 1 (назву буде уточнено)',
    description: [
      'Тимчасовий опис зони 1. Назву, історичний текст і фотоматеріали буде додано після погодження відповідності між об’єктами та файлами шару.'
    ],
    mapLabel: { anchor: [185, 454] },
    Component: Layer2Zone1
  },
  {
    id: 'layer2-zone-2',
    label: 'Зона 2 (назву буде уточнено)',
    description: [
      'Тимчасовий опис зони 2. Семантична відповідність і фінальні матеріали ще потребують підтвердження дослідницької команди.'
    ],
    mapLabel: { anchor: [42, 424] },
    Component: Layer2Zone2
  },
  {
    id: 'layer2-zone-3',
    label: 'Зона 3 (назву буде уточнено)',
    description: [
      'Тимчасовий опис зони 3. Цей текст позначає місце для затвердженого історичного опису та пов’язаного з ним зображення.'
    ],
    mapLabel: { anchor: [565, 595] },
    Component: Layer2Zone3
  },
  {
    id: 'layer2-zone-4',
    label: 'Зона 4 (назву буде уточнено)',
    description: [
      'Тимчасовий опис зони 4. Назву й матеріали буде замінено після отримання авторитетного зіставлення з історичними об’єктами.'
    ],
    mapLabel: { anchor: [630, 82] },
    Component: Layer2Zone4
  }
]

const LAYER_TWO_ROUTES: readonly HistoryMapRoute[] = [
  {
    id: 'layer2-way-1',
    label: 'Маршрут 1 (назву буде уточнено)',
    description: [
      'Тимчасовий опис маршруту 1. Остаточну назву, історичний контекст і пов’язані матеріали буде додано після погодження контенту.'
    ],
    mapLabel: { anchor: [298, 492] },
    Component: Layer2Way1
  },
  {
    id: 'layer2-way-2',
    label: 'Маршрут 2 (назву буде уточнено)',
    description: [
      'Тимчасовий опис маршруту 2. Файл інтегровано з власним напрямком руху, однак видима назва ще не затверджена.'
    ],
    mapLabel: { anchor: [427, 626] },
    Component: Layer2Way2
  }
]

const LAYER_TWO_BACKGROUND: readonly HistoryMapOverlay[] = [
  { id: 'layer2-border', delay: 0.8, duration: 0.44, Component: Layer2Border }
]

const LAYER_TWO_SYMBOLS: readonly HistoryMapOverlay[] = [
  { id: 'layer2-blockpost', delay: 4, Component: Layer2Blockpost },
  { id: 'layer2-tank-1', delay: 4.15, Component: Layer2Tank1 },
  { id: 'layer2-tank-2', delay: 4.3, Component: Layer2Tank2 }
]

export const HISTORY_MAP_BASE = {
  src: '/assets/base_map.png',
  alt: 'Історична топографічна карта території Бабиного Яру',
  aspectRatio: '894.14 / 783.2'
} as const

export const HISTORY_MAP_LAYERS: readonly HistoryMapLayerData[] = [
  {
    title: 'Бабин Яр до 1941 року',
    mapSource:
      'Топографічний план м. Києва станом на 1924 рік, 1:2100 (зменшений)',
    featureLabel: 'Території кладовищ:',
    features: LAYER_ONE_FEATURES,
    overview: [
      'Історія походження назви «Бабин Яр» точно не відома. Існує, зокрема, міська легенда, не підтверджена іншими джерелами, про жінку-шинкарку з Сирця з дуже «важким» характером, яка заповіла своє майно Домініканському монастирю.',
      'Історію Бабиного Яру та прилеглих до нього територій найчастіше починають з 1139 року, коли князі Ольговичі заснували Кирилівський монастир. У 1240 році місцевість Сирець згадана у грамоті князя Данила Галицького, який передав ці землі Києво-Печерській лаврі.',
      'З 1661 року Сирець та навколишня територія були включені до передмістя Києва. У період Гетьманщини патроном Кирилівського монастиря став Іван Мазепа. Він активно жертвував гроші для реновації та реставрації монастиря.',
      'Під час втілення політики секуляризації Катериною Другою Кирилівський монастир було перетворено на Києво-Кирилівську лікарню. Біля цієї лікарні було відведено місця для поховання померлих пацієнтів, а з 1871 року на території Кирилівського гаю — територію для повноцінного кладовища.'
    ]
  },
  {
    title: 'Бабин Яр у 1941–1943 роках',
    mapSource: 'Джерело картографічної основи другого шару уточнюється',
    featureLabel: 'Об’єкти другого шару:',
    features: LAYER_TWO_FEATURES,
    featureInitialDelayMs: 520,
    routes: LAYER_TWO_ROUTES,
    backgroundOverlays: LAYER_TWO_BACKGROUND,
    symbols: LAYER_TWO_SYMBOLS,
    overview: [
      'У цьому шарі показано об’єкти й маршрути періоду німецької окупації Києва у 1941–1943 роках. Детальні історичні тексти, підписи та фотоматеріали очікують остаточного погодження.',
      'Назви зон і маршрутів у переліку тимчасові. Вони навмисно не пов’язують технічні назви файлів із конкретними історичними подіями без підтвердження дослідницької команди.'
    ]
  },
  {
    title: 'Бабин Яр у 1943–1961 роках',
    mapSource: 'Тимчасово використано топографічний план першого шару',
    featureLabel: 'Об’єкти третього шару:',
    features: LAYER_ONE_FEATURES,
    overview: [
      'Це тимчасовий третій шар для перевірки переходу через кілька історичних періодів. Він повторно використовує карту та SVG першого шару.',
      'Фінальні зображення, об’єкти й історичний текст буде додано після отримання матеріалів для цього періоду.'
    ]
  }
]
