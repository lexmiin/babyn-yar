import type { PlaceId } from './places'

type GuideSection = {
  title: string
  paragraphs: readonly string[]
  link?: string
}

type PublishedGuideAssignment = {
  id: `poi-${string}`
  contentKey: PlaceId
  guideImage?: string
}

type PendingGuideAssignment = {
  id: `poi-${string}`
  semanticId: string
  assignedTitle: string
  description?: string
  sections?: readonly GuideSection[]
  image?: {
    src: string
    alt: string
  }
  en?: {
    title: string
    description?: string
    sections?: readonly GuideSection[]
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
  {
    id: 'poi-06',
    contentKey: '05',
    guideImage: '/assets/places-guide/06-children.webp'
  },
  {
    id: 'poi-07',
    contentKey: '14',
    guideImage: '/assets/places-guide/07-olena-teliha.webp'
  },
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
    image: {
      src: '/assets/places-guide/12-authentic-ravine.webp',
      alt: 'Збережені схили Бабиного Яру серед дерев'
    },
    en: {
      title: 'Authentic Ravine. A Part of Babyn Yar Preserved Since 1941',
      description:
        'This area has not undergone major changes since the beginning of the mass shootings at Babyn Yar in 1941.',
      alt: 'Preserved slopes of Babyn Yar among trees'
    }
  },
  {
    id: 'poi-13',
    semanticId: 'memory-road-tank-repair-workshop',
    assignedTitle: 'Танко-ремонтний цех',
    description:
      'В цьому приміщенні примусово ночували євреї у ніч з 29 на 30 вересня 1941 року. Зараз це приміщення супермаркету “Сільпо”.',
    image: {
      src: '/assets/places-guide/13-tank-workshop.webp',
      alt: 'Будівля супермаркету «Сільпо» на місці танко-ремонтного цеху'
    },
    en: {
      title: 'Tank Repair Workshop',
      description:
        'Jews were forced to spend the night in this building on the night of 29–30 September 1941. The building now houses a Silpo supermarket.',
      alt: 'The Silpo supermarket building at the tank repair workshop site'
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
  },
  {
    id: 'poi-16',
    semanticId: 'memory-road-missile-shadow',
    assignedTitle: 'ТІНЬ РАКЕТИ',
    description: 'Пауліна Пукіте (Литва), 2026',
    sections: [
      {
        title: 'Контекст',
        paragraphs: [
          '1 березня 2022 року, близько 17:10, російські війська випустили дві ракети по Київській телевежі. Одна влучила в апаратну мовника — ніхто зі співробітників не постраждав. Друга вбила людей, які були в той момент на вулиці.',
          'Загинуло пʼятеро людей, ще пʼятеро дістали поранення. Серед загиблих — телеоператор, який працював неподалік вежі, жінка і родина: двоє дорослих та 11-річна дитина.',
          'Удар стався на території Бабиного Яру — за кількасот метрів від місця, де в 1941–1943 роках нацисти вбили десятки тисяч людей, переважно київських євреїв.'
        ]
      },
      {
        title: 'Про роботу',
        paragraphs: [
          'Довга чорна тінь ніби падає від телевежі й перетинає тротуар. Вона не огороджена й не піднята над землею: щоб пройти далі, потрібно переступити через неї. Робота не вимагає зупинки, проте й не дає пройти повз без уваги.',
          'Тінь вписана у щоденний міський маршрут, яким люди йдуть до метро й повертаються додому. Саме в цьому співіснуванні з буденністю й полягає задум художниці: слід війни не винесений на пʼєдестал, а залишений там, де все сталося.'
        ]
      },
      {
        title: 'Коментар художниці',
        paragraphs: [
          'Усі ми пам’ятаємо, як на самому початку повномасштабного вторгнення, 1 березня 2022 року, російська ракета, випущена по Київській телевежі, влучила в територію меморіалу «Бабин Яр», убивши п’ятьох людей, серед яких 11-річна дитина. Уже тоді стало зрозуміло, що для агресора немає нічого святого.',
          'Для мене як литовської художниці велика честь отримати запрошення від української державної установи — Національного історико-меморіального заповідника «Бабин Яр» — створити мистецький обʼєкт у публічному просторі, щоб вшанувати памʼять жертв сучасної війни на місці масових розстрілів.',
          'У роботі застосовано сучасний підхід до створення монументів: вона пропонує горизонтальну форму замість вертикальної. Це інтервенція в повсякденне вуличне середовище — пронизливий маркер трагічних подій. «Тінь ракети» простягається через тротуар — з того боку, звідки прилетіла ракета, — і врізається в землю, де загинули люди. Вона відкриває незагоєну рану в землі, яка свідчить про десятки тисяч втрачених життів. Де б ви не торкнулися цієї землі, там, під нею, лежать понівечені дорогоцінні людські життя.',
          "Протиставляючи жорстокості красу, робота вшановує памʼять пʼяти невинних людей, чиї життя забрав російський ракетний удар 2022 року — тут, на території трагедії Бабиного Яру. Вона повʼязує це безглузде вбивство з масовим убивством київських євреїв, яке відбувалося на цьому місці у 1941–1943 роках. Чорна «тінь ракети» врізається в землю, наче відкриваючи рану, щоб нагадати нам, що життя кожної людини є безцінним — незалежно від того, як давно воно було жорстоко обірване. Дорогоцінною і священною є земля цього місця пам'яті.",
          'Пауліна Пукіте'
        ]
      },
      {
        title: 'Про художницю',
        paragraphs: [
          'Пауліна Пукіте (нар. 1966, Вільнюс) — художниця, письменниця, кураторка й критикиня. Навчалася у Вільнюській академії мистецтв і Королівському коледжі мистецтв у Лондоні, викладає у Вільнюській академії мистецтв. Живе й працює у Вільнюсі та Лондоні.',
          'Її практика охоплює інтервенції в публічному просторі, сайт-специфічні інсталяції, рухомі зображення й роботу зі знайденими обʼєктами та текстами. Художні стратегії Пукіте свідомо стримані, майже непомітні: вона радше зміщує звичний погляд, ніж будує монумент.',
          'Тема памʼяті проходить крізь усі її роботи. У 2017 році Пукіте курувала 11-ту Каунаську бієнале «There and Not There» («Там і не там»), присвячену питанню (не)можливості памʼятника: бієнале ставила під сумнів популістську практику зносити й ставити монументи слідом за зміною політичних режимів і шукала нові, сучасні стратегії вшанування памʼяті.',
          'Тінь — повторюваний мотив у роботах художниці. У 2022 році для виставки «Difficult Pasts. Connected Worlds» у Національній галереї мистецтв у Вільнюсі (колишньому Музеї революції) вона створила серію скульптурних інтервенцій «Тіні»: тіні без видимого джерела, розміщені в непомітних місцях будівлі. Виставка була присвячена замовчуваним травмам Східної Європи.',
          '«Тінь ракети» продовжує цю лінію, але вперше тінь має точне джерело, дату й місце.'
        ],
        link: 'http://www.pukyte.com/'
      },
      {
        title: 'Про проєкт',
        paragraphs: [
          '«Тінь ракети» реалізовано до 85-х роковин трагедії Бабиного Яру.'
        ]
      }
    ],
    image: {
      src: '/assets/places-guide/16-missile-shadow.webp',
      alt: 'Мистецький об’єкт «Тінь ракети» на тротуарі біля Київської телевежі'
    },
    en: {
      title: 'MISSILE SHADOW',
      description: 'Paulina Pukytė (Lithuania), 2026',
      sections: [
        {
          title: 'Context',
          paragraphs: [
            'On 1 March 2022, at around 17:10, russian forces fired two missiles at the Kyiv TV Tower. One struck the broadcasting equipment building; none of the staff were harmed. The other killed people who were outside at that moment.',
            'Five people were killed and five others were injured. Among those killed were a television cameraman who had been working near the tower, a woman, and a family — two adults and an 11-year-old child.',
            'The strike took place on the territory of Babyn Yar, a few hundred metres from the site where, in 1941–1943, the Nazis murdered tens of thousands of people, most of them Kyiv Jews.'
          ]
        },
        {
          title: 'About the work',
          paragraphs: [
            'A long black shadow seems to fall from the TV Tower and crosses the pavement. It is neither fenced off nor raised above the ground: to walk ahead, you have to step over it. The work does not ask you to stop, yet it is impossible to pass without noticing.',
            'The artwork is integrated into an ordinary city route, one that people take to and from the metro every day. That everydayness is the point: the trace of war is not raised onto a pedestal, but remains where the strike took place.'
          ]
        },
        {
          title: 'In the Artist’s Words',
          paragraphs: [
            'We all remember when, right at the start of the full-scale invasion, on 1 March 2022, a missile fired by russia at the Kyiv TV tower struck the Babyn Yar memorial site, killing five people, including an 11-year-old child. Even then it became clear that nothing is sacred to this aggressor.',
            'As a Lithuanian artist, it is a great honour for me to have been invited by a Ukrainian governmental organisation Babyn Yar National Historical Memorial Reserve, to create a public space artwork to commemorate these victims of the new war at the site of the mass killings.',
            'The artwork employs a contemporary approach to monument building and creates a horizontal shape instead of a vertical one. It is an intervention into everyday street surroundings as a poignant marker of tragic events. The Missile Shadow stretches across the pavement, from where the rocket came in, and cuts into the ground where people were killed. It opens an unhealing wound in the earth that bears witness to tens of thousands of lost lives. Wherever you touch this ground, there, beneath it, lie precious human lives, shattered.',
            'The following text was written by Paulina Pukytė.',
            'By resisting brutality with beauty, this artwork commemorates five innocent people whose lives were taken away by a russian missile strike in 2022, here, on the territory of Babyn Yar — the site of mass murder of the Kyiv Jews in 1941–1943. The black ‘missile shadow’ cuts into the ground, as if opening a wound, to remind us how precious every human life is, no matter how long ago it was brutally ended. Precious and sacred is the ground of this territory of memory.'
          ]
        },
        {
          title: 'About the artist',
          paragraphs: [
            'Paulina Pukytė (b. 1966, Vilnius) is an artist, writer, curator and critic. She studied at the Vilnius Academy of Arts and the Royal College of Art in London, and teaches at the Vilnius Academy of Arts. She lives and works between Vilnius and London.',
            'Her practice includes interventions in public space, site-specific installations, moving images, and texts. Her strategies are deliberately restrained, almost invisible: she shifts the habitual gaze rather than building a traditional monument.',
            'Memory runs through all of her work. In 2017 she curated the 11th Kaunas Biennial, There and Not There, devoted to the question of the (im)possibility of a monument. The biennial challenged the populist practice of removing and erecting monuments, questioned traditional approaches of commemoration, and explored new, contemporary strategies of remembrance.',
            'The shadow is a recurring motif in Paulina Pukytė’s work. In 2022, for the exhibition Difficult Pasts. Connected Worlds at the National Gallery of Art in Vilnius — the former Museum of the Revolution — she created Shadows, a series of sculptural interventions: material, tangible shadows without a visible source of light, disturbed by people stepping on them. The exhibition addressed the silenced traumas of Eastern Europe.',
            'Missile Shadow continues this line of inquiry, but here, for the first time, the shadow has an exact source, date and place.'
          ],
          link: 'http://www.pukyte.com/'
        },
        {
          title: 'About the project',
          paragraphs: [
            'Missile Shadow was created on the 85th anniversary of the Babyn Yar tragedy.'
          ]
        }
      ],
      alt: 'The Missile Shadow artwork across the pavement near the Kyiv TV Tower'
    }
  },
  {
    id: 'poi-17',
    semanticId: 'memory-road-thin-red-line',
    assignedTitle: 'ТОНКА ЧЕРВОНА ЛІНІЯ',
    description: 'Пауліна Пукіте (Литва), 2026',
    sections: [
      {
        title: 'Контекст',
        paragraphs: [
          '29 вересня 1941 року в Бабиному Яру почалися масові розстріли: за два дні нацисти вбили тут майже 34 тисячі київських євреїв. Вбивства тривали до 1943 року, жертвами були також роми, пацієнти психіатричної лікарні імені Івана Павлова, радянські військовополонені, підпільники, заручники.'
        ]
      },
      {
        title: 'Про роботу',
        paragraphs: [
          'Відвідувачі та відвідувачки можуть продовжити червону лінію: викласти на землі коротку смужку з дрібних камінців, пофарбованих у червоне, заповнити прогалини в лінії червоним восковим олівцем чи крейдою — будь-де на території Бабиного Яру. Багато дерев позначено червоною ниткою. Якщо ви побачите, що вона порвана або пошкоджена, звʼяжіть її, будь ласка.'
        ]
      },
      {
        title: 'Коментар художниці',
        paragraphs: [
          'Переривчаста червона лінія на деревах, будівлях, парканах, ліхтарних стовпах, сходах і каменях на цій території позначає символічний контур меморіальної території Бабиного Яру, місця масових убивств у 1941–1943 роках. Червоні позначки на обʼєктах у публічному просторі, особливо на живих деревах, роблять їх вразливими, виокремленими, небажаними. Якщо це нас тривожить — значить, ми небайдужі, значить, нам не все одно. Позначки тут метафоричні: дерева позначені не під вирубку, а на збереження. На збереження памʼяті.',
          'Червона лінія поєднує універсальне з особистим і простягається з минулого в теперішнє. Вона — наче нитка, розпущена з тієї маленької червоної вʼязаної шапочки, знайденої серед одягу вбитих євреїв Києва. Це запрошення до кожного та кожної, хто сюди приходить: зберігати памʼять про трагедію живою — спільними і невпинними зусиллями зʼєднувати розірвану лінію.'
        ]
      },
      {
        title: 'Про художницю',
        paragraphs: [
          'Пауліна Пукіте (нар. 1966, Вільнюс) — художниця, письменниця, кураторка й критикиня. Навчалася у Вільнюській академії мистецтв і Королівському коледжі мистецтв у Лондоні, викладає у Вільнюській академії мистецтв. Живе й працює між Вільнюсом і Лондоном.',
          'Її практика охоплює інтервенції в публічному просторі, сайт-специфічні інсталяції, рухоме зображення й тексти. Її стратегії свідомо стримані, майже непомітні: вона радше зміщує звичний погляд, ніж зводить традиційний монумент.',
          'Наскрізна тема її робіт — памʼять. У 2017 році вона курувала 11-те Каунаське бієнале «Там і не там», присвячене питанню (не)можливості монумента. Бієнале ставило під сумнів популістську практику знесення і встановлення памʼятників, а також традиційні способи вшанування, і шукало нові, сучасні стратегії комеморації.'
        ],
        link: 'http://www.pukyte.com/'
      },
      {
        title: 'Про проєкт',
        paragraphs: [
          'Роботу «Тонка червона лінія» реалізовано до 85-х роковин трагедії Бабиного Яру.'
        ]
      }
    ],
    image: {
      src: '/assets/places-guide/17-thin-red-line.webp',
      alt: 'Дерева, обв’язані червоною ниткою, у мистецькому об’єкті «Тонка червона лінія»'
    },
    en: {
      title: 'THE THIN RED LINE',
      description:
        'Paulina Pukytė (Lithuania), 2026\n\nThe red marks surrounding you form an artwork tracing a symbolic boundary of the Babyn Yar memorial site. The trees are marked not for felling, but for preservation — the preservation of memory. The artwork was created to commemorate the 85th anniversary of the Babyn Yar tragedy.',
      sections: [
        {
          title: 'Context',
          paragraphs: [
            'On 29 September 1941, mass shootings began at Babyn Yar: over two days, the Nazis murdered almost 34,000 Kyiv Jews here. The killings continued until 1943, with victims also included Roma, patients of the Ivan Pavlov Psychiatric Hospital, Soviet prisoners of war, underground resistance members, and hostages.'
          ]
        },
        {
          title: 'About the work',
          paragraphs: [
            'Visitors are invited to extend the red line by placing a short row of small red-painted pebbles on the ground anywhere within Babyn Yar, or by filling gaps in the line with a red crayon or chalk. A lot of trees are marked with red knitting yarn. If you notice any broken or damaged yarn, please repair it or replace it with your own red yarn on the same spot.'
          ]
        },
        {
          title: 'In the Artist’s Words',
          paragraphs: [
            'The fragmented red line on trees, buildings, fences, lampposts, steps, and stones marks a symbolic boundary of the Babyn Yar memorial site of mass murders in 1941–1943. Red markings on objects in public space, especially on living trees, make them look vulnerable, singled out, not wanted. If this worries us, it means we are not indifferent, it means we care. The marks here are metaphoric: the trees are not marked for destruction, but for preservation. The preservation of memory.',
            'The red line connects the universal with the personal and extends from the past into the present. It is like a thread unravelled from that small red knitted hat found among the clothes of the murdered Jews of Kyiv. It is an invitation for everybody who comes here to keep the memory of the tragedy alive by a collective and unceasing effort to connect the broken line.'
          ]
        },
        {
          title: 'About the artist',
          paragraphs: [
            'Paulina Pukytė (b. 1966, Vilnius) is an artist, writer, curator and critic. She studied at the Vilnius Academy of Arts and the Royal College of Art in London, and teaches at the Vilnius Academy of Arts. She lives and works between Vilnius and London.',
            'Her practice includes interventions in public space, site-specific installations, moving images, and texts. Her strategies are deliberately restrained, almost invisible: she shifts the habitual gaze rather than building a traditional monument.',
            'Memory runs through all of her work. In 2017 she curated the 11th Kaunas Biennial, There and Not There, devoted to the question of the (im)possibility of a monument. The biennial challenged the populist practice of removing and erecting monuments, questioned traditional approaches of commemoration, and explored new, contemporary strategies of remembrance.'
          ]
        },
        {
          title: 'About the project',
          paragraphs: [
            'The Thin Red Line was created for the 85th anniversary of the Babyn Yar tragedy.'
          ]
        }
      ],
      alt: 'Trees wrapped in red yarn as part of The Thin Red Line artwork'
    }
  }
]
