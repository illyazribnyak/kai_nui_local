/**
 * Canonical story events — FACT keys the GM must fire via [FACT_ADD].
 * Pure data (safe for client + server). Seeds only starter facts; the rest unlock in play.
 *
 * Also: Jack mission chain + per-tribe entry reactions (all peoples react differently).
 */

export type CanonEvent = {
  key: string
  category: 'plot' | 'npc' | 'item' | 'secret' | 'ending' | 'world' | 'ritual' | 'tribe'
  chapter: string
  /** Short content for FACT_ADD when the event fires */
  content: string
  /** When the GM should fire this (for prompt) */
  trigger: string
}

/** Ordered story beats — main path + key character moments. */
export const CANON_EVENTS: CanonEvent[] = [
  // --- arrival ---
  {
    key: 'found_fresh_water',
    category: 'plot',
    chapter: 'arrival',
    content: 'Лара знайшла джерело прісної води (водоспад, лагуна або струмок).',
    trigger: 'Перший раз п\'є/наповнює ємність прісною водою',
  },
  {
    key: 'found_food',
    category: 'plot',
    chapter: 'arrival',
    content: 'Лара здобула їжу на острові (фрукти, риба, здобич).',
    trigger: 'Перша їстівна здобич / збір / полювання',
  },
  {
    key: 'first_night_survived',
    category: 'plot',
    chapter: 'arrival',
    content: 'Лара пережила першу ніч на острові.',
    trigger: 'Перехід dayNumber 1→2 або перший світанок',
  },

  // --- jungle ---
  {
    key: 'entered_jungle',
    category: 'plot',
    chapter: 'jungle',
    content: 'Лара залишила берег і увійшла в джунглі.',
    trigger: 'Перший вхід у джунглі / мангровий ліс',
  },
  {
    key: 'found_weapon',
    category: 'item',
    chapter: 'jungle',
    content: 'Лара знайшла або виготовила зброю (спис, ніж, лук).',
    trigger: 'Перша зброя в інвентарі',
  },
  {
    key: 'predator_encounter',
    category: 'world',
    chapter: 'jungle',
    content: 'Лара зіткнулася з хижаком або небезпечною істотою джунглів.',
    trigger: 'Бій / втеча від звіра чи монстра',
  },
  {
    key: 'jack_wreck_clue',
    category: 'plot',
    chapter: 'jungle',
    content: 'Лара знайшла сліди аварії / речі Джека (рюкзак, ніж, слід багаття).',
    trigger: 'Пошук уламків, сліди на березі/в джунглях до зустрічі з Джеком',
  },

  // --- tribe / cast ---
  {
    key: 'met_tane',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лара зустріла Тане — молодого воїна Кай-Тору. Він зацікавлений і ніжний.',
    trigger: 'Перша поява Тане',
  },
  {
    key: 'met_leya',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лара зустріла Лею — жінку Кай-Тору, сестру Тане, пов\'язану з Джеком.',
    trigger: 'Перша поява Леї',
  },
  {
    key: 'met_jack',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лара знайшла (або знову зустріла) Джека Вейна — провідника зі зовнішнього світу.',
    trigger: 'Перша поява Джека після аварії',
  },
  {
    key: 'jack_found_alive',
    category: 'npc',
    chapter: 'tribe',
    content: 'Підтверджено: Джек Вейн живий після шторму і лишається на острові.',
    trigger: 'Разом із met_jack або після діалогу «ти вижив»',
  },
  {
    key: 'jack_offers_guide',
    category: 'plot',
    chapter: 'tribe',
    content: 'Джек запропонував провести Лару (за плату, секс, борг або «стару дружбу»).',
    trigger: 'Джек стає провідником / companion',
  },
  {
    key: 'jack_map_shared',
    category: 'secret',
    chapter: 'tribe',
    content: 'Джек поділився картою/схемою острова (частковою — храм не позначений точно).',
    trigger: 'Bond/довіра до Джека або угода',
  },
  {
    key: 'jack_ruins_explored',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара досліджувала руїни разом із Джеком (або за його вказівками).',
    trigger: 'Спільна експедиція в руїни',
  },
  {
    key: 'jack_leya_confrontation',
    category: 'npc',
    chapter: 'tribe',
    content: 'Стався конфлікт/розмова трикутника Джек–Лея–Лара.',
    trigger: 'Лея й Джек в одній сцені з Ларою',
  },
  {
    key: 'jack_temple_hint',
    category: 'secret',
    chapter: 'depths',
    content: 'Джек дав підказку до храму, але сам ніколи не входив усередину.',
    trigger: 'Глибока довіра / фінальна угода з Джеком',
  },
  {
    key: 'jack_loyalty_ally',
    category: 'npc',
    chapter: 'climax',
    content: 'Джек став союзником Лари до кінця (не зраджує заради скарбу).',
    trigger: 'Високий bond + чесний вибір на боці Лари',
  },
  {
    key: 'jack_loyalty_rival',
    category: 'npc',
    chapter: 'climax',
    content: 'Джек став конкурентом за скарб або зрадив заради втечі з острова.',
    trigger: 'Конфлікт інтересів / низька довіра / темний шлях',
  },
  {
    key: 'met_kai_toru',
    category: 'plot',
    chapter: 'tribe',
    content: 'Лара встановила контакт із племенем Кай-Тору.',
    trigger: 'Перший контакт з будь-ким з Кай-Тору',
  },
  {
    key: 'entered_village',
    category: 'plot',
    chapter: 'tribe',
    content: 'Лара увійшла в селище Кай-Тору.',
    trigger: 'STAT location → селище / перший візит',
  },
  {
    key: 'met_makai',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лара постала перед вождем Макаї. Він має «право чужинки».',
    trigger: 'Аудієнція / зустріч із Макаї',
  },
  {
    key: 'met_naya',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лара зустріла шаманку Найю — хранительку ритуалів і таємниць амулета.',
    trigger: 'Перша поява Найї',
  },
  {
    key: 'guest_of_tribe',
    category: 'plot',
    chapter: 'tribe',
    content: 'Кай-Тору визнали Лару гостею (тимчасовий захист / місце біля вогнища).',
    trigger: 'Прийняття племенем, ритуал гостинності, дозвіл вождя',
  },
  {
    key: 'tribe_accepted',
    category: 'plot',
    chapter: 'tribe',
    content: 'Лара прийнята глибше — не лише гостя, а «своя» для частини племені.',
    trigger: 'Висока репутація / ритуал прийняття / bond з кількома NPC',
  },
  {
    key: 'tane_confessed',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане відкрито зізнався Ларі в почуттях.',
    trigger: 'Bond Тане ≥5 або романтична сцена',
  },
  {
    key: 'leya_rivalry',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лея бачить у Ларі суперницю (Тане і/або Джек).',
    trigger: 'Конфлікт інтересів із Леєю',
  },
  {
    key: 'jack_secret',
    category: 'secret',
    chapter: 'tribe',
    content: 'Джек розкрив частину таємниць острова або своєї історії з Леєю.',
    trigger: 'Довіра до Джека / глибока розмова',
  },

  // --- tribe territory entries ---
  {
    key: 'entered_centaur_lands',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара вперше ступила на землі кентаврів (східні луки).',
    trigger: 'Локація Землі кентаврів',
  },
  {
    key: 'met_xeron',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Ксерона — ватажка табуна кентаврів.',
    trigger: 'Перша поява Ксерона',
  },
  {
    key: 'met_hippolyta',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Іпполіту — найшвидшу кобилу табуна.',
    trigger: 'Перша поява Іпполіти',
  },
  {
    key: 'centaur_trial_won',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара виграла (або гідно пройшла) випробування швидкості/сили кентаврів.',
    trigger: 'Перемога в бігу/боротьбі/стрільбі перед сексом/повагою',
  },
  {
    key: 'centaur_accepted',
    category: 'tribe',
    chapter: 'depths',
    content: 'Табун визнав Лару вартою — не «легка здобич».',
    trigger: 'Після trial або високої поваги кентаврів',
  },

  {
    key: 'entered_minotaur_labyrinth',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара увійшла в лабіринт мінотаврів.',
    trigger: 'Локація Лабіринт мінотаврів',
  },
  {
    key: 'met_gor_ak',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Гор-Ака — ватажка мінотаврів.',
    trigger: 'Перша поява Гор-Ака',
  },
  {
    key: 'met_mira',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Міру — воїнку-мінотаврку поза гаремом Гор-Ака.',
    trigger: 'Перша поява Міри',
  },
  {
    key: 'minotaur_labyrinth',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара пройшла (або втекла з) ключової частини лабіринту мінотаврів.',
    trigger: 'Вихід із лабіринту / перемога / угода',
  },
  {
    key: 'minotaur_dominance_settled',
    category: 'tribe',
    chapter: 'depths',
    content: 'Вирішено ієрархію: Лара підкорилась, здолала суперника або стала союзницею Міри.',
    trigger: 'Фінал конфлікту з Гор-Аком / Мірою',
  },

  {
    key: 'entered_hyena_territory',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара увійшла на територію гієноїдів.',
    trigger: 'Локація Територія гієноїдів',
  },
  {
    key: 'met_kira',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Кіру — матріарха гієноїдів.',
    trigger: 'Перша поява Кіри',
  },
  {
    key: 'met_zek',
    category: 'npc',
    chapter: 'depths',
    content:
      'Лара зустріла Зека — самця-гієноїда, відступника зі стаї Кіри. Він утік із матріархату і просить захисту.',
    trigger: 'Перша поява Зека',
  },
  {
    key: 'zek_escape_clue',
    category: 'plot',
    chapter: 'depths',
    content:
      'Знайдено сліди відступника: порваний нашийник-мітка стаї, пазурі не по-мисливськи, запах самця поза територією.',
    trigger: 'Сліди / випадкова подія / чутки до зустрічі з Зеком',
  },
  {
    key: 'zek_escape_story',
    category: 'secret',
    chapter: 'depths',
    content:
      'Зек розповів, як вийшов зі стаї: відмовився бути лише «розплідником» Кіри, зірвав ритуал повного підкорення самців і втік у ніч рейду, коли стая відволіклась. На ньому «запах смерті» — мітка вигнанця.',
    trigger: 'Довіра/bond з Зеком, глибока розмова',
  },
  {
    key: 'zek_death_scent',
    category: 'secret',
    chapter: 'depths',
    content:
      'Кіра наклала на Зека death-scent (запах смерті): будь-яка гієноїдка зобов\'язана повернути або вбити його. Запах чути здалеку.',
    trigger: 'Зек зізнається / Найя/амулет відчуває / мисливці пояснюють',
  },
  {
    key: 'zek_sheltered',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара дала Зеку притулок (табір, селище, руїни, печера) — хоча б тимчасово.',
    trigger: 'Лара ховає/годує/веде Зека з собою',
  },
  {
    key: 'zek_hunters',
    category: 'plot',
    chapter: 'depths',
    content: 'Стая вислала мисливців за Зеком; сталася сутичка або переговори.',
    trigger: 'Засідка мисливців / випадкова подія zek_hunters',
  },
  {
    key: 'zek_mark_cleansed',
    category: 'ritual',
    chapter: 'depths',
    content:
      'Мітку «запаху смерті» знято (ритуал Найї, амулет, кров Кіри, або обман феромонами).',
    trigger: 'Ритуал очищення / квест «Зняти мітку»',
  },
  {
    key: 'zek_guide',
    category: 'npc',
    chapter: 'depths',
    content:
      'Зек став провідником: знає обхідні стежки стаї, слабкі місця патрулів і натяки на скарби/храм з околиць.',
    trigger: 'Companion або угода «проведи мене»',
  },
  {
    key: 'zek_protected',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара відкрито захистила Зека від Кіри/мисливців (не видала).',
    trigger: 'Вибір захистити, не здати',
  },
  {
    key: 'zek_betrayed',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара видала Зека Кірі або мисливцям стаї.',
    trigger: 'Вибір зрадити заради пакту/безпеки',
  },
  {
    key: 'zek_kira_confront',
    category: 'plot',
    chapter: 'depths',
    content: 'Конфронтація з Кірою саме через Зека (суд, дуель, торг, гарем-ультиматум).',
    trigger: 'Кіра вимагає відступника',
  },
  {
    key: 'zek_free_exile',
    category: 'npc',
    chapter: 'depths',
    content: 'Зек вільний вигнанець: живе поза стаєю під захистом Лари або сам.',
    trigger: 'Фінал арки — свобода',
  },
  {
    key: 'zek_companion',
    category: 'npc',
    chapter: 'depths',
    content: 'Зек лишився компаньйоном Лари (bond високий, вірний до кінця).',
    trigger: 'Companion + фінал арки',
  },
  {
    key: 'zek_returned',
    category: 'npc',
    chapter: 'depths',
    content: 'Зека повернули в стаю (живим — у підкорення, або як трофей Кіри).',
    trigger: 'Фінал — повернення в стаю',
  },
  {
    key: 'zek_dead',
    category: 'npc',
    chapter: 'depths',
    content: 'Зек загинув (мисливці, Кіра, хвороба, жертва ритуалу, бій).',
    trigger: 'Смерть Зека',
  },
  {
    key: 'hyena_pact',
    category: 'tribe',
    chapter: 'depths',
    content: 'Укладено пакт із Кірою (гарем/васалітет) або відкриту війну з матріархатом.',
    trigger: 'Рішення після зустрічі з Кірою',
  },

  {
    key: 'entered_boar_swamps',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара увійшла в болота свинолюдів — найнебезпечнішу зону примусу.',
    trigger: 'Локація Болота свинолюдів',
  },
  {
    key: 'met_gruh',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Груха — ватажка свинолюдів; він бачить у ній трофей.',
    trigger: 'Перша поява Груха',
  },
  {
    key: 'met_sow_matron',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара зустріла Свиноматку — стару, що керує розмноженням і «обміном».',
    trigger: 'Перша поява Свиноматки',
  },
  {
    key: 'boar_trophy_escape',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара втекла, відкупилась або перемогла спробу зробити її трофеєм свинолюдів.',
    trigger: 'Фінал сцени з Грухом / болотом',
  },
  {
    key: 'boar_trade_deal',
    category: 'tribe',
    chapter: 'depths',
    content: 'Угода зі Свиноматкою: «захист» за ціну (тіло, речі, послуга).',
    trigger: 'Обмін із Свиноматкою',
  },

  // --- amulet / depths ---
  {
    key: 'amulet_awakened',
    category: 'plot',
    chapter: 'depths',
    content: 'Амулет «прокинувся» — світиться, вібрує, реагує на секс-енергію і руїни.',
    trigger: 'Перше сильне світіння / заряд від сексу / реакція на артефакт',
  },
  {
    key: 'learned_amulet_secret',
    category: 'secret',
    chapter: 'depths',
    content: 'Лара дізналася: амулет — ключ/перекладач/батарея до Скарбу Атлантів.',
    trigger: 'Найя, видіння, руїни або Араху пояснюють природу амулета',
  },
  {
    key: 'spoke_with_naya',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара говорила з Найєю про амулет, ритуали або шлях до храму.',
    trigger: 'Діалог із Найєю про сюжет',
  },
  {
    key: 'naya_youth_ritual',
    category: 'ritual',
    chapter: 'tribe',
    content: 'Виконано (або відмовлено) ритуал повернення молодості Найї.',
    trigger: 'Квест «Останнє бажання шаманки»',
  },
  {
    key: 'soul_bound_tane',
    category: 'ritual',
    chapter: 'tribe',
    content: 'Лара й Тане уклали soul-bound (або свідомо відмовились).',
    trigger: 'Ритуал soul-bound',
  },
  {
    key: 'found_ruins',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара знайшла руїни стародавньої цивілізації / Атлантиди.',
    trigger: 'Відкриття локації руїн',
  },
  {
    key: 'entered_caves',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара увійшла в печери острова.',
    trigger: 'Перший вхід у печери',
  },
  {
    key: 'climbed_mountain',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара піднялася на священну гору / вулкан у центрі острова.',
    trigger: 'Локація Священна гора',
  },
  {
    key: 'met_arahu',
    category: 'npc',
    chapter: 'depths',
    content: 'Лара відчула або зустріла Араху — дух/присутність острова.',
    trigger: 'Видіння, голос амулета, явлення духа',
  },
  {
    key: 'other_tribe_contact',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара встановила контакт із не-людським племенем (кентаври / мінотаври / гієноїди / свинолюди).',
    trigger: 'Перша зустріч з іншим племенем',
  },
  {
    key: 'hyena_raid_kai_toru',
    category: 'plot',
    chapter: 'tribe',
    content: 'Гієноїди рейдували селище Кай-Тору; Лара була свідком або учасницею оборони.',
    trigger: 'Випадкова подія reйд / сюжетний напад гієноїдів на селище',
  },
  {
    key: 'boar_raid_kai_toru',
    category: 'plot',
    chapter: 'tribe',
    content: 'Свинолюди напали на селище Кай-Тору; хаос, пожежі, трофеї.',
    trigger: 'Випадкова подія reйд / напад свинолюдів на селище',
  },

  // --- temple / climax ---
  {
    key: 'found_temple',
    category: 'plot',
    chapter: 'temple',
    content: 'Лара знайшла Храм насолоди — центральне святилище острова.',
    trigger: 'Перший раз біля/у храмі',
  },
  {
    key: 'temple_opened',
    category: 'plot',
    chapter: 'temple',
    content: 'Вхід до внутрішніх залів храму відкрито (амулет, ритуал або ключ).',
    trigger: 'Двері/бар\'єр храму знято',
  },
  {
    key: 'ritual_started',
    category: 'ritual',
    chapter: 'climax',
    content: 'Почався великий ритуал біля Скарбу Атлантів.',
    trigger: 'Старт фінального ритуалу',
  },
  {
    key: 'treasure_found',
    category: 'plot',
    chapter: 'climax',
    content: 'Лара знайшла Скарб Атлантів — артефакт неймовірної сили.',
    trigger: 'Отримання/відкриття скарбу',
  },
  {
    key: 'dark_lara_awake',
    category: 'plot',
    chapter: 'climax',
    content: 'Темна сторона Лари прокинулась (isDarkLara / темний шлях).',
    trigger: 'Сильний сором+впевненість, темний ритуал, вибір насильства',
  },

  // --- endings ---
  {
    key: 'ending_freedom',
    category: 'ending',
    chapter: 'ending',
    content: 'Кінцівка: Шлях Свободи — Лара залишає острів із знанням і артефактами.',
    trigger: 'Фінальний вибір свободи / втечі',
  },
  {
    key: 'ending_priestess',
    category: 'ending',
    chapter: 'ending',
    content: 'Кінцівка: Шлях Жриці — Лара лишається верховною жрицею острова.',
    trigger: 'Фінальний вибір служити острову',
  },
  {
    key: 'ending_goddess',
    category: 'ending',
    chapter: 'ending',
    content: 'Кінцівка: Шлях Богині — Лара зливається з енергією острова.',
    trigger: 'Фінальний вибір злиття / апофеозу',
  },
  {
    key: 'ending_destroyer',
    category: 'ending',
    chapter: 'ending',
    content: 'Кінцівка: Шлях Руйнівниці — Лара знищує джерело сили острова.',
    trigger: 'Фінальний вибір знищити скарб/джерело',
  },
  {
    key: 'ending_dark_queen',
    category: 'ending',
    chapter: 'ending',
    content: 'Кінцівка: Королева Темряви — Лара підкорює або знищує племена, править одна.',
    trigger: 'Темний фінал / dark_lara + влада',
  },
]

/** How each people reacts when Lara first enters their territory. */
export type TribeEntryDef = {
  tribe: string
  locationName: string
  locationHints: string[]
  leaders: string[]
  /** Immediate reaction on first entry — GM must play this tone */
  firstReaction: string
  /** What they respect / despise (short) */
  values: string
  enteredFactKey: string
  entryQuestTitle: string
  completeFactKeys: string[]
}

export const TRIBE_ENTRIES: TribeEntryDef[] = [
  {
    tribe: 'Кай-Тору',
    locationName: 'Селище Кай-Тору',
    locationHints: ['кай-тору', 'селищ'],
    leaders: ['Макаї', 'Найя', 'Тане', 'Лея'],
    firstReaction:
      'Людська цікавість + право сильного. Не питають «згоди» по-західному. Чоловіча зона селища = «ти вже погодилась». Вождь має право чужинки; жінки племені спочатку ворожі (загроза статусу).',
    values: 'Поважають: soul-bound, ніжність, гостинність. Зневажають: безлад зі свинолюдами, зраду гостя.',
    enteredFactKey: 'entered_village',
    entryQuestTitle: 'Вхід: Селище Кай-Тору',
    completeFactKeys: ['entered_village', 'met_makai', 'guest_of_tribe'],
  },
  {
    tribe: 'Кентаври',
    locationName: 'Землі кентаврів',
    locationHints: ['кентавр'],
    leaders: ['Ксерон', 'Іпполіта'],
    firstReaction:
      'Гордість і дистанція. Не кидаються «трахати» одразу — спочатку дивляться, чи варта. Ксерон вимагає змагання (біг/сила). Без перемоги секс = «легка здобич», репутація −. Іпполіта може захистити/закохатися, якщо Лара сильна духом.',
    values: 'Поважають: перемогу перед близькістю. Зневажають: секс без боротьби.',
    enteredFactKey: 'entered_centaur_lands',
    entryQuestTitle: 'Вхід: Землі кентаврів',
    completeFactKeys: ['entered_centaur_lands', 'centaur_trial_won', 'other_tribe_contact'],
  },
  {
    tribe: 'Мінотаври',
    locationName: 'Лабіринт мінотаврів',
    locationHints: ['мінотавр', 'лабіринт'],
    leaders: ['Гор-Ак', 'Міра'],
    firstReaction:
      'Ієрархія й домінування. Слабший підкоряється. Гор-Ак може схопити як трофей у гарем; ризик травми високий. Міра — шанс союзу проти ватажка (лесбі-лінія, політика). Лабіринт сам по собі пастка.',
    values: 'Поважають: силу й домінування. Зневажають: жалість і підкорення без бою.',
    enteredFactKey: 'entered_minotaur_labyrinth',
    entryQuestTitle: 'Вхід: Лабіринт мінотаврів',
    completeFactKeys: ['entered_minotaur_labyrinth', 'minotaur_labyrinth', 'other_tribe_contact'],
  },
  {
    tribe: 'Гієноїди',
    locationName: 'Територія гієноїдів',
    locationHints: ['гієноїд'],
    leaders: ['Кіра', 'Зек'],
    firstReaction:
      'Матріархат. Самки оцінюють: сила → рівна; слабкість → підкорять. Кіра розумна й жорстока, може запропонувати «гарем» як захист. Самці в стаї — підлеглі/розплідники. ОКЕ: Зек — відступник (уже поза стаєю, death-scent); його можуть шукати на околицях, не як «вірного самця». Феромони підвищують Desire.',
    values: 'Поважають: агресивне домінування, владу самок. Зневажають: пасивність перед самцями.',
    enteredFactKey: 'entered_hyena_territory',
    entryQuestTitle: 'Вхід: Територія гієноїдів',
    completeFactKeys: ['entered_hyena_territory', 'hyena_pact', 'other_tribe_contact'],
  },
  {
    tribe: 'Свинолюди',
    locationName: 'Болота свинолюдів',
    locationHints: ['свинолюд', 'болот'],
    leaders: ['Грух', 'Свиноматка'],
    firstReaction:
      '⚠️ Найгірший вхід. Примітивні, хитрі, без гігієни. Чужинка = трофей. Грух хоче володіти фізично; Свиноматка торгує «захистом» за тіло/речі. Високий ризик примусу й хвороб. Кай-Тору зневажають секс тут.',
    values: 'Їм байдуже до честі — лише здобич, їжа, розмноження.',
    enteredFactKey: 'entered_boar_swamps',
    entryQuestTitle: 'Вхід: Болота свинолюдів',
    completeFactKeys: ['entered_boar_swamps', 'boar_trophy_escape', 'other_tribe_contact'],
  },
]

/** Side quests the GM may open with QUEST_UPDATE when the moment fits. */
export type SideQuestDef = {
  title: string
  description: string
  givenBy: string
  chapter: string
  /** Preferred FACT keys when completed */
  completeFactKeys?: string[]
  unlockHint: string
  /** Optional tag for grouping in prompts */
  chain?: 'jack' | 'zek' | 'tribe_entry' | 'romance' | 'temple' | 'other'
}

export const SIDE_QUESTS: SideQuestDef[] = [
  // ——— Jack chain ———
  {
    title: 'Знайти провідника',
    description:
      'Знайти Джека Вейна після аварії — він може знати дороги, руїни й небезпеки острова.',
    givenBy: 'Система',
    chapter: 'jungle',
    completeFactKeys: ['met_jack', 'jack_found_alive'],
    unlockHint: 'Після виживання на березі / сліди аварії / чутки',
    chain: 'jack',
  },
  {
    title: 'Сліди Джека',
    description:
      'Знайти уламки, багаття або речі Джека, щоб зрозуміти, куди він пішов (часто — до руїн).',
    givenBy: 'Система',
    chapter: 'jungle',
    completeFactKeys: ['jack_wreck_clue'],
    unlockHint: 'До met_jack, якщо шукаєш провідника',
    chain: 'jack',
  },
  {
    title: 'Угода з Джеком',
    description:
      'Джек не веде безкоштовно: їжа, перлини, секс за згодою, частка скарбу або «старий борг».',
    givenBy: 'Джек Вейн',
    chapter: 'tribe',
    completeFactKeys: ['jack_offers_guide'],
    unlockHint: 'Після met_jack',
    chain: 'jack',
  },
  {
    title: 'Карта Джека',
    description:
      'Витягнути з Джека часткову мапу острова. Храм позначений неточно — він сам там не був.',
    givenBy: 'Джек Вейн',
    chapter: 'tribe',
    completeFactKeys: ['jack_map_shared'],
    unlockHint: 'Bond/довіра або виконана угода',
    chain: 'jack',
  },
  {
    title: 'Руїни з Джеком',
    description:
      'Піти з Джеком у руїни стародавнього міста — артефакти, пастки, натяки на Атлантиду.',
    givenBy: 'Джек Вейн',
    chapter: 'depths',
    completeFactKeys: ['jack_ruins_explored', 'found_ruins'],
    unlockHint: 'Джек — companion або угода «покажу руїни»',
    chain: 'jack',
  },
  {
    title: 'Джек і Лея',
    description:
      'Розрулити трикутник: Лея — «подруга» Джека; Тане — її брат. Ревнощі, шантаж або союз.',
    givenBy: 'Система',
    chapter: 'tribe',
    completeFactKeys: ['jack_leya_confrontation', 'jack_secret', 'leya_rivalry'],
    unlockHint: 'met_jack + met_leya',
    chain: 'jack',
  },
  {
    title: 'Підказка Джека до храму',
    description:
      'Джек знає обхідні стежки до околиць храму, але всередину не ходив. Ціна — довіра або частка.',
    givenBy: 'Джек Вейн',
    chapter: 'temple',
    completeFactKeys: ['jack_temple_hint'],
    unlockHint: 'Перед/після found_temple, високий bond',
    chain: 'jack',
  },
  {
    title: 'Союзник чи конкурент',
    description:
      'Фінальний вибір Джека: лишитись із Ларою, зрадити заради втечі, або битись за скарб.',
    givenBy: 'Джек Вейн',
    chapter: 'climax',
    completeFactKeys: ['jack_loyalty_ally', 'jack_loyalty_rival'],
    unlockHint: 'Біля скарбу / climax',
    chain: 'jack',
  },

  // ——— Kai-Toru & romance ———
  {
    title: 'Піти з Тане до селища',
    description: 'Тане запрошує Лару до племені Кай-Тору.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['entered_village'],
    unlockHint: 'Після зустрічі з Тане',
    chain: 'other',
  },
  {
    title: 'Вхід: Селище Кай-Тору',
    description:
      'Перший вхід у селище: цікавість, «право чужинки» Макаї, ворожість жінок, звичаї згоди.',
    givenBy: 'Система',
    chapter: 'tribe',
    completeFactKeys: ['entered_village', 'met_makai', 'guest_of_tribe'],
    unlockHint: 'STAT location → Селище Кай-Тору (обовʼязково QUEST + FACT)',
    chain: 'tribe_entry',
  },
  {
    title: 'Право чужинки',
    description: 'Вождь Макаї вимагає «право першого» або випробування для чужинки.',
    givenBy: 'Макаї',
    chapter: 'tribe',
    completeFactKeys: ['guest_of_tribe', 'met_makai'],
    unlockHint: 'Аудієнція у вождя',
    chain: 'other',
  },
  {
    title: 'Останнє бажання шаманки',
    description: 'Найя просить Лару про ритуал повернення молодості (інтимний обряд).',
    givenBy: 'Найя',
    chapter: 'tribe',
    completeFactKeys: ['naya_youth_ritual'],
    unlockHint: 'Довіра до Найї / розмова про амулет',
    chain: 'romance',
  },
  {
    title: 'Ритуал soul-bound',
    description: 'Тане пропонує магічний зв\'язок душ — сила вдвох, зрада смертельна.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['soul_bound_tane'],
    unlockHint: 'Bond Тане ≥7',
    chain: 'romance',
  },
  {
    title: 'Таємниця Леї',
    description: 'Розплутати трикутник Тане–Лея–Джек і зрозуміти, на чиєму боці Лея.',
    givenBy: 'Система',
    chapter: 'tribe',
    completeFactKeys: ['leya_rivalry', 'jack_secret'],
    unlockHint: 'Після зустрічі з двома з трьох',
    chain: 'other',
  },

  // ——— Other tribes: entry missions ———
  {
    title: 'Вхід: Землі кентаврів',
    description:
      'Перший контакт із табуном: Ксерон вимагає змагання. Без перемоги — зневага «легка здобич».',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['entered_centaur_lands', 'met_xeron', 'other_tribe_contact'],
    unlockHint: 'Локація Землі кентаврів — одразу QUEST_UPDATE add',
    chain: 'tribe_entry',
  },
  {
    title: 'Випробування швидкості',
    description: 'Ксерон вимагає перемоги в бігу/змаганні перед повагою і близькістю.',
    givenBy: 'Ксерон',
    chapter: 'depths',
    completeFactKeys: ['centaur_trial_won', 'centaur_accepted'],
    unlockHint: 'Після входу на землі кентаврів',
    chain: 'other',
  },
  {
    title: 'Вхід: Лабіринт мінотаврів',
    description:
      'Вхід у лабіринт: домінування Гор-Ака, ризик гарему, шанс союзу з Мірою.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['entered_minotaur_labyrinth', 'met_gor_ak', 'other_tribe_contact'],
    unlockHint: 'Локація Лабіринт мінотаврів',
    chain: 'tribe_entry',
  },
  {
    title: 'Лабіринт Гор-Ака',
    description: 'Пройти лабіринт — силою, хитрістю або союзом з Мірою проти ватажка.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['minotaur_labyrinth', 'minotaur_dominance_settled'],
    unlockHint: 'Після входу в лабіринт',
    chain: 'other',
  },
  {
    title: 'Вхід: Територія гієноїдів',
    description:
      'Матріархат оцінює силу. Кіра пропонує гарем або війну; Зек може просити захисту.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['entered_hyena_territory', 'met_kira', 'other_tribe_contact'],
    unlockHint: 'Локація Територія гієноїдів',
    chain: 'tribe_entry',
  },
  {
    title: 'Гарем Кіри',
    description: 'Гієноїдка Кіра пропонує «захист» гарему — або відкриту ворожнечу.',
    givenBy: 'Кіра',
    chapter: 'depths',
    completeFactKeys: ['hyena_pact'],
    unlockHint: 'Після met_kira',
    chain: 'other',
  },

  // ——— Zek renegade arc ———
  {
    title: 'Сліди відступника',
    description:
      'Дивні сліди самця-гієноїда поза стаєю: порвана мітка, паніка, запах не «свого». Хтось утік від Кіри.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['zek_escape_clue'],
    unlockHint: 'Джунглі / околиці гієноїдів / чутки Кай-Тору про «смішного пса»',
    chain: 'zek',
  },
  {
    title: 'Зустріч із відступником',
    description:
      'Зек — самець, що вийшов зі стаї. Полохливий, хитрий, пропонує все (включно з тілом) за захист від Кіри.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['met_zek'],
    unlockHint: 'Після zek_escape_clue або випадкова подія «Зек тікає»',
    chain: 'zek',
  },
  {
    title: 'Звільни Зека',
    description:
      'Не видати Зека мисливцям/Кірі. Перший відкритий акт захисту — або зрада за пакт.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_protected', 'zek_betrayed'],
    unlockHint: 'met_zek + тиск стаї',
    chain: 'zek',
  },
  {
    title: 'Притулок для вигнанця',
    description:
      'Знайти місце, де death-scent не вб\'є Зека одразу: дальній табір, руїни, селище (Кай-Тору можуть не прийняти), печера з Найєю.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_sheltered'],
    unlockHint: 'Після met_zek',
    chain: 'zek',
  },
  {
    title: 'Таємниця втечі',
    description:
      'Дізнатися, ЯК і ЧОМУ Зек вийшов зі стаї: відмова бути розплідником, зірваний ритуал підкорення, втеча в ніч рейду. Правда про «запах смерті».',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_escape_story', 'zek_death_scent'],
    unlockHint: 'Bond Зек ≥3 або порятунок у бою',
    chain: 'zek',
  },
  {
    title: 'Мисливці стаї',
    description:
      'Гієноїдки-мисливці йдуть по сліду. Бій, переговори, обман запахом або видача Зека.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['zek_hunters'],
    unlockHint: 'Після zek_sheltered або на території гієноїдів із Зеком',
    chain: 'zek',
  },
  {
    title: 'Зняти мітку смерті',
    description:
      'Зняти death-scent: ритуал Найї, кров/феромон Кіри, сила амулета, або обман стаї. Інакше Зек завжди «світиться».',
    givenBy: 'Найя',
    chapter: 'depths',
    completeFactKeys: ['zek_mark_cleansed'],
    unlockHint: 'zek_death_scent відомий; Найя, руїни або Кіра',
    chain: 'zek',
  },
  {
    title: 'Провідник-відступник',
    description:
      'Зек веде обхідними стежками: патрулі, слабкі місця стаї, стежка до околиць храму, яких Кіра не афішує.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_guide'],
    unlockHint: 'Захист + довіра; потрібен провідник углиб',
    chain: 'zek',
  },
  {
    title: 'Суд Кіри за відступника',
    description:
      'Кіра вимагає Зека: гаремний ультиматум, дуель честі, торг (Лара замість нього), або війна.',
    givenBy: 'Кіра',
    chapter: 'depths',
    completeFactKeys: ['zek_kira_confront', 'zek_protected', 'zek_betrayed'],
    unlockHint: 'met_kira + Зек ще живий/не повернутий',
    chain: 'zek',
  },
  {
    title: 'Доля відступника',
    description:
      'Фінал арки Зека: вільний вигнанець, компаньйон Лари, повернення в стаю, або смерть.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: [
      'zek_free_exile',
      'zek_companion',
      'zek_returned',
      'zek_dead',
    ],
    unlockHint: 'Після zek_kira_confront або zek_mark_cleansed',
    chain: 'zek',
  },
  {
    title: 'Вхід: Болота свинолюдів',
    description:
      '⚠️ Небезпечний вхід: трофей для Груха, торгівля зі Свиноматкою, ризик примусу й хвороб.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['entered_boar_swamps', 'met_gruh', 'other_tribe_contact'],
    unlockHint: 'Локація Болота свинолюдів',
    chain: 'tribe_entry',
  },
  {
    title: 'Трофей Груха',
    description: 'Уникнути або пережити статус «трофею» ватажка свинолюдів.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['boar_trophy_escape'],
    unlockHint: 'Після met_gruh / нападу',
    chain: 'other',
  },
  {
    title: 'Угода зі Свиноматкою',
    description: 'Обмін: «захист» або прохід через болота ціною тіла, речей чи послуги.',
    givenBy: 'Свиноматка',
    chapter: 'depths',
    completeFactKeys: ['boar_trade_deal'],
    unlockHint: 'Діалог зі Свиноматкою',
    chain: 'other',
  },

  // ——— Temple ———
  {
    title: 'Голос Араху',
    description: 'Відшукати видіння духа острова — він знає, де Скарб і яка ціна.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['met_arahu'],
    unlockHint: 'Амулет «прокинувся» або священна гора',
    chain: 'temple',
  },
  {
    title: 'Ключ від храму',
    description: 'Зібрати знання/заряд амулета, щоб відчинити внутрішній храм.',
    givenBy: 'Найя',
    chapter: 'temple',
    completeFactKeys: ['temple_opened'],
    unlockHint: 'Знайдено храм, але двері зачинені',
    chain: 'temple',
  },
  {
    title: 'Вибір долі',
    description:
      'Біля Скарбу Атлантів обрати шлях: свобода, жриця, богиня, руйнування або темрява.',
    givenBy: 'Система',
    chapter: 'climax',
    completeFactKeys: [
      'ending_freedom',
      'ending_priestess',
      'ending_goddess',
      'ending_destroyer',
      'ending_dark_queen',
    ],
    unlockHint: 'treasure_found',
    chain: 'temple',
  },
]

/** Compact block for the GM system prompt. */
export function formatCanonEventsForPrompt(max = 90): string {
  const lines = CANON_EVENTS.slice(0, max).map(
    (e) => `• ${e.key} [${e.chapter}/${e.category}]: ${e.trigger}`
  )
  return (
    `\n--- КАНОНІЧНІ ПОДІЇ (обов'язковий FACT_ADD при спрацюванні) ---\n` +
    lines.join('\n') +
    `\nКінцівки: ending_freedom | ending_priestess | ending_goddess | ending_destroyer | ending_dark_queen\n` +
    `Ключі латиницею snake_case. Не вигадуй альтернативних ключів для тих самих подій.\n---\n`
  )
}

/** Per-tribe first-entry reactions — always inject. */
export function formatTribeEntriesForPrompt(): string {
  const lines = TRIBE_ENTRIES.map(
    (t) =>
      `• ${t.tribe} (${t.locationName})\n` +
      `  Реакція: ${t.firstReaction}\n` +
      `  ${t.values}\n` +
      `  FACT: ${t.enteredFactKey} + QUEST «${t.entryQuestTitle}»\n` +
      `  Лідери: ${t.leaders.join(', ')}`
  )
  return (
    `\n--- ВХІД ДО ПЛЕМЕН (кожен народ реагує ІНАКШЕ — не копіюй Кай-Тору) ---\n` +
    `При ПЕРШОМУ заході на територію: STAT location + FACT_ADD entered_* + QUEST_UPDATE add «Вхід: …» + REL_UPDATE лідерів.\n` +
    lines.join('\n') +
    `\n---\n`
  )
}

/** Side-quest hooks for the GM (not auto-seeded as active). */
export function formatSideQuestsForPrompt(): string {
  const byChain = (chain: SideQuestDef['chain']) =>
    SIDE_QUESTS.filter((q) => q.chain === chain)

  const fmt = (q: SideQuestDef) =>
    `• «${q.title}» (${q.chapter}, ${q.givenBy}) — ${q.unlockHint}`

  return (
    `\n--- ПОБІЧНІ КВЕСТИ (QUEST_UPDATE add за моментом) ---\n` +
    `## Ланцюг Джека\n${byChain('jack').map(fmt).join('\n')}\n` +
    `## Арка Зека (гієноїд-відступник)\n${byChain('zek').map(fmt).join('\n')}\n` +
    `## Вхід у території\n${byChain('tribe_entry').map(fmt).join('\n')}\n` +
    `## Інше\n${SIDE_QUESTS.filter((q) => !q.chain || !['jack', 'zek', 'tribe_entry'].includes(q.chain)).map(fmt).join('\n')}\n` +
    `Не відкривай усі одразу. При вході в нову територію племені — ЗАВЖДИ квест «Вхід: …».\n` +
    `Арка Зека: він УЖЕ вийшов зі стаї (не «просто заблукав») — death-scent, мисливці, таємниця втечі, фінал.\n---\n`
  )
}

/** Dedicated GM brief for the renegade hyenoid arc. */
export function formatZekArcForPrompt(): string {
  return (
    `\n--- АРКА: ЗЕК — ГІЄНОЇД-ВІДСТУПНИК ---\n` +
    `Канон: Зек — самець, що ВИЙШОВ зі стаї Кіри. У матріархаті самці — підлеглі/розплідники.\n` +
    `Втеча: відмовився від повного ритуалу підкорення, зірвав статус «улюбленого жеребця» Кіри, ` +
    `втік у ніч, коли стая йшла в рейд. Не «вигнали лагідно» — він злочинець для стаї.\n` +
    `Мітка: death-scent (запах смерті) — гієноїдки зобов'язані повернути або вбити. Чути здалеку.\n` +
    `Характер: полохливий, вдячний, хитрий, сексуально досвідчений (вузол/замок), може стати вірним companion.\n` +
    `Ланцюг квестів: Сліди відступника → Зустріч → Звільни Зека / Притулок → Таємниця втечі → ` +
    `Мисливці стаї → Зняти мітку → Провідник → Суд Кіри → Доля відступника.\n` +
    `FACT keys: zek_escape_clue | met_zek | zek_escape_story | zek_death_scent | zek_sheltered | ` +
    `zek_hunters | zek_mark_cleansed | zek_guide | zek_protected | zek_betrayed | zek_kira_confront | ` +
    `zek_free_exile | zek_companion | zek_returned | zek_dead.\n` +
    `Не плутай з звичайним патрулем. Зек ≠ Кіра. Кай-Тору можуть зневажати «пса» біля селища.\n---\n`
  )
}

export function getCanonEvent(key: string): CanonEvent | undefined {
  return CANON_EVENTS.find((e) => e.key === key)
}

export function getTribeEntryForLocation(location: string): TribeEntryDef | undefined {
  const loc = (location || '').toLowerCase()
  return TRIBE_ENTRIES.find((t) => t.locationHints.some((h) => loc.includes(h.toLowerCase())))
}
