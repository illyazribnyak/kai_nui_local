/**
 * Server-rolled random events for each turn.
 * Injected into the GM prompt so the island feels alive (raids, ambushes, finds…).
 */

export type EventCategory =
  | 'combat'
  | 'raid'
  | 'discovery'
  | 'npc'
  | 'weather'
  | 'sex'
  | 'mystery'
  | 'survival'
  | 'social'
  | 'calm'

export type EventSeverity = 'minor' | 'moderate' | 'major' | 'deadly'

export type RandomEventDef = {
  id: string
  title: string
  category: EventCategory
  severity: EventSeverity
  /** Relative pick weight (higher = more common when eligible) */
  weight: number
  /** Location name substrings; empty/omit = almost anywhere */
  locations?: string[]
  excludeLocations?: string[]
  /** If set, only these times of day */
  timeOfDay?: Array<'morning' | 'day' | 'evening' | 'night'>
  /** Prefer when chapter id matches (still can roll elsewhere if weight low) */
  chapters?: string[]
  /** Short player-facing hook */
  hook: string
  /** Mandatory GM staging notes */
  gm: string
  /** Suggested tags (narrative reminder) */
  tags?: string
}

export type EventRollContext = {
  location: string
  chapter?: string | null
  timeOfDay?: string | null
  weather?: string | null
  mode?: 'adventure' | 'dialogue' | 'combat' | 'sex'
  /** Player message this turn */
  message?: string
  dayNumber?: number | null
  companionName?: string | null
  isDarkLara?: boolean
  /** Avoid immediate repeats */
  recentIds?: string[]
}

export type RolledEvent = {
  event: RandomEventDef
  /** d20 flavour for the narrative */
  d20: number
  forced: boolean
}

// ─── Catalog ───────────────────────────────────────────────────────────────

export const RANDOM_EVENTS: RandomEventDef[] = [
  // ===== HYENOIDS =====
  {
    id: 'hyena_ambush',
    title: 'Засідка гієноїдів',
    category: 'combat',
    severity: 'major',
    weight: 14,
    locations: ['джунгл', 'гієноїд', 'мангров', 'болот'],
    hook: 'З кущів лунає сміх-скавчання — патруль гієноїдів бере в кільце.',
    gm: '2–4 гієноїдки/самці. Ініціатива d20+Спритність. Можуть пропонувати здачу в «гарем» замість бою. Desire + від феромонів.',
    tags: 'REL met гієноїд, TRIBE_UPDATE Гієноїди ±, можливий SEX_SCENE_START coercion',
  },
  {
    id: 'hyena_scouts',
    title: 'Розвідниці Кіри',
    category: 'combat',
    severity: 'moderate',
    weight: 12,
    locations: ['джунгл', 'гієноїд', 'гора', 'храм'],
    hook: 'Дві гієноїдки-розвідниці стежили за Ларою; тепер виходять назустріч.',
    gm: 'Не одразу бій — допит, оцінка сили. Якщо Лара слабка — зв\'яжуть. Якщо сильна — поважають, ведуть до Кіри.',
    tags: 'FACT other_tribe_contact / met_kira path',
  },
  {
    id: 'hyena_pheromones',
    title: 'Хмара феромонів',
    category: 'sex',
    severity: 'moderate',
    weight: 10,
    locations: ['гієноїд', 'джунгл'],
    hook: 'Повітря густе від мускусу гієноїдів — коліна м\'якшають, думки пливуть.',
    gm: 'Desire +15–25. Воля d20 проти DC 14. Провал = імпульсивні дії / легше підкорення. Не обов\'язково бій.',
    tags: 'STAT desire↑, можливий DISEASE або стан «під феромонами»',
  },
  {
    id: 'hyena_zek_flee',
    title: 'Зек тікає через хащі',
    category: 'npc',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'гієноїд', 'мангров', 'руїн', 'берег'],
    hook: 'З кущів вискакує переляканий самець-гієноїд — Зек, ВІДСТУПНИК зі стаї Кіри.',
    gm: 'Він УЖЕ вийшов зі стаї (не заблукав). Просить захисту, може запропонувати тіло/секрет стежок. Death-scent — мисливці близько. QUEST «Зустріч із відступником» / «Звільни Зека». REL Зек met:true.',
    tags: 'FACT met_zek, QUEST_UPDATE add, REL Зек',
  },
  {
    id: 'zek_escape_traces',
    title: 'Сліди відступника',
    category: 'discovery',
    severity: 'moderate',
    weight: 8,
    locations: ['джунгл', 'гієноїд', 'мангров', 'руїн'],
    hook: 'Порваний шкіряний нашийник із міткою стаї, пазурі в паніці, сеча-мітка «я більше не ваш».',
    gm: 'FACT zek_escape_clue. QUEST «Сліди відступника». Не одразу met_zek — можна лише натяк. Кай-Тору могли бачити «пса без стаї».',
    tags: 'FACT zek_escape_clue, QUEST',
  },
  {
    id: 'zek_hunters_ambush',
    title: 'Мисливці за відступником',
    category: 'combat',
    severity: 'major',
    weight: 9,
    locations: ['джунгл', 'гієноїд', 'мангров', 'руїн', 'кай-тору'],
    hook: 'Гієноїдки-мисливці йдуть по death-scent — полюють на Зека, не на вас (поки що).',
    gm: 'Якщо Зек companion/поруч — бій або переговори. Можна видати його (zek_betrayed) або захистити (zek_protected). FACT zek_hunters. Феромони, вузли, матріархатний тон.',
    tags: 'FACT zek_hunters, combat/social',
  },
  {
    id: 'zek_death_scent_flare',
    title: 'Спалах запаху смерті',
    category: 'mystery',
    severity: 'moderate',
    weight: 6,
    locations: ['джунгл', 'гієноїд', 'печер', 'руїн'],
    hook: 'Амулет/ніс вловлює різкий «мертвий» феромон — мітка вигнанця. Стая чує те саме.',
    gm: 'Якщо Зек уже відомий — нагадування про death-scent. Інакше — загадка. Шлях до «Зняти мітку» / Найя.',
    tags: 'FACT zek_death_scent path',
  },
  {
    id: 'zek_offers_body',
    title: 'Зек платить тілом',
    category: 'sex',
    severity: 'moderate',
    weight: 7,
    locations: ['джунгл', 'руїн', 'печер', 'мангров', 'лагуна'],
    hook: 'Зек, тремтячи, пропонує себе — «бери, лише не віддавай Кірі». Вузол, замок, вдячність-жах.',
    gm: 'Добровільно з його боку, але з відчаю. FACT zek_first_intimacy / zek_knot_bond / zek_begs_protection. QUEST «Ціна тіла». Bond+, desire. Опиши анатомію гієноїда ♂ (вузол). Не обов\'язково приймати.',
    tags: 'SEX optional, FACT zek_first_intimacy, REL Зек, knot/lock',
  },
  {
    id: 'kira_ultimatum_zek',
    title: 'Ультиматум Кіри за Зека',
    category: 'npc',
    severity: 'major',
    weight: 6,
    locations: ['гієноїд', 'джунгл', 'руїн', 'мангров'],
    hook: 'Гінці або сама Кіра: «Віддай пса. Або увійдеш у гарем замість нього.»',
    gm: 'Лише якщо met_zek і Зек ще не returned/dead. FACT kira_demands_zek / kira_trade_for_zek. QUEST «Ультиматум Кіри». Може вести до zek_kira_confront / hyena_pact. Тиск, феромони, матріархатний тон.',
    tags: 'FACT kira_demands_zek, QUEST, REL Кіра',
  },
  {
    id: 'zek_saves_in_ambush',
    title: 'Зек кидається під удар',
    category: 'combat',
    severity: 'major',
    weight: 5,
    locations: ['джунгл', 'гієноїд', 'руїн', 'мангров', 'печер'],
    hook: 'Засідка! Зек з виттям кидається між Ларою і ударом — не як герой, а як той, кому вже нічого втрачати.',
    gm: 'Якщо Зек companion/поруч. FACT zek_saves_lara, bond↑. Може поранитись. Не робіть його супер-воїном — страх + відчай. Далі мисливці/подяка/секс-вдячність.',
    tags: 'FACT zek_saves_lara, combat, REL Зек',
  },
  {
    id: 'hyena_raid_kai_toru',
    title: 'Рейд гієноїдів на Кай-Тору',
    category: 'raid',
    severity: 'deadly',
    weight: 11,
    locations: ['кай-тору', 'селищ'],
    hook: 'Крики з краю селища: гієноїди рейдують! Жінки тягнуть дітей, воїни хапають списи.',
    gm: 'Живий бій у селищі. Тане/Макаї/мисливці в сцені. Лара може битися, тікати, торгувати полоненими, врятувати когось. TRIBE ± обидва племена. Велика сюжетна подія.',
    tags: 'TRIBE_UPDATE Кай-Тору+, Гієноїди-, ACHIEVEMENT можливий, FACT hyena_raid_kai_toru',
  },

  // ===== BOAR / SWINE =====
  {
    id: 'boar_ambush',
    title: 'Напад свинолюдів',
    category: 'combat',
    severity: 'major',
    weight: 14,
    locations: ['болот', 'свинолюд', 'джунгл', 'мангров', 'лагуна'],
    hook: 'З багна піднімаються силуети з іклами — свинолюди хочуть трофей.',
    gm: 'Брудно, смердить, ризик DISEASE. Грух або патруль. Примус/трофей якщо програш. d20 бій або втеча.',
    tags: 'FACT met_gruh / entered_boar path, DISEASE можлива',
  },
  {
    id: 'boar_hunting_party',
    title: 'Мисливці Груха',
    category: 'combat',
    severity: 'major',
    weight: 10,
    locations: ['болот', 'джунгл', 'берег', 'мангров'],
    hook: 'Свинолюдський загін жене здобич — і Лара опинилась на їхньому шляху.',
    gm: 'Можна сховатись (Спритність), відволікти, битися. Якщо схоплять — ведуть у болота.',
    tags: 'combat or capture branch',
  },
  {
    id: 'boar_raid_kai_toru',
    title: 'Напад свинолюдів на Кай-Тору',
    category: 'raid',
    severity: 'deadly',
    weight: 10,
    locations: ['кай-тору', 'селищ'],
    hook: 'Рев і смрад: свинолюди вломились у селище! Палають плетені хати, кричать жінки.',
    gm: 'Хаос. Макаї командує обороною. Лея/Тане під загрозою. Лара — ключ до перемоги або ганьби. Репутація Кай-Тору сильно залежить від її дій. Не робіть це «фоном».',
    tags: 'FACT boar_raid_kai_toru, TRIBE_UPDATE, QUEST захист селища',
  },
  {
    id: 'boar_sow_trade',
    title: 'Свиноматка на стежці',
    category: 'npc',
    severity: 'moderate',
    weight: 7,
    locations: ['болот', 'свинолюд', 'джунгл'],
    hook: 'Стара Свиноматка з обозом «товару» блокує стежку — пропонує угоду.',
    gm: 'Торг: прохід/захист/інфо за тіло, їжу, артефакт. Не обов\'язково бій. Хитра, не тупа.',
    tags: 'FACT met_sow_matron, boar_trade_deal path',
  },

  // ===== OTHER TRIBES / RAIDS =====
  {
    id: 'centaur_patrol',
    title: 'Патруль кентаврів',
    category: 'npc',
    severity: 'moderate',
    weight: 9,
    locations: ['кентавр', 'джунгл', 'луг', 'гора'],
    hook: 'Грім копит: патруль кентаврів перетинає шлях. Ксерон або молоді жеребці.',
    gm: 'Горді, дистанція. Можуть вимагати змагання або супроводити з території. Не «зґвалтування одразу».',
    tags: 'FACT entered_centaur / met_xeron',
  },
  {
    id: 'minotaur_war_band',
    title: 'Військовий загін мінотаврів',
    category: 'combat',
    severity: 'deadly',
    weight: 8,
    locations: ['мінотавр', 'лабіринт', 'руїн', 'джунгл', 'гора'],
    hook: 'Земля труситься — мінотаври на рейді. Роги, важкі сокири, запах крові.',
    gm: 'Дуже небезпечно. Краще ховатись/домовлятись. Міра може бути в загоні як розвідниця-ренегат.',
    tags: 'combat DC high',
  },
  {
    id: 'kai_toru_war_party',
    title: 'Військовий загін Кай-Тору',
    category: 'social',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'мангров', 'водоспад', 'берег', 'руїн'],
    hook: 'Зустрічаєте загін воїнів Кай-Тору — йдуть у рейд або повертаються з полювання.',
    gm: 'Можуть упізнати «чужинку», відвести в селище, вимагати секс/повинність, або Тане серед них.',
    tags: 'REL / QUEST Піти з Тане',
  },
  {
    id: 'inter_tribe_skirmish',
    title: 'Бійка двох племен',
    category: 'raid',
    severity: 'major',
    weight: 8,
    locations: ['джунгл', 'болот', 'гієноїд', 'кентавр', 'мангров'],
    hook: 'Ви натрапляєте на сутичку: два племена б\'ються за стежку/воду/полонених.',
    gm: 'Лара може обрати бік, пограбувати поле бою, врятувати полоненого, або пройти непоміченою. Живий світ.',
    tags: 'TRIBE_UPDATE обидва ±',
  },

  // ===== PREDATORS / MONSTERS =====
  {
    id: 'predator_big_cat',
    title: 'Великий хижак',
    category: 'combat',
    severity: 'major',
    weight: 11,
    locations: ['джунгл', 'мангров', 'гора', 'печер'],
    excludeLocations: ['селищ', 'кай-тору'],
    hook: 'У хащі спалахують очі — великий хижак (ягуар/тіньова пантера) полює на вас.',
    gm: 'Бій або Спритність втечі. Успіх = шкіра/м\'ясо в INV. Провал = рана, DISEASE ризик.',
    tags: 'INV, ACHIEVEMENT Вбивця хижака',
  },
  {
    id: 'snake_strike',
    title: 'Змія в листі',
    category: 'survival',
    severity: 'moderate',
    weight: 10,
    locations: ['джунгл', 'мангров', 'руїн', 'болот'],
    hook: 'Шипіння — отруйна змія біля щиколотки.',
    gm: 'Спритність DC 12 ухил. Провал = DISEASE отрута, Сила/Витривалість −.',
    tags: 'DISEASE_ADD',
  },
  {
    id: 'root_spirit',
    title: 'Корінь-Дух',
    category: 'mystery',
    severity: 'deadly',
    weight: 6,
    locations: ['джунгл', 'мангров', 'руїн', 'печер'],
    timeOfDay: ['evening', 'night'],
    hook: 'Ліани ворушаться самі — Корінь-Дух хоче обплутати й поглинути.',
    gm: 'Жах / еротичний боді-хорор. Сила/амулет/вогонь. Ризик спор-паразита 20%.',
    tags: 'DISEASE спори, amulet reaction',
  },
  {
    id: 'shadow_beast',
    title: 'Тіньовий Звір (Ша-Кар)',
    category: 'mystery',
    severity: 'deadly',
    weight: 4,
    locations: ['печер', 'руїн', 'храм', 'гора'],
    timeOfDay: ['night', 'evening'],
    hook: 'Тінь відривається від стіни — Ша-Кар шепоче і тягне спогади.',
    gm: 'Ризик втрати пам\'яті (FACT або notes). Воля DC 16. Не вбивається звичайною зброєю легко.',
    tags: 'mystery, will save',
  },
  {
    id: 'harpy_swoop',
    title: 'Наліт гарпій',
    category: 'combat',
    severity: 'major',
    weight: 7,
    locations: ['гора', 'берег', 'північ', 'храм', 'скел'],
    hook: 'З неба — крик гарпій. Кігті, лесбі-агресія, ризик яйця-паразита.',
    gm: 'Повітряний бій. 30% яйце-паразит при програші/сексі. DISEASE.',
    tags: 'DISEASE яйце гарпії',
  },
  {
    id: 'waterfall_demon',
    title: 'Демон водоспаду',
    category: 'sex',
    severity: 'deadly',
    weight: 5,
    locations: ['водоспад', 'лагуна'],
    hook: 'Вода темнішає — демон водоспаду тягне вниз, гіпертрофований фалос, утримання під водою.',
    gm: 'Витривалість/Сила. Секс-небезпека + утоплення. Амулет може втрутитись.',
    tags: 'SEX + survival',
  },
  {
    id: 'golem_scan',
    title: 'Кам\'яний голем',
    category: 'mystery',
    severity: 'moderate',
    weight: 5,
    locations: ['руїн', 'храм', 'печер', 'гора'],
    hook: 'Кам\'яна фігура «сканує» тіло Лари холодними руками — принизливо, не сексуально за primarу.',
    gm: 'Сором +, можливий секрет руїн. Не обов\'язково бій.',
    tags: 'STAT shame, secret',
  },

  // ===== SURVIVAL / WEATHER =====
  {
    id: 'storm_break',
    title: 'Раптовий шторм',
    category: 'weather',
    severity: 'moderate',
    weight: 10,
    hook: 'Небо чорніє за хвилини — тропічний шторм б\'є по острову.',
    gm: 'STAT weather:storm. −2 до кидків. Шукати укриття. Ризик травми від гілок.',
    tags: 'STAT weather',
  },
  {
    id: 'heatwave',
    title: 'Спека',
    category: 'weather',
    severity: 'minor',
    weight: 9,
    timeOfDay: ['day', 'morning'],
    hook: 'Повітря тремтить від спеки. Спрага ріже горло.',
    gm: 'thirst +10–15, weather:heat. Потрібна вода або тінь.',
    tags: 'STAT thirst weather',
  },
  {
    id: 'dense_fog',
    title: 'Густий туман',
    category: 'weather',
    severity: 'moderate',
    weight: 8,
    timeOfDay: ['morning', 'evening', 'night'],
    hook: 'Туман з\'їдає стежки — легко заблукати або вийти не туди.',
    gm: 'Можлива «випадкова» зміна локації. −2 огляд. Засідки ймовірніші.',
    tags: 'STAT weather:fog, location risk',
  },
  {
    id: 'quicksand',
    title: 'Трясовина',
    category: 'survival',
    severity: 'major',
    weight: 8,
    locations: ['болот', 'мангров'],
    hook: 'Ноги йдуть у багно — трясовина затягує.',
    gm: 'Сила/Спритність DC 13. Провал = потреба допомоги, втрата предмета, або «рятівник» (небезпечний).',
    tags: 'INV risk',
  },
  {
    id: 'insect_swarm',
    title: 'Рій комах',
    category: 'survival',
    severity: 'minor',
    weight: 9,
    locations: ['джунгл', 'болот', 'мангров', 'лагуна'],
    hook: 'Хмара кусючих комах атакує відкриту шкіру.',
    gm: 'дрібна шкода, desire− або +irritation, ризик лихоманки (DISEASE).',
    tags: 'DISEASE ризик',
  },
  {
    id: 'poison_fruit',
    title: 'Отруйний плід',
    category: 'survival',
    severity: 'moderate',
    weight: 7,
    locations: ['джунгл', 'мангров', 'лагуна'],
    hook: 'Яскраві плоди виглядають їстівними — чи це пастка острова?',
    gm: 'Якщо їсть без перевірки — отруєння. Знання/амулет можуть попередити. Або aphrodisiac fruit (desire+).',
    tags: 'INV / DISEASE / desire',
  },
  {
    id: 'night_drums',
    title: 'Нічні барабани',
    category: 'mystery',
    severity: 'minor',
    weight: 8,
    timeOfDay: ['night', 'evening'],
    hook: 'З глибини острова б\'ють барабани — ритуал, війна чи заклик духів?',
    gm: 'Атмосфера. Амулет теплішає. Можна йти на звук (нова сцена) або ігнорувати.',
    tags: 'atmosphere, amulet',
  },

  // ===== DISCOVERY =====
  {
    id: 'find_food',
    title: 'Знахідка їжі',
    category: 'discovery',
    severity: 'minor',
    weight: 14,
    excludeLocations: ['селищ'],
    hook: 'Пощастило: фрукти, яйця, рибна мілина або залишки чужого багаття з їжею.',
    gm: 'INV_UPDATE add їжа. Можливий FACT found_food.',
    tags: 'INV їжа',
  },
  {
    id: 'find_water',
    title: 'Джерело води',
    category: 'discovery',
    severity: 'minor',
    weight: 12,
    excludeLocations: ['селищ', 'водоспад', 'лагуна'],
    hook: 'Чути воду — джерело, калюжа після дощу або ліана з вологою.',
    gm: 'thirst↓, можливий INV вода, FACT found_fresh_water.',
    tags: 'STAT thirst, INV',
  },
  {
    id: 'find_weapon',
    title: 'Загублена зброя',
    category: 'discovery',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'руїн', 'берег', 'печер', 'болот'],
    hook: 'У багні/піску — спис, ніж або обсидіанове лезо.',
    gm: 'INV зброя. Може належати племені (ризик, якщо побачать).',
    tags: 'INV зброя, FACT found_weapon',
  },
  {
    id: 'find_herbs',
    title: 'Лікарські трави',
    category: 'discovery',
    severity: 'minor',
    weight: 10,
    locations: ['джунгл', 'гора', 'водоспад', 'мангров'],
    hook: 'Пізнавані (або ні) трави — ліки, протиотрута, або афродизіак.',
    gm: 'INV ресурс. Найя могла б упізнати. Крафт.',
    tags: 'INV ресурс',
  },
  {
    id: 'ancient_carving',
    title: 'Давні різьблення',
    category: 'discovery',
    severity: 'moderate',
    weight: 8,
    locations: ['руїн', 'печер', 'храм', 'гора'],
    hook: 'На камені — символи Атлантиди. Амулет вібрує.',
    gm: 'Підказка до храму/скарбу. amuletEnergy+. FACT learned hint. Не повний spoiler кінцівки.',
    tags: 'amulet, secret',
  },
  {
    id: 'pearl_cache',
    title: 'Схованка перлин',
    category: 'discovery',
    severity: 'moderate',
    weight: 6,
    locations: ['лагуна', 'берег', 'руїн', 'печер'],
    hook: 'У розколині блищать перлини — валюта острова.',
    gm: 'INV перлини. Хтось може стежити.',
    tags: 'INV',
  },
  {
    id: 'jack_camp_signs',
    title: 'Сліди табору Джека',
    category: 'discovery',
    severity: 'moderate',
    weight: 7,
    locations: ['руїн', 'джунгл', 'берег', 'мангров'],
    hook: 'Окурки? Ні — гільзи немає, але є сучасний ніж і сліди європейських черевиків.',
    gm: 'FACT jack_wreck_clue. QUEST Сліди Джека / Знайти провідника. Не обов\'язково одразу met_jack.',
    tags: 'FACT jack_wreck_clue, QUEST',
  },
  {
    id: 'secret_path',
    title: 'Таємна стежка',
    category: 'discovery',
    severity: 'moderate',
    weight: 8,
    locations: ['джунгл', 'гора', 'руїн', 'мангров'],
    hook: 'За ліанами — стежка, якої немає на жодній карті Джека.',
    gm: 'Може вести до нової локації, засідки або коротшого шляху. Гравець обирає.',
    tags: 'location discovery',
  },
  {
    id: 'amulet_surge',
    title: 'Спалах амулета',
    category: 'mystery',
    severity: 'moderate',
    weight: 9,
    hook: 'Амулет раптом пече груди — видіння, карта, обличчя Араху або чужий оргазм десь на острові.',
    gm: 'amuletEnergy±, desire±, коротка візія-підказка. FACT amulet_awakened якщо ще немає.',
    tags: 'STAT amuletEnergy, FACT',
  },

  // ===== NPC / SOCIAL =====
  {
    id: 'wounded_warrior',
    title: 'Поранений воїн',
    category: 'npc',
    severity: 'moderate',
    weight: 8,
    locations: ['джунгл', 'мангров', 'берег', 'болот', 'руїн'],
    hook: 'Біля стежки стогне поранений — свій чи чужий?',
    gm: 'Допомога = bond/rep+. Добити/пограбувати = dark path. Може бути приманкою.',
    tags: 'REL / TRIBE / dark',
  },
  {
    id: 'merchant_traveler',
    title: 'Мандрівний торговець',
    category: 'social',
    severity: 'minor',
    weight: 7,
    locations: ['джунгл', 'селищ', 'кай-тору', 'берег', 'руїн'],
    hook: 'Рідкісний торговець (або кай-тору з мішком) пропонує обмін.',
    gm: 'Торгівля INV. Ціни від репутації. Може продати чутки про Джека/храм.',
    tags: 'INV trade',
  },
  {
    id: 'tane_appears',
    title: 'Тане на стежці',
    category: 'npc',
    severity: 'minor',
    weight: 8,
    locations: ['джунгл', 'водоспад', 'кай-тору', 'мангров', 'лагуна'],
    hook: 'Тане виходить з хащі — ніби «випадково» шукав вас (або полював).',
    gm: 'Теплий NPC beat. REL bond±. Може дати їжу/запрошення в селище. Не бій.',
    tags: 'REL Тане, QUEST селище',
  },
  {
    id: 'leya_jealous',
    title: 'Лея стежить',
    category: 'social',
    severity: 'moderate',
    weight: 7,
    locations: ['джунгл', 'кай-тору', 'селищ', 'водоспад'],
    hook: 'Лея з\'являється з ревнивою посмішкою — чула про вас і Тане/Джека.',
    gm: 'Соціальний конфлікт, флірт-пастка, союз або суперництво. FACT leya_rivalry path.',
    tags: 'REL Лея',
  },
  {
    id: 'jack_smoke',
    title: 'Дим багаття Джека',
    category: 'npc',
    severity: 'moderate',
    weight: 7,
    locations: ['руїн', 'джунгл', 'берег', 'північ'],
    hook: 'Тонкий стовп диму — хтось цивілізований розводить багаття.',
    gm: 'Шанс met_jack. Цинічний діалог. Угода/карта. Не плутати з пасткою племен.',
    tags: 'FACT met_jack, QUEST Угода з Джеком',
  },
  {
    id: 'makai_summons',
    title: 'Гінці Макаї',
    category: 'social',
    severity: 'moderate',
    weight: 6,
    locations: ['кай-тору', 'селищ', 'джунгл'],
    hook: 'Гінці вождя: Макаї кличе чужинку. Відмова = образа.',
    gm: 'Квест Право чужинки / аудієнція. Тиск, не одразу секс-сцена без сцени.',
    tags: 'QUEST, REL Макаї',
  },
  {
    id: 'naya_omen',
    title: 'Знак Найї',
    category: 'mystery',
    severity: 'minor',
    weight: 6,
    locations: ['кай-тору', 'храм', 'гора', 'печер', 'руїн'],
    hook: 'Пір\'я, кістки й запах трав — Найя лишила знак або кличе у видінні.',
    gm: 'Шлях до шаманки/амулета. spoke_with_naya path.',
    tags: 'FACT / QUEST Найя',
  },
  {
    id: 'fertility_festival',
    title: 'Свято родючості',
    category: 'sex',
    severity: 'moderate',
    weight: 6,
    locations: ['кай-тору', 'селищ'],
    timeOfDay: ['evening', 'night'],
    hook: 'У селищі свято: барабани, тіла, вино, ритуальний секс під відкритим небом.',
    gm: 'Соціально-еротична сцена. Desire+. Можна взяти участь, спостерігати, відмовитись (ціна репутації).',
    tags: 'SEX optional, TRIBE, desire',
  },
  {
    id: 'patrol_proposition',
    title: 'Патруль «хоче познайомитись»',
    category: 'sex',
    severity: 'moderate',
    weight: 10,
    locations: ['джунгл', 'кай-тору', 'селищ', 'водоспад'],
    hook: 'Патруль Кай-Тору (або змішаний) блокує шлях і явно хоче сексу — за звичаєм, не за «згодою» Заходу.',
    gm: 'Перевірка Сили/Харизми/втечі або сцена. Не роби всіх патрулів однаковими.',
    tags: 'SEX / combat / social',
  },
  {
    id: 'aphrodisiac_pollen',
    title: 'Пилок бажання',
    category: 'sex',
    severity: 'minor',
    weight: 8,
    locations: ['джунгл', 'лагуна', 'храм', 'мангров'],
    hook: 'Квіти розкриваються — золотий пилок сідає на шкіру. Тіло палає.',
    gm: 'Desire +20. Може зірвати план «просто пройти». Амулет радіє.',
    tags: 'STAT desire',
  },

  // ===== VILLAGE LIFE =====
  {
    id: 'village_feast',
    title: 'Бенкет у селищі',
    category: 'social',
    severity: 'minor',
    weight: 8,
    locations: ['кай-тору', 'селищ'],
    hook: 'Сьогодні бенкет: м\'ясо, фрукти, танці. Вас штовхають до кола.',
    gm: 'hunger/thirst↓, social, можливий секс/конфлікт з Леєю.',
    tags: 'STAT, REL',
  },
  {
    id: 'thief_in_hut',
    title: 'Злодій у селищі',
    category: 'social',
    severity: 'moderate',
    weight: 6,
    locations: ['кай-тору', 'селищ'],
    hook: 'Кричать: у хаті вкрали амулет/їжу/спис — звинувачують чужинку або справжнього злодія.',
    gm: 'Соціальне розслідування. d20 Харизма/Спритність. Репутація на кону.',
    tags: 'TRIBE, INV',
  },
  {
    id: 'child_follows',
    title: 'Дитина племені',
    category: 'social',
    severity: 'minor',
    weight: 6,
    locations: ['кай-тору', 'селищ'],
    hook: 'Маленька дитина тягне Лару за руку — хоче показати «секрет» (або заманює).',
    gm: 'Милий beat або пастка дорослих. Не сексуалізувати дитину — секрет = печера/їжа/дорослий NPC.',
    tags: 'social only',
  },

  // ===== CALM / POSITIVE =====
  {
    id: 'peaceful_travel',
    title: 'Спокійна путь',
    category: 'calm',
    severity: 'minor',
    weight: 16,
    hook: 'Стежка тиха. Лише птахи, волога зелень і власне дихання.',
    gm: 'Коротка атмосферна проза. Не вигадуй бій. Можна дрібну деталь світу. hunger/thirst трохи ↑.',
    tags: 'STAT survival tick only',
  },
  {
    id: 'beautiful_vista',
    title: 'Краєвид',
    category: 'calm',
    severity: 'minor',
    weight: 10,
    locations: ['гора', 'берег', 'водоспад', 'храм', 'північ'],
    hook: 'Відкривається краєвид острова — нагадування, навіщо ви тут.',
    gm: 'Краса + орієнтація на мапі (підказка локацій). confidence +1–3 optional.',
    tags: 'atmosphere',
  },
  {
    id: 'companion_talk',
    title: 'Розмова з компаньйоном',
    category: 'calm',
    severity: 'minor',
    weight: 12,
    hook: 'Компаньйон заводить розмову — спогад, попередження або ревнощі.',
    gm: 'Тільки якщо є companion. Інакше перекинь на внутрішній монолог/амулет. REL bond.',
    tags: 'REL companion',
  },
  {
    id: 'friendly_animal',
    title: 'Не agресивна істота',
    category: 'calm',
    severity: 'minor',
    weight: 8,
    locations: ['джунгл', 'лагуна', 'берег', 'мангров'],
    hook: 'Маленька істота (лемур/птах/ящірка) не тікає — дивиться з цікавістю.',
    gm: 'Милий beat. Не бій. Може привести до знахідки.',
    tags: 'atmosphere',
  },

  // ===== TEMPLE / LATE =====
  {
    id: 'temple_guardians',
    title: 'Духи-охоронці храму',
    category: 'mystery',
    severity: 'major',
    weight: 9,
    locations: ['храм'],
    hook: 'Фантомні руки й голоси торкаються шкіри — охоронці випробовують чужинку.',
    gm: 'Психоделія + можливий секс-енергія. amulet key. Не одразу treasure_found.',
    tags: 'amulet, sex magic',
  },
  {
    id: 'dark_whisper',
    title: 'Темний шепіт',
    category: 'mystery',
    severity: 'moderate',
    weight: 5,
    hook: 'Голос у голові пропонує силу — знищити, підкорити, стати королевою.',
    gm: 'Темна Лара seed. isDarkLara path. desire/shame/confidence mix.',
    tags: 'FACT dark_lara path',
  },
  {
    id: 'earth_tremor',
    title: 'Тремтіння землі',
    category: 'mystery',
    severity: 'moderate',
    weight: 6,
    locations: ['гора', 'храм', 'печер', 'руїн', 'лабіринт'],
    hook: 'Острів здригається — ніби Скарб дихає в глибині.',
    gm: 'Ознака близькості до кульмінації. Печери можуть відкритись/обвалитись.',
    tags: 'plot pressure',
  },

  // ===== BEACH / LAGOON / MANGROVE =====
  {
    id: 'wreck_debris',
    title: 'Уламки корабля',
    category: 'discovery',
    severity: 'moderate',
    weight: 11,
    locations: ['берег', 'лагуна', 'північ', 'мангров'],
    hook: 'Хвиля викидає уламки — дошка з чужою мовою, скриня, мотузка, пляшка.',
    gm: 'INV ресурс/інструмент. Можливий натяк на Джека або інших «ззовні». hunger не знімає.',
    tags: 'INV, jack_wreck_clue path',
  },
  {
    id: 'tidal_trap',
    title: 'Пастка припливу',
    category: 'survival',
    severity: 'moderate',
    weight: 9,
    locations: ['берег', 'лагуна', 'мангров'],
    hook: 'Вода піднімається швидше, ніж здавалось — відрізає шлях назад.',
    gm: 'Спритність/Сила DC 12–14. Провал = мокрий, втрата предмета, ніч на мілині, або рятівник (NPC).',
    tags: 'STAT, INV risk',
  },
  {
    id: 'shark_fin',
    title: 'Плавець у воді',
    category: 'combat',
    severity: 'major',
    weight: 7,
    locations: ['берег', 'лагуна', 'північ'],
    hook: 'У хвилях — плавець. Не обов\'язково акула… але близько.',
    gm: 'Якщо Лара в воді — небезпека. На березі — напруга/рибалка з ризиком. Не вигадуй скарб одразу.',
    tags: 'combat optional',
  },
  {
    id: 'coconut_crab',
    title: 'Крабова засідка',
    category: 'combat',
    severity: 'minor',
    weight: 10,
    locations: ['берег', 'лагуна', 'мангров'],
    hook: 'Величезний кокосовий краб клацає клешнями біля припасів.',
    gm: 'Короткий бій/втеча. Перемога = м\'ясо (INV їжа). Комічний тон ок.',
    tags: 'INV їжа',
  },
  {
    id: 'message_bottle',
    title: 'Пляшка з посланням',
    category: 'discovery',
    severity: 'minor',
    weight: 8,
    locations: ['берег', 'лагуна', 'північ'],
    hook: 'Скляна пляшка в піску — всередині клаптик шкіри з малюнком стежок.',
    gm: 'Підказка локації (не повний спойлер храму). Або жарт Джека.',
    tags: 'discovery, map hint',
  },
  {
    id: 'mangrove_whispers',
    title: 'Голоси в манграх',
    category: 'mystery',
    severity: 'moderate',
    weight: 8,
    locations: ['мангров'],
    timeOfDay: ['evening', 'night'],
    hook: 'Між корінням хтось шепоче ім\'ям Лари — або імітує його.',
    gm: 'Може бути дух, гієноїд, або відлуння амулета. Напруга, не одразу бій.',
    tags: 'mystery',
  },

  // ===== JUNGLE EXTRA =====
  {
    id: 'hunter_trap',
    title: 'Мисливська пастка',
    category: 'survival',
    severity: 'moderate',
    weight: 12,
    locations: ['джунгл', 'мангров', 'болот'],
    hook: 'Під ногою — петля/ями з кілками. Хтось полює тут регулярно.',
    gm: 'Спритність DC 13. Провал = рана, thirst/hunger+, кульгавість. Успіх = можна переробити пастку (INV).',
    tags: 'DISEASE risk, INV',
  },
  {
    id: 'spider_nest',
    title: 'Гніздо павуків',
    category: 'survival',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'печер', 'руїн'],
    hook: 'Павутиння товсте, як мотузки. Щось велике ворушиться всередині.',
    gm: 'Бій або обхід. Отрута = DISEASE. Рідкісний шовк як ресурс.',
    tags: 'DISEASE, INV ресурс',
  },
  {
    id: 'falling_tree',
    title: 'Падаюче дерево',
    category: 'survival',
    severity: 'major',
    weight: 7,
    locations: ['джунгл', 'мангров'],
    timeOfDay: ['day', 'evening'],
    hook: 'Тріск — гігантський стовбур валиться просто на стежку.',
    gm: 'Спритність DC 14. Провал = травма. Успіх = шлях перекрито, треба обхід (нова міні-локація).',
    tags: 'combat avoidance',
  },
  {
    id: 'glowing_mushrooms',
    title: 'Сяючі гриби',
    category: 'discovery',
    severity: 'minor',
    weight: 10,
    locations: ['джунгл', 'печер', 'мангров'],
    timeOfDay: ['evening', 'night'],
    hook: 'Гриби світяться блакитним — їжа, отрута, галюциноген чи заряд амулета?',
    gm: 'd20 знання/інтуїція. Ефекти: desire+, видіння, отруєння, або безпечний перекус.',
    tags: 'INV, STAT, mystery',
  },
  {
    id: 'monkeys_steal',
    title: 'Мавпи-злодії',
    category: 'social',
    severity: 'minor',
    weight: 11,
    locations: ['джунгл', 'мангров', 'гора'],
    hook: 'Зграя мавп кидає горіхи й тягне блискуче з інвентаря.',
    gm: 'Можуть вкрасти дрібний INV (не амулет). Погоня комічна або втрата. Не смертельно.',
    tags: 'INV remove risk',
  },
  {
    id: 'obsidian_shard',
    title: 'Обсидіановий уламок',
    category: 'discovery',
    severity: 'minor',
    weight: 9,
    locations: ['джунгл', 'гора', 'руїн', 'печер'],
    hook: 'У землі блищить чорне скло — ідеальне вістря.',
    gm: 'INV ресурс/зброя (ножик). Крафт.',
    tags: 'INV',
  },
  {
    id: 'blood_trail',
    title: 'Кривавий слід',
    category: 'mystery',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'болот', 'мангров', 'руїн'],
    hook: 'Свіжа кров на листі веде вбік від стежки — здобич, жертва чи приманка?',
    gm: 'Гравець обирає йти/ігнорувати. Може привести до пораненого NPC, пастки, або трофею.',
    tags: 'branching',
  },
  {
    id: 'echoing_moan',
    title: 'Стогін у хащі',
    category: 'sex',
    severity: 'moderate',
    weight: 10,
    locations: ['джунгл', 'водоспад', 'мангров', 'руїн'],
    timeOfDay: ['evening', 'night'],
    hook: 'З гущавини чути стогони — секс чужих, ритуал, або пастка.',
    gm: 'Desire +. Можна підглянути, втрутитись, обійти. Не завжди напад.',
    tags: 'STAT desire, voyeur optional',
  },

  // ===== WATERFALL / LAGOON SEXY/NATURE =====
  {
    id: 'bathing_locals',
    title: 'Купання місцевих',
    category: 'sex',
    severity: 'moderate',
    weight: 10,
    locations: ['водоспад', 'лагуна'],
    hook: 'Біля води — голі тіла Кай-Тору (або змішана компанія). Вони помічають Лару.',
    gm: 'Соціально-еротичний beat: запрошення, насмішка, флірт, конфлікт. REL якщо знайомі імена.',
    tags: 'SEX optional, REL',
  },
  {
    id: 'slippery_rocks',
    title: 'Слизьке каміння',
    category: 'survival',
    severity: 'minor',
    weight: 10,
    locations: ['водоспад', 'лагуна', 'печер'],
    hook: 'Нога їде — майже падіння в воду/на скелі.',
    gm: 'Спритність DC 11. Провал = синяк, сором якщо хтось бачив, мокрий одяг.',
    tags: 'STAT minor',
  },
  {
    id: 'sacred_pool_vision',
    title: 'Видіння в купіль',
    category: 'mystery',
    severity: 'moderate',
    weight: 7,
    locations: ['водоспад', 'лагуна', 'храм'],
    hook: 'У відображенні — не своє обличчя: храм, скарб, або Темна Лара.',
    gm: 'Амулет +. Коротка візія-підказка. desire/shame mix.',
    tags: 'amulet, FACT path',
  },

  // ===== CAVES / RUINS / MOUNTAIN =====
  {
    id: 'cave_collapse',
    title: 'Обвал у печері',
    category: 'survival',
    severity: 'major',
    weight: 8,
    locations: ['печер', 'лабіринт', 'руїн'],
    hook: 'Стеля сиплеться — вихід завалює пилом і камінням.',
    gm: 'Сила/Спритність. Може розділити групу/companion. Новий шлях углиб.',
    tags: 'survival',
  },
  {
    id: 'bat_swarm',
    title: 'Рій кажанів',
    category: 'survival',
    severity: 'minor',
    weight: 10,
    locations: ['печер', 'руїн', 'лабіринт'],
    hook: 'Тисячі крил — кажани злітають просто в обличчя.',
    gm: 'Паніка, дрібні подряпини, ризик втратити орієнтир. Не бій «бос».',
    tags: 'atmosphere',
  },
  {
    id: 'underground_spring',
    title: 'Підземне джерело',
    category: 'discovery',
    severity: 'minor',
    weight: 9,
    locations: ['печер', 'лабіринт', 'руїн'],
    hook: 'Чиста холодна вода в кам\'яній чаші — рідкість у глибині.',
    gm: 'thirst↓, INV вода, можливий ритуал/напис на дні.',
    tags: 'STAT thirst, INV',
  },
  {
    id: 'ruin_guardian_wakes',
    title: 'Охоронець руїн прокидається',
    category: 'combat',
    severity: 'major',
    weight: 7,
    locations: ['руїн', 'храм', 'печер'],
    hook: 'Кам\'яні очі спалахують — механізм/дух/голем реагує на амулет.',
    gm: 'Бій, загадка, або підношення (секс-енергія/предмет). amulet reaction.',
    tags: 'combat/mystery',
  },
  {
    id: 'atlantean_mural',
    title: 'Атлантська фреска',
    category: 'discovery',
    severity: 'moderate',
    weight: 8,
    locations: ['руїн', 'храм', 'печер'],
    hook: 'На стіні — еротичний ритуал і карта енергетичних ліній острова.',
    gm: 'Підказка до храму/кінцівок без прямого spoiler. desire+, amuletEnergy+.',
    tags: 'secret, amulet',
  },
  {
    id: 'mountain_wind',
    title: 'Штормовий вітер на горі',
    category: 'weather',
    severity: 'moderate',
    weight: 9,
    locations: ['гора', 'храм', 'північ'],
    hook: 'Вітер збиває з ніг, пісок і попіл ріжуть шкіру.',
    gm: '−1–2 до кидків, thirst+. Шукати укриття. Видимість на острів (орієнтація).',
    tags: 'STAT weather',
  },
  {
    id: 'lava_vent',
    title: 'Тріщина з жаром',
    category: 'survival',
    severity: 'moderate',
    weight: 6,
    locations: ['гора', 'печер'],
    hook: 'Зі скелі валить гаряче повітря — вулкан дихає.',
    gm: 'Небезпека опіку. Може відкрити прохід або закрити стежку.',
    tags: 'survival',
  },
  {
    id: 'eagle_attack',
    title: 'Напад гігантського орла',
    category: 'combat',
    severity: 'major',
    weight: 6,
    locations: ['гора', 'північ', 'храм'],
    hook: 'Тінь накриває скелю — величезний орел цілиться в здобич (вас).',
    gm: 'Бій/укриття. Перо як трофей. Не плутати з гарпією.',
    tags: 'combat, INV',
  },

  // ===== CENTAURS / MINOTAURS EXTRA =====
  {
    id: 'centaur_race_challenge',
    title: 'Виклик на біг',
    category: 'social',
    severity: 'moderate',
    weight: 9,
    locations: ['кентавр', 'джунгл'],
    hook: 'Молодий кентавр тупотить копитами: «Біжи зі мною — або йди як слабка».',
    gm: 'Випробування швидкості (Спритність/Витривалість). Перемога = повага, можливо секс-запрошення. FACT centaur path.',
    tags: 'd20, TRIBE Кентаври',
  },
  {
    id: 'hippolyta_shadow',
    title: 'Золота тінь Іпполіти',
    category: 'npc',
    severity: 'moderate',
    weight: 6,
    locations: ['кентавр', 'джунгл', 'гора'],
    hook: 'Золотиста кентаврида спостерігає здалеку — Іпполіта цікавиться силою Лари.',
    gm: 'REL Іпполіта met. Не Ксерон. Лесбі-потенціал, повага до сили.',
    tags: 'FACT met_hippolyta path, REL',
  },
  {
    id: 'labyrinth_echo',
    title: 'Відлуння лабіринту',
    category: 'mystery',
    severity: 'moderate',
    weight: 8,
    locations: ['лабіринт', 'мінотавр', 'печер'],
    hook: 'Роги б\'ються об камінь десь у темряві — близько, але напрямок бреше.',
    gm: 'Страх, навігація DC. Може вивести до Міри або Гор-Ака.',
    tags: 'mystery',
  },
  {
    id: 'mira_signal',
    title: 'Знак Міри',
    category: 'npc',
    severity: 'moderate',
    weight: 6,
    locations: ['лабіринт', 'мінотавр', 'руїн'],
    hook: 'На стіні вугіллям: символ бунту й стрілка «не туди, де Гор-Ак».',
    gm: 'Шлях до Міри/союзу. FACT met_mira path. Політика лабіринту.',
    tags: 'QUEST/REL Міра',
  },
  {
    id: 'minotaur_rut_scent',
    title: 'Запах гону мінотаврів',
    category: 'sex',
    severity: 'major',
    weight: 7,
    locations: ['лабіринт', 'мінотавр'],
    hook: 'Повітря важке від мускусу гону — самці неадекватні, небезпечні.',
    gm: 'Desire + і ризик примусу/бою. Розмір = травма. Краще ховатись або домінувати харизмою.',
    tags: 'SEX risk, combat',
  },

  // ===== SWAMP / BOAR EXTRA =====
  {
    id: 'swamp_gas',
    title: 'Болотний газ',
    category: 'survival',
    severity: 'moderate',
    weight: 10,
    locations: ['болот', 'мангров'],
    hook: 'Солодкуватий сморід — голова паморочиться, іскри біля вогню небезпечні.',
    gm: 'Витривалість DC. Провал = кашель, −1, ризик вибуху біля смолоскипа.',
    tags: 'STAT, survival',
  },
  {
    id: 'leech_attack',
    title: 'П\'явки',
    category: 'survival',
    severity: 'minor',
    weight: 11,
    locations: ['болот', 'мангров', 'лагуна'],
    hook: 'Після броду ноги в п\'явках — мерзенно, але реально.',
    gm: 'Сором+, дрібна шкода, можна зняти вогнем/сіллю/руками. Короткий beat.',
    tags: 'STAT shame minor',
  },
  {
    id: 'boar_squeal_alarm',
    title: 'Визг-сигнал свинолюдів',
    category: 'combat',
    severity: 'moderate',
    weight: 9,
    locations: ['болот', 'свинолюд', 'джунгл'],
    hook: 'Різкий визг — патруль кличе підкріплення. Хвилини до натовпу.',
    gm: 'Таймер: тікати, ховатись, або вдарити першими. Не обов\'язково Грух особисто.',
    tags: 'combat pressure',
  },
  {
    id: 'mud_wallow_orgy',
    title: 'Багно й оргія',
    category: 'sex',
    severity: 'major',
    weight: 6,
    locations: ['болот', 'свинолюд'],
    hook: 'Свинолюди в багні — грубий груповий секс. Бачать чужинку.',
    gm: '⚠️ Високий ризик примусу/хвороб. Втеча пріоритетна. DISEASE. Кай-Тору зневажають, якщо дізнаються.',
    tags: 'SEX coercion risk, DISEASE, TRIBE',
  },

  // ===== VILLAGE / KAI-TORU EXTRA =====
  {
    id: 'duel_challenge',
    title: 'Виклик на поєдинок',
    category: 'combat',
    severity: 'moderate',
    weight: 8,
    locations: ['кай-тору', 'селищ'],
    hook: 'Молодий воїн кидає Ларі кістку в ноги — виклик на ритуальний бій.',
    gm: 'Честь племені. d20 бій. Перемога = respect+, поразка = сором/повинність. Не до смерті зазвичай.',
    tags: 'TRIBE, REL',
  },
  {
    id: 'tattoo_offer',
    title: 'Пропозиція ритуального тату',
    category: 'social',
    severity: 'minor',
    weight: 7,
    locations: ['кай-тору', 'селищ'],
    hook: 'Митець/шаман пропонує світне татуювання — мітка «своя» або боргу.',
    gm: 'bodyPaint/accessories. TRIBE+. Може не подобатись Леї/Макаї.',
    tags: 'STAT bodyPaint, TRIBE',
  },
  {
    id: 'food_poisoning_feast',
    title: 'Зіпсована їжа на бенкеті',
    category: 'survival',
    severity: 'moderate',
    weight: 7,
    locations: ['кай-тору', 'селищ'],
    hook: 'Після частування нудить — риба була несвіжа, або це помста.',
    gm: 'DISEASE харчове. Детектив: випадковість чи Лея/ворог?',
    tags: 'DISEASE',
  },
  {
    id: 'night_raid_alarm',
    title: 'Нічна тривога в селищі',
    category: 'raid',
    severity: 'major',
    weight: 8,
    locations: ['кай-тору', 'селищ'],
    timeOfDay: ['night', 'evening'],
    hook: 'Барабани тривоги! Напад з темряви — гієноїди, свинолюди або внутрішній бунт.',
    gm: 'Хаос. Обери ворога. Лара вирішує долю NPC. Великий beat як reйд.',
    tags: 'raid, TRIBE, combat',
  },
  {
    id: 'bond_gift',
    title: 'Подарунок від шанувальника',
    category: 'social',
    severity: 'minor',
    weight: 8,
    locations: ['кай-тору', 'селищ', 'джунгл'],
    hook: 'Хтось лишив квіти, намисто або смажене м\'ясо біля місця Лари.',
    gm: 'Тане / анонім / пастка. INV. REL якщо відомо хто.',
    tags: 'INV, REL',
  },
  {
    id: 'public_shaming',
    title: 'Публічний осуд',
    category: 'social',
    severity: 'moderate',
    weight: 6,
    locations: ['кай-тору', 'селищ'],
    hook: 'Жінки племені збираються колом — чужинка «псує» воїнів/звичаї.',
    gm: 'Харизма/Воля. shame+. Можна переломити на повагу або поглибити конфлікт з Леєю.',
    tags: 'STAT shame, REL Лея',
  },

  // ===== JACK / CAST EXTRA =====
  {
    id: 'jack_gunshot_echo',
    title: 'Відлуння пострілу',
    category: 'mystery',
    severity: 'moderate',
    weight: 6,
    locations: ['руїн', 'джунгл', 'берег', 'північ'],
    hook: 'Далеко тріщить щось, схоже на постріл — на острові майже немає пороху.',
    gm: 'Слід Джека або ілюзія. QUEST/знахідка. Не давай Ларі сучасну гвинтівку без ціни.',
    tags: 'jack path',
  },
  {
    id: 'arahu_touch',
    title: 'Дотик Араху',
    category: 'mystery',
    severity: 'major',
    weight: 5,
    locations: ['гора', 'храм', 'руїн', 'печер'],
    hook: 'Невидимі пальці проводять по хребту — Араху цікавиться амулетом.',
    gm: 'REL Араху met path. Психоделія, desire, підказка скарбу. Не повний ending.',
    tags: 'FACT met_arahu path',
  },
  {
    id: 'naya_herb_basket',
    title: 'Кошик Найї',
    category: 'discovery',
    severity: 'minor',
    weight: 6,
    locations: ['джунгл', 'кай-тору', 'гора', 'храм'],
    hook: 'Плетений кошик з травами й амулетами-кістками — свіжий.',
    gm: 'Найя близько або лишила приманку. INV трави. QUEST/діалог.',
    tags: 'INV, REL Найя',
  },

  // ===== SEX / DESIRE EXTRA =====
  {
    id: 'desire_dream_flash',
    title: 'Спалах жаги',
    category: 'sex',
    severity: 'minor',
    weight: 11,
    hook: 'Раптова хвиля Desire без видимої причини — острів «дихає» в тіло.',
    gm: 'desire +10–20. Амулет теплий. Може зірвати спокійну сцену. Не обов\'язково NPC.',
    tags: 'STAT desire',
  },
  {
    id: 'voyeur_caught',
    title: 'Спіймана за підгляданням',
    category: 'sex',
    severity: 'moderate',
    weight: 7,
    locations: ['кай-тору', 'селищ', 'водоспад', 'джунгл'],
    hook: 'Лара (або NPC) застала когось голим — і навпаки, її помітили.',
    gm: 'shame/confidence fork. Флірт, бійка, або запрошення.',
    tags: 'STAT shame/confidence',
  },
  {
    id: 'fertility_pollen_storm',
    title: 'Буря пилку родючості',
    category: 'sex',
    severity: 'moderate',
    weight: 7,
    locations: ['джунгл', 'лагуна', 'храм', 'мангров'],
    hook: 'Вітер несе рожевий пилок — легенда каже, що після нього «живіт росте швидше».',
    gm: 'desire+, pregnancy risk flavor (не авто-вагітність без сексу). Атмосфера.',
    tags: 'STAT desire',
  },
  {
    id: 'restraint_offer',
    title: 'Пропозиція мотузок',
    category: 'sex',
    severity: 'moderate',
    weight: 6,
    locations: ['кай-тору', 'селищ', 'джунгл', 'руїн'],
    hook: 'NPC пропонує «гру в полон» з ліанами — добровільно або з підтекстом пастки.',
    gm: 'Consent ambiguity острова. kink bondage. Перевірка довіри.',
    tags: 'SEX, KINK',
  },

  // ===== DISEASE / SURVIVAL EXTRA =====
  {
    id: 'mosquito_fever',
    title: 'Укуси лихоманки',
    category: 'survival',
    severity: 'moderate',
    weight: 10,
    locations: ['джунгл', 'болот', 'мангров', 'лагуна'],
    timeOfDay: ['evening', 'night'],
    hook: 'Хмара комарів; до ранку може піднятись температура.',
    gm: 'Шанс DISEASE тропічна лихоманка. Профілактика: дим, мазь, укриття.',
    tags: 'DISEASE risk',
  },
  {
    id: 'infected_cut',
    title: 'Загнана рана',
    category: 'survival',
    severity: 'moderate',
    weight: 8,
    locations: ['джунгл', 'болот', 'руїн', 'лабіринт'],
    hook: 'Стара подряпина червоніє і пульсує — інфекція острова швидка.',
    gm: 'DISEASE якщо ігнорувати. Трави/Найя/вогонь. Не ігноруй механіку.',
    tags: 'DISEASE',
  },
  {
    id: 'find_rope_vine',
    title: 'Міцні ліани',
    category: 'discovery',
    severity: 'minor',
    weight: 12,
    locations: ['джунгл', 'мангров', 'водоспад'],
    hook: 'Ліани як мотузки — ідеально для крафту, пастки, спуску.',
    gm: 'INV ресурс (ліана). Крафт лук/пастка/одяг.',
    tags: 'INV ресурс',
  },
  {
    id: 'find_flint',
    title: 'Кремінь і трут',
    category: 'discovery',
    severity: 'minor',
    weight: 10,
    locations: ['берег', 'гора', 'руїн', 'печер', 'джунгл'],
    hook: 'Кремінь б\'є іскру — нарешті надійний вогонь.',
    gm: 'INV інструмент/ресурс. Допомагає виживанню вночі.',
    tags: 'INV',
  },
  {
    id: 'abandoned_camp',
    title: 'Покинутий табір',
    category: 'discovery',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'руїн', 'берег', 'гора', 'мангров'],
    hook: 'Згасле багаття, відбиток тіла в листі, недоїдена їжа — хтось пішов швидко.',
    gm: 'Лут + загадка. Може бути Джек, Зек, жертва рейду. Не завжди ворог.',
    tags: 'INV, mystery',
  },

  // ===== WEATHER / TIME EXTRA =====
  {
    id: 'sudden_rain',
    title: 'Злива',
    category: 'weather',
    severity: 'minor',
    weight: 12,
    hook: 'Небо розривається теплою зливою — все мокре за хвилини.',
    gm: 'weather:rain. Спрага не росте так швидко. Слизько (−1 спритність). Атмосфера.',
    tags: 'STAT weather',
  },
  {
    id: 'star_omen',
    title: 'Знак на небі',
    category: 'mystery',
    severity: 'minor',
    weight: 7,
    timeOfDay: ['night'],
    hook: 'Зірки складаються в символ амулета — або падає болід над храмом.',
    gm: 'Орієнтир на карті, confidence+, lore beat.',
    tags: 'atmosphere, plot',
  },
  {
    id: 'eclipse_shadow',
    title: 'Затемнення',
    category: 'mystery',
    severity: 'major',
    weight: 3,
    hook: 'День темнішає — рідкісне затемнення. Племена панікують або починають ритуал.',
    gm: 'Великий world beat. desire/fear. Амулет божеволіє. Можна прив\'язати до глави.',
    tags: 'world event',
  },
  {
    id: 'double_rainbow',
    title: 'Подвійна веселка',
    category: 'calm',
    severity: 'minor',
    weight: 6,
    timeOfDay: ['morning', 'day'],
    hook: 'Після дощу — дві веселки над джунглями. На мить острів здається добрим.',
    gm: 'Спокій, confidence+, коротка краса. Без бою.',
    tags: 'atmosphere',
  },

  // ===== TEMPLE / CLIMAX EXTRA =====
  {
    id: 'temple_bell',
    title: 'Дзвін храму',
    category: 'mystery',
    severity: 'moderate',
    weight: 7,
    locations: ['храм', 'гора', 'кай-тору'],
    hook: 'Далеко гуде метал, якого не має бути — хтось (або щось) торкнулось святині.',
    gm: 'Тиск сюжету до храму. Паніка племен. Не auto found_temple якщо далеко.',
    tags: 'plot pressure',
  },
  {
    id: 'sacrifice_procession',
    title: 'Процесія жертви',
    category: 'social',
    severity: 'major',
    weight: 5,
    locations: ['храм', 'кай-тору', 'гора', 'селищ'],
    hook: 'Процесія з барабанами веде прикрашене тіло — ритуал, не обов\'язково смерть.',
    gm: 'Моральний вибір: втрутитись, приєднатись, спостерігати. Секс-магія можлива.',
    tags: 'ritual, social',
  },
  {
    id: 'amulet_jealousy',
    title: 'Ревнощі амулета',
    category: 'mystery',
    severity: 'moderate',
    weight: 8,
    hook: 'Амулет холоне й кусає шкіру, коли Лара думає про іншого «ключа»/партнера.',
    gm: 'Амулет має волю. desire/punish. Може відмовити в перекладі до «вибачення» (секс/увага).',
    tags: 'STAT amuletEnergy, roleplay',
  },
  {
    id: 'false_treasure',
    title: 'Фальшивий скарб',
    category: 'discovery',
    severity: 'moderate',
    weight: 5,
    locations: ['руїн', 'печер', 'храм', 'лабіринт'],
    hook: 'Скриня з блиском — золото виявляється фарбою, пасткою або прокляттям.',
    gm: 'Не ending. Пастка/урок. Можливий дрібний лут + сором.',
    tags: 'trap',
  },

  // ===== COMPANION / GENERIC =====
  {
    id: 'companion_jealous',
    title: 'Ревнощі компаньйона',
    category: 'social',
    severity: 'moderate',
    weight: 9,
    hook: 'Компаньйон мовчить колюче — бачив флірт або чує запах чужого сексу.',
    gm: 'Тільки з companion. REL bond±, сцена розмови. Без companion — skip/replace calm.',
    tags: 'REL companion',
  },
  {
    id: 'companion_finds_food',
    title: 'Компаньйон знайшов їжу',
    category: 'discovery',
    severity: 'minor',
    weight: 10,
    hook: 'Супутник кидає Ларі плід/дичину: «Їж. Ще жива — добре».',
    gm: 'З companion. INV їжа, bond+. Без companion — дика тварина лишила здобич.',
    tags: 'INV, REL',
  },
  {
    id: 'lost_path',
    title: 'Збилась зі стежки',
    category: 'survival',
    severity: 'moderate',
    weight: 11,
    locations: ['джунгл', 'мангров', 'болот', 'туман'],
    hook: 'Знайомі дерева повторюються — ви заблукали.',
    gm: 'Час+, hunger/thirst+. Можлива випадкова зміна «відчуття» локації. d20 орієнтація.',
    tags: 'STAT survival',
  },
  {
    id: 'strange_trader_mask',
    title: 'Торговець у масці',
    category: 'social',
    severity: 'moderate',
    weight: 6,
    locations: ['джунгл', 'руїн', 'берег', 'мангров'],
    hook: 'Фігура в масці пропонує обмін: секрет за секрет, тіло за карту, кров за зілля.',
    gm: 'Може бути дух/шпигун/Найя інкогніто. Небезпечний торг. Не безкоштовний OP лут.',
    tags: 'trade, mystery',
  },
  {
    id: 'laughter_in_dark',
    title: 'Сміх у темряві',
    category: 'mystery',
    severity: 'moderate',
    weight: 9,
    timeOfDay: ['night', 'evening'],
    hook: 'З темряви — жіночий сміх. Гієна? Лея? Дух?',
    gm: 'Напруга. Розгалуження: засідка, флірт, або нічого (нерви).',
    tags: 'atmosphere',
  },
  {
    id: 'sudden_silence',
    title: 'Мертва тиша',
    category: 'mystery',
    severity: 'moderate',
    weight: 9,
    locations: ['джунгл', 'мангров', 'болот', 'печер'],
    hook: 'Усі птахи замовкли одночасно. Хижак. Або гірше.',
    gm: 'Передчуття бою/монстра. Дай 1 хід на підготовку, потім загроза або хибна тривога.',
    tags: 'tension',
  },
]

/** In-process memory so the same event id is less likely next turns. */
const recentEventIds: string[] = []
const RECENT_EVENT_LIMIT = 12

export function rememberRolledEventId(id: string): void {
  recentEventIds.push(id)
  while (recentEventIds.length > RECENT_EVENT_LIMIT) recentEventIds.shift()
}

export function getRecentEventIds(): string[] {
  return [...recentEventIds]
}

// ─── Travel / chance ───────────────────────────────────────────────────────

const TRAVEL_RE =
  /(йду|піти|підемо|руша|вируша|йдемо|іти |йти |дорога|стежк|подорож|йду до|піду|пробира|просува|залиша|виходжу|входжу|поверт|біжу|крадусь|пливу|пливти)/i

export function isTravelIntent(message: string): boolean {
  return TRAVEL_RE.test(message || '')
}

/** Probability of rolling an event this turn (0–1). */
export function eventChance(ctx: EventRollContext): number {
  const mode = ctx.mode || 'adventure'
  let p = 0.5
  if (mode === 'adventure') p = 0.62
  if (mode === 'dialogue') p = 0.32
  if (mode === 'combat') p = 0.18
  if (mode === 'sex') p = 0.15
  if (isTravelIntent(ctx.message || '')) p = Math.min(0.95, p + 0.38)
  if (ctx.timeOfDay === 'night') p += 0.1
  if (ctx.weather === 'storm' || ctx.weather === 'fog') p += 0.07
  const loc = (ctx.location || '').toLowerCase()
  if (loc.includes('селищ') || loc.includes('кай-тору')) p += 0.06
  if (loc.includes('болот') || loc.includes('гієноїд') || loc.includes('лабіринт')) p += 0.12
  if (loc.includes('берег') && (ctx.dayNumber ?? 1) <= 2) p += 0.08
  return Math.min(0.96, Math.max(0.1, p))
}

function locationMatches(event: RandomEventDef, location: string): boolean {
  const loc = (location || '').toLowerCase()
  if (event.excludeLocations?.some((h) => loc.includes(h.toLowerCase()))) return false
  if (!event.locations?.length) return true
  return event.locations.some((h) => loc.includes(h.toLowerCase()))
}

function timeMatches(event: RandomEventDef, timeOfDay?: string | null): boolean {
  if (!event.timeOfDay?.length) return true
  if (!timeOfDay) return true
  return event.timeOfDay.includes(timeOfDay as any)
}

/** Filter eligible events for context. */
export function eligibleEvents(ctx: EventRollContext): RandomEventDef[] {
  let pool = RANDOM_EVENTS.filter(
    (e) => locationMatches(e, ctx.location) && timeMatches(e, ctx.timeOfDay)
  )

  // Events that need a companion
  if (!ctx.companionName) {
    pool = pool.filter(
      (e) => !['companion_talk', 'companion_jealous', 'companion_finds_food'].includes(e.id)
    )
  }

  const recent = new Set([...(ctx.recentIds ?? []), ...recentEventIds])
  if (recent.size) {
    const filtered = pool.filter((e) => !recent.has(e.id))
    if (filtered.length > 0) pool = filtered
  }

  return pool
}

function weightedPick(events: RandomEventDef[], rng: () => number): RandomEventDef {
  // Boost raids slightly at night in villages; boost combat in hostile zones
  const weights = events.map((e) => {
    let w = e.weight
    return Math.max(0.1, w)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < events.length; i++) {
    r -= weights[i]
    if (r <= 0) return events[i]
  }
  return events[events.length - 1]
}

/**
 * Roll whether an event happens and which one.
 * `forced: true` means GM must stage this event this turn.
 */
export function rollRandomEvent(
  ctx: EventRollContext,
  rng: () => number = Math.random
): RolledEvent | null {
  const d20 = Math.floor(rng() * 20) + 1
  const chance = eventChance(ctx)

  // Travel almost always gets something (including calm)
  const forceRoll = isTravelIntent(ctx.message || '') || rng() < chance
  if (!forceRoll) return null

  const pool = eligibleEvents(ctx)
  if (!pool.length) return null

  // Map d20 bands for flavour (still weighted pick from pool)
  // 1-4 danger bias, 5-8 find, 9-12 npc, 13-16 calm, 17-20 rare
  let biased = pool
  if (d20 <= 4) {
    const danger = pool.filter((e) =>
      ['combat', 'raid', 'survival'].includes(e.category)
    )
    if (danger.length) biased = danger
  } else if (d20 <= 8) {
    const find = pool.filter((e) => e.category === 'discovery')
    if (find.length) biased = find
  } else if (d20 <= 12) {
    const npc = pool.filter((e) =>
      ['npc', 'social', 'sex'].includes(e.category)
    )
    if (npc.length) biased = npc
  } else if (d20 <= 16) {
    const calm = pool.filter((e) => e.category === 'calm' || e.severity === 'minor')
    if (calm.length) biased = calm
  } else {
    const rare = pool.filter(
      (e) => e.severity === 'major' || e.severity === 'deadly' || e.category === 'mystery'
    )
    if (rare.length) biased = rare
  }

  const event = weightedPick(biased, rng)
  rememberRolledEventId(event.id)
  return { event, d20, forced: true }
}

/** Prompt block for the narrator. */
export function formatRolledEventForPrompt(rolled: RolledEvent | null): string {
  if (!rolled) {
    return (
      `\n--- ВИПАДКОВА ПОДІЯ ЦЬОГО ХОДУ ---\n` +
      `Кидок: спокій (немає нав'язаної події). Можеш додати дрібну атмосферну деталь, але НЕ вигадуй великий бій без потреби.\n---\n`
    )
  }
  const e = rolled.event
  return (
    `\n--- ⚡ ВИПАДКОВА ПОДІЯ ЦЬОГО ХОДУ (ОБОВ'ЯЗКОВО РОЗІГРАЙ) ---\n` +
    `d20 події: ${rolled.d20} → «${e.title}» [${e.id}] (${e.category}, ${e.severity})\n` +
    `Гачок: ${e.hook}\n` +
    `Інструкція GM: ${e.gm}\n` +
    (e.tags ? `Теги/наслідки: ${e.tags}\n` : '') +
    `Вплітай у відповідь на дію гравця. Почни або кульмінуй сценою події. Повідом гравцю в тексті (🎲/⚠️). Не ігноруй.\n` +
    `---\n`
  )
}

/** Compact catalog reminder for system prompt (not the roll). */
export function formatRandomEventCatalogHint(): string {
  return (
    `\n--- ВИПАДКОВІ ПОДІЇ (сервер кидає щоходу; ~${RANDOM_EVENTS.length} у каталозі) ---\n` +
    `Типи: напади гієноїдів/свинолюдів, рейди на Кай-Тору, хижаки, Корінь-Дух, гарпії, ` +
    `Зек-відступник, кентаври/мінотаври, уламки на березі, печери/руїни, хвороби, ` +
    `знахідки/крафт, Джек/Тане/Лея/Найя, погода, феромони, свята, амулет, храм.\n` +
    `При зміні локації / подорожі — майже завжди подія. Рейди на селище = великий сюжетний beat.\n` +
    `Якщо блок «ВИПАДКОВА ПОДІЯ ЦЬОГО ХОДУ» не порожній — РОЗІГРАЙ обов'язково.\n---\n`
  )
}

export function getRandomEventById(id: string): RandomEventDef | undefined {
  return RANDOM_EVENTS.find((e) => e.id === id)
}
