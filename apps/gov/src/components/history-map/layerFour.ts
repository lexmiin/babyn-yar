import { LAYER_FOUR_POI_POSITIONS } from './generated/Layer4PoiPositions'
import { Layer4Borders } from './generated/Layer4Svgs'
import type { HistoryMapPoi, HistoryMapPoiSceneData } from './layers'

export type LayerFourPoiId = (typeof LAYER_FOUR_POI_POSITIONS)[number]['id']
type LocalizedPoiContent = Pick<HistoryMapPoi, 'title' | 'description'> & {
  alt: string
}
type LayerFourPoiContent = Omit<HistoryMapPoi, 'id' | 'center'> & {
  semanticId: string
  en?: LocalizedPoiContent
}

const POI_IMAGE_ROOT = '/assets/history-map/pois'

export const LAYER_FOUR_POI_CONTENT = {
  '01': {
    semanticId: 'soviet-monument',
    title:
      "Пам'ятник радянським громадянам та військовополоненим солдатам і офіцерам Радянської Армії, які загинули від рук німецьких окупантів",
    description:
      "Офіційний державний пам'ятник було встановлено 2 липня 1976 року у верхів'ях Бабиного яру, між двома місцями масових розстрілів: самим яром за вулицею Юрія Іллєнка і протитанковим ровом за вулицею Дорогожицькою та навпроти місця Сирецького концтабору за вулицею Олени Теліги. У 1989 році поруч із оригінальними написами українською та російською мовами було встановлено плиту з написом мовою їдиш.",
    image: {
      src: `${POI_IMAGE_ROOT}/01-soviet-monument.webp`,
      alt: "Пам'ятник радянським громадянам та військовополоненим"
    },
    en: {
      title:
        'Monument to Soviet Citizens and Prisoners of War, Soldiers and Officers of the Soviet Army, Killed by the German Occupiers',
      description:
        'The official state monument was erected on 2 July 1976 in the upper part of Babyn Yar. It stands between two sites of mass shootings — the ravine itself, beyond Yuriia Illienka Street, and the anti-tank ditch, beyond Dorohozhytska Street — and opposite the site of the Syrets concentration camp, beyond Olena Teliha Street. In 1989, a plaque with an inscription in Yiddish was added alongside the original Ukrainian and Russian inscriptions.',
      alt: 'Monument to Soviet Citizens and Prisoners of War, Soldiers and Officers of the Soviet Army, Killed by the German Occupiers'
    }
  },
  '02': {
    semanticId: 'oun-memorial-cross',
    title: "Пам'ятний хрест членам ОУН, розстріляним у Бабиному Яру",
    description:
      "Пам'ятний хрест у Бабиному Яру встановлено у лютому 1992 року на вшанування пам'яті Олени Теліги та членів Організації українських націоналістів (ОУН) під проводом Андрія Мельника. Під час німецької окупації нацисти вбили декілька десятків членів організації, серед яких була відома українська поетка Олена Теліга. З часом дерев'яний хрест замінили на кам'яний.",
    image: {
      src: `${POI_IMAGE_ROOT}/02-oun-cross.webp`,
      alt: "Пам'ятний хрест членам ОУН"
    },
    en: {
      title: 'Memorial Cross to OUN Members Executed in Babyn Yar',
      description:
        'The memorial cross at Babyn Yar was erected in February 1992 to commemorate members of the Organisation of Ukrainian Nationalists (OUN), led by Andrii Melnyk. During the German occupation, several dozen members of the organisation were killed by the Nazis, among them the prominent Ukrainian poet Olena Teliha. The original wooden cross was later replaced with a stone one.',
      alt: 'Memorial Cross to OUN Members Executed in Babyn Yar'
    }
  },
  '03': {
    semanticId: 'ukrainian-ostarbeiters',
    title: 'Пам’ятник українським остарбайтерам та жертвам нацизму',
    description:
      'Монумент присвячений понад трьом мільйонам громадян України, яких під час Другої світової війни насильно вивезли на примусові роботи до нацистської Німеччини. Його було встановлено у 2005 році.',
    image: {
      src: `${POI_IMAGE_ROOT}/03-ostarbeiters.webp`,
      alt: 'Пам’ятний знак остарбайтерам'
    }
  },
  '04': {
    semanticId: 'tetiana-markus-monument',
    title: "Пам'ятник Герою України Київській підпільниці Тетяні Маркус",
    description:
      "Пам'ятник 21-річній радянській підпільниці Тетяні Маркус був відкритий 1 грудня 2009 за ініціативи Іллі Левітаса та організацій, які він очолював — Єврейської конфедерації України та фонду «Пам'ять Бабиного Яру».",
    image: {
      src: `${POI_IMAGE_ROOT}/04-tetiana-markus.webp`,
      alt: "Пам'ятник Тетяні Маркус"
    },
    en: {
      title:
        'Monument to Hero of Ukraine Tetiana Markus, a Member of the Kyiv Underground Resistance',
      description:
        'The monument to Tetiana Markus, a 21-year-old Soviet underground resistance member, was unveiled on 1 December 2009 on the initiative of Illia Levitas and the organisations he headed — the Jewish Confederation of Ukraine and the Babyn Yar Memory Foundation.',
      alt: 'Monument to Hero of Ukraine Tetiana Markus, a Member of the Kyiv Underground Resistance'
    }
  },
  '05': {
    semanticId: 'children-monument',
    title: "Пам'ятник дітям, розстріляним у Бабиному Яру",
    description:
      "Памʼятник встановлений у 2001 році. Автором скульптури став Валерій Медведєв, архітекторами — Руслан Кухаренко та Юрій Мельничук. У 2016 році був відреставрований у рамках пам'ятних заходів, присвячених 75-м роковинам початку масових страт у Бабиному Яру.",
    image: {
      src: `${POI_IMAGE_ROOT}/05-children.webp`,
      alt: "Пам'ятник дітям, розстріляним у Бабиному Яру"
    },
    en: {
      title: 'Monument to the Children Executed at Babyn Yar',
      description:
        'The monument was erected in 2001. The sculpture was created by Valerii Medvediev, with the architectural design by Ruslan Kukharenko and Yurii Melnychuk. In 2016, as part of commemorative events marking the 75th anniversary of the beginning of the mass killings at Babyn Yar, the monument was restored.',
      alt: 'Monument to the Children Executed at Babyn Yar'
    }
  },
  '06': {
    semanticId: 'menorah',
    title: "Пам'ятний знак «Менора»",
    description:
      "Встановлений 29 вересня 1991 року на межі колишніх Єврейського та Кирилівського кладовищ на вшанування загиблих у Бабиному Яру євреїв до 50-х роковин трагедії. Автор проекту — архітектор Юрій Паскевич, автори скульптурних рельєфів — художники Яким Левич та Олександр Левич, Інженер-конструктор каркаса пам'ятника — Борис Гіллер.",
    image: {
      src: `${POI_IMAGE_ROOT}/06-menorah.webp`,
      alt: "Пам'ятний знак «Менора»"
    },
    en: {
      title: 'The Menorah',
      description:
        'The memorial sign was unveiled on 29 September 1991, marking 50 years sincethe first mass killing of Jews at Babyn Yar. It stands on the boundary between the former Jewish and Kyrylivske cemeteries. The project was designed by architect Yurii Paskevych; the sculptural reliefs were created by artists Yakym Levyсh and Oleksandr Levyсh. The structural engineer responsible for the monument’s framework was Borys Hiller.',
      alt: 'The Menorah'
    }
  },
  '07': {
    semanticId: 'road-of-sorrow',
    title: 'Дорога Скорботи',
    description:
      "Алея з'явилася в межах проєкту меморіалізації території заповідника, що юридично та концептуально був сформований після урядової постанови Кабінету Міністрів України від 1 березня 2007 року. Вона є символічним шляхом від вулиці Юрія Іллєнка до пам'ятника «Менора».",
    image: {
      src: `${POI_IMAGE_ROOT}/07-road-of-sorrow.webp`,
      alt: 'Дорога Скорботи'
    }
  },
  '08': {
    semanticId: 'orthodox-clergy-cross',
    title:
      "Хрест у пам'ять про священнослужителів, розстріляних за заклики до захисту Вітчизни від  нацистських загарбників",
    description:
      "Меморіальний знак встановлений на честь священнослужителів, які були розстріляні нацистськими окупантами під час Другої світової війни. Його було встановлено у 2000 році та присвячено пам'яті архімандрита Олександра (Вишнякова), протоієрея Павла (Остренського) та схимонахині Есфірі.",
    image: {
      src: `${POI_IMAGE_ROOT}/08-orthodox-clergy.webp`,
      alt: "Пам'ятний хрест православним священикам"
    }
  },
  '09': {
    semanticId: 'lapidarium',
    title: 'Лапідарій',
    description:
      "Лапідарій було встановлено у вересні 2017 року. Приблизно 70 меморіальних плит і надгробних пам’ятників (мацев) з ліквідованого Єврейського кладовища, що були знайдені науковцями на території Реп'яхового яру, були встановлені вздовж «Дороги скорботи», яка простягається від будівлі по вулиці Юрія Іллєнка 44 до пам’ятного знаку «Менора».",
    image: {
      src: `${POI_IMAGE_ROOT}/09-lapidarium.webp`,
      alt: 'Лапідарій Єврейського кладовища'
    },
    en: {
      title: 'The Lapidarium',
      description:
        'The Lapidarium was established in September 2017. Around 70 memorial stones and Jewish gravestones (matzevot) from the former Jewish cemetery, discovered by researchers in Repiakhiv Yar, were placed along the “Road of Sorrow”, which runs from the building at 44 Yuriia Illienka Street to the “Menorah” memorial.',
      alt: 'The Lapidarium'
    }
  },
  '10': {
    semanticId: 'kachkovsky-brothers-crypt',
    title: 'Склеп братів Качковських',
    description:
      "Кам'яна усипальня знаходиться на території історичного Кирилівського кладовища в Кирилівському гаю. У  1912 році у ній поховали видатного київського хірурга, доктора медицини Петра Качковського та його молодшого брата Антона, який помер студентом-юристом наприкінці XIX століття.",
    image: {
      src: `${POI_IMAGE_ROOT}/10-kachkovsky-crypt.webp`,
      alt: 'Склеп братів Качковських'
    }
  },
  '11': {
    semanticId: 'kurenivka-mudslide-memorial',
    title: "Пам'ятний знак жертвам Куренівської трагедії",
    description:
      "13 березня 1961 року через порушення норм будівництва та експлуатації прорвало захисну дамбу в районі Бабиного Яру, через що селевий потік із рідкої глини та піску затопив околиці Куренівки. Внаслідок катастрофи загинуло 145 людей за офіційними даними, проте радянська влада приховувала реальну кількість жертв, кількість яких могла сягати півтора тисячі людей. Пам'ятник жертвам Куренівської трагедії був офіційно відкритий у березні 2006 року. Монумент встановили на території Національного історико-меморіального заповідника «Бабин Яр», неподалік від перетину вулиць Олени Теліги та Дорогожицької, поблизу верхньої частини колишнього відрогу Бабиного Яру .",
    image: {
      src: `${POI_IMAGE_ROOT}/11-kurenivka-mudslide.webp`,
      alt: "Пам'ятний знак жертвам Куренівської трагедії"
    },
    en: {
      title: 'Memorial to the Victims of the Kurenivka Mudslide',
      description:
        'On 13 March 1961, a protective dam in the Babyn Yar area breached due to violations of construction and maintenance regulations, sending a mudflow of liquid clay and sand into the surrounding areas of Kurenivka. According to official figures, 145 people were killed in the disaster. However, the Soviet authorities concealed the actual number of victims, which may have been as high as 1,500. The memorial to the victims of the Kurenivka disasterwas officially unveiled in March 2006. It stands on the territory of the National Historical and Memorial Reserve “Babyn Yar”, near the intersection of Olena Teliha Street and Dorohozhytska Street, close to the beginning of a former ravine that once formed part of Babyn Yar.',
      alt: 'Memorial to the Victims of the Kurenivka Mudslide'
    }
  },
  '12': {
    semanticId: 'heritage-community-centre-sign',
    title: "Пам'ятний знак на місці майбутнього Общинного центру “Спадщина”.",
    description:
      'Встановлений у 2001 з ініціативи “Джойнту”. Проект не було реалізовано.',
    image: {
      src: `${POI_IMAGE_ROOT}/12-heritage-centre.webp`,
      alt: "Пам'ятний знак на місці майбутнього Общинного центру «Спадщина»"
    }
  },
  '13': {
    semanticId: 'roma-wagon',
    title: "Пам'ятний знак «Ромська кибитка»",
    description:
      "Створення пам'ятника було ініційоване у 1998 році в Києві. Якийсь час пам'ятник стояв у Кам'янці-Подільському. 23 вересня 2016 року його було перенесено на територію заповідника до 75-х роковин першого масового розстрілу ромських таборів. .",
    image: {
      src: `${POI_IMAGE_ROOT}/13-roma-wagon.webp`,
      alt: "Пам'ятний знак «Ромська кибитка»"
    },
    en: {
      title: 'The Roma Wagon',
      description:
        'The memorial project was initiated in Kyiv in 1998. For some time, the monument stood in Kamianets-Podilskyi. On 23 September 2016, marking 75 years since the first mass killing of several Roma groups, the “Roma Wagon” was installed on the territory of the National Historical and Memorial Reserve “Babyn Yar”.',
      alt: 'The Roma Wagon'
    }
  },
  '14': {
    semanticId: 'olena-teliha-monument',
    title:
      'Пам’ятник Олені Телізі та її соратникам, що загинули за незалежність України',
    description:
      'Олена Теліга — поетеса, літературна критикиня та активна діячка Організації українських націоналістів (ОУН) під проводом Андрія Мельника. Під час окупації Києва вона стала жертвою нацистських репресій.\n\nЦеремонія відкриття пам’ятника Олені Телізі та її соратникам відбулася 25 лютого 2017 року. Автори скульптурної композиції — Олександра Рубан та Віктор Липовка.',
    image: {
      src: `${POI_IMAGE_ROOT}/14-olena-teliha.webp`,
      alt: "Пам'ятник українській поетесі Олені Телізі"
    },
    en: {
      title:
        'Monument to Olena Teliha and Her Сomrades, Who Died for the Independence of Ukraine',
      description:
        'Olena Teliha was a poet, literary critic and an active member of the Organisation of Ukrainian Nationalists (OUN), under the leadership of Andrii Melnyk. During the occupation of Kyiv, she became a victim of Nazi persecution.\n\nThe monument to Olena Teliha and her comrades was unveiled on 25 February 2017. The sculptural composition was created by Oleksandra Ruban and Viktor Lypovka.',
      alt: 'Monument to Olena Teliha and Her Сomrades, Who Died for the Independence of Ukraine'
    }
  },
  '15': {
    semanticId: 'jewish-cemetery-entrance-gate',
    title: "В'їзна брама до Лукʼянівського єврейського кладовища",
    description:
      "Відновлений історичний об'єкт знаходиться біля колишньої контори єврейського цвинтаря на вулиці Юрія Іллєнка 44, поруч із територією Бабиного Яру. Браму відтворили у 2018 році за проектом компанії «Раден» на замовлення Національного історико-меморіального заповідника «Бабин Яр». Оригінал був зруйнований на початку 1960-х.",
    image: {
      src: `${POI_IMAGE_ROOT}/15-entrance-gate.webp`,
      alt: "В'їзна брама до Лукʼянівського єврейського кладовища"
    },
    en: {
      title: 'Entrance Gate to the Former Lukianivske Jewish Cemetery',
      description:
        'A reconstructed historic structure located near the former cemetery office on Yuriia Illienka Street , adjacent to the territory of Babyn Yar. The gate was reconstructed in 2018 according to a design by the Raden company, commissioned by the National Historical and Memorial Reserve “Babyn Yar”. The original gate was destroyed in the early 1960s.',
      alt: 'Entrance Gate to the Former Lukianivske Jewish Cemetery'
    }
  },
  '16': {
    semanticId: 'jewish-cemetery-office',
    title: 'Будинок колишньої контори єврейського кладовища',
    description:
      'Будівля зведена у 1899 році за проєктом архітектора Володимира Ніколаєва. У серпні–вересні 1943 року будинок був казармою німецької окупаційної влади, яка реалізувала в ньому секретну «Операцію 1005»: спалювала тіла жертв розстрілів 1941–1943 років у Бабиному Яру. У 1962 року у будинку облаштували гуртожиток для хокейної команди «Сокіл». З 2015-го контора є частиною Національного історико-меморіального заповідника «Бабин Яр».',
    image: {
      src: `${POI_IMAGE_ROOT}/16-jewish-cemetery-office.webp`,
      alt: 'Будівля контори Єврейського кладовища'
    },
    en: {
      title: 'The Former Office Building of the Jewish Cemetery',
      description:
        'The building was constructed in 1899 to a design by architect Volodymyr Nikolaiev. In August–September 1943, the building served as a barracks for the German occupying authorities, who carried out the secret operation “Action 1005” there, burning the bodies of victims of the mass killings carried out at Babyn Yar in 1941–1943. In 1962, the building was converted into a dormitory for the Sokol ice hockey team. Since 2015, the office has been part of the National Historical and Memorial Reserve “Babyn Yar.”',
      alt: 'The Former Office Building of the Jewish Cemetery'
    }
  },
  '17': {
    semanticId: 'mirror-field',
    title: 'Дзеркальне поле',
    description:
      'Аудіовізуальна інсталяція «Дзеркальне поле». Відкрита у вересні 2020 року на території зруйнованого Єврейського кладовища. Обʼєкт представляє собою сорокаметровий дзеркальний диск та колони, пробиті кулями, з яких лунають імена загиблих.',
    image: {
      src: `${POI_IMAGE_ROOT}/17-mirror-field.webp`,
      alt: 'Аудіовізуальна інсталяція «Дзеркальне поле»'
    }
  },
  '18': {
    semanticId: 'crystal-wailing-wall',
    title: 'Кристалічна стіна плачу',
    description:
      '«Кришталева стіна плачу». Відкрита у жовтні 2021 року. «Стіна» представляє собою арт-обʼєкт мисткиці Марини Абрамович. Інсталяція задумувалася як символічне продовження знаменитої Стіни Плачу в Єрусалимі. За задумом Абрамович, обʼєкт не просто нагадує про страшну трагедію минулого, а й створює простір «для роздумів, зцілення та відновлення памʼяті».',
    image: {
      src: `${POI_IMAGE_ROOT}/18-crystal-wailing-wall.webp`,
      alt: 'Кристалічна стіна плачу'
    }
  },
  '19': {
    semanticId: 'symbolic-synagogue',
    title: 'Символічна синагога «Місце для роздумів»',
    description:
      'Символічна синагога «Місце для роздумів». Відкрита у травні 2021 року. Обʼєкт представляє собою деревʼяну будівлю-трансформер за проектом архітектора Мануеля Герца, яка розгортається як книга та нагадує традиційні синагоги Західної України.',
    image: {
      src: `${POI_IMAGE_ROOT}/19-symbolic-synagogue.webp`,
      alt: 'Символічна синагога «Місце для роздумів»'
    }
  }
} as const satisfies Record<LayerFourPoiId, LayerFourPoiContent>

export const LAYER_FOUR_POI_SCENE = {
  mapBase: {
    id: 'presentDay',
    alt: 'Сучасна карта території Бабиного Яру',
    aspectRatio: '894.14 / 783.2'
  },
  mapSource: 'Картографічна основа четвертого шару',
  BorderComponent: Layer4Borders,
  pois: LAYER_FOUR_POI_POSITIONS.map(({ id, center }) => {
    const { title, description, image } = LAYER_FOUR_POI_CONTENT[id]
    return { id: `layer4-poi-${id}`, center, title, description, image }
  }),
  overview: [
    'У перші роки незалежності на території Бабиного Яру та прилеглих територіях продовжувалося будівництво об’єктів, запланованих у пізню радянську епоху. Так, Телецентр (відомий також як «Олівець») було добудовано у 1992 році, але повноцінно установа так і не запрацювала. Ще з 1970-х років планувалося будівництво Сирецько-Печерської лінії метро. Її станцію «Дорогожичі» (територія входила до зони масових розстрілів та скидання тіл у 1941–1943 роках) відкрили у 2000 році. З 2019 року до третього кварталу 2021 року на території, де також відбувалися масові розстріли, тривало будівництво житлового комплексу UNO City House у Києві (вул. Олени Теліги, 25).',
    'У цей період після падіння комуністичної диктатури та цензури, але без якісного втручання української держави в ці процеси, різні організації безсистемно встановлювали на території Бабиного Яру та прилеглих територіях велику кількість різноманітних пам’ятників і меморіальних таблиць. На межі пізньої «перебудови» та української незалежності у 1991 році було встановлено пам’ятники «Менора» та «Пам’ятне місце Сирецького нацистського концтабору». У 1992 році прихильники мельниківської ОУН встановили «Пам’ятний знак-хрест загиблим членам ОУН(м)» з меморіальними таблицями. Спочатку хрест був дерев’яним, а з часом його замінили на кам’яний. У 2017 році прихильники ОУН(м) встановили біля станції метро «Дорогожичі» пам’ятник Олені Телізі. У 2001 році було відкрито пам’ятник «Дітям, розстріляним у Бабиному Яру». Бабин Яр став місцем і для пам’ятників проєктам, які не були реалізовані. У 2001 році неподалік від хреста мельниківцям відкрили «Пам’ятну стелу на ознаку спорудження єврейського общинно-культурного центру «Спадщина»», який так і не було побудовано. У 2009 році неподалік від радянського монумента 1976 року встановили «Пам’ятник радянській підпільниці-єврейці Тетяні Маркус». У 2016 році на території НІМЗ «Бабин Яр» відкрили пам’ятник «Ромська кибитка», присвячений жертвам Пораймосу.',
    'НІМЗ «Бабин Яр» намагається зберігати пам’ять про зруйновані кладовища на своїй території. У 2017 році співробітники заповідника відкопали та частково описали скинуті до Реп’яхового Яру мацеви з Єврейського кладовища. Ці надгробні плити встановили біля алеї «Дорога Скорботи», яка пролягає від вулиці Юрія Іллєнка в напрямку пам’ятного знаку «Менора».',
    'Приватний фонд «Меморіальний центр Голокосту «Бабин Яр»» побудував у 2020–2021 роках декілька об’єктів. Одним із них стала відкрита у травні 2021 року символічна синагога «Місце для роздумів». Це дерев’яна будівля-трансформер за проєктом архітектора Мануеля Герца, яка розгортається як книга та нагадує традиційні синагоги Західної України. Іншим об’єктом стала «Кришталева стіна плачу», відкрита у жовтні 2021 року. «Стіна» є артоб’єктом мисткині Марини Абрамович. На території зруйнованого Єврейського кладовища фонд побудував аудіовізуальну інсталяцію «Дзеркальне поле», відкриту у вересні 2020 року. Об’єкт являє собою сорокаметровий дзеркальний диск та колони, пробиті кулями, з яких лунають імена загиблих. Фонд також відкрив об’єкт «Погляд у минуле» — серію інсталяцій, зокрема у вигляді дерев’яних окулярів-телескопів з архівними фото, встановлених у різних точках міста та на підходах до урочища. У березні 2021 року відкрили артоб’єкт пам’яті жертв Куренівської трагедії — пам’ятний знак авторства Олега Шовенка, присвячений техногенній катастрофі 1961 року. Загалом близько трьох десятків пам’ятників та пам’ятних таблиць було встановлено в Бабиному Яру з 1991 до 2026 року.',
    'З 2023 року на території НІМЗ «Бабин Яр» працює Виставковий центр «Жива пам’ять», де проводять екскурсії, демонструють різні виставки («Бабин Яр: Дзеркала смерті», «Невидимі. Стійкість: минуле і сучасність ромів», «Коли руйнується світ», «Держава обману: сила нацистської пропаганди», «Українсько-єврейське століття: фото та історії від 1920 до 2025» тощо), реалізують публічний проєкт «Простір дослідження», влаштовують покази фільмів, наукові дискусії та книжковий клуб. Тут також працюють архів і бібліотека.'
  ]
} as const satisfies HistoryMapPoiSceneData
