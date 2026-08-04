/**
 * Sex skill tree — single source of truth for UI + mechanical effects.
 * Skill `name` values MUST match seed-skills / SKILL_NAMES exactly.
 *
 * Each intimacy act is its OWN branch. Node levels 1–5 = mastery depth
 * (e.g. «Глибоке горло» Lv1 = tip… Lv5 = full + hold).
 */

export type SexSkillCategory =
  | 'seduction'
  | 'technique'
  | 'endurance'
  | 'domination'
  | 'submission'
  | 'body_magic'
  | 'dirty_talk'
  | 'handjob'
  | 'blowjob'
  | 'deepthroat'
  | 'anal'
  | 'riding'
  | 'edging'
  | 'public'
  | 'creampie'
  | 'aftercare'

export interface SexSkillNode {
  id: string
  name: string
  category: SexSkillCategory
  /** Parent skill name that must be level >= 1 to unlock this node in the tree UI */
  parentName?: string
  icon: string
  description: string
  /** Concrete mechanical effect (gameplay) */
  effectByLevel: string
  /** What Lv1–5 mean for this skill (shown in UI) */
  levelMeanings?: [string, string, string, string, string]
  diceKeywords: string[]
}

export const SEX_SKILL_CATEGORIES: {
  id: SexSkillCategory
  label: string
  icon: string
  color: string
  activeClass: string
}[] = [
  { id: 'seduction', label: 'Зваблення', icon: '🌹', color: 'pink', activeClass: 'bg-pink-500 text-white shadow-pink-500/30' },
  { id: 'technique', label: 'Техніка', icon: '💋', color: 'rose', activeClass: 'bg-rose-500 text-white shadow-rose-500/30' },
  { id: 'endurance', label: 'Витривалість', icon: '🔥', color: 'orange', activeClass: 'bg-orange-500 text-white shadow-orange-500/30' },
  { id: 'domination', label: 'Домінування', icon: '⛓️', color: 'red', activeClass: 'bg-red-600 text-white shadow-red-600/30' },
  { id: 'submission', label: 'Підкорення', icon: '🦋', color: 'violet', activeClass: 'bg-violet-600 text-white shadow-violet-600/30' },
  { id: 'body_magic', label: 'Магія тіла', icon: '✨', color: 'amber', activeClass: 'bg-amber-500 text-slate-950 shadow-amber-500/30' },
  { id: 'dirty_talk', label: 'Брудні слова', icon: '🗣️', color: 'fuchsia', activeClass: 'bg-fuchsia-600 text-white shadow-fuchsia-600/30' },
  { id: 'handjob', label: 'Дрочка', icon: '✋', color: 'rose', activeClass: 'bg-rose-600 text-white shadow-rose-600/30' },
  { id: 'blowjob', label: 'Мінет', icon: '💋', color: 'pink', activeClass: 'bg-pink-600 text-white shadow-pink-600/30' },
  { id: 'deepthroat', label: 'Горло', icon: '🌊', color: 'violet', activeClass: 'bg-violet-700 text-white shadow-violet-700/30' },
  { id: 'anal', label: 'Анал', icon: '🍑', color: 'orange', activeClass: 'bg-orange-600 text-white shadow-orange-600/30' },
  { id: 'riding', label: 'Вершниця', icon: '🏇', color: 'amber', activeClass: 'bg-amber-600 text-slate-950 shadow-amber-600/30' },
  { id: 'edging', label: 'Еджинг', icon: '⏸️', color: 'slate', activeClass: 'bg-slate-600 text-white shadow-slate-600/30' },
  { id: 'public', label: 'Публічність', icon: '👀', color: 'sky', activeClass: 'bg-sky-600 text-white shadow-sky-600/30' },
  { id: 'creampie', label: 'Насіння', icon: '💦', color: 'stone', activeClass: 'bg-stone-500 text-white shadow-stone-500/30' },
  { id: 'aftercare', label: 'Aftercare', icon: '🤍', color: 'teal', activeClass: 'bg-teal-600 text-white shadow-teal-600/30' },
]

/** Linear trees per category — order = progression within branch. */
export const SEX_SKILL_TREE: SexSkillNode[] = [
  // —— Зваблення
  {
    id: 'sed_1',
    name: 'Чарівний погляд',
    category: 'seduction',
    icon: '👁️',
    description: 'Вміння зачарувати поглядом',
    effectByLevel: 'd20 зваблення/харизма: +1 за кожні 2 рівні (макс +3). Легше почати флірт.',
    diceKeywords: ['зваблення', 'харизма', 'погляд', 'флірт', 'спокуса', 'charisma'],
  },
  {
    id: 'sed_2',
    name: 'Солодкі слова',
    category: 'seduction',
    parentName: 'Чарівний погляд',
    icon: '💬',
    description: 'Мистецтво еротичних компліментів',
    effectByLevel: 'діалогові перевірки +рівень (макс +4). NPC швидше підвищують bond при флірті.',
    diceKeywords: ['слова', 'діалог', 'комплімент', 'переконання', 'харизма', 'charisma'],
  },
  {
    id: 'sed_3',
    name: 'Спокусливий танець',
    category: 'seduction',
    parentName: 'Солодкі слова',
    icon: '💃',
    description: 'Танець, що розпалює бажання',
    effectByLevel: 'на старті сцени desire партнера/атмосфера: +5 desire до STAT за рівень (підказка AI). d20 танець +рівень.',
    diceKeywords: ['танець', 'ритм', 'виступ', 'спритність', 'agility'],
  },
  {
    id: 'sed_4',
    name: 'Аура бажання',
    category: 'seduction',
    parentName: 'Спокусливий танець',
    icon: '✨',
    description: 'Магічна привабливість тіла',
    effectByLevel: 'рівень ≥3: auto-бонус +2 до всіх зваблень. Рівень 5: крити зваблення на 19–20.',
    diceKeywords: ['аура', 'зваблення', 'магія', 'бажання', 'харизма'],
  },

  // —— Техніка
  {
    id: 'tech_1',
    name: 'Ніжний дотик',
    category: 'technique',
    icon: '🌹',
    description: 'Вміння ласкати тіло партнера',
    effectByLevel: 'задоволення партнера: +2% за рівень при PLEASURE. d20 дотик +рівень.',
    diceKeywords: ['дотик', 'ласка', 'прелюдія', 'техніка', 'руки'],
  },
  {
    id: 'tech_2',
    name: 'Поцілунок вогню',
    category: 'technique',
    parentName: 'Ніжний дотик',
    icon: '💋',
    description: 'Пристрасні поцілунки',
    effectByLevel: 'фаза foreplay: pleasure.lara +1 за рівень за тик. d20 поцілунок +рівень.',
    diceKeywords: ['поцілунок', 'рот', 'поцілунки', 'техніка'],
  },
  {
    id: 'tech_3',
    name: 'Гнучкість тіла',
    category: 'technique',
    parentName: 'Поцілунок вогню',
    icon: '🤸',
    description: 'Різноманітні пози та рухи',
    effectByLevel: 'd20 позиція/спритність: +рівень (макс +5). Складні пози DC −1 при рівні ≥3.',
    diceKeywords: ['позиція', 'гнучкість', 'спритність', 'agility', 'поза'],
  },
  {
    id: 'tech_4',
    name: 'Майстерність рук',
    category: 'technique',
    parentName: 'Гнучкість тіла',
    icon: '✋',
    description: 'Вправність дотиків і ласк',
    effectByLevel: 'задоволення партнера ×(1 + 0.05×рівень). Рівень 5: +10% до partner pleasure.',
    diceKeywords: ['руки', 'ласка', 'техніка', 'мастурбація'],
  },

  // —— Витривалість
  {
    id: 'end_1',
    name: 'Тривала насолода',
    category: 'endurance',
    icon: '⏱️',
    description: 'Здатність довго тримати темп',
    effectByLevel: 'стаміна: підлога value +3×рівень (не нижче). d20 витримка +рівень.',
    diceKeywords: ['витривалість', 'темп', 'витримка', 'endurance', 'тривалість'],
  },
  {
    id: 'end_2',
    name: 'Множинне задоволення',
    category: 'endurance',
    parentName: 'Тривала насолода',
    icon: '🌊',
    description: 'Кілька хвиль оргазму поспіль',
    effectByLevel: 'рівень ≥2: розблоковує MULTI_ORGASM. Рівень ≥4: can_continue навіть при stamina 25+.',
    diceKeywords: ['оргазм', 'мульти', 'хвиля', 'витривалість', 'endurance'],
  },
  {
    id: 'end_3',
    name: 'Контроль тіла',
    category: 'endurance',
    parentName: 'Множинне задоволення',
    icon: '🧘',
    description: 'Управління своїми відчуттями',
    effectByLevel: 'd20 контроль/воля під час сексу +рівень. Знижує chance crit-fail на темпі.',
    diceKeywords: ['контроль', 'воля', 'willpower', 'стрим', 'витривалість'],
  },
  {
    id: 'end_4',
    name: 'Невтомність',
    category: 'endurance',
    parentName: 'Контроль тіла',
    icon: '💪',
    description: 'Невичерпна сексуальна енергія',
    effectByLevel: 'швидкий темп: stamina drain −рівень. Рівень 5: stamina не падає нижче 15.',
    diceKeywords: ['енергія', 'витривалість', 'endurance', 'сила', 'strength'],
  },

  // —— Домінування
  {
    id: 'dom_1',
    name: 'Владний голос',
    category: 'domination',
    icon: '🗣️',
    description: 'Командний тон, що збуджує',
    effectByLevel: 'DOMINATION: +5×рівень до value (кліп −100..100). d20 наказ +рівень.',
    diceKeywords: ['наказ', 'влада', 'домінування', 'голос', 'харизма'],
  },
  {
    id: 'dom_2',
    name: "Зв'язування",
    category: 'domination',
    parentName: 'Владний голос',
    icon: '⛓️',
    description: 'Мистецтво еротичного бондажу',
    effectByLevel: 'd20 бондаж/сила +рівень. При рівні ≥2 AI відкриває risk-опції в SEX_CHOICES.',
    diceKeywords: ['зв\'язування', 'бондаж', 'мотузка', 'сила', 'strength'],
  },
  {
    id: 'dom_3',
    name: 'Покарання та нагорода',
    category: 'domination',
    parentName: "Зв'язування",
    icon: '⚡',
    description: 'Гра з болем і насолодою',
    effectByLevel: 'комбо: +1 до count при рівні ≥2. d20 інтенсивність +рівень.',
    diceKeywords: ['покарання', 'біль', 'інтенсивність', 'домінування'],
  },
  {
    id: 'dom_4',
    name: 'Повна влада',
    category: 'domination',
    parentName: 'Покарання та нагорода',
    icon: '👑',
    description: 'Абсолютний контроль над партнером',
    effectByLevel: 'рівень ≥3: domination не опускається нижче 20 у сцені. Рівень 5: +3 до всіх dom-кидків.',
    diceKeywords: ['влада', 'контроль', 'домінування', 'підкорення партнера'],
  },

  // —— Підкорення
  {
    id: 'sub_1',
    name: 'Покірність',
    category: 'submission',
    icon: '🙇',
    description: 'Мистецтво віддаватися партнеру',
    effectByLevel: 'DOMINATION: −5×рівень (більше покори). d20 підкорення +рівень.',
    diceKeywords: ['покора', 'підкорення', 'віддатися', 'покірність'],
  },
  {
    id: 'sub_2',
    name: 'Чутливість',
    category: 'submission',
    parentName: 'Покірність',
    icon: '💗',
    description: 'Підвищена чутливість до дотиків',
    effectByLevel: 'pleasure.lara +2%×рівень. Швидший шлях до оргазму Лари.',
    diceKeywords: ['чутливість', 'відчуття', 'насолода', 'оргазм'],
  },
  {
    id: 'sub_3',
    name: 'Прохання та благання',
    category: 'submission',
    parentName: 'Чутливість',
    icon: '🙏',
    description: 'Вміння просити так, що неможливо відмовити',
    effectByLevel: 'd20 прохання/харизма +рівень. NPC рідше відмовляють у сцені.',
    diceKeywords: ['прохання', 'благання', 'харизма', 'діалог'],
  },
  {
    id: 'sub_4',
    name: 'Повна довіра',
    category: 'submission',
    parentName: 'Прохання та благання',
    icon: '🤍',
    description: 'Абсолютна відкритість і вразливість',
    effectByLevel: 'рівень ≥3: shame −2 за рівень при кінці сцени (через STAT підказку). d20 довіра +рівень.',
    diceKeywords: ['довіра', 'відкритість', 'підкорення', 'воля'],
  },

  // —— Магія тіла
  {
    id: 'mag_1',
    name: 'Цілюща ласка',
    category: 'body_magic',
    icon: '💚',
    description: 'Дотик, що зцілює тіло й душу',
    effectByLevel: 'після сексу: hunger/thirst не ростуть сильніше (AI). d20 лікування +рівень.',
    diceKeywords: ['лікування', 'зцілення', 'ласка', 'магія'],
  },
  {
    id: 'mag_2',
    name: 'Ритуал насолоди',
    category: 'body_magic',
    parentName: 'Цілюща ласка',
    icon: '🔮',
    description: 'Магічний ритуал через секс',
    effectByLevel: 'amuletEnergy з оргазму: +1 за рівень. d20 ритуал +рівень.',
    diceKeywords: ['ритуал', 'магія', 'амулет', 'обряд'],
  },
  {
    id: 'mag_3',
    name: "Зв'язок душ",
    category: 'body_magic',
    parentName: 'Ритуал насолоди',
    icon: '🔗',
    description: 'Телепатичний зв\'язок під час близькості',
    effectByLevel: 'bond з партнером: AI +1 легше. d20 емпатія +рівень. Рівень ≥3: бачить REACTION чіткіше.',
    diceKeywords: ['зв\'язок', 'душ', 'емпатія', 'телепатія', 'магія'],
  },
  {
    id: 'mag_4',
    name: 'Екстаз сили',
    category: 'body_magic',
    parentName: "Зв'язок душ",
    icon: '✨',
    description: 'Перетворення оргазму на магічну енергію',
    effectByLevel: 'amulet_gain ×(1 + 0.1×рівень). Рівень 5: мінімум +15 amulet за оргазм.',
    diceKeywords: ['екстаз', 'енергія', 'амулет', 'магія', 'сила'],
  },

  
  // ═══════════════════════════════════════════
  // БРУДНІ РОЗМОВИ (окрема гілка)
  // ═══════════════════════════════════════════
  {
    id: 'dt_1',
    name: 'Натяки і стогін',
    category: 'dirty_talk',
    icon: '😮‍💨',
    description: 'Легкі натяки, зітхання, стогін',
    effectByLevel: 'Lv↑ = гучніший/сміливіший стогін. +1% lara/partner pleasure за рівень на dirty-ходах. d20 +рівень.',
    levelMeanings: ['тихий стогін', 'натяки', 'відверті фрази', 'брудний шепіт', 'без цензури'],
    diceKeywords: ['стогін', 'натяк', 'зітхан', 'шепіт'],
  },
  {
    id: 'dt_2',
    name: 'Брудні розмови',
    category: 'dirty_talk',
    parentName: 'Натяки і стогін',
    icon: '🗣️',
    description: 'Відверті брудні слова під час сексу',
    effectByLevel: 'Кожен рівень = сміливіша лексика. Partner pleasure +2%/Lv на dirty talk. Desire NPC +2/Lv (AI).',
    levelMeanings: ['м\'які слова', 'брудно', 'порно-слова', 'принизливо/гаряче', 'ламає партнера словами'],
    diceKeywords: ['брудн', 'розмов', 'dirty', 'talk', 'словес', 'вербаль'],
  },
  {
    id: 'dt_3',
    name: 'Брудна домінація',
    category: 'dirty_talk',
    parentName: 'Брудні розмови',
    icon: '🗯️',
    description: 'Вербальний контроль і накази',
    effectByLevel: 'Domination +3×Lv за хід dirty-dom. d20 наказ +рівень. Рівень ≥3: risk verbal дозволений.',
    levelMeanings: ['м\'який наказ', 'команда', 'жорсткий тон', 'приниження', 'повний verbal control'],
    diceKeywords: ['наказ', 'брудна домін', 'verbal', 'приниз'],
  },
  {
    id: 'dt_4',
    name: 'Порно-голос',
    category: 'dirty_talk',
    parentName: 'Брудна домінація',
    icon: '🎤',
    description: 'Голос, від якого партнер не тримається',
    effectByLevel: 'Partner orgasm threshold −2×Lv (мін 80). Рівень 5: crit dirty talk на 19–20.',
    levelMeanings: ['сексуальний тембр', 'хрипкий', 'брудний', 'порновий', 'ламає волю'],
    diceKeywords: ['порно', 'голос', 'voice', 'тембр'],
  },

  // ═══════════════════════════════════════════
  // ДРОЧКА (окрема гілка)
  // ═══════════════════════════════════════════
  {
    id: 'hj_1',
    name: 'Легка стимуляція',
    category: 'handjob',
    icon: '👆',
    description: 'Обережні рухи рукою',
    effectByLevel: 'Partner +1.5%/Lv. Повільний старт, низька витрата stamina.',
    levelMeanings: ['кінчики пальців', 'повільні рухи', 'впевненіше', 'ритм', 'гра з голівкою'],
    diceKeywords: ['легка стимул', 'пальц', 'дотик члена'],
  },
  {
    id: 'hj_2',
    name: 'Дрочка руками',
    category: 'handjob',
    parentName: 'Легка стимуляція',
    icon: '✋',
    description: 'Впевнена ручна стимуляція',
    effectByLevel: 'Partner pleasure +3%/Lv на handjob-ходах. d20 руки +рівень. Lv5: +8 flat partner.',
    levelMeanings: ['базовий хват', 'стабільний ритм', 'варіації тиску', 'швидкість/контроль', 'майстер дрочки'],
    diceKeywords: ['дроч', 'handjob', 'руками', 'ручна'],
  },
  {
    id: 'hj_3',
    name: 'Техніка двох рук',
    category: 'handjob',
    parentName: 'Дрочка руками',
    icon: '👐',
    description: 'Складніші патерни й тиск',
    effectByLevel: 'Partner +4%/Lv. Combo +1 при Lv≥2. Stamina cost hand −1 при Lv≥3.',
    levelMeanings: ['дві руки', 'скручування', 'подвійний ритм', 'точки тиску', 'без пауз'],
    diceKeywords: ['двох рук', 'техніка рук', 'подвійн'],
  },
  {
    id: 'hj_4',
    name: 'Ручний фініш',
    category: 'handjob',
    parentName: 'Техніка двох рук',
    icon: '💥',
    description: 'Довести до оргазму лише руками',
    effectByLevel: 'Partner orgasm threshold −3×Lv. Гарантований SKILL XP ×1.2 на фініш-ході.',
    levelMeanings: ['близько до краю', 'контроль фінішу', 'сильний фініш', 'фонтан', 'миттєвий ручний оргазм'],
    diceKeywords: ['ручний фініш', 'кінчити в руку', 'hand finish'],
  },

  // ═══════════════════════════════════════════
  // МІНЕТ (окрема гілка)
  // ═══════════════════════════════════════════
  {
    id: 'bj_1',
    name: 'Поцілунки голівки',
    category: 'blowjob',
    icon: '😘',
    description: 'Поцілунки й легкі оральні ласки',
    effectByLevel: 'Partner +2%/Lv. Низька stamina. d20 oral soft +рівень.',
    levelMeanings: ['поцілунок', 'язик по голівці', 'облизування', 'смоктання кінчика', 'гра з вуздечкою'],
    diceKeywords: ['голівк', 'поцілунок члена', 'облиз'],
  },
  {
    id: 'bj_2',
    name: 'Мінет',
    category: 'blowjob',
    parentName: 'Поцілунки голівки',
    icon: '💋',
    description: 'Повноцінний оральний секс',
    effectByLevel: 'Partner +4%/Lv. d20 мінет +рівень. Основний oral-хід.',
    levelMeanings: ['неглибоко', 'середня глибина', 'ритмічний мінет', 'глибше з руками', 'майстер мінету'],
    diceKeywords: ['мінет', 'blowjob', 'орал', 'смокт', 'рот'],
  },
  {
    id: 'bj_3',
    name: 'Вологий ритм',
    category: 'blowjob',
    parentName: 'Мінет',
    icon: '💧',
    description: 'Слина, темп, варіації',
    effectByLevel: 'Partner +5%/Lv. Fast tempo oral: +10% partner. Stamina oral −1 при Lv≥3.',
    levelMeanings: ['слина', 'волого', 'безперервно', 'зміна темпу', 'брудний вологий мінет'],
    diceKeywords: ['волог', 'слина', 'ритм мінет'],
  },
  {
    id: 'bj_4',
    name: 'Мінет-оргазм',
    category: 'blowjob',
    parentName: 'Вологий ритм',
    icon: '💦',
    description: 'Довести партнера ротом до фінішу',
    effectByLevel: 'Partner orgasm threshold −4×Lv (мін 75). Cum-in-mouth narrative AI при Lv≥3.',
    levelMeanings: ['близько', 'тримає край', 'ковтає/на язик', 'сильний oral-оргазм', 'повний контроль фінішу ротом'],
    diceKeywords: ['мінет-оргазм', 'кінчити в рот', 'oral finish'],
  },

  // ═══════════════════════════════════════════
  // ГЛИБОКЕ ГОРЛО (окрема гілка) — рівні = глибина
  // ═══════════════════════════════════════════
  {
    id: 'dt_gag_1',
    name: 'Подолання рефлекса',
    category: 'deepthroat',
    icon: '😤',
    description: 'Контроль блювотного рефлексу',
    effectByLevel: 'Lv = стійкість до gag. Stamina deep cost −Lv. d20 gag-control +рівень.',
    levelMeanings: ['давиться', 'терпить', 'контролює', 'майже без рефлексу', 'повний контроль'],
    diceKeywords: ['рефлекс', 'блювот', 'gag', 'терп'],
  },
  {
    id: 'dt_gag_2',
    name: 'Глибоке горло',
    category: 'deepthroat',
    parentName: 'Подолання рефлекса',
    icon: '🌊',
    description: 'Наскільки глибоко може прийняти',
    effectByLevel: 'ГОЛОВНЕ: Lv1=кінчик, 2=¼, 3=½, 4=¾, 5=до кінця+hold. Partner pleasure +5%/Lv. d20 deepthroat +рівень. Lv≥3: oral crit 19–20.',
    levelMeanings: [
      'лише кінчик / вхід',
      'чверть довжини',
      'половина',
      'майже вся довжина',
      'повністю + утримання (full + hold)',
    ],
    diceKeywords: ['глибок', 'горл', 'deepthroat', 'deep', 'throat', 'глибина'],
  },
  {
    id: 'dt_gag_3',
    name: 'Hands-free горло',
    category: 'deepthroat',
    parentName: 'Глибоке горло',
    icon: '🙌',
    description: 'Глибина без допомоги рук',
    effectByLevel: 'Partner +6%/Lv. Руки вільні → domination +2×Lv. Потрібен «Глибоке горло» ≥1.',
    levelMeanings: ['спроба без рук', 'стабільно', 'ритм без рук', 'удар головою', 'ідеальний hands-free'],
    diceKeywords: ['hands-free', 'без рук', 'головою'],
  },
  {
    id: 'dt_gag_4',
    name: 'Горло-фініш',
    category: 'deepthroat',
    parentName: 'Hands-free горло',
    icon: '🕳️',
    description: 'Фініш глибоко в горлі',
    effectByLevel: 'Partner orgasm −5×Lv threshold. Amulet +2 при фініші якщо body_magic≥1. AI: creampie throat.',
    levelMeanings: ['глибоко на краю', 'тримає під час фінішу', 'ковтає глибоко', 'без відриву', 'повний throatpie control'],
    diceKeywords: ['горло-фініш', 'throatpie', 'кінчити в горло'],
  },

  // ═══════════════════════════════════════════
  // АНАЛ (окрема гілка)
  // ═══════════════════════════════════════════
  {
    id: 'an_1',
    name: 'Анальна підготовка',
    category: 'anal',
    icon: '🧴',
    description: 'Розслаблення, змазка, обережність',
    effectByLevel: 'Без Lv≥1 — anal-ходи дорожчі stamina ×1.5. d20 prep +рівень. Risk anal блокується без Lv1.',
    levelMeanings: ['страх/напруга', 'пальці', 'змазка', 'розслаблення', 'готова повністю'],
    diceKeywords: ['підготовк', 'змаз', 'розслаб', 'anal prep'],
  },
  {
    id: 'an_2',
    name: 'Анал',
    category: 'anal',
    parentName: 'Анальна підготовка',
    icon: '🍑',
    description: 'Анальне проникнення з контролем',
    effectByLevel: 'Lv = глибина/інтенсивність. Partner+Lara pleasure +3%/Lv. d20 анал +рівень. Risk-anal з Lv≥2.',
    levelMeanings: ['лише кінчик', 'повільно всередині', 'середня глибина', 'сильний темп', 'повний контроль аналу'],
    diceKeywords: ['анал', 'anal', 'задн', 'попка'],
  },
  {
    id: 'an_3',
    name: 'Глибокий анал',
    category: 'anal',
    parentName: 'Анал',
    icon: '🔻',
    description: 'Глибина й інтенсивність',
    effectByLevel: 'Partner +5%/Lv. Stamina floor +Lv у anal-фазі. Domination ± залежно від top/bottom ходу.',
    levelMeanings: ['глибше', 'жорсткіше', 'без пауз', 'удари в глибину', 'екстремальний анал'],
    diceKeywords: ['глибокий анал', 'deep anal', 'жорсткий анал'],
  },
  {
    id: 'an_4',
    name: 'Анальний оргазм',
    category: 'anal',
    parentName: 'Глибокий анал',
    icon: '🎆',
    description: 'Оргазм від анальної стимуляції',
    effectByLevel: 'Lara orgasm threshold −3×Lv на anal-ходах. Partner threshold −2×Lv. Multi легше якщо endurance≥2.',
    levelMeanings: ['близько', 'труситься', 'анальний оргазм', 'сильний', 'руйнівний anal-orgasm'],
    diceKeywords: ['анальний оргазм', 'anal orgasm'],
  },

  // ═══════════════════════════════════════════
  // ВЕРШНИЦЯ
  // ═══════════════════════════════════════════
  {
    id: 'rd_1',
    name: 'Сісти зверху',
    category: 'riding',
    icon: '🪑',
    description: 'Баланс і ритм зверху',
    effectByLevel: 'Lara pleasure +2%/Lv. d20 баланс +рівень. Низький risk.',
    levelMeanings: ['сідає обережно', 'тримає рівновагу', 'легкий рух', 'впевнена', 'повний баланс'],
    diceKeywords: ['зверху', 'сісти', 'cowgirl start'],
  },
  {
    id: 'rd_2',
    name: 'Вершниця',
    category: 'riding',
    parentName: 'Сісти зверху',
    icon: '🏇',
    description: 'Впевнена їзда',
    effectByLevel: 'Lara + Partner +3%/Lv. Контроль темпу: slow/fast бонуси ×(1+0.05×Lv).',
    levelMeanings: ['повільна їзда', 'ритм', 'сильна', 'дикий темп', 'ламає партнера зверху'],
    diceKeywords: ['вершниц', 'cowgirl', 'їзда', 'riding'],
  },
  {
    id: 'rd_3',
    name: 'Глибока їзда',
    category: 'riding',
    parentName: 'Вершниця',
    icon: '⬇️',
    description: 'Глибина й кут',
    effectByLevel: 'Partner +4%/Lv. Domination +2×Lv (вона контролює).',
    levelMeanings: ['глибше сідає', 'кут', 'крутить стегнами', 'притискає', 'максимальна глибина'],
    diceKeywords: ['глибока їзда', 'кут', 'стегн'],
  },
  {
    id: 'rd_4',
    name: 'Вершниця-оргазм',
    category: 'riding',
    parentName: 'Глибока їзда',
    icon: '🌟',
    description: 'Оргазм у позиції зверху',
    effectByLevel: 'Lara orgasm −4×Lv threshold. Якщо multi≥2 — легший chain на їзді.',
    levelMeanings: ['на краю зверху', 'кінчає', 'труситься на ньому', 'множинний зверху', 'не може зупинитись'],
    diceKeywords: ['вершниця-оргазм', 'кінчити зверху'],
  },

  // ═══════════════════════════════════════════
  // ЕДЖИНГ
  // ═══════════════════════════════════════════
  {
    id: 'ed_1',
    name: 'Зупинка на краю',
    category: 'edging',
    icon: '🛑',
    description: 'Зупинитись перед піком',
    effectByLevel: 'Partner pleasure cap 90−Lv (не дає кінчити). d20 контроль +рівень.',
    levelMeanings: ['вчасно', 'стабільно', 'жорсткий стоп', 'знущально', 'ідеальний edge'],
    diceKeywords: ['зупинка', 'край', 'edge stop'],
  },
  {
    id: 'ed_2',
    name: 'Еджинг',
    category: 'edging',
    parentName: 'Зупинка на краю',
    icon: '⏸️',
    description: 'Тримати на межі',
    effectByLevel: 'За хід: partner pleasure −5+Lv потім +10+2×Lv (накопичення). Orgasm delay.',
    levelMeanings: ['1 цикл', '2 цикли', 'довгий edge', 'ламання волі', 'повний edging control'],
    diceKeywords: ['еджинг', 'edging', 'на межі'],
  },
  {
    id: 'ed_3',
    name: 'Множинний еджинг',
    category: 'edging',
    parentName: 'Еджинг',
    icon: '🔁',
    description: 'Кілька циклів затримки',
    effectByLevel: 'Combo edge ×Lv. Фінальний orgasm partner pleasure burst +15×Lv%.',
    levelMeanings: ['2 цикли', '3', '4', '5+', 'нескінченний edge'],
    diceKeywords: ['множинний еджинг', 'цикли edge'],
  },
  {
    id: 'ed_4',
    name: 'Заборона оргазму',
    category: 'edging',
    parentName: 'Множинний еджинг',
    icon: '🚫',
    description: 'Повний контроль дозволу кінчати',
    effectByLevel: 'Блокує partner orgasm пока Lv-check. Domination +5×Lv. Потрібен verbal/dom для flavor.',
    levelMeanings: ['просити дозволу', 'відмова', 'жорстка заборона', 'ламання', 'оргазм лише з дозволу'],
    diceKeywords: ['заборона оргазму', 'не кінчати', 'permission'],
  },

  // ═══════════════════════════════════════════
  // ПУБЛІЧНІСТЬ
  // ═══════════════════════════════════════════
  {
    id: 'pub_1',
    name: 'Натяк на людях',
    category: 'public',
    icon: '😏',
    description: 'Флірт і натяки при свідках',
    effectByLevel: 'Shame −Lv. NPC desire +2×Lv. d20 exhibition soft +рівень.',
    levelMeanings: ['червоніє', 'сміється', 'провокує', 'не ховає', 'ламає табу'],
    diceKeywords: ['натяк', 'на людях', 'при свідках', 'флірт публіч'],
  },
  {
    id: 'pub_2',
    name: 'Секс на виду',
    category: 'public',
    parentName: 'Натяк на людях',
    icon: '👀',
    description: 'Близькість, де можуть побачити',
    effectByLevel: 'Pleasure +2%/Lv. Public kink XP. Risk public дозволений з Lv≥1.',
    levelMeanings: ['ризик бути спійманою', 'напівприховано', 'відкрито', 'не зупиняється', 'хоче очей'],
    diceKeywords: ['на виду', 'публічн.*секс', 'підгля', 'exhibition'],
  },
  {
    id: 'pub_3',
    name: 'Ритуальне шоу',
    category: 'public',
    parentName: 'Секс на виду',
    icon: '🎭',
    description: 'Секс як вистава / обряд племені',
    effectByLevel: 'Tribe rep + при успіху. Amulet +Lv. Ritual kink synergy.',
    levelMeanings: ['учасниця', 'центр уваги', 'жриця шоу', 'ламає плем’я', 'легенда ритуалу'],
    diceKeywords: ['ритуальне шоу', 'обряд секс', 'вистава'],
  },
  {
    id: 'pub_4',
    name: 'Без сорому',
    category: 'public',
    parentName: 'Ритуальне шоу',
    icon: '🔥',
    description: 'Повна втрата сорому на людях',
    effectByLevel: 'Shame floor −10×Lv (мін 0). Public orgasm без штрафу. Crit exhibition 19–20 при Lv5.',
    levelMeanings: ['майже без сорому', 'сміється з сорому', 'провокує натовп', 'оргазм на очах', 'нуль сорому'],
    diceKeywords: ['без сорому', 'нуль сором', 'exhibition master'],
  },

  // ═══════════════════════════════════════════
  // КРЕМПАЙ / НАСІННЯ
  // ═══════════════════════════════════════════
  {
    id: 'cr_1',
    name: 'Прийняти всередині',
    category: 'creampie',
    icon: '🤲',
    description: 'Просити фініш всередині',
    effectByLevel: 'Finish-inside pleasure +2%/Lv. Відкриває creampie-ходи.',
    levelMeanings: ['просить обережно', 'хоче всередині', 'благає', 'тримає', 'не відпускає'],
    diceKeywords: ['всередині', 'не виймай', 'кінчи в'],
  },
  {
    id: 'cr_2',
    name: 'Кремпай',
    category: 'creampie',
    parentName: 'Прийняти всередині',
    icon: '💦',
    description: 'Прийняти оргазм партнера в собі',
    effectByLevel: 'Amulet +1×Lv. Partner orgasm threshold −2×Lv. Creampie kink XP.',
    levelMeanings: ['приймає', 'насолоджується', 'витікає', 'просить ще', 'ритуал кремпаю'],
    diceKeywords: ['кремпай', 'creampie', 'наповн'],
  },
  {
    id: 'cr_3',
    name: 'Ризик насіння',
    category: 'creampie',
    parentName: 'Кремпай',
    icon: '🤰',
    description: 'Свідомий ризик вагітності',
    effectByLevel: 'pregnancy_risk ×(1+0.1×Lv). Breeding kink. d20 will/desire.',
    levelMeanings: ['ризик ок', 'хоче ризик', 'благає завагітніти', 'ламає захист', 'тільки насіння'],
    diceKeywords: ['ризик', 'вагіт', 'насін', 'breed'],
  },
  {
    id: 'cr_4',
    name: 'Прийняти все',
    category: 'creampie',
    parentName: 'Ризик насіння',
    icon: '🌊',
    description: 'Максимальна відкритість до насіння',
    effectByLevel: 'Amulet min +5 при finish. Multi-creampie. Partner + Lara climax sync bonus.',
    levelMeanings: ['всередині+ззовні', 'обличчя+всередині', 'подвійний фініш', 'ритуал насіння', 'повне прийняття'],
    diceKeywords: ['прийняти все', 'все насіння', 'облити й всередині'],
  },

  // ═══════════════════════════════════════════
  // AFTERCARE
  // ═══════════════════════════════════════════
  {
    id: 'ac_1',
    name: 'Обійми після',
    category: 'aftercare',
    icon: '🤗',
    description: 'Фізична близькість після сексу',
    effectByLevel: 'Shame −2×Lv. Bond + при REL. Немає stamina cost у post-scene.',
    levelMeanings: ['торкається', 'обіймає', 'не відпускає', 'колисає', 'зцілює дотиком'],
    diceKeywords: ['обійм', 'після сексу', 'пригорн'],
  },
  {
    id: 'ac_2',
    name: 'Aftercare',
    category: 'aftercare',
    parentName: 'Обійми після',
    icon: '🤍',
    description: 'Турбота, вода, тепло, спокій',
    effectByLevel: 'Hunger/thirst −small. Next-turn stamina +5×Lv. Soft praise kink XP.',
    levelMeanings: ['вода/тканина', 'тепло', 'тиша разом', 'повний догляд', 'ритуал aftercare'],
    diceKeywords: ['aftercare', 'турбот', 'догляд після'],
  },
  {
    id: 'ac_3',
    name: 'Слова підтримки',
    category: 'aftercare',
    parentName: 'Aftercare',
    icon: '💬',
    description: 'М\'які слова після жорсткої сцени',
    effectByLevel: 'Shame −3×Lv. Fear −. Bond +. d20 soft charisma.',
    levelMeanings: ['ти тихо', 'ти в безпеці', 'я з тобою', 'гордість', 'любов/повага'],
    diceKeywords: ['підтримк', 'ти в безпеці', 'м\'які слова'],
  },
  {
    id: 'ac_4',
    name: 'Зцілення близькості',
    category: 'aftercare',
    parentName: 'Слова підтримки',
    icon: '💚',
    description: 'Відновлення довіри й тіла',
    effectByLevel: 'Heal light (narrative). Amulet +Lv/2. Body_magic synergy. Clears mild disease chance.',
    levelMeanings: ['спокій', 'відновлення', 'довіра', 'зцілення', 'повне оновлення'],
    diceKeywords: ['зцілення близькості', 'відновл', 'heal after'],
  },
]

export function getSexSkillNodes(category?: SexSkillCategory): SexSkillNode[] {
  if (!category) return SEX_SKILL_TREE
  return SEX_SKILL_TREE.filter((n) => n.category === category)
}

export function findSexSkillNode(name: string): SexSkillNode | undefined {
  const n = name.trim().toLowerCase()
  return SEX_SKILL_TREE.find((s) => s.name.toLowerCase() === n)
}

/** Human-readable depth/mastery for a skill at given level (1–5). */
export function getLevelMeaning(skillName: string, level: number): string | null {
  const node = findSexSkillNode(skillName)
  if (!node?.levelMeanings) return null
  const lv = Math.min(5, Math.max(1, Math.floor(level)))
  return node.levelMeanings[lv - 1] ?? null
}
