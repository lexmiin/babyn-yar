import type { Language } from '@babyn-yar/i18n'

type PeriodCopy = { date: string; title?: string; description: string }
export type LandscapeCopy = {
  title: string
  description: string
  heading: string
  timelineTitle: string
  intro: string[]
  prompt: string
  periods: Record<
    | 'before1941'
    | 'shootings'
    | 'occupation'
    | 'postwar'
    | 'flood'
    | 'independence'
    | 'today',
    PeriodCopy
  >
}

export const landscape = {
  uk: {
    title: 'Ландшафт Бабиного Яру',
    description:
      'Як змінювалися Бабин Яр і простір навколо нього: інтерактивна мапа та історичні періоди.',
    heading: 'Про проєкт',
    timelineTitle: 'Бабин Яр',
    intro: [
      'Ландшафт Бабиного Яру – це інтерактивна мапа, що показує, як змінювався Бабин Яр і простір навколо нього від 1941 року до сьогодення.',
      'Від мирного передмістя Києва — до місця масових убивств, а згодом — до простору, який радянська влада намагалася змінити й позбавити пам’яті про злочин. У незалежній Україні Бабин Яр став місцем повернення цієї пам’яті. У 2022 році, після початку повномасштабної російської агресії, цей ландшафт знову став свідком злочину.',
      'Мапа також містить інформацію про основні пам’ятні знаки та об’єкти, що формують сучасний меморіальний ландшафт Бабиного Яру.',
      'Проєкт створено до 85-ї річниці трагедії Бабиного Яру Національним історико-меморіальним заповідником «Бабин Яр» у співпраці з Посольством Федеративної Республіки Німеччина в Києві.'
    ],
    prompt:
      'Кожна дата на часовій лінії відкриває окрему історію. Натисніть, щоб дізнатися більше.',
    periods: {
      before1941: {
        date: 'до 1941',
        description: 'Бабин Яр до початку Другої світової війни'
      },
      shootings: {
        date: '29–30 вересня 1941',
        description:
          'Нацисти розстріляли близько 34 тисяч київських євреїв у Бабиному Яру.'
      },
      occupation: {
        date: '1941–1943',
        title: 'Період масових розстрілів',
        description:
          'Бабин Яр був місцем масових розстрілів представників різних етнічних, політичних і соціальних груп, яких переслідував нацистський режим.'
      },
      postwar: {
        title: 'Радянський період',
        date: '1943–1991',
        description: 'Зміни території Бабиного Яру після війни.'
      },
      flood: {
        date: '13 березня 1961',
        title: 'Куренівська трагедія',
        description:
          'Прорив дамби спричинив докорінну зміну ландшафту Бабиного Яру'
      },
      independence: {
        date: '1991–2021',
        title: 'Незалежна Україна: повернення пам’яті',
        description:
          'Процес повернення пам’яті про всіх жертв Бабиного Яру та формування меморіального простору'
      },
      today: {
        date: '2022 — сьогодення',
        title: 'Повномасштабна війна Росії проти України',
        description:
          'Бабин Яр стає свідком війни та злочинів російського тоталітарного режиму.'
      }
    }
  },
  en: {
    title: 'Babyn Yar Landscape',
    description:
      'How Babyn Yar and its surroundings have changed: an interactive map and historical periods.',
    heading: 'About the project',
    timelineTitle: 'Babyn Yar',
    intro: [
      'Babyn Yar Landscape is an interactive map that shows how Babyn Yar and the surrounding area have changed from 1941 to the present day.',
      'It was once a quiet suburb of Kyiv. Then it became a site of mass murder. Later, the Soviet authorities reshaped the landscape and suppressed the memory of the crimes committed here. In independent Ukraine, the history of Babyn Yar began to return to public memory. In 2022, after russia launched a full-scale invasion against Ukraine, this landscape once again bore witness to war crimes',
      "The map also shows the main memorials and sites that make up Babyn Yar's memorial landscape today.",
      'The project was created for the 85th anniversary of the Babyn Yar tragedy by the Babyn Yar National Historical Memorial Preserve, in cooperation with the Embassy of the Federal Republic of Germany in Kyiv.'
    ],
    prompt:
      'Every date on the timeline opens its own story. Tap to find out more.',
    periods: {
      before1941: {
        date: 'Before 1941',
        description: 'Babyn Yar before the Second World War.'
      },
      shootings: {
        date: 'September 29–30, 1941',
        description:
          'The Nazis shot about 34,000 of Jews from Kyiv at Babyn Yar.'
      },
      occupation: {
        date: '1941–1943',
        title: 'The years of mass shootings',
        description:
          'Babyn Yar became the site of mass shootings carried out by the Nazi regime against people from many ethnic, political and social groups it persecuted.'
      },
      postwar: {
        date: '1943–1991',
        title: 'The Soviet period',
        description: 'How Babyn Yar and its surroundings changed after the war.'
      },
      flood: {
        date: 'March 13, 1961',
        title: 'The Kurenivka Tragedy',
        description:
          'A dam breach dramatically changed the landscape of Babyn Yar.'
      },
      independence: {
        date: '1991–2021',
        title: 'Independent Ukraine and the return of memory',
        description:
          'The return of the memory of all the victims of Babyn Yar and the creation of a memorial space.'
      },
      today: {
        date: '2022 to today',
        title: "russia's full-scale war against Ukraine",
        description:
          "Babyn Yar bears witness to the war and to the crimes of russia's totalitarian regime."
      }
    }
  }
} satisfies Record<Language, LandscapeCopy>
