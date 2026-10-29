import { landscape } from './landscape'
import { uk, type HistoryMapCopy } from './uk'

const timeline = landscape.en.periods

// shortcut: descriptions absent from the source retain Ukrainian; replace when approved translations arrive.
export const en = {
  before1941: {
    'before-1941.title': 'Babyn Yar before 1941',
    'before1941.alt': 'Historical topographic map of the Babyn Yar area',
    overview: [
      'The origins of the name ‘Babyn Yar’ remain uncertain. According to one version, it derives from the nickname of a local tavern keeper, ‘Baba’ (in Ukrainian usually means grandma or an old woman), who owned land near Syrets. The name was later applied to the ravine and the surrounding area. The tract known as Babyn Yar was first documented in the Plan of the City of Kyiv with All Lands under Its Jurisdiction, compiled in 1902 by Ivan Tairov, the city’s land surveyor.',
      "The history of Babyn Yar and its surroundings is often traced back to 1139, when the Olhovychi princes founded the Kyrylivsky Monastery (St. Cyril's Monastery). In 1240, Syrets was mentioned in a charter issued by Prince Danylo of Halych, who granted these lands to the Kyiv-Pechersk Lavra.",
      "From 1661, Syrets and the surrounding area were part of Kyiv's suburbs. In the Hetmanate era, Ivan Mazepa became a patron of the Kyrylivsky Monastery and donated generously to its renovation and restoration.",
      'Under Empress Catherine II of russia, the monastery was secularized and converted into the Kyiv-Kyrylivska Hospital. Land nearby was set aside for burying patients who died there, and by 1871 a cemetery had been established in the Kyrylivsky Grove.',
      'In the late 19th century, two Jewish sites were established near Babyn Yar: the Jewish Hospital in 1885 and the Lukyanivske Jewish Cemetery in 1894. Adjacent to the cemetery were the Kyrylivske Orthodox Cemetery and the Karaite, Muslim, Fraternal and Military cemeteries.'
    ],
    'before-1941-features.mapSource':
      'Topographic plan of Kyiv as of 1924, 1:2100 (reduced)',
    'before-1941-features.featureLabel': 'Cemetery areas:',
    'jewish-cemetery.label': 'Lukianivka Jewish Cemetery',
    'jewish-cemetery.description': uk.before1941['jewish-cemetery.description'],
    'jewish-cemetery.lines': ['Lukianivka Jewish', 'Cemetery'],
    'karaite-cemetery.label': 'Karaite Cemetery',
    'karaite-cemetery.description':
      uk.before1941['karaite-cemetery.description'],
    'muslim-cemetery.label': 'Muslim Cemetery',
    'muslim-cemetery.description': uk.before1941['muslim-cemetery.description'],
    'muslim-cemetery.lines': ['Muslim Cemetery'],
    'kyrylivske-cemetery.label': 'St. Cyril’s Orthodox Cemetery',
    'kyrylivske-cemetery.description':
      uk.before1941['kyrylivske-cemetery.description'],
    'kyrylivske-cemetery.lines': ['St. Cyril’s Orthodox', 'Cemetery'],
    'military-cemetery.label': 'Military Cemetery',
    'military-cemetery.description':
      uk.before1941['military-cemetery.description'],
    'bratske-cemetery.label': 'Fraternal Cemetery',
    'bratske-cemetery.description':
      uk.before1941['bratske-cemetery.description'],
    'mariavite-cemetery.label': 'Mariavite Cemetery',
    'mariavite-cemetery.description':
      uk.before1941['mariavite-cemetery.description'],
    'evangelical-cemetery.label': 'Evangelical Christian Cemetery',
    'evangelical-cemetery.description':
      uk.before1941['evangelical-cemetery.description'],
    'evangelical-cemetery.lines': ['Evangelical Christian', 'Cemetery'],
    'lukianivske-cemetery.label': 'Lukianivka Cemetery',
    'lukianivske-cemetery.description':
      uk.before1941['lukianivske-cemetery.description']
  },
  occupation: {
    'occupation.alt': 'Map of the Babyn Yar area during the Nazi occupation',
    'occupation-features.mapSource':
      'The source of the second layer’s base map is being clarified',
    'occupation-features.title': timeline.shootings.date,
    'occupation-features.featureLabel': 'Second Layer Sites:',
    'layer2-zone-1.label': 'Babyn Yar mass shooting zone',
    'layer2-zone-1.description': uk.occupation['layer2-zone-1.description'],
    'layer2-zone-1.lines': ['Babyn Yar mass', 'shooting zone'],
    'layer2-zone-3.label': 'Garages of Repair Base No. 8',
    'layer2-zone-3.description': uk.occupation['layer2-zone-3.description'],
    'layer2-zone-3.lines': ['Garages of Repair', 'Base No. 8'],
    'layer2-way-2.label': 'Red arrow',
    'layer2-way-2.description': uk.occupation['layer2-way-2.description'],
    'layer2-blockpost.label': 'First German outpost',
    'layer2-blockpost.description':
      uk.occupation['layer2-blockpost.description'],
    'layer2-tank-1.label':
      'First anti-tank ditch on Melnykova Street (now Illienka Street)',
    'layer2-tank-1.description': uk.occupation['layer2-tank-1.description'],
    'layer2-tank-1.lines': [
      'First anti-tank ditch',
      'on Melnykova Street',
      '(now Illienka Street)'
    ],
    'occupation-features.overview': [
      'On September 18, 1941, the last units of the Red Army left Kyiv. The following day, the city was occupied by the 6th Army of the Wehrmacht, the armed forces of Nazi Germany. On September 27–28, an order was posted on buildings and notice boards throughout the city: ‘All Jews of the city of Kyiv and its surroundings must report on Monday, September 29, 1941, by 8 a.m., at the corner of Melnykova and Doktorivska streets.’',
      'Over September 29–30, thousands of people made their way toward the cemetery grounds, believing they were being resettled. Sonderkommando 4a of Einsatzgruppe C, led by SS-Standartenführer Paul Blobel, robbed and murdered around 34,000 Jews from Kyiv at Babyn Yar. The unit was assisted by two battalions of the German Police Regiment South, the 45th and 303rd, as well as the local collaborationist police and administrative authorities.',
      'Only eleven people managed to escape from the ravine itself. About 21 more prisoners of the Syrets camp, who were also meant to be shot at Babyn Yar, got away.'
    ],
    'occupation-features-part-2.mapSource':
      'The source of the second layer’s base map is being clarified',
    'occupation-features-part-2.title': `${timeline.occupation.date} ${timeline.occupation.title}`,
    'occupation-features-part-2.featureLabel': 'Second Layer Sites:',
    'layer2-zone-2.label': 'Syrets camp',
    'layer2-zone-2.description': uk.occupation['layer2-zone-2.description'],
    'layer2-zone-4.label': 'Site of the murder of Pavlov Hospital patients',
    'layer2-zone-4.description': uk.occupation['layer2-zone-4.description'],
    'layer2-zone-4.lines': [
      'Site of the murder of',
      'Pavlov Hospital patients'
    ],
    'layer2-way-1.label': 'Blue arrow',
    'layer2-way-1.description': uk.occupation['layer2-way-1.description'],
    'layer2-tank-2.label':
      'Second anti-tank ditch (near the Soviet monument at Lukianivka Cemetery)',
    'layer2-tank-2.description': uk.occupation['layer2-tank-2.description'],
    'layer2-tank-2.lines': [
      'Second anti-tank ditch',
      'near the Soviet monument',
      'at Lukianivka Cemetery'
    ],
    'occupation-features-part-2.overview': [
      'From October 1941 to the end of October 1943, Babyn Yar and the adjacent anti-tank ditch — stretching from the Lukyanivske Cemetery along Tabirna Street to the turn onto Dehtiarivska Street — were sites of systematic mass shootings carried out by the German occupation authorities.',
      'Those murdered there included Jews who had gone into hiding  and were discovered; Roma, targeted because of their ethnicity; Soviet prisoners of war; party and Soviet activists; members of the underground resistance; hostages; people accused of “sabotage”; people who violated the curfew; patients of a psychiatric hospital; and possibly some members of the OUN(m) — the Organisation of Ukrainian Nationalists Melnyk faction. The bodies of people killed elsewhere were also brought to Babyn Yar: from the prisons at 33 and 15 Korolenka Street, on Polova Street, and at 5a Pylyp Orlyk Street.',
      'In September 1942, Blobel took SS-Sturmbannführer Albert Hartl on a ’tour’ and told him: ‘Here lie my 30,000 Jews.’',
      'Estimates of the total number of people murdered at Babyn Yar range from 70,000 to 100,000. At the Nuremberg trial in 1946, the figure given was 100,000.',
      'In June 1942, the Nazis also set up the Syrets concentration camp, where more than 5,000 people were imprisoned; many were murdered or died as a result of inhumane conditions. On September 29, 1943, about 300 inmates — POWs and civilians — raised an uprising, and 21 of them managed to escape. Twelve of them, among others Davyd Budnyk, Semen Berliant, Yukhym Vilkis, Zakhar Trubakov, Leonid Ostrovsky, subsequently gave testimonies on how the Nazis were destroying evidence of mass burials in Babyn Yar. This was the so-called “Sonderaktion 1005”.'
    ]
  },
  postwar: {
    'postwar.title': 'Babyn Yar in 1943–1991',
    'postwar.alt': 'Historical map of the Babyn Yar area in 1943–1991',
    floodOverview: [
      'In the second half of the 1940s, the Soviet city authorities adopted a new master plan for the Syrets and Babyn Yar districts. It called for new housing and a transformation of the area. In 1947, construction of Stalin-era apartment blocks (‘stalinkas’) began on Shchusieva Street, partly on the site of the former Syrets concentration camp. In 1950, work started on a highway through part of the ravine, along the route of what is now Olena Teliha Street.',
      'On March 13, 1961, Kyiv went through one of the worst man-made disasters in its history. For the previous ten years, Babyn Yar had been used as a dumping ground for pulp, the liquid waste from the Petrivka brick factory. The first and second branches of the ravine were filled in 1951–1952, and the third from 1954 onward. The slurry slowly altered the terrain and filled the natural hollows of the ravine.',
      'The dam holding the pulp back could no longer withstand the pressure and collapsed. A 14-meter wave of liquid mud flooded 30 hectares of Kurenivka district within minutes, destroying houses, vehicles and everything in its path. Estimates of the number of people who died that day vary, with several hundred reported killed. The city suffered heavy material losses.',
      'After the disaster, the landscape of Babyn Yar was permanently transformed: the ravine allmost disappeared beneath a layer of silt. The tragedy was suppressed for a long time, and the Soviet authorities downplayed its scale.'
    ],
    'postwar-map.mapSource': 'Base map of the third layer',
    'postwar-map.listLabel': 'Third Layer Sites:',
    'postwar-street-1.label': 'Shchusieva Street',
    'postwar-street-1.extraLabels.label': 'Illienka Street',
    'postwar-street-2.label': 'Oleny Telihy Street',
    'postwar-map.overview': [
      'On September 29, 1944, the first mourning ceremony for the victims was held at Babyn Yar, with the writers David Hofstein and Itsik Kipnis among those who took part in a big rally. Over the following thirty years, the Soviet authorities rejected every request to put up a monument here and instead planned further development of the site.',
      'Still, Babyn Yar remained a place for mourning gatherings and political demonstrations by Jews from the USSR and the West. In 1965, the writer Elie Wiesel visited Babyn Yar. In 1966, two demonstrations were held, on September 24 and 29. Ukrainian intellectuals took an active part in the second one, and the dissident Ivan Dziuba gave a speech.',
      'In 1976, a Soviet monument was erected on the site where Jews had traditionally gathered, but it made no mention of Jewish victims. A Yiddish inscription next to the monument  was added only in 1989.'
    ],
    'postwar-video.caption':
      'Archival footage of development and hydraulic filling at Babyn Yar',
    'postwar-flood.mapSource': 'Base map of the third layer',
    'postwar-flood.title': `${timeline.flood.date} ${timeline.flood.title}`,
    'postwar-flood.featureLabel': 'Third Layer Sites:',
    'layer3-karer.label': 'Quarry of the Petrivka brickworks',
    'layer3-karer.description': uk.postwar['layer3-karer.description'],
    'layer3-karer.lines': ['Quarry of the', 'Petrivka brickworks'],
    'layer3-perekach.label':
      'Slurry pumping for the hydraulic filling of Babyn Yar',
    'layer3-perekach.description': uk.postwar['layer3-perekach.description'],
    'layer3-perekach.lines': [
      'Slurry pumping for the',
      'hydraulic filling of',
      'Babyn Yar'
    ],
    'layer3-pulpa.label': 'Slurry accumulation site',
    'layer3-pulpa.description': uk.postwar['layer3-pulpa.description'],
    'layer3-pulpa.lines': ['Slurry accumulation', 'site'],
    'layer3-damba.label': 'Earthen dam',
    'layer3-damba.description': uk.postwar['layer3-damba.description'],
    'layer3-razliv.label': 'Kurenivka tragedy',
    'layer3-razliv.description': uk.postwar['layer3-razliv.description'],
    'postwar-development.mapSource': 'Base map of the third layer',
    'postwar-development.featureLabel': 'Third Layer Sites:',
    'layer3-lager.label': 'Site of the former Syrets concentration camp',
    'layer3-lager.description': uk.postwar['layer3-lager.description'],
    'layer3-lager.lines': ['Site of the former Syrets', 'concentration camp'],
    'layer3-sirec.label': 'Development of the Syrets residential district',
    'layer3-sirec.description': uk.postwar['layer3-sirec.description'],
    'layer3-sirec.lines': ['Development of the', 'Syrets residential district'],
    'layer3-park-2.label': 'Syrets Park',
    'layer3-park-2.description': uk.postwar['layer3-park-2.description'],
    'layer3-point-4.label': 'Syrets Children’s Railway and viaduct',
    'layer3-point-4.description': uk.postwar['layer3-point-4.description'],
    'layer3-point-4.lines': ['Syrets Children’s Railway', 'and viaduct'],
    'layer3-park.label': 'Park of Culture and Recreation',
    'layer3-park.description': uk.postwar['layer3-park.description'],
    'layer3-park.lines': ['Park of Culture', 'and Recreation'],
    'layer3-point-1.label': 'Destroyed Jewish Cemetery',
    'layer3-point-1.description': uk.postwar['layer3-point-1.description'],
    'layer3-point-1.lines': ['Destroyed Jewish', 'Cemetery'],
    'layer3-point-2.label': 'Kyiv TV Centre (“the Pencil”)',
    'layer3-point-2.description': uk.postwar['layer3-point-2.description'],
    'layer3-point-2.lines': ['Kyiv TV Centre', '“the Pencil”'],
    'layer3-point-3.label': 'Soviet monument',
    'layer3-point-3.description': uk.postwar['layer3-point-3.description'],
    'postwar-development.overview': [
      'The cemetery grounds were gradually built over. In 1958, some of the graves from the Lukyanivske Jewish Cemetery were moved to the Berkovetske Cemetery. In 1962, the Lukyanivske Jewish, Karaite and Muslim cemeteries were closed, and their demolition began. Some Karaite burials were relocated to the Lukyanivske Cemetery.',
      'From 1964, the cleared land was used for the construction of a sports complex for the Avanhard sports society, with two halls and a swimming pool. A sports school was added in 1969, followed by an indoor ice rink in 1976. By 1980, the Shevchenkivskyi District Park of Culture and Recreation had been established on the former ravine grounds. The former Fraternal and Jewish cemeteries were also built over: the Kyiv TV Tower was erected in 1976, followed by the Kyiv Television Center, also known as ‘the Pencil’, which was constructed from 1983 to the early 1990s.'
    ]
  },
  presentDay: {
    'presentDay.alt': 'Present-day map of the Babyn Yar area',
    'present-day-pois.mapSource': 'Base map of the fourth layer',
    'present-day-pois.listLabel': 'Fourth Layer Sites:',
    'present-day-pois.overview': [
      'In the first years of independence, projects planned during the late Soviet period continued to be developed in Babyn Yar and the surrounding areas. Plans for the Syrets–Pechersk metro line had existed since the 1970s. Its Dorohozhychi station opened in 2000, even though it was built within the area where mass shootings and burials had taken place in 1941–1943. From 2019 to the third quarter of 2021, the UNO City House residential complex was built at 25 Olena Teliha Street, on the site where mass shootings had also taken place.',
      'After the fall of the communist rule and lifting the censorship, but without a coordinated state policy on the commemoration of Babyn Yar, monuments and memorial plaques initiated by various organizations began to appear throughout the area, without an overall plan.',
      'In 1991, during the transition from perestroika to independence, the Menorah and a memorial sign were installed on the site of the former Syrets concentration camp. In 1992, a wooden cross, later replaced with a stone one, was erected with memorial plaques commemorating the OUN(m) members who were killed. In 2017, a monument to writer Olena Teliha was erected near Dorohozhychi metro station.',
      "In 2001, a monument to the children shot at Babyn Yar was unveiled. Not far from the cross commemorating members of the OUN(m), a stele was erected in honor of the Jewish community center ‘Spadshchyna’ (‘Heritage’), which was never built. In 2009, a monument to the underground resistance member Tetiana Markus was erected next to the 1976 Soviet monument. In 2016, the Roma Caravan (Kibitka) was installed on the grounds of the Babyn Yar Preserve, in memory of the victims of the Porajmos, Roma's genocide.",
      'The Babyn Yar Preserve works to keep alive the memory of the destroyed cemeteries that once stood on its territory. In 2017, its workers excavated and partly documented matzevot — Jewish gravestones from the former Jewish Cemetery that had been dumped in Repiakhiv Yar. The stones were placed beside the Road of Sorrow, which runs from Yurii Illienko Street toward the Menorah memorial.',
      "In 2020–2021, the private foundation Babyn Yar Holocaust Memorial Center created several memorial sites and installations on the preserve's grounds.",
      'In September 2020, the installation Mirror Field opened on the site of the former Jewish Cemetery: a forty-meter mirrored disc and columns riddled with bullet holes, from which the names of the dead can be heard.',
      'In May 2021, the symbolic synagogue Place for Reflection, designed by German architect Manuel Herz, was installed at Babyn Yar. The wooden structure unfolds like a book. In October of the same year, the Crystal Wailing Wall, an art object by Serbian artist Marina Abramović, opened at the site. The foundation also created a series of installations called A Look into the Past: wooden telescope-like viewers displaying archival photos, placed at various locations across the city.',
      'In March 2021, a memorial sign by Oleh Shovenko was unveiled in memory of the victims of the Kurenivka Tragedy.',
      'Altogether, between 1991 and 2026, about thirty monuments and memorial plaques were installed at Babyn Yar.'
    ],
    'present-day.title': 'Independent Ukraine: the return of memory'
  },
  wartime: {
    title: '2022 to the present day',
    mapAlt: 'Present-day map of the Babyn Yar area',
    mapSource: 'Base map of the fourth layer',
    listLabel: 'Fifth Layer Sites:',
    overview: [
      'In 2023, the Babyn Yar National Historical Memorial Preserve and the NGO Living Memory revitalized the Avanhard sports complex building and opened the Living Memory Exhibition Center there.',
      'Since then, the center has hosted more than 15 exhibitions and educational projects. They include Babyn Yar: Mirrors of Death; The Invisible. Resilience: The Roma Past and Present; When the World Falls Apart; State of Deception: The Power of Nazi Propaganda, a joint exhibition with the United States Holocaust Memorial Museum; and Ukrainian-Jewish Century: Photos and Stories from 1920 to 2025, created in cooperation with Centropa.',
      'The Exhibition Center also runs a Film Club and a Book Club. The Film Club screens documentaries on related topics in cooperation with the Goethe-Institut, the Institut français and the Polish Institute in Ukraine. The Book Club holds public discussions of important recent books on the Holocaust, Babyn Yar and memory culture.'
    ],
    pois: {
      'living-memory': {
        title: 'The “Living Memory” Exhibition Center',
        description:
          'The “Living Memory” Exhibition Center, operating on the reserve’s grounds and established in 2023 during Russia’s full-scale invasion of Ukraine, serves as a space for dialogue, reflection, and the recognition of the importance of preserving memory. It hosts exhibitions, discussions, and educational projects that analyze historical lessons and their relevance to the present day.',
        alt: 'The Living Memory Exhibition Center building'
      },
      'missile-strike': {
        title: 'Site of the Russian Missile Strike',
        description:
          'At 5:08 p.m. on 1 March 2022, a Russian missile aimed at the Kyiv TV Tower struck the grounds of the Babyn Yar National Historical and Memorial Reserve, a site that bears witness to one of the largest massacres of the Holocaust in Europe.\n\nFive civilians were killed in the attack, including an 11-year-old child.',
        alt: 'Explosion near the Kyiv TV Tower on 1 March 2022'
      }
    }
  }
} satisfies HistoryMapCopy
