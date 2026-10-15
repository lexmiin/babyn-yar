import type { Language } from '@babyn-yar/i18n'

const uk = {
  title: 'Дорога пам’яті',
  introduction:
    'Ця аудіоекскурсія проведе вас маршрутом, яким 29 вересня 1941 року євреїв Києва вели до Бабиного Яру. Від першого блокпоста до місця масових убивств. Ви почуєте свідчення очевидців та історії людей, які йшли цим шляхом.',
  duration: 'Тривалість: від 40 хв · 5 точок маршруту',
  instructions:
    'Рекомендований спосіб проходження: рухайтеся маршрутом пішки від першої до п’ятої точки, на кожній точці скануйте QR-код.',
  credits: [
    'Проєкт створено до 85 річниці трагедії Бабиного Яру Національним історико-меморіальним заповідником «Бабин Яр» у співпраці з RememberUs.org та за підтримки Посольства Федеративної Республіки Німеччина в Києві.',
    'До створення аудіогіду долучилися Національний академічний драматичний театр імені Івана Франка та актори Віталій Ажнов, Олег Стальчук і Наталя Ярошенко, які озвучили тексти української версії аудіоекскурсії.'
  ],
  stops: [
    {
      id: '01',
      title: 'Перший блокпост',
      location:
        'Початок маршруту · вул. Юрія Іллєнка, перетин з вул. Академіка Ромоданова',
      map: 'https://maps.app.goo.gl/goNmjjukBjEwuUyE6',
      paragraphs: [
        'Ви перебуваєте на початку маршруту «Дорога пам’яті» — на місці, де 29 вересня 1941 року нацистами було встановлено перший блокпост.',
        'Слухаючи аудіо, продовжуйте рух вулицею Юрія Іллєнка вниз до перехрестя з Дорогожицькою.',
        'Наступна точка маршруту — пам’ятний знак «Дорога смерті». QR-код розміщено поруч із пам’ятним знаком.'
      ]
    },
    {
      id: '02',
      title: 'Пам’ятний знак «Дорога смерті»',
      location: 'Перетин вул. Юрія Іллєнка та Дорогожицької',
      map: 'https://share.google/oUpXZ3gLHsZ8NBUYo',
      paragraphs: [
        'Ви продовжуєте шлях, яким 29 вересня 1941 року євреїв Києва вели до Бабиного Яру.',
        'Від пам’ятного знака продовжуйте рух вулицею Юрія Іллєнка до перехрестя з вулицею Ґарета Джонса.',
        'Поверніть ліворуч і прямуйте до центральних воріт військового кладовища.',
        'Там розташований наступний QR-код.'
      ]
    },
    {
      id: '03',
      title: 'Ворота військового кладовища',
      location: 'вул. Ґарета Джонса',
      map: 'https://maps.app.goo.gl/BmWkNZNhHL94nafj8',
      paragraphs: [
        'Перед вами — ворота військового кладовища, ще одна важлива локація на історичному маршруті до Бабиного Яру.',
        'Від воріт кладовища продовжуйте рух у напрямку вулиці Дорогожицької.',
        'Далі поверніть на вулицю Праведників і перейдіть на інший бік вулиці Юрія Іллєнка.',
        'Наступна точка — майданчик для роздягання на перетині вулиць Дорогожицької та Праведників, там ви знайдете наступний QR-код.'
      ]
    },
    {
      id: '04',
      title: 'Майданчик для роздягання євреїв перед розстрілом',
      location: 'Перетин вул. Дорогожицької та Праведників',
      map: 'https://maps.app.goo.gl/rSuW5NsoMHEsFQWw9',
      paragraphs: [
        'Від цієї точки продовжуйте рух територією Національного історико-меморіального заповідника «Бабин Яр».',
        'Фінальна точка маршруту розташована поблизу пам’ятника дітям, розстріляним у Бабиному Яру, там відскануйте останній QR-код.'
      ]
    },
    {
      id: '05',
      title: 'Бабин Яр',
      location:
        'Фінальна точка маршруту · поблизу пам’ятника дітям, розстріляним у Бабиному Яру',
      map: 'https://maps.app.goo.gl/J1cvVmE4oGBhJJiSA',
      paragraphs: [
        'Ви дійшли до фінальної точки «Дороги пам’яті» — Бабиного Яру.',
        'Саме тут 29–30 вересня 1941 року нацисти здійснили масове вбивство київських євреїв.',
        'Дякуємо, що пройшли цей шлях разом із нами.'
      ]
    }
  ]
}

const en = {
  title: 'The Road of Memory',
  introduction:
    'This audio-guided walking path follows the route along which the Jews of Kyiv were marched to Babyn Yar on 29 September 1941, from the first checkpoint to the site of the mass killings. Along the way, you will hear eyewitness testimonies and learn the stories of the people who were forced to walk this path.',
  duration: 'Duration: approximately 40 minutes or more · 5 stops',
  instructions:
    'We recommend walking from Stop 1 to Stop 5 in the order indicated. Scan the QR code at each stop to access the corresponding audio guide section.',
  credits: [
    'The audio guide was created to mark the 85th anniversary of the Babyn Yar massacre by the National Historical and Memorial Preserve “Babyn Yar” in cooperation with RememberUs.org and with the support of the Embassy of the Federal Republic of Germany in Kyiv.',
    'The project was developed with the participation of the Ivan Franko National Academic Drama Theatre. Actors Vitalii Azhnov, Oleh Stalchuk and Natalia Yaroshenko provided the narration for the Ukrainian-language version of the audio guide.'
  ],
  stops: [
    {
      id: '01',
      title: 'First Checkpoint',
      location:
        'Starting point · Yuriia Illienka Street, at the intersection with Akademika Romodanova Street',
      paragraphs: [
        'You are at the starting point of the Road of Memory route, where the Nazis established the first checkpoint on 29 September 1941.',
        'As you listen to the audio guide, continue walking down Yuriia Illienka Street towards the intersection with Dorohzhytska Street.',
        'The next stop is the “Road of Death” memorial sign. The QR code is located next to the memorial sign.'
      ],
      map: 'https://maps.app.goo.gl/goNmjjukBjEwuUyE6'
    },
    {
      id: '02',
      title: '“Road of Death” Memorial Sign',
      location:
        'Intersection of Yuriia Illienka Street and Dorohzhytska Street',
      paragraphs: [
        'You are continuing along the route taken by the Jews of Kyiv as they were marched to Babyn Yar on 29 September 1941.',
        'From the memorial sign, continue along Yuriia Illienka Street to the intersection with Gareth Jones Street.',
        'Turn left and proceed towards the main gates of the military cemetery.',
        'The next QR code is located there.'
      ],
      map: 'https://share.google/oUpXZ3gLHsZ8NBUYo'
    },
    {
      id: '03',
      title: 'Military Cemetery Gates',
      location: 'Gareth Jones Street',
      paragraphs: [
        'Before you are the gates of the military cemetery, another significant location along the historic route to Babyn Yar.',
        'From the cemetery gates, continue towards Dorohzhytska Street.',
        'Then turn onto Pravednykiv Street and cross to the opposite side of Yuriia Illienka Street.',
        'The next stop is the site where Jews were forced to undress before being shot, at the intersection of Dorohzhytska Street and Pravednykiv Street. You will find the next QR code there.'
      ],
      map: 'https://maps.app.goo.gl/BmWkNZNhHL94nafj8'
    },
    {
      id: '04',
      title: 'Site Where Jews Were Forced to Undress Before Being Shot',
      location: 'Intersection of Dorohzhytska Street and Pravednykiv Street',
      paragraphs: [
        'From this point, continue on foot through the grounds of the National Historical and Memorial Preserve “Babyn Yar.”',
        'The final stop is located near the monument to the children murdered at Babyn Yar. Scan the last QR code there.'
      ],
      map: 'https://maps.app.goo.gl/rSuW5NsoMHEsFQWw9'
    },
    {
      id: '05',
      title: 'Babyn Yar',
      location: 'Final stop',
      paragraphs: [
        'You have reached the final stop on the Road of Memory route: Babyn Yar.',
        'It was here, on 29–30 September 1941, that the Nazis carried out the mass murder of the Jews of Kyiv.',
        'Thank you for walking this path of remembrance with us.'
      ],
      map: 'https://maps.app.goo.gl/J1cvVmE4oGBhJJiSA'
    }
  ]
}

const translations: Record<Language, typeof uk> = { uk, en }
export const getAudioGuide = (lang: Language) => ({
  ...translations[lang],
  language: lang
})

export const recordings: Record<Language, Record<string, string>> = {
  uk: {
    '01': 'https://static.babynyar.work/audio/uk/01.mp3',
    '02': 'https://static.babynyar.work/audio/uk/02.mp3',
    '03': 'https://static.babynyar.work/audio/uk/03.mp3',
    '04': 'https://static.babynyar.work/audio/uk/04.mp3',
    '05': 'https://static.babynyar.work/audio/uk/05.mp3'
  },
  en: {
    '01': 'https://static.babynyar.work/audio/en/01.mp3',
    '02': 'https://static.babynyar.work/audio/en/02.mp3',
    '03': 'https://static.babynyar.work/audio/en/03.mp3',
    '04': 'https://static.babynyar.work/audio/en/04.mp3',
    '05': 'https://static.babynyar.work/audio/en/05.mp3'
  }
}
