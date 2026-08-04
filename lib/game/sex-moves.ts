/**
 * Skill Moves — player actions unlocked by the sex skill tree.
 * skillName must match SKILL_NAMES / seed exactly.
 */

import { skillLevel, isSkillUnlockedInTree, type SkillLike } from '@/lib/game/skill-effects'
import { findSexSkillNode, SEX_SKILL_TREE } from '@/lib/game/sex-skill-tree'

export type SexPhaseBucket = 'foreplay' | 'main' | 'climax' | 'any'

export interface SexMove {
  id: string
  skillName: string
  minLevel: number
  label: string
  icon: string
  /** Short description for HUD */
  description: string
  phase: SexPhaseBucket
  /** Stamina cost by tempo */
  staminaCost: Record<'slow' | 'medium' | 'fast', number>
  /** Base pleasure before skill multipliers */
  pleasure: { lara: number; partner: number }
  dominationDelta?: number
  /** Requires multi-orgasm unlock */
  requiresMulti?: boolean
  /** Min amulet energy (read from gameState if provided) */
  minAmulet?: number
  /** Guaranteed XP to skillName */
  xp: number
  /** Text injected into chat for the LLM */
  playerPrompt: string
  category: string
}

export const SEX_MOVES: SexMove[] = [
  // —— Зваблення
  {
    id: 'sed_gaze',
    skillName: 'Чарівний погляд',
    minLevel: 0,
    label: 'Спіймати поглядом',
    icon: '👁️',
    description: 'Флірт очима — розігріває партнера',
    phase: 'any',
    staminaCost: { slow: 2, medium: 3, fast: 4 },
    pleasure: { lara: 4, partner: 8 },
    xp: 12,
    playerPrompt: 'Лара ловить погляд партнера і тримає його, зваблюючи без слів.',
    category: 'seduction',
  },
  {
    id: 'sed_words',
    skillName: 'Солодкі слова',
    minLevel: 1,
    label: 'Солодкі слова',
    icon: '💬',
    description: 'Еротичний комплімент / шепіт',
    phase: 'any',
    staminaCost: { slow: 2, medium: 3, fast: 3 },
    pleasure: { lara: 5, partner: 10 },
    xp: 12,
    playerPrompt: 'Лара шепоче солодкі, відверті слова, розпалюючи бажання.',
    category: 'seduction',
  },
  {
    id: 'sed_dance',
    skillName: 'Спокусливий танець',
    minLevel: 1,
    label: 'Спокусливий рух',
    icon: '💃',
    description: 'Тіло в ритмі — сильний foreplay',
    phase: 'foreplay',
    staminaCost: { slow: 6, medium: 8, fast: 12 },
    pleasure: { lara: 8, partner: 14 },
    xp: 15,
    playerPrompt: 'Лара рухається повільно й зухвало, показуючи тіло в спокусливому танці.',
    category: 'seduction',
  },

  // —— Техніка
  {
    id: 'tech_touch',
    skillName: 'Ніжний дотик',
    minLevel: 0,
    label: 'Ніжні ласки',
    icon: '🌹',
    description: 'Базові ласки по тілу партнера',
    phase: 'any',
    staminaCost: { slow: 5, medium: 8, fast: 12 },
    pleasure: { lara: 8, partner: 14 },
    xp: 15,
    playerPrompt: 'Лара ніжно пестить тіло партнера, досліджуючи чутливі зони.',
    category: 'technique',
  },
  {
    id: 'tech_kiss',
    skillName: 'Поцілунок вогню',
    minLevel: 1,
    label: 'Поцілунок вогню',
    icon: '💋',
    description: 'Пристрасний поцілунок',
    phase: 'any',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 10, partner: 10 },
    xp: 14,
    playerPrompt: 'Лара цілує глибоко й пристрасно, не даючи відірватися.',
    category: 'technique',
  },
  {
    id: 'tech_flex',
    skillName: 'Гнучкість тіла',
    minLevel: 1,
    label: 'Змінити позу',
    icon: '🤸',
    description: 'Нова позиція — сильніше в main/climax',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 14 },
    pleasure: { lara: 12, partner: 16 },
    xp: 16,
    playerPrompt: 'Лара вправно змінює позу, використовуючи гнучкість тіла.',
    category: 'technique',
  },
  {
    id: 'tech_hands',
    skillName: 'Майстерність рук',
    minLevel: 1,
    label: 'Майстерність рук',
    icon: '✋',
    description: 'Вправні ласки руками',
    phase: 'any',
    staminaCost: { slow: 6, medium: 9, fast: 12 },
    pleasure: { lara: 6, partner: 18 },
    xp: 16,
    playerPrompt: 'Лара використовує вправність рук, доводячи партнера до тремтіння.',
    category: 'technique',
  },

  // —— Витривалість
  {
    id: 'end_hold',
    skillName: 'Тривала насолода',
    minLevel: 0,
    label: 'Тримати темп',
    icon: '⏱️',
    description: 'Стабільний ритм, менше втрати стаміни',
    phase: 'any',
    staminaCost: { slow: 3, medium: 5, fast: 7 },
    pleasure: { lara: 8, partner: 8 },
    xp: 12,
    playerPrompt: 'Лара тримає рівний, виснажливий для партнера темп, контролюючи дихання.',
    category: 'endurance',
  },
  {
    id: 'end_multi',
    skillName: 'Множинне задоволення',
    minLevel: 2,
    label: 'Хвиля насолоди',
    icon: '🌊',
    description: 'Спроба мульти-оргазму (потрібен Lv≥2)',
    phase: 'climax',
    staminaCost: { slow: 15, medium: 20, fast: 28 },
    pleasure: { lara: 20, partner: 12 },
    requiresMulti: true,
    xp: 20,
    playerPrompt: 'Лара не зупиняється після піку — жене тіло до наступної хвилі оргазму.',
    category: 'endurance',
  },
  {
    id: 'end_control',
    skillName: 'Контроль тіла',
    minLevel: 1,
    label: 'Контроль тіла',
    icon: '🧘',
    description: 'Затримати себе, підсилити партнера',
    phase: 'main',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 4, partner: 14 },
    xp: 14,
    playerPrompt: 'Лара стримує власний пік, віддаючи контроль і увагу партнеру.',
    category: 'endurance',
  },

  // —— Домінування
  {
    id: 'dom_voice',
    skillName: 'Владний голос',
    minLevel: 0,
    label: 'Наказ',
    icon: '🗣️',
    description: 'Командний тон',
    phase: 'any',
    staminaCost: { slow: 3, medium: 4, fast: 5 },
    pleasure: { lara: 6, partner: 10 },
    dominationDelta: 12,
    xp: 14,
    playerPrompt: 'Лара наказує низьким владним голосом, не залишаючи права відмови.',
    category: 'domination',
  },
  {
    id: 'dom_bind',
    skillName: "Зв'язування",
    minLevel: 2,
    label: "Зв'язати",
    icon: '⛓️',
    description: 'Бондаж (потрібен Lv≥2)',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 12 },
    pleasure: { lara: 8, partner: 14 },
    dominationDelta: 18,
    xp: 18,
    playerPrompt: 'Лара вправно зв\'язує партнера, забираючи контроль над тілом.',
    category: 'domination',
  },
  {
    id: 'dom_full',
    skillName: 'Повна влада',
    minLevel: 3,
    label: 'Повна влада',
    icon: '👑',
    description: 'Абсолютний контроль (Lv≥3)',
    phase: 'any',
    staminaCost: { slow: 10, medium: 12, fast: 15 },
    pleasure: { lara: 12, partner: 16 },
    dominationDelta: 25,
    xp: 22,
    playerPrompt: 'Лара бере повну владу над сценою — темп, поза і дозволи лише її.',
    category: 'domination',
  },

  // —— Підкорення
  {
    id: 'sub_yield',
    skillName: 'Покірність',
    minLevel: 0,
    label: 'Віддатися',
    icon: '🙇',
    description: 'Зняти контроль, віддати ініціативу',
    phase: 'any',
    staminaCost: { slow: 3, medium: 5, fast: 6 },
    pleasure: { lara: 12, partner: 8 },
    dominationDelta: -12,
    xp: 14,
    playerPrompt: 'Лара м\'якне, віддається, дозволяючи партнеру вести.',
    category: 'submission',
  },
  {
    id: 'sub_sense',
    skillName: 'Чутливість',
    minLevel: 1,
    label: 'Відкрити чутливість',
    icon: '💗',
    description: 'Підсилити власні відчуття',
    phase: 'any',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 16, partner: 6 },
    dominationDelta: -6,
    xp: 14,
    playerPrompt: 'Лара повністю відкривається відчуттям, шкіра горить від кожного дотику.',
    category: 'submission',
  },
  {
    id: 'sub_beg',
    skillName: 'Прохання та благання',
    minLevel: 1,
    label: 'Благати',
    icon: '🙏',
    description: 'Просити сильніше / більше',
    phase: 'main',
    staminaCost: { slow: 3, medium: 4, fast: 5 },
    pleasure: { lara: 10, partner: 12 },
    dominationDelta: -10,
    xp: 15,
    playerPrompt: 'Лара благає хрипким голосом — про більше, глибше, сильніше.',
    category: 'submission',
  },

  // —— Магія тіла
  {
    id: 'mag_heal',
    skillName: 'Цілюща ласка',
    minLevel: 0,
    label: 'Цілюща ласка',
    icon: '💚',
    description: 'Ніжний магічний дотик',
    phase: 'any',
    staminaCost: { slow: 5, medium: 7, fast: 9 },
    pleasure: { lara: 8, partner: 10 },
    xp: 14,
    playerPrompt: 'Лара проводить долонею з теплом амулета — ласка, що зцілює й збуджує.',
    category: 'body_magic',
  },
  {
    id: 'mag_ritual',
    skillName: 'Ритуал насолоди',
    minLevel: 1,
    label: 'Ритуал насолоди',
    icon: '🔮',
    description: 'Заряд амулета через близькість',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 12 },
    pleasure: { lara: 10, partner: 10 },
    minAmulet: 0,
    xp: 18,
    playerPrompt: 'Лара шепоче слова ритуалу; амулет пульсує в такт рухам тіл.',
    category: 'body_magic',
  },
  {
    id: 'mag_ecstasy',
    skillName: 'Екстаз сили',
    minLevel: 1,
    label: 'Екстаз сили',
    icon: '✨',
    description: 'Перетворити пік на енергію амулета',
    phase: 'climax',
    staminaCost: { slow: 12, medium: 16, fast: 20 },
    pleasure: { lara: 18, partner: 14 },
    minAmulet: 5,
    xp: 22,
    playerPrompt: 'Лара спрямовує оргазм у амулет — насолода стає магічною силою.',
    category: 'body_magic',
  },

  // —— Брудні розмови (гілка)
  {
    id: 'dt_talk',
    skillName: 'Брудні розмови',
    minLevel: 0,
    label: 'Брудні слова',
    icon: '🗣️',
    description: 'Говорити брудно — рівень = сміливість лексики',
    phase: 'any',
    staminaCost: { slow: 2, medium: 3, fast: 4 },
    pleasure: { lara: 6, partner: 10 },
    xp: 14,
    playerPrompt: 'Лара шепоче брудні, відверті слова — без цензури, змушуючи партнера червоніти й твердіти.',
    category: 'dirty_talk',
  },
  {
    id: 'dt_dom',
    skillName: 'Брудна домінація',
    minLevel: 1,
    label: 'Вербальний наказ',
    icon: '🗯️',
    description: 'Брудні накази (Lv≥1)',
    phase: 'any',
    staminaCost: { slow: 3, medium: 4, fast: 5 },
    pleasure: { lara: 8, partner: 12 },
    dominationDelta: 14,
    xp: 16,
    playerPrompt: 'Лара наказує брудним голосом — що робити з її тілом і як кінчати.',
    category: 'dirty_talk',
  },

  // —— Дрочка (гілка)
  {
    id: 'hj_main',
    skillName: 'Дрочка руками',
    minLevel: 0,
    label: 'Дрочка руками',
    icon: '✋',
    description: 'Ручна стимуляція — Lv = майстерність хвату/ритму',
    phase: 'any',
    staminaCost: { slow: 6, medium: 9, fast: 12 },
    pleasure: { lara: 5, partner: 18 },
    xp: 16,
    playerPrompt: 'Лара бере члена в руку і дрочить вправно — ритм, стиск, великий палець по голівці.',
    category: 'handjob',
  },
  {
    id: 'hj_finish',
    skillName: 'Ручний фініш',
    minLevel: 1,
    label: 'Ручний фініш',
    icon: '💥',
    description: 'Довести руками (Lv≥1)',
    phase: 'main',
    staminaCost: { slow: 8, medium: 12, fast: 16 },
    pleasure: { lara: 6, partner: 24 },
    xp: 20,
    playerPrompt: 'Лара прискорює руку, не відпускає — хоче, щоб він кінчив їй у долоню.',
    category: 'handjob',
  },

  // —— Мінет (гілка)
  {
    id: 'bj_main',
    skillName: 'Мінет',
    minLevel: 0,
    label: 'Мінет',
    icon: '💋',
    description: 'Оральний секс — Lv = глибина/техніка мінету',
    phase: 'any',
    staminaCost: { slow: 8, medium: 11, fast: 15 },
    pleasure: { lara: 8, partner: 22 },
    xp: 18,
    playerPrompt: 'Лара бере в рот, смокче волого — язик, губи, ритм під стогін партнера.',
    category: 'blowjob',
  },
  {
    id: 'bj_finish',
    skillName: 'Мінет-оргазм',
    minLevel: 1,
    label: 'Мінет до фінішу',
    icon: '💦',
    description: 'Oral finish (Lv≥1)',
    phase: 'main',
    staminaCost: { slow: 10, medium: 14, fast: 18 },
    pleasure: { lara: 10, partner: 26 },
    xp: 22,
    playerPrompt: 'Лара не відривається — смокче до оргазму, готово прийняти все.',
    category: 'blowjob',
  },

  // —— Глибоке горло (гілка) — Lv = наскільки глибоко
  {
    id: 'th_main',
    skillName: 'Глибоке горло',
    minLevel: 0,
    label: 'Глибоке горло',
    icon: '🌊',
    description: 'Lv1 кінчик… Lv5 full+hold — глибина прийняття',
    phase: 'main',
    staminaCost: { slow: 12, medium: 16, fast: 22 },
    pleasure: { lara: 10, partner: 28 },
    xp: 22,
    playerPrompt: 'Лара насаджується глибше по рівню своєї навички «Глибоке горло», стримує рефлекс, очі вологі.',
    category: 'deepthroat',
  },
  {
    id: 'th_finish',
    skillName: 'Горло-фініш',
    minLevel: 1,
    label: 'Фініш у горло',
    icon: '🕳️',
    description: 'Throatpie (Lv≥1 + deepthroat)',
    phase: 'climax',
    staminaCost: { slow: 14, medium: 18, fast: 24 },
    pleasure: { lara: 12, partner: 32 },
    xp: 24,
    playerPrompt: 'Лара тримає його глибоко в горлі на фініші — не відпускає, поки не скінчить.',
    category: 'deepthroat',
  },

  // —— Вагіна (місткість / глибина)
  {
    id: 'vg_prep',
    skillName: "М'який вхід",
    minLevel: 0,
    label: "М'який вхід",
    icon: '🪷',
    description: 'Розтягнення: змазка, розслаб, повільний вхід',
    phase: 'foreplay',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 10, partner: 8 },
    xp: 12,
    playerPrompt:
      'Лара готує вагіну: змазка, пальці, дихання, м\'який вхід — підвищує розтягнення перед великим розміром.',
    category: 'vaginal',
  },
  {
    id: 'vg_capacity',
    skillName: 'Вагінальна місткість',
    minLevel: 0,
    label: 'Прийняти товщину',
    icon: '🌸',
    description: 'Lv = місткість по ⌀ (товщина партнера)',
    phase: 'main',
    staminaCost: { slow: 8, medium: 12, fast: 16 },
    pleasure: { lara: 14, partner: 16 },
    xp: 18,
    playerPrompt:
      'Лара свідомо працює з товщиною партнера — розтягує вагіну, дихає, приймає ⌀ на межі місткості.',
    category: 'vaginal',
  },
  {
    id: 'vg_depth',
    skillName: 'Глибина вагіни',
    minLevel: 1,
    label: 'Глибоко всередині',
    icon: '📏',
    description: 'Lv = глибина (см); зайва довжина лишається зовні',
    phase: 'main',
    staminaCost: { slow: 10, medium: 14, fast: 18 },
    pleasure: { lara: 16, partner: 18 },
    xp: 20,
    playerPrompt:
      'Лара бере на глибину свого рівня — кут, притиск; якщо член довший за місткість, частина лишається зовні.',
    category: 'vaginal',
  },
  {
    id: 'vg_orgasm',
    skillName: 'Вагінальний оргазм',
    minLevel: 1,
    label: 'Вагінальний оргазм',
    icon: '💫',
    description: 'Оргазм від наповнення / глибини',
    phase: 'climax',
    staminaCost: { slow: 10, medium: 14, fast: 18 },
    pleasure: { lara: 24, partner: 16 },
    xp: 22,
    playerPrompt:
      'Лара кінчає від наповненості й глибини — судоми навколо нього, фокус на G-spot / full-feel.',
    category: 'vaginal',
  },

  // —— Анал (місткість / глибина)
  {
    id: 'an_prep',
    skillName: 'Анальна підготовка',
    minLevel: 0,
    label: 'Підготувати анал',
    icon: '🧴',
    description: 'Розтяг сфінктера — без цього великий ⌀ небезпечний',
    phase: 'foreplay',
    staminaCost: { slow: 5, medium: 7, fast: 9 },
    pleasure: { lara: 8, partner: 8 },
    xp: 12,
    playerPrompt:
      'Лара готує анал — пальці, змазка, дихання, розслаблення сфінктера (розтягнення).',
    category: 'anal',
  },
  {
    id: 'an_main',
    skillName: 'Анал',
    minLevel: 0,
    label: 'Анал (товщина)',
    icon: '🍑',
    description: 'Lv = місткість по ⌀',
    phase: 'main',
    staminaCost: { slow: 10, medium: 14, fast: 18 },
    pleasure: { lara: 14, partner: 20 },
    xp: 20,
    playerPrompt:
      'Лара бере анал з фокусом на товщині — від кінчика до повного ⌀ на рівні місткості.',
    category: 'anal',
  },
  {
    id: 'an_deep',
    skillName: 'Глибокий анал',
    minLevel: 1,
    label: 'Глибокий анал',
    icon: '🔻',
    description: 'Lv = глибина (см) анального прийняття',
    phase: 'main',
    staminaCost: { slow: 12, medium: 16, fast: 22 },
    pleasure: { lara: 16, partner: 24 },
    xp: 22,
    playerPrompt:
      'Лара йде в глибину аналу — стегна, ритм; порівнюй з usable length партнера.',
    category: 'anal',
  },

  // —— Вершниця
  {
    id: 'rd_main',
    skillName: 'Вершниця',
    minLevel: 0,
    label: 'Вершниця',
    icon: '🏇',
    description: 'Їзда зверху — Lv = сила/ритм',
    phase: 'main',
    staminaCost: { slow: 8, medium: 12, fast: 16 },
    pleasure: { lara: 16, partner: 16 },
    dominationDelta: 8,
    xp: 18,
    playerPrompt: 'Лара сідає зверху й їде — кут, глибина, темп під її контролем.',
    category: 'riding',
  },
  {
    id: 'rd_finish',
    skillName: 'Вершниця-оргазм',
    minLevel: 1,
    label: 'Кінчити зверху',
    icon: '🌟',
    description: 'Оргазм вершницею (Lv≥1)',
    phase: 'climax',
    staminaCost: { slow: 10, medium: 14, fast: 18 },
    pleasure: { lara: 22, partner: 18 },
    dominationDelta: 10,
    xp: 22,
    playerPrompt: 'Лара скаче до свого оргазму зверху, стискаючи його всередині.',
    category: 'riding',
  },

  // —— Еджинг
  {
    id: 'ed_main',
    skillName: 'Еджинг',
    minLevel: 0,
    label: 'Еджинг',
    icon: '⏸️',
    description: 'Тримати на межі — Lv = цикли контролю',
    phase: 'main',
    staminaCost: { slow: 6, medium: 8, fast: 10 },
    pleasure: { lara: 8, partner: 14 },
    dominationDelta: 6,
    xp: 16,
    playerPrompt: 'Лара доводить до краю й зупиняється — знову і знову, не даючи кінчити.',
    category: 'edging',
  },
  {
    id: 'ed_deny',
    skillName: 'Заборона оргазму',
    minLevel: 1,
    label: 'Заборонити кінчати',
    icon: '🚫',
    description: 'Orgasm denial (Lv≥1)',
    phase: 'main',
    staminaCost: { slow: 5, medium: 7, fast: 9 },
    pleasure: { lara: 10, partner: 12 },
    dominationDelta: 18,
    xp: 20,
    playerPrompt: 'Лара забороняє оргазм — лише з її дозволу можна кінчити.',
    category: 'edging',
  },

  // —— Публічність
  {
    id: 'pub_hint',
    skillName: 'Натяк на людях',
    minLevel: 0,
    label: 'Натяк при свідках',
    icon: '😏',
    description: 'Флірт на людях',
    phase: 'any',
    staminaCost: { slow: 2, medium: 3, fast: 4 },
    pleasure: { lara: 6, partner: 8 },
    xp: 12,
    playerPrompt: 'Лара кидає зухвалий натяк, знаючи що хтось може бачити або чути.',
    category: 'public',
  },
  {
    id: 'pub_sex',
    skillName: 'Секс на виду',
    minLevel: 1,
    label: 'Секс на виду',
    icon: '👀',
    description: 'Близькість з ризиком бути побаченою',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 12 },
    pleasure: { lara: 14, partner: 14 },
    xp: 18,
    playerPrompt: 'Лара не зупиняє секс, навіть коли є шанс що їх побачать — сором і кайф змішані.',
    category: 'public',
  },

  // —— Кремпай / насіння
  {
    id: 'cr_inside',
    skillName: 'Прийняти всередині',
    minLevel: 0,
    label: 'Просити всередині',
    icon: '🤲',
    description: 'Просити фініш у собі',
    phase: 'main',
    staminaCost: { slow: 4, medium: 5, fast: 6 },
    pleasure: { lara: 10, partner: 12 },
    xp: 14,
    playerPrompt: 'Лара благає не виймати — хоче відчути фініш глибоко всередині.',
    category: 'creampie',
  },
  {
    id: 'cr_main',
    skillName: 'Кремпай',
    minLevel: 1,
    label: 'Кремпай',
    icon: '💦',
    description: 'Прийняти оргазм всередині (Lv≥1)',
    phase: 'climax',
    staminaCost: { slow: 6, medium: 8, fast: 10 },
    pleasure: { lara: 16, partner: 22 },
    xp: 20,
    playerPrompt: 'Лара приймає кремпай — тримає його в собі, відчуваючи тепло й наповненість.',
    category: 'creampie',
  },
  {
    id: 'cr_breed',
    skillName: 'Ризик насіння',
    minLevel: 1,
    label: 'Ризик насіння',
    icon: '🤰',
    description: 'Свідомий ризик вагітності',
    phase: 'climax',
    staminaCost: { slow: 6, medium: 8, fast: 10 },
    pleasure: { lara: 18, partner: 20 },
    xp: 22,
    playerPrompt: 'Лара свідомо йде на ризик — хоче його насіння, навіть якщо це означає вагітність.',
    category: 'creampie',
  },

  // —— Aftercare
  {
    id: 'ac_hug',
    skillName: 'Обійми після',
    minLevel: 0,
    label: 'Обійняти після',
    icon: '🤗',
    description: 'Післяоргазмені обійми',
    phase: 'any',
    staminaCost: { slow: 1, medium: 1, fast: 2 },
    pleasure: { lara: 4, partner: 4 },
    xp: 12,
    playerPrompt: 'Після хвилі Лара притискається, обіймає, дихає з партнером в одному ритмі.',
    category: 'aftercare',
  },
  {
    id: 'ac_main',
    skillName: 'Aftercare',
    minLevel: 0,
    label: 'Aftercare',
    icon: '🤍',
    description: 'Турбота після сексу',
    phase: 'any',
    staminaCost: { slow: 2, medium: 2, fast: 3 },
    pleasure: { lara: 6, partner: 5 },
    xp: 14,
    playerPrompt: 'Лара (або просить) aftercare — вода, тепло, тихі дотики, без поспіху.',
    category: 'aftercare',
  },
  {
    id: 'ac_words',
    skillName: 'Слова підтримки',
    minLevel: 1,
    label: 'Слова підтримки',
    icon: '💬',
    description: 'М\'які слова після жорсткого',
    phase: 'any',
    staminaCost: { slow: 1, medium: 2, fast: 2 },
    pleasure: { lara: 8, partner: 6 },
    xp: 16,
    playerPrompt: 'Лара каже м\'які підтримуючі слова — «ти в безпеці», «я з тобою», знімаючи сором.',
    category: 'aftercare',
  },
]

export function findSexMove(id: string): SexMove | undefined {
  return SEX_MOVES.find((m) => m.id === id)
}

export interface MoveAvailability {
  move: SexMove
  unlocked: boolean
  reason?: string
  skillLevel: number
}

export function listAvailableSexMoves(
  skills: SkillLike[] | null | undefined,
  opts: {
    phase?: string | null
    multiUnlocked?: boolean
    amuletEnergy?: number
  } = {}
): MoveAvailability[] {
  const phase = (opts.phase || 'foreplay') as SexPhaseBucket
  const multi = opts.multiUnlocked ?? false
  const amulet = opts.amuletEnergy ?? 0

  return SEX_MOVES.map((move) => {
    const lv = skillLevel(skills, move.skillName)
    const node = findSexSkillNode(move.skillName)
    const treeOk = node ? isSkillUnlockedInTree(node, skills) : true

    if (!treeOk) {
      return { move, unlocked: false, reason: `Спочатку «${node?.parentName}»`, skillLevel: lv }
    }
    if (lv < move.minLevel) {
      return {
        move,
        unlocked: false,
        reason: `Потрібен ${move.skillName} Lv≥${move.minLevel}`,
        skillLevel: lv,
      }
    }
    if (move.requiresMulti && !multi) {
      return { move, unlocked: false, reason: 'Множинне задоволення Lv≥2', skillLevel: lv }
    }
    if (move.minAmulet != null && amulet < move.minAmulet) {
      return { move, unlocked: false, reason: `Амулет ≥${move.minAmulet}`, skillLevel: lv }
    }
    // Phase soft-lock: allow any-phase; for specific, still show but mark if mismatch as unlocked with note?
    // Strict: climax moves only in climax; main only main/climax; foreplay only early
    if (move.phase !== 'any') {
      const order = { foreplay: 0, main: 1, climax: 2 } as const
      const cur = order[(phase in order ? phase : 'foreplay') as keyof typeof order] ?? 0
      const need = order[move.phase as keyof typeof order] ?? 0
      if (cur < need) {
        return {
          move,
          unlocked: false,
          reason: `Фаза: ${move.phase}`,
          skillLevel: lv,
        }
      }
    }
    return { move, unlocked: true, skillLevel: lv }
  })
}

/** Prefer showing unlocked first, then locked (for HUD strip). */
export function sexMovesForHud(
  skills: SkillLike[] | null | undefined,
  opts: Parameters<typeof listAvailableSexMoves>[1] = {}
): MoveAvailability[] {
  const all = listAvailableSexMoves(skills, opts)
  const unlocked = all.filter((a) => a.unlocked)
  // Show up to 8 unlocked; if few, show locked previews of same category roots
  if (unlocked.length >= 4) return unlocked.slice(0, 10)
  const lockedPreview = all.filter((a) => !a.unlocked).slice(0, 4)
  return [...unlocked, ...lockedPreview]
}

export function tempoKey(tempo: string | undefined): 'slow' | 'medium' | 'fast' {
  const t = (tempo || 'medium').toLowerCase()
  if (t.includes('slow') || t.includes('повіл')) return 'slow'
  if (t.includes('fast') || t.includes('швид')) return 'fast'
  return 'medium'
}

export function phaseKey(phase: string | undefined | null): 'foreplay' | 'main' | 'climax' {
  const p = (phase || 'foreplay').toLowerCase()
  if (p.includes('climax') || p.includes('кульм')) return 'climax'
  if (p.includes('main') || p.includes('основ')) return 'main'
  return 'foreplay'
}

// re-export tree length sanity for tests
export function sexMovesSkillNames(): string[] {
  return [...new Set(SEX_MOVES.map((m) => m.skillName))]
}

export function allMoveSkillsExistInTree(): boolean {
  const names = new Set(SEX_SKILL_TREE.map((n) => n.name))
  return SEX_MOVES.every((m) => names.has(m.skillName))
}
