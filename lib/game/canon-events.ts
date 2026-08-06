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
  // --- prologue / arrival ---
  {
    key: 'treasure_lead',
    category: 'plot',
    chapter: 'arrival',
    content:
      'Лара знайшла наводку на Скарб Атлантів на острові, оточеному вічним штормом (до експедиції).',
    trigger: 'Стартовий канон / спогад / щоденник',
  },
  {
    key: 'expedition_hired_jack',
    category: 'plot',
    chapter: 'arrival',
    content:
      'Лара найняла Джека Вейна провідником експедиції до острова (до аварії).',
    trigger: 'Стартовий канон / спогад / діалог із Джеком',
  },
  {
    key: 'shipwrecked',
    category: 'plot',
    chapter: 'arrival',
    content:
      'Судно розбилось у штормі; Лару винесло на берег без спорядження, лише з амулетом.',
    trigger: 'Старт гри / пробудження на березі',
  },
  {
    key: 'jack_fate_unknown',
    category: 'plot',
    chapter: 'arrival',
    content: 'Доля Джека після аварії ще не підтверджена.',
    trigger: 'До jack_ashore_with_lara / jack_near_wreck / met_jack',
  },
  {
    key: 'jack_ashore_with_lara',
    category: 'npc',
    chapter: 'arrival',
    content:
      'Джек Вейн опинився на тому ж відрізку берега, що й Лара (вцілів і зійшов поруч).',
    trigger: 'Перші хвилини на березі: Джек поруч / окликає / лежить неподалік',
  },
  {
    key: 'jack_near_wreck',
    category: 'npc',
    chapter: 'arrival',
    content:
      'Джек лишився біля уламків човна / далі по узбережжю — не поруч із місцем пробудження Лари.',
    trigger: 'Сліди/крик/багаття біля уламків, не на тому ж піску',
  },
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
    trigger: 'Пошук уламків, сліди на березі/в джунглях — особливо якщо Джек не поруч',
  },

  // --- tribe / cast ---
  {
    key: 'met_tane',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Лара зустріла Тане — молодого воїна/мисливця Кай-Тору, сина вождівської лінії. Ніжний, пристрасний; має сестру Лею.',
    trigger: 'Перша поява Тане',
  },
  {
    key: 'met_leya',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Лара зустріла Лею — принцесу Кай-Тору, доньку вождя Макаї, рідну сестру Тане. Горда, ревнива; «подруга» Джека.',
    trigger: 'Перша поява Леї',
  },
  {
    key: 'met_jack',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Лара зустріла Джека Вейна після аварії — свого найнятого провідника (не випадкового туриста).',
    trigger: 'Перший живий контакт із Джеком на острові (берег / уламки / джунглі)',
  },
  {
    key: 'jack_found_alive',
    category: 'npc',
    chapter: 'tribe',
    content: 'Підтверджено: Джек Вейн живий після шторму і лишається на острові.',
    trigger: 'Разом із met_jack / jack_ashore_with_lara / jack_near_wreck',
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

  // --- АРКА КЕНТАВРІВ: Ксерон · Іпполіта · табун · Лара ---
  {
    key: 'xeron_demands_trial',
    category: 'npc',
    chapter: 'depths',
    content:
      'Ксерон відкрито вимагає випробування (біг/сила) перед повагою — інакше Лара «легка здобич».',
    trigger: 'Перший серйозний діалог із Ксероном на землях табуна',
  },
  {
    key: 'xeron_first_intimacy',
    category: 'npc',
    chapter: 'depths',
    content:
      'Перша інтимна близькість із Ксероном (зазвичай після перемоги/поваги; великий розмір, верхова анатомія).',
    trigger: 'SEX_SCENE з партнером Ксерон',
  },
  {
    key: 'xeron_respects_lara',
    category: 'npc',
    chapter: 'depths',
    content: 'Ксерон визнав Лару рівною / вартою — не здобиччю (слова, жест табуна, дозвіл).',
    trigger: 'Після trial + чесна сцена / високий respect',
  },
  {
    key: 'hippolyta_jealousy',
    category: 'npc',
    chapter: 'depths',
    content: 'Іпполіта виявила ревнощі через близькість Лари з Ксероном або статус у табуні.',
    trigger: 'Конфлікт/діалог після xeron_intimacy або високого bond з Ксероном',
  },
  {
    key: 'hippolyta_first_intimacy',
    category: 'npc',
    chapter: 'depths',
    content: 'Перша інтимна близькість із Іпполітою (лесбі / сестринство тіла).',
    trigger: 'SEX_SCENE з партнером Іпполіта',
  },
  {
    key: 'hippolyta_teaches_riding',
    category: 'npc',
    chapter: 'depths',
    content: 'Іпполіта вчила Лару триматись / «їздити» з кентавром (баланс, ритм, довіра).',
    trigger: 'Спільне тренування / урок верхової з Іпполітою',
  },
  {
    key: 'centaur_herd_challenge',
    category: 'tribe',
    chapter: 'depths',
    content: 'Інші кентаври оскаржили статус Лари — виклик табуна (біг, бій, ритуал).',
    trigger: 'Конфлікт із членами табуна після прийняття',
  },
  {
    key: 'centaur_mate_claim',
    category: 'npc',
    chapter: 'depths',
    content: 'Ксерон (або табун) заявив «claim» / сезонну пару / право на Лару як обраницю.',
    trigger: 'Публічна заява вожака після близькості',
  },
  {
    key: 'centaur_herd_ally',
    category: 'tribe',
    chapter: 'depths',
    content: 'Табун став союзником Лари (військо/провід/захист лук).',
    trigger: 'Висока репутація + trial + (moon run або mate path)',
  },
  {
    key: 'centaur_exile_path',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара пішла шляхом відмови/вигнання від табуна (ворожість або самостійність).',
    trigger: 'Відмова від claim / провал trial / образа Ксерона',
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
  // =====================================================================
  // АРКА: ЗЕК — ГІЄНОЇД-ВТІКАЧ / ВІДСТУПНИК  (послідовний канон)
  // =====================================================================
  // 1. СЛІДИ І ЗУСТРІЧ
  // 2. ПРИТУЛОК, ІНТИМ, ДОВІРА
  // 3. DEATH-SCENT, МИСЛИВЦІ, ЗАХИСТ/ЗРАДА
  // 4. ЗНЯТИ МІТКУ, ПРОВІДНИК, ТАЄМНИЦІ СТАЇ
  // 5. СУД КІРИ, ТОРГ, ФІНАЛИ

  {
    key: 'met_zek',
    category: 'npc',
    chapter: 'depths',
    content:
      'Лара зустріла Зека — самця-гієноїда, відступника зі стаї Кіри. Він УЖЕ втік із матріархату і просить захисту (не «просто заблукав»).',
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
    key: 'zek_begs_protection',
    category: 'npc',
    chapter: 'depths',
    content:
      'Зек відкрито благав Лару про захист від стаї — тілом, секретами стежок, службою; страх перед Кірою справжній.',
    trigger: 'Діалог після met_zek: «не віддавай Кірі»',
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
    key: 'zek_kai_toru_hostility',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Кай-Тору (Тане/Макаї/селяни) вороже або зневажливо відреагували на «пса»-гієноїда біля селища / біля Лари.',
    trigger: 'Зек у/біля селища Кай-Тору; конфлікт культур',
  },
  {
    key: 'zek_first_intimacy',
    category: 'npc',
    chapter: 'depths',
    content:
      'Перша інтимна близькість Лари з Зеком (часто з відчаю/вдячності з його боку; вузол/замок гієноїда).',
    trigger: 'SEX_SCENE з партнером Зек (перший раз)',
  },
  {
    key: 'zek_knot_bond',
    category: 'npc',
    chapter: 'depths',
    content:
      'Зв\'язок через вузол/замок: глибока довіра або залежність після «зчеплення» з Зеком.',
    trigger: 'Секс-сцена з knot/lock і bond↑',
  },
  {
    key: 'zek_saves_lara',
    category: 'npc',
    chapter: 'depths',
    content: 'Зек ризикнув життям і врятував / прикрив Лару (бій, засідка, отрута, падіння).',
    trigger: 'Зек захищає Лару в критичний момент',
  },
  {
    key: 'zek_hunters',
    category: 'plot',
    chapter: 'depths',
    content: 'Стая вислала мисливців за Зеком; сталася сутичка або переговори.',
    trigger: 'Засідка мисливців / випадкова подія zek_hunters',
  },
  {
    key: 'zek_scent_masked',
    category: 'ritual',
    chapter: 'depths',
    content:
      'Death-scent тимчасово замасковано (багно, зілля Найї, чужий феромон, амулет) — не знято назавжди.',
    trigger: 'Тимчасовий обман запаху до повного очищення',
  },
  {
    key: 'zek_mark_cleansed',
    category: 'ritual',
    chapter: 'depths',
    content:
      'Мітку «запаху смерті» знято назавжди (ритуал Найї, амулет, кров Кіри, або обман феромонами на рівні звичаю).',
    trigger: 'Ритуал очищення / квест «Зняти мітку»',
  },
  {
    key: 'zek_naya_aid',
    category: 'npc',
    chapter: 'depths',
    content: 'Найя втрутилась в арку Зека: розпізнала death-scent, запропонувала ритуал, ціну або відмову.',
    trigger: 'Розмова/ритуал Найї про Зека або мітку',
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
    key: 'zek_pack_secret',
    category: 'secret',
    chapter: 'depths',
    content:
      'Зек розкрив таємницю стаї: схованки, ритуал «жеребця», слабкість Кіри, стежка до околиць храму, або чому death-scent священний.',
    trigger: 'Високий bond / після порятунку / після зняття мітки',
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
    key: 'kira_demands_zek',
    category: 'plot',
    chapter: 'depths',
    content:
      'Кіра відкрито вимагає повернення Зека (гінець, ультиматум, «віддай пса — живи»).',
    trigger: 'До або під час зустрічі з Кірою, якщо Зек ще втікач',
  },
  {
    key: 'kira_trade_for_zek',
    category: 'plot',
    chapter: 'depths',
    content:
      'Кіра запропонувала торг: Лара в гарем / васалітет / секс-ритуал — в обмін на життя/свободу Зека (або навпаки).',
    trigger: 'Переговори з Кірою про відступника',
  },
  {
    key: 'zek_kira_confront',
    category: 'plot',
    chapter: 'depths',
    content: 'Конфронтація з Кірою саме через Зека (суд, дуель, торг, гарем-ультиматум).',
    trigger: 'Кіра вимагає відступника — кульмінаційна сцена',
  },
  {
    key: 'zek_loyal_oath',
    category: 'npc',
    chapter: 'depths',
    content:
      'Зек склав клятву вірності Ларі (кров, запах, слово вигнанця) — не як раб стаї, а як вільний companion.',
    trigger: 'Високий bond + свідомий вибір «йду з тобою»',
  },
  {
    key: 'zek_jealousy',
    category: 'npc',
    chapter: 'depths',
    content: 'Зек виявив ревнощі до іншого партнера Лари (Тане, Джек, Кіра тощо) — страх знову бути «розплідником на вимогу».',
    trigger: 'Трикутник / порівняння / відмова в близькості',
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
    content:
      'Гієноїди рейдували селище Кай-Тору; Лара свідком/учасницею. Може бути тиск через Зека або звичайний рейд стаї Кіри.',
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

  // =====================================================================
  // АРКА РОДУ: ТАНЕ · ЛЕЯ · БАТЬКО МАКАЇ · ЛАРА  (послідовний канон)
  // =====================================================================
  // Порядок для GM (етапи 1→4). FACT_ADD при кожному кроці.
  //
  // 1. ЗУСТРІЧ І ЗВ'ЯЗОК З ТАНЕ
  // 2. СЕСТРА ЛЕЯ, ІНЦЕСТ, РЕВНОЩІ
  // 3. БАТЬКО МАКАЇ, ЗВИЧАЙ КРОВІ, СПАДОК
  // 4. РОЗВ'ЯЗКИ: благословення / відмова / вогнище / soul-bound / тріада

  // --- 1. Tane + Lara ---
  {
    key: 'tane_guides_lara',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане особисто повів / запросив Лару до селища Кай-Тору як свій обов\'язок і інтерес.',
    trigger: 'Тане стає провідником до селища після met_tane',
  },
  {
    key: 'tane_first_hunt',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лара та Тане успішно вполювали здобич джунглів разом.',
    trigger: 'Перше спільне полювання з Тане',
  },
  {
    key: 'tane_first_intimacy',
    category: 'npc',
    chapter: 'tribe',
    content: 'Перша повна інтимна близькість Лари з Тане (добровільна секс-сцена).',
    trigger: 'SEX_SCENE_START/END з партнером Тане (перший раз)',
  },
  {
    key: 'tane_sacred_waterfall',
    category: 'npc',
    chapter: 'tribe',
    content: 'Ніч пристрасті та обітниць біля священного водоспаду з Тане.',
    trigger: 'Романтична секс-сцена з Тане біля водоспаду',
  },
  {
    key: 'tane_life_saver',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане ризикнув життям і прикрив Лару від смертельного удару.',
    trigger: 'Бій / врятування Лари у критичний момент',
  },
  {
    key: 'tane_jealousy_jack',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане виявив ревнощі через близькість Лари з Джеком Вейном.',
    trigger: 'Ревнощі Тане при розмові про Джека або трикутнику',
  },
  {
    key: 'tane_tribe_tattoo',
    category: 'ritual',
    chapter: 'tribe',
    content: 'Ларі завдано священне племінне татуювання Сонця Кай-Тору (часто з Тане/Найєю).',
    trigger: 'Ритуал нанесення розпису/татуювання',
  },
  {
    key: 'tane_presents_lara_to_father',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане привів Лару до батька — вождя Макаї — як гостю / обраницю / «свою».',
    trigger: 'Сцена аудієнції: Тане + Лара + Макаї',
  },

  // --- 2. Leya sibling-lover ---
  {
    key: 'tane_leya_siblings',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Підтверджено: Тане і Лея — рідний брат і сестра, діти вождя Макаї (вождівська кров).',
    trigger: 'Діалог, чутка в селищі, або зізнання',
  },
  {
    key: 'tane_leya_secret_lovers',
    category: 'secret',
    chapter: 'tribe',
    content:
      'Лара дізналася: рідний брат Тане і сестра Лея — таємні коханці; інцестуальний зв\'язок активний до появи Лари.',
    trigger: 'Свідчення, підглядання, або зізнання про інтим Тане–Лея',
  },
  {
    key: 'caught_tane_leya_intimate',
    category: 'secret',
    chapter: 'tribe',
    content: 'Лара застала / побачила Тане й Лею в інтимній близькості (не чутка — очевидець).',
    trigger: 'Сцена підглядання / зриву таємниці на місці',
  },
  {
    key: 'leya_past_with_jack',
    category: 'secret',
    chapter: 'tribe',
    content:
      'Лея розкрила Ларі правду про секс із Джеком Вейном і образу (поряд із таємницею з братом).',
    trigger: 'Глибокий діалог із Леєю про Джека',
  },
  {
    key: 'tane_leya_confrontation',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Спалах ревнощів Леї: сестра-коханка бачить у Ларі загрозу зв\'язку з братом і ролі «першої».',
    trigger: 'Конфронтація Леї з Ларою через Тане',
  },
  {
    key: 'leya_threatens_lara',
    category: 'npc',
    chapter: 'tribe',
    content: 'Лея прямо погрожувала Ларі (вигнання, ритуал, шантаж, насильство — за тоном сцени).',
    trigger: 'Агресивна сцена Леї після суперництва',
  },
  {
    key: 'tane_torn_choice',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане відкрито зізнався, що розірваний між сестрою-коханкою Леєю і почуттям до Лари.',
    trigger: 'Ісповідь Тане після викриття інцесту / конфронтації',
  },
  {
    key: 'tane_leya_reconciliation',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Примирення з Леєю — правила «ділити» Тане, союз або інший компроміс трьох.',
    trigger: "Розв'язання конфлікту Лея–Тане–Лара",
  },
  {
    key: 'leya_accepts_lara',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Лея визнала Лару «сестрою по вогню» і дозволила розділити брата / увійти в коло пристрасті.',
    trigger: 'Високий bond із Леєю / згода ділити Тане',
  },
  {
    key: 'leya_lara_first_intimacy',
    category: 'npc',
    chapter: 'tribe',
    content: 'Перша інтимна близькість Лари з Леєю (лесбі / спільна сцена з Тане).',
    trigger: 'Секс-сцена з участю Леї',
  },
  {
    key: 'tane_leya_triad_ritual',
    category: 'ritual',
    chapter: 'tribe',
    content:
      'Ритуал пристрасті трьох: брат Тане + сестра Лея + Лара (таємний або племінний).',
    trigger: 'Інтимний ритуал/сцена троє',
  },

  // --- 3. Father Makai + blood custom ---
  {
    key: 'tane_leya_father_clue',
    category: 'secret',
    chapter: 'tribe',
    content:
      'З\'явився натяк на таємницю батька Макаї: звичай крові, зниклий мисливець-предок, або заборонений обряд роду.',
    trigger: 'Чутка Найї/старійшин, слова Тане/Леї, символ у селищі',
  },
  {
    key: 'makai_blood_custom_hint',
    category: 'secret',
    chapter: 'tribe',
    content:
      'Вождь Макаї (батько) натякнув або виявив, що знає про «ложе крові» — інтим брата й сестри як частину/тінь звичаю.',
    trigger: 'Діалог із Макаї про дітей / звичаї / Лару',
  },
  {
    key: 'tane_leya_father_journal',
    category: 'secret',
    chapter: 'depths',
    content:
      'Знайдено щоденник/реліквію роду Макаї в руїнах: правда про звичай крові, предка-мисливця й долю дітей-коханців.',
    trigger: 'Знаходження реліквії/щоденника батька/роду в руїнах',
  },
  {
    key: 'makai_claims_lara',
    category: 'npc',
    chapter: 'tribe',
    content:
      'Макаї заявив «право чужинки/першого» або випробування над Ларою — батько втручається в долю сина.',
    trigger: 'Аудієнція / сцена права вождя над Ларою',
  },
  {
    key: 'makai_sex_with_lara',
    category: 'npc',
    chapter: 'tribe',
    content: 'Відбулася інтимна сцена Макаї з Ларою (право вождя, торг, або примус — за тоном).',
    trigger: 'SEX_SCENE з партнером Макаї',
  },
  {
    key: 'tane_witnesses_makai_lara',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане дізнався або побачив, що батько Макаї мав близькість із Ларою — удар по сину.',
    trigger: 'Після makai_sex_with_lara / зізнання / свідчення',
  },
  {
    key: 'tane_defies_makai',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане відкрито протистоїть батькові Макаї заради Лари (слова, бій, втеча, шантаж).',
    trigger: 'Конфлікт син–батько через Лару',
  },
  {
    key: 'makai_blesses_lara',
    category: 'npc',
    chapter: 'tribe',
    content: 'Макаї благословив союз Лари з Тане (або її місце біля дітей) — батьківське визнання.',
    trigger: 'Сцена благословення вождя після випробувань',
  },
  {
    key: 'makai_rejects_lara',
    category: 'npc',
    chapter: 'tribe',
    content: 'Макаї відкинув Лару як обраницю сина (вигнання, заборона, ворожість).',
    trigger: 'Альтернативний розв\'язок — відмова батька',
  },
  {
    key: 'family_hearth_accepted',
    category: 'ritual',
    chapter: 'tribe',
    content:
      'Родинне вогнище прийняте: Лара, Тане, Лея (± Макаї) уклали мир крові/вогню — Лара «своя» в роді.',
    trigger: 'Фінальний ритуал роду після примирення',
  },
  {
    key: 'tane_chooses_lara_public',
    category: 'npc',
    chapter: 'tribe',
    content: 'Тане публічно обрав Лару (навіть ціною конфлікту з Леєю чи батьком).',
    trigger: 'Публічна заява/обряд вибору',
  },
  {
    key: 'blood_custom_broken',
    category: 'secret',
    chapter: 'tribe',
    content: 'Звичай крові (інцест брата й сестри) розірвано або реформовано — нова ера для роду.',
    trigger: 'Спільне рішення Макаї/дітей/Лари змінити звичай',
  },
  {
    key: 'blood_custom_continued',
    category: 'secret',
    chapter: 'tribe',
    content: 'Звичай крові збережено: Лара увійшла в коло, не руйнуючи зв\'язок Тане–Лея.',
    trigger: 'Тріада / прийняття без розриву інцесту',
  },

  // --- naya & amulet lore arcs ---
  {
    key: 'naya_first_prophecy',
    category: 'secret',
    chapter: 'tribe',
    content: 'Шаманка Найя виголосила канонічне пророцтво про долю Лари та Амулета.',
    trigger: 'Глибока розмова з Найєю про майбутнє',
  },
  {
    key: 'amulet_first_overcharge',
    category: 'ritual',
    chapter: 'depths',
    content: 'Амулет вперше перевантажився від пристрасті — спалах магічного сяйва.',
    trigger: 'Сильний оргазм / переповнення амулета магічною енергією',
  },
  {
    key: 'naya_sacred_elixir',
    category: 'item',
    chapter: 'tribe',
    content: 'Лара зварювала з Найєю священний еліксир молодості та чуттєвості.',
    trigger: 'Крафт або ритуал виготовлення священного еліксиру',
  },
  {
    key: 'naya_ancestor_spirit',
    category: 'ritual',
    chapter: 'depths',
    content: 'Вхід у транс та спілкування з духами предків Кай-Тору біля святилища.',
    trigger: 'Ритуал трансу з Найєю',
  },

  // --- centaur & minotaur & hyena & boar arcs ---
  {
    key: 'xeron_challenge_race',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара взяла участь у виснажливому забігу навипередки з ватажком Ксероном.',
    trigger: 'Змагання бігу з Ксероном',
  },
  {
    key: 'hippolyta_sisterhood',
    category: 'npc',
    chapter: 'depths',
    content: 'Найшвидша кобила Іпполіта уклала сестринський союз із Ларою.',
    trigger: 'Дружба/союз із Іпполітою',
  },
  {
    key: 'centaur_moon_run',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара приєдналася до нічного забігу табуна кентаврів під місячним сяйвом.',
    trigger: 'Нічний ритуальний забіг табуна',
  },
  {
    key: 'mira_rebellion_plan',
    category: 'secret',
    chapter: 'depths',
    content: 'Міра розкрила Ларі таємний план повалення тиранії Гор-Ака.',
    trigger: 'Таємна розмова з Мірою про зраду',
  },
  {
    key: 'gor_ak_harem_escape',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара вирвалася з полону гарему мінотавра Гор-Ака.',
    trigger: 'Втеча / звільнення з гарему Гор-Ака',
  },
  {
    key: 'minotaur_arena_victory',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара здобула перемогу на підземній арені мінотаврів.',
    trigger: 'Перемога в бою на арені мінотаврів',
  },
  {
    key: 'kira_matriarch_duel',
    category: 'tribe',
    chapter: 'depths',
    content: 'Лара вступила в дуель сили з матріархом гієноїдів Кірою.',
    trigger: 'Дуель або вирішальна сутичка з Кірою',
  },
  {
    key: 'hyena_pheromone_storm',
    category: 'world',
    chapter: 'depths',
    content: 'Лара потрапила під дію диких феромонів стаї гієноїдів.',
    trigger: 'Вплив феромонного туману / стрибок Desire до 90+',
  },
  {
    key: 'sow_matron_secret_deal',
    category: 'secret',
    chapter: 'depths',
    content: 'Лара уклала таємну угоду зі Свиноматкою заради проходу скрізь болота.',
    trigger: 'Торг / таємна угода зі Свиноматкою',
  },
  {
    key: 'boar_pit_escape',
    category: 'plot',
    chapter: 'depths',
    content: 'Лара вирвалася з брудної ями свинолюдів.',
    trigger: 'Втеча з полону свинолюдів',
  },
  {
    key: 'arahu_first_manifestation',
    category: 'secret',
    chapter: 'depths',
    content: 'Присутність духа Араху матеріалізувалася у видінні Лари.',
    trigger: 'Явлення Араху / прямова мова духа',
  },
  {
    key: 'atlantean_portal_activated',
    category: 'plot',
    chapter: 'temple',
    content: 'Лара за допомогою Амулета запустила давній портал Атлантиди.',
    trigger: 'Активація магічного вівтаря/порталу',
  },
  {
    key: 'temple_chamber_of_ecstasy',
    category: 'ritual',
    chapter: 'temple',
    content: 'Лара увійшла в Залу Екстазу всередині Храму.',
    trigger: 'Вхід до центральної зали екстазу у Храмі',
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
  chain?:
    | 'jack'
    | 'zek'
    | 'tane_family'
    | 'centaur'
    | 'tribe_entry'
    | 'romance'
    | 'temple'
    | 'other'
}

export const SIDE_QUESTS: SideQuestDef[] = [
  // ——— Jack chain ———
  {
    title: 'Знайти провідника',
    description:
      'З\'ясувати долю Джека Вейна — найнятого провідника експедиції: поруч на березі, біля уламків, або за слідами. Він знає острів краще за Лару.',
    givenBy: 'Система',
    chapter: 'arrival',
    completeFactKeys: [
      'met_jack',
      'jack_found_alive',
      'jack_ashore_with_lara',
      'jack_near_wreck',
    ],
    unlockHint: 'З пробудження на березі / перші ходи',
    chain: 'jack',
  },
  {
    title: 'Сліди Джека',
    description:
      'Якщо Джека немає поруч: уламки, багаття, речі, слід до джунглів — знайти, куди він пішов.',
    givenBy: 'Система',
    chapter: 'jungle',
    completeFactKeys: ['jack_wreck_clue'],
    unlockHint: 'Якщо jack_fate_unknown / jack_near_wreck, до met_jack',
    chain: 'jack',
  },
  {
    title: 'Угода з Джеком',
    description:
      'Джек — найманець: після аварії умови змінюються. Їжа, захист, секс за згодою, частка скарбу або «старий борг».',
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
      'Розрулити вузол: Лея — сестра Тане і його таємна коханка + «подруга» Джека. Ревнощі, шантаж, викриття або союз.',
    givenBy: 'Система',
    chapter: 'tribe',
    completeFactKeys: ['jack_leya_confrontation', 'jack_secret', 'leya_rivalry', 'tane_leya_secret_lovers'],
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

  // ——— Kai-Toru entry (not tane_family chain) ———
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
    title: 'Останнє бажання шаманки',
    description: 'Найя просить Лару про ритуал повернення молодості (інтимний обряд).',
    givenBy: 'Найя',
    chapter: 'tribe',
    completeFactKeys: ['naya_youth_ritual'],
    unlockHint: 'Довіра до Найї / розмова про амулет',
    chain: 'romance',
  },
  {
    title: 'Пророцтво Шаманки',
    description: 'Вислухати видіння Найї про магію Амулета, Скарб Атлантів та майбутній вибір.',
    givenBy: 'Найя',
    chapter: 'tribe',
    completeFactKeys: ['naya_first_prophecy', 'learned_amulet_secret'],
    unlockHint: 'Після spoked_with_naya',
    chain: 'temple',
  },

  // ——— АРКА РОДУ: Тане · Лея · Макаї · Лара (послідовно) ———
  {
    title: 'Піти з Тане до селища',
    description: 'Тане запрошує і веде Лару до Кай-Тору — перший крок арки роду.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['met_tane', 'tane_guides_lara', 'entered_village'],
    unlockHint: 'Після зустрічі з Тане',
    chain: 'tane_family',
  },
  {
    title: 'Священне полювання',
    description: 'Спільне полювання з Тане — згуртованість, пристрасть, довіра (до/після першої близькості).',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['tane_first_hunt'],
    unlockHint: 'Bond Тане ≥2 / після входу в селище',
    chain: 'tane_family',
  },
  {
    title: 'Ніч у водоспаді',
    description: 'Інтим і обітниці з Тане біля священного водоспаду — закріпити почуття.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['tane_first_intimacy', 'tane_sacred_waterfall', 'tane_confessed'],
    unlockHint: 'Bond ≥4 або після полювання',
    chain: 'tane_family',
  },
  {
    title: 'Перед батьком',
    description: 'Тане приводить Лару до вождя Макаї — батька. Право чужинки, оцінка, напруга сина.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['tane_presents_lara_to_father', 'met_makai', 'makai_claims_lara'],
    unlockHint: 'Після близькості з Тане / guest_of_tribe',
    chain: 'tane_family',
  },
  {
    title: 'Право батька',
    description:
      'Макаї втручається: право вождя над чужинкою. Можлива інтимна сцена з батьком — удар по Тане.',
    givenBy: 'Макаї',
    chapter: 'tribe',
    completeFactKeys: ['makai_claims_lara', 'makai_sex_with_lara', 'tane_witnesses_makai_lara'],
    unlockHint: 'Аудієнція / «Право чужинки»',
    chain: 'tane_family',
  },
  {
    title: 'Таємниця брата й сестри',
    description:
      'Дізнатися: Тане і Лея — рідний брат і сестра та таємні коханці (інцест уже був до Лари).',
    givenBy: 'Система',
    chapter: 'tribe',
    completeFactKeys: [
      'met_leya',
      'tane_leya_siblings',
      'tane_leya_secret_lovers',
      'caught_tane_leya_intimate',
    ],
    unlockHint: 'met_tane + met_leya / підглядання / чутки',
    chain: 'tane_family',
  },
  {
    title: 'Ревнощі сестри',
    description: 'Конфронтація з Леєю: сестра-коханка захищає брата і своє місце. Погрози або торг.',
    givenBy: 'Лея',
    chapter: 'tribe',
    completeFactKeys: ['leya_rivalry', 'tane_leya_confrontation', 'leya_threatens_lara', 'tane_torn_choice'],
    unlockHint: 'Після викриття інцесту або високого bond з Тане',
    chain: 'tane_family',
  },
  {
    title: 'Минуле Леї та Джека',
    description: 'Розкрити секс Леї з Джеком і як це б\'ється з таємницею брата.',
    givenBy: 'Лея',
    chapter: 'tribe',
    completeFactKeys: ['leya_past_with_jack', 'tane_jealousy_jack'],
    unlockHint: 'met_jack + met_leya',
    chain: 'tane_family',
  },
  {
    title: 'Спадок крові',
    description:
      'Сліди й щоденник роду Макаї в руїнах: звичай крові, чому брат і сестра ділять ложе, доля дітей вождя.',
    givenBy: 'Тане / Лея / Найя',
    chapter: 'depths',
    completeFactKeys: ['tane_leya_father_clue', 'makai_blood_custom_hint', 'tane_leya_father_journal'],
    unlockHint: 'Розмова про родину + похід у руїни',
    chain: 'tane_family',
  },
  {
    title: 'Син проти батька',
    description: 'Тане стає проти Макаї заради Лари — слова, бій або втеча. Кульмінація синівського бунту.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['tane_defies_makai', 'tane_life_saver'],
    unlockHint: 'Після права батька / відмови / образи Тане',
    chain: 'tane_family',
  },
  {
    title: 'Благословення або вигнання',
    description:
      'Розв\'язок з Макаї: благословить Лару біля дітей (makai_blesses_lara) АБО відкине (makai_rejects_lara).',
    givenBy: 'Макаї',
    chapter: 'tribe',
    completeFactKeys: ['makai_blesses_lara', 'makai_rejects_lara'],
    unlockHint: 'Після конфлікту син–батько / спадок крові',
    chain: 'tane_family',
  },
  {
    title: 'Сестра по вогню',
    description: 'Примирення з Леєю: прийняти Лару, ділити Тане, лесбі/спільна близькість — за згодою.',
    givenBy: 'Лея',
    chapter: 'tribe',
    completeFactKeys: ['tane_leya_reconciliation', 'leya_accepts_lara', 'leya_lara_first_intimacy'],
    unlockHint: 'Після ревнощів / благословення / спадок',
    chain: 'tane_family',
  },
  {
    title: 'Вогнище роду',
    description:
      'Фінал арки: ритуал вогнища (тріада, soul-bound, публічний вибір, збереження чи розрив звичаю крові).',
    givenBy: 'Тане / Лея / Макаї',
    chapter: 'tribe',
    completeFactKeys: [
      'tane_leya_triad_ritual',
      'soul_bound_tane',
      'family_hearth_accepted',
      'tane_chooses_lara_public',
      'blood_custom_broken',
      'blood_custom_continued',
    ],
    unlockHint: 'Висока довіра роду + пройдені попередні кроки арки',
    chain: 'tane_family',
  },
  {
    title: 'Ритуал soul-bound',
    description: 'Тане пропонує магічний зв\'язок душ із Ларою — сила вдвох, зрада смертельна.',
    givenBy: 'Тане',
    chapter: 'tribe',
    completeFactKeys: ['soul_bound_tane'],
    unlockHint: 'Bond Тане ≥7 / після вогнища або замість тріади',
    chain: 'tane_family',
  },
  {
    title: 'Татуювання Сонця',
    description: 'Священні візерунки Кай-Тору на шкірі — знак поваги роду.',
    givenBy: 'Найя / Тане',
    chapter: 'tribe',
    completeFactKeys: ['tane_tribe_tattoo'],
    unlockHint: 'Репутація Кай-Тору або довіра Тане',
    chain: 'tane_family',
  },


  {
    title: 'Бунт Міри',
    description: 'Допомогти воїнці Мірі підготувати повалення брутального ватажка Гор-Ака.',
    givenBy: 'Міра',
    chapter: 'depths',
    completeFactKeys: ['mira_rebellion_plan', 'minotaur_dominance_settled'],
    unlockHint: 'Зустріч з Мірою у лабіринті',
    chain: 'other',
  },
  {
    title: 'Зала Екстазу',
    description: 'Увійти у центральну залу Храму, де магічна енергія Амулета сягає піку.',
    givenBy: 'Система',
    chapter: 'temple',
    completeFactKeys: ['temple_chamber_of_ecstasy', 'atlantean_portal_activated'],
    unlockHint: 'Після temple_opened',
    chain: 'temple',
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

  // ——— АРКА КЕНТАВРІВ: Ксерон · Іпполіта · табун ———
  {
    title: 'Зустріч із табуном',
    description: 'Офіційна зустріч: met_xeron / met_hippolyta, тон «випробуй або йди».',
    givenBy: 'Ксерон',
    chapter: 'depths',
    completeFactKeys: ['met_xeron', 'met_hippolyta', 'xeron_demands_trial'],
    unlockHint: 'Після entered_centaur_lands',
    chain: 'centaur',
  },
  {
    title: 'Випробування швидкості',
    description: 'Ксерон вимагає перемоги в бігу/змаганні перед повагою і близькістю.',
    givenBy: 'Ксерон',
    chapter: 'depths',
    completeFactKeys: ['centaur_trial_won', 'xeron_challenge_race', 'xeron_demands_trial'],
    unlockHint: 'Після зустрічі з Ксероном',
    chain: 'centaur',
  },
  {
    title: 'Повага табуна',
    description: 'Табун визнає Лару вартою — centaur_accepted / xeron_respects_lara.',
    givenBy: 'Ксерон',
    chapter: 'depths',
    completeFactKeys: ['centaur_accepted', 'xeron_respects_lara'],
    unlockHint: 'Після trial won',
    chain: 'centaur',
  },
  {
    title: 'Ніч з вожаком',
    description: 'Близькість із Ксероном після поваги — розмір, ритм, claim-натяк.',
    givenBy: 'Ксерон',
    chapter: 'depths',
    completeFactKeys: ['xeron_first_intimacy', 'centaur_mate_claim'],
    unlockHint: 'Після поваги / високий bond з Ксероном',
    chain: 'centaur',
  },
  {
    title: 'Сестринство Іпполіти',
    description: 'Союз або ревнощі Іпполіти; можлива близькість / урок «їзди».',
    givenBy: 'Іпполіта',
    chapter: 'depths',
    completeFactKeys: [
      'hippolyta_sisterhood',
      'hippolyta_jealousy',
      'hippolyta_first_intimacy',
      'hippolyta_teaches_riding',
    ],
    unlockHint: 'met_hippolyta + (trial або близькість із Ксероном)',
    chain: 'centaur',
  },
  {
    title: 'Нічний забіг табуна',
    description: 'Ритуальний місячний біг — єдність з табуном.',
    givenBy: 'Ксерон / Іпполіта',
    chapter: 'depths',
    completeFactKeys: ['centaur_moon_run'],
    unlockHint: 'Після поваги табуна',
    chain: 'centaur',
  },
  {
    title: 'Виклик табуна',
    description: 'Інші кентаври оскаржують статус — бій/біг/ритуал.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['centaur_herd_challenge'],
    unlockHint: 'Після claim або moon run',
    chain: 'centaur',
  },
  {
    title: 'Доля з табуном',
    description: 'Фінал: союз табуна (centaur_herd_ally) АБО шлях відмови/вигнання (centaur_exile_path).',
    givenBy: 'Ксерон',
    chapter: 'depths',
    completeFactKeys: ['centaur_herd_ally', 'centaur_exile_path'],
    unlockHint: 'Після moon run / challenge / mate claim',
    chain: 'centaur',
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

  // ——— АРКА: Зек — гієноїд-втікач (послідовно) ———
  {
    title: 'Сліди відступника',
    description:
      'Дивні сліди самця-гієноїда поза стаєю: порвана мітка, паніка, запах не «свого». Хтось утік від Кіри.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['zek_escape_clue'],
    unlockHint: 'Джунглі / околиці гієноїдів / чутки Кай-Тору про «пса без стаї»',
    chain: 'zek',
  },
  {
    title: 'Зустріч із відступником',
    description:
      'Зек — самець, що ВИЙШОВ зі стаї. Полохливий, хитрий; благає захисту (тіло, стежки, служба).',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['met_zek', 'zek_begs_protection'],
    unlockHint: 'Після zek_escape_clue або подія «Зек тікає»',
    chain: 'zek',
  },
  {
    title: 'Притулок для вигнанця',
    description:
      'Сховати Зека: табір, руїни, печера, селище. Кай-Тору можуть зневажати «пса» — конфлікт культур.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_sheltered', 'zek_kai_toru_hostility'],
    unlockHint: 'Після met_zek',
    chain: 'zek',
  },
  {
    title: 'Ціна тіла',
    description:
      'Перша близькість із Зеком (відчай/вдячність): вузол, замок, bond. Не обов\'язково — але типовий крок арки.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_first_intimacy', 'zek_knot_bond'],
    unlockHint: 'Після притулку / подія «Зек платить тілом»',
    chain: 'zek',
  },
  {
    title: 'Таємниця втечі',
    description:
      'ЯК і ЧОМУ Зек вийшов зі стаї: не «розплідник», зірваний ритуал, ніч рейду. Правда про death-scent.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_escape_story', 'zek_death_scent'],
    unlockHint: 'Bond Зек ≥3 або порятунок у бою',
    chain: 'zek',
  },
  {
    title: 'Мисливці стаї',
    description:
      'Гієноїдки-мисливці по death-scent. Бій, переговори, обман запахом — захист або видача.',
    givenBy: 'Система',
    chapter: 'depths',
    completeFactKeys: ['zek_hunters', 'zek_protected', 'zek_betrayed', 'zek_saves_lara'],
    unlockHint: 'Після zek_sheltered / death_scent / на території стаї',
    chain: 'zek',
  },
  {
    title: 'Звільни Зека',
    description:
      'Відкритий акт: не здати Зека. (Альтернатива — zek_betrayed за пакт із Кірою.)',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_protected', 'zek_betrayed'],
    unlockHint: 'met_zek + тиск стаї / мисливці',
    chain: 'zek',
  },
  {
    title: 'Маска запаху',
    description:
      'Тимчасово сховати death-scent: багно, зілля, чужий феромон, амулет. Не знімає мітку назавжди.',
    givenBy: 'Зек / Найя',
    chapter: 'depths',
    completeFactKeys: ['zek_scent_masked', 'zek_naya_aid'],
    unlockHint: 'zek_death_scent відомий; до «Зняти мітку»',
    chain: 'zek',
  },
  {
    title: 'Зняти мітку смерті',
    description:
      'Зняти death-scent назавжди: ритуал Найї, кров/феромон Кіри, сила амулета, або звичай стаї.',
    givenBy: 'Найя',
    chapter: 'depths',
    completeFactKeys: ['zek_mark_cleansed', 'zek_naya_aid'],
    unlockHint: 'zek_death_scent; Найя / руїни / торг з Кірою',
    chain: 'zek',
  },
  {
    title: 'Провідник-відступник',
    description:
      'Зек веде обхідними: патрулі, слабкі місця стаї, стежка до околиць храму, таємниці матріархату.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_guide', 'zek_pack_secret'],
    unlockHint: 'Захист + довіра; потрібен провідник углиб',
    chain: 'zek',
  },
  {
    title: 'Ультиматум Кіри',
    description:
      'Кіра вимагає Зека: гінці, торг (Лара ↔ Зек), гаремний ультиматум. kira_demands_zek / kira_trade_for_zek.',
    givenBy: 'Кіра',
    chapter: 'depths',
    completeFactKeys: ['kira_demands_zek', 'kira_trade_for_zek', 'met_kira'],
    unlockHint: 'met_kira або death-scent «світить» до стаї',
    chain: 'zek',
  },
  {
    title: 'Суд Кіри за відступника',
    description:
      'Кульмінація: суд, дуель, торг, війна. Захист Зека, зрада, або hyena_pact як ціна.',
    givenBy: 'Кіра',
    chapter: 'depths',
    completeFactKeys: [
      'zek_kira_confront',
      'zek_protected',
      'zek_betrayed',
      'hyena_pact',
      'kira_matriarch_duel',
    ],
    unlockHint: 'Після ультиматуму / met_kira + Зек живий',
    chain: 'zek',
  },
  {
    title: 'Клятва вигнанця',
    description:
      'Зек клянеться Ларі вірністю (не як раб стаї). Можливі ревнощі до інших партнерів.',
    givenBy: 'Зек',
    chapter: 'depths',
    completeFactKeys: ['zek_loyal_oath', 'zek_jealousy', 'zek_saves_lara'],
    unlockHint: 'Bond високий / після суду або зняття мітки',
    chain: 'zek',
  },
  {
    title: 'Доля відступника',
    description:
      'Фінал: вільний вигнанець, companion, повернення в стаю, або смерть.',
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
  const criticalTail = [
    'found_temple',
    'temple_opened',
    'treasure_found',
    'ending_freedom',
    'ending_priestess',
    'ending_goddess',
    'ending_destroyer',
    'ending_dark_queen',
  ]
  const picked = CANON_EVENTS.slice(0, max)
  const have = new Set(picked.map((e) => e.key))
  const extra = CANON_EVENTS.filter((e) => criticalTail.includes(e.key) && !have.has(e.key))
  const lines = [...picked, ...extra].map(
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

export type SideQuestPromptOpts = {
  /** If set, only these chains (plus always tribe_entry). Empty/omit = all. */
  chains?: Array<NonNullable<SideQuestDef['chain']>>
  /** Include romance/temple/other unchained quests */
  includeOther?: boolean
}

/** Side-quest hooks for the GM (not auto-seeded as active). */
export function formatSideQuestsForPrompt(opts: SideQuestPromptOpts = {}): string {
  const knownChains: NonNullable<SideQuestDef['chain']>[] = [
    'jack',
    'zek',
    'tane_family',
    'centaur',
    'tribe_entry',
  ]
  const want = opts.chains?.length
    ? new Set<string>([...opts.chains, 'tribe_entry'])
    : new Set<string>(knownChains)
  const includeOther = opts.includeOther !== false && !opts.chains?.length

  const byChain = (chain: SideQuestDef['chain']) =>
    SIDE_QUESTS.filter((q) => q.chain === chain)

  const fmt = (q: SideQuestDef) =>
    `• «${q.title}» (${q.chapter}, ${q.givenBy}) — ${q.unlockHint}`

  const sections: string[] = ['\n--- ПОБІЧНІ КВЕСТИ (QUEST_UPDATE add за моментом) ---']
  if (want.has('jack')) {
    sections.push(`## Ланцюг Джека\n${byChain('jack').map(fmt).join('\n')}`)
  }
  if (want.has('tane_family')) {
    sections.push(
      `## Арка роду: Тане · Лея · Макаї · Лара\n${byChain('tane_family').map(fmt).join('\n')}`
    )
  }
  if (want.has('zek')) {
    sections.push(`## Арка Зека (гієноїд-відступник)\n${byChain('zek').map(fmt).join('\n')}`)
  }
  if (want.has('centaur')) {
    sections.push(`## Арка кентаврів\n${byChain('centaur').map(fmt).join('\n')}`)
  }
  if (want.has('tribe_entry')) {
    sections.push(`## Вхід у території\n${byChain('tribe_entry').map(fmt).join('\n')}`)
  }
  if (includeOther) {
    sections.push(
      `## Інше\n${SIDE_QUESTS.filter((q) => !q.chain || !knownChains.includes(q.chain)).map(fmt).join('\n')}`
    )
  }
  sections.push(
    `Не відкривай усі одразу. При вході в нову територію племені — ЗАВЖДИ квест «Вхід: …».\n` +
      (want.has('zek')
        ? `Арка Зека: він УЖЕ вийшов зі стаї (не «просто заблукав») — death-scent, мисливці, таємниця втечі, фінал.\n`
        : '') +
      (want.has('tane_family')
        ? `Арка роду: послідовно (Тане→батько→Лея→звичай крові→розв'язок); не відкривай «Вогнище роду» до викриття інцесту.\n`
        : '') +
      (want.has('centaur')
        ? `Арка кентаврів: trial → повага → близькість (Ксерон/Іпполіта) → moon run → союз|вигнання.\n`
        : '') +
      `---`
  )
  return sections.join('\n') + '\n'
}

/**
 * Dedicated GM brief for the full renegade hyenoid (Zek) arc.
 */
export function formatZekArcForPrompt(): string {
  return (
    `\n--- АРКА: ЗЕК — ГІЄНОЇД-ВТІКАЧ / ВІДСТУПНИК ---\n` +
    `⚠️ КАНОН (не супереч):\n` +
    `• Зек — самець, що САМ ВИЙШОВ зі стаї Кіри. Не «заблукав», не «лагідне вигнання» — злочинець для стаї.\n` +
    `• Матріархат: самці = підлеглі/розплідники. Зек зірвав ритуал повного підкорення, був «улюбленим жеребцем» Кіри, ` +
    `втік у ніч рейду.\n` +
    `• Death-scent (запах смерті): будь-яка гієноїдка мусить повернути або вбити. Чути здалеку; амулет/Найя відчувають.\n` +
    `• Характер: полохливий, вдячний, хитрий, жадібний до свободи; секс (вузол/замок) часто як плата/вдячність, не лише похоть.\n` +
    `• Кіра ≠ Зек. Кіра — матріарх: розумна, жорстока, гарем як влада. Може торгувати Ларою за Зека.\n` +
    `• Кай-Тору можуть зневажати «пса» біля селища (zek_kai_toru_hostility). Не плутай зі звичайним патрулем гієноїдів.\n` +
    `\n## Етапи (послідовно; не стрибай у фінал)\n` +
    `1) СЛІДИ: zek_escape_clue → met_zek → zek_begs_protection.\n` +
    `2) ПРИТУЛОК І ЗВ'ЯЗОК: zek_sheltered → (zek_kai_toru_hostility) → zek_first_intimacy / zek_knot_bond → ` +
    `zek_escape_story + zek_death_scent.\n` +
    `3) ПОЛЮВАННЯ: zek_hunters → zek_protected АБО zek_betrayed → (zek_saves_lara) → ` +
    `zek_scent_masked / zek_naya_aid → zek_mark_cleansed.\n` +
    `4) КОРИСТЬ І ТИСК: zek_guide + zek_pack_secret → kira_demands_zek / kira_trade_for_zek → ` +
    `zek_kira_confront (+ hyena_pact / kira_matriarch_duel за тоном).\n` +
    `5) ФІНАЛ (взаємовиключні гілки долі): zek_loyal_oath / zek_jealousy → ` +
    `zek_free_exile | zek_companion | zek_returned | zek_dead.\n` +
    `\n## Квести chain=zek\n` +
    `Сліди відступника → Зустріч із відступником → Притулок для вигнанця → Ціна тіла → Таємниця втечі → ` +
    `Мисливці стаї → Звільни Зека → Маска запаху → Зняти мітку смерті → Провідник-відступник → ` +
    `Ультиматум Кіри → Суд Кіри за відступника → Клятва вигнанця → Доля відступника.\n` +
    `\n## FACT keys\n` +
    `zek_escape_clue | met_zek | zek_begs_protection | zek_sheltered | zek_kai_toru_hostility | ` +
    `zek_first_intimacy | zek_knot_bond | zek_escape_story | zek_death_scent | zek_hunters | ` +
    `zek_saves_lara | zek_protected | zek_betrayed | zek_scent_masked | zek_naya_aid | zek_mark_cleansed | ` +
    `zek_guide | zek_pack_secret | kira_demands_zek | kira_trade_for_zek | zek_kira_confront | ` +
    `zek_loyal_oath | zek_jealousy | zek_free_exile | zek_companion | zek_returned | zek_dead | ` +
    `hyena_pact | hyena_raid_kai_toru | met_kira | kira_matriarch_duel.\n` +
    `Правила: protect vs betray — гілки; returned/dead/companion/free_exile — фінали (не мішай без причини). ` +
    `Не роби Зека «звичайним самцем зі стаї» — він уже зрадник для Кіри.\n---\n`
  )
}

/**
 * Dedicated GM brief for the full bloodline arc:
 * Tane · Leya (siblings + incest) · father Makai · Lara.
 */
export function formatTaneLeyaArcForPrompt(): string {
  return (
    `\n--- АРКА РОДУ: ТАНЕ · ЛЕЯ · БАТЬКО МАКАЇ · ЛАРА ---\n` +
    `⚠️ КАНОН (не супереч ніколи):\n` +
    `• Тане і Лея — РІДНІ БРАТ І СЕСТРА, діти вождя Макаї (вождівська кров).\n` +
    `• Між ними вже активний ІНЦЕСТУАЛЬНИЙ інтим/романтика на старті гри (таємниця або «звичай крові» — не випадковий флірт).\n` +
    `• Макаї — батько обох; авторитет, «право чужинки», може втрутитись у долю сина й Лари.\n` +
    `• Тане: ніжний, закохується в Лару; рветься між сестрою-коханкою, батьком і Ларою.\n` +
    `• Лея: горда, ревнива; сестра-коханка + «подруга»/колишня Джека; не «просто суперниця».\n` +
    `• Джек–Лея: секс у минулому/паралелі; Джек не обов'язково знає про інцест одразу.\n` +
    `• Трикутники: Тане–Лея–Лара | Джек–Лея–Лара | Макаї–Тане–Лара (син vs батько).\n` +
    `\n## Етапи (послідовно; не стрибай у фінал)\n` +
    `1) ЗВ'ЯЗОК З ТАНЕ: met_tane → tane_guides_lara → entered_village → tane_first_hunt → ` +
    `tane_first_intimacy / tane_sacred_waterfall / tane_confessed → tane_presents_lara_to_father / met_makai.\n` +
    `2) БАТЬКО: makai_claims_lara → (опц.) makai_sex_with_lara → tane_witnesses_makai_lara → tane_defies_makai → ` +
    `makai_blesses_lara АБО makai_rejects_lara.\n` +
    `3) СЕСТРА І ІНЦЕСТ: met_leya → tane_leya_siblings → tane_leya_secret_lovers / caught_tane_leya_intimate → ` +
    `leya_rivalry / tane_leya_confrontation / leya_threatens_lara → tane_torn_choice → ` +
    `leya_past_with_jack / tane_jealousy_jack (якщо Джек у грі).\n` +
    `4) СПАДОК І РОЗВ'ЯЗОК: tane_leya_father_clue → makai_blood_custom_hint → tane_leya_father_journal → ` +
    `tane_leya_reconciliation / leya_accepts_lara / leya_lara_first_intimacy → ` +
    `tane_leya_triad_ritual / soul_bound_tane / family_hearth_accepted / tane_chooses_lara_public → ` +
    `blood_custom_broken АБО blood_custom_continued (+ tane_tribe_tattoo за моментом).\n` +
    `\n## Квести chain=tane_family (QUEST_UPDATE add за етапом)\n` +
    `Піти з Тане до селища → Священне полювання → Ніч у водоспаді → Перед батьком → Право батька → ` +
    `Таємниця брата й сестри → Ревнощі сестри → Минуле Леї та Джека → Спадок крові → ` +
    `Син проти батька → Благословення або вигнання → Сестра по вогню → Вогнище роду → ` +
    `Ритуал soul-bound → Татуювання Сонця.\n` +
    `\n## FACT keys (латиниця snake_case — саме ці)\n` +
    `tane_guides_lara | tane_first_hunt | tane_first_intimacy | tane_sacred_waterfall | tane_life_saver | ` +
    `tane_jealousy_jack | tane_tribe_tattoo | tane_presents_lara_to_father | tane_confessed | ` +
    `tane_leya_siblings | tane_leya_secret_lovers | caught_tane_leya_intimate | leya_past_with_jack | ` +
    `leya_rivalry | tane_leya_confrontation | leya_threatens_lara | tane_torn_choice | ` +
    `tane_leya_reconciliation | leya_accepts_lara | leya_lara_first_intimacy | tane_leya_triad_ritual | ` +
    `tane_leya_father_clue | makai_blood_custom_hint | tane_leya_father_journal | ` +
    `makai_claims_lara | makai_sex_with_lara | tane_witnesses_makai_lara | tane_defies_makai | ` +
    `makai_blesses_lara | makai_rejects_lara | family_hearth_accepted | tane_chooses_lara_public | ` +
    `blood_custom_broken | blood_custom_continued | soul_bound_tane.\n` +
    `Правила FACT: «брат і сестра» → tane_leya_siblings; свідчення інтиму → tane_leya_secret_lovers ` +
    `(+ caught_tane_leya_intimate якщо очевидець); секс з Макаї → makai_sex_with_lara; ` +
    `благословення vs відмова — взаємовиключні гілки.\n` +
    `Не відкривай «Вогнище роду» / тріаду до викриття таємниці брата й сестри. Не роби Тане/Лею «просто друзями».\n---\n`
  )
}

/** Full GM brief: centaur herd arc (Xeron · Hippolyta · Lara). */
export function formatCentaurArcForPrompt(): string {
  return (
    `\n--- АРКА КЕНТАВРІВ: КСЕРОН · ІППОЛІТА · ТАБУН · ЛАРА ---\n` +
    `⚠️ КАНОН:\n` +
    `• Ксерон — вожак, гордий; секс/повага ЛИШЕ після випробування (інакше «легка здобич»).\n` +
    `• Іпполіта — найшвидша; лесбі/сестринство; може ревнувати до Ксерона або захистити Лару.\n` +
    `• Анатомія: великий розмір, «верхова» близькість; скіл Верхова їзда / Гра з розміром критичні.\n` +
    `• Не копіюй Кай-Тору: спочатку змагання, потім близькість.\n` +
    `\n## Етапи\n` +
    `1) entered_centaur_lands → met_xeron / met_hippolyta → xeron_demands_trial\n` +
    `2) centaur_trial_won / xeron_challenge_race → centaur_accepted / xeron_respects_lara\n` +
    `3) xeron_first_intimacy → (centaur_mate_claim) → hippolyta_jealousy | hippolyta_sisterhood\n` +
    `4) hippolyta_first_intimacy / hippolyta_teaches_riding → centaur_moon_run\n` +
    `5) centaur_herd_challenge → centaur_herd_ally АБО centaur_exile_path\n` +
    `\n## Квести chain=centaur\n` +
    `Зустріч із табуном → Випробування швидкості → Повага табуна → Ніч з вожаком → ` +
    `Сестринство Іпполіти → Нічний забіг табуна → Виклик табуна → Доля з табуном.\n` +
    `\n## FACT\n` +
    `entered_centaur_lands | met_xeron | met_hippolyta | xeron_demands_trial | centaur_trial_won | ` +
    `xeron_challenge_race | centaur_accepted | xeron_respects_lara | xeron_first_intimacy | ` +
    `centaur_mate_claim | hippolyta_jealousy | hippolyta_sisterhood | hippolyta_first_intimacy | ` +
    `hippolyta_teaches_riding | centaur_moon_run | centaur_herd_challenge | ` +
    `centaur_herd_ally | centaur_exile_path | other_tribe_contact.\n` +
    `Фінали herd_ally vs exile_path — взаємовиключні.\n---\n`
  )
}

export function getCanonEvent(key: string): CanonEvent | undefined {
  return CANON_EVENTS.find((e) => e.key === key)
}

export function getTribeEntryForLocation(location: string): TribeEntryDef | undefined {
  const loc = (location || '').toLowerCase()
  return TRIBE_ENTRIES.find((t) => t.locationHints.some((h) => loc.includes(h.toLowerCase())))
}
