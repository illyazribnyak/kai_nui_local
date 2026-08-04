/**
 * Sex skill tree — single source of truth for UI + mechanical effects.
 * Skill `name` values MUST match seed-skills / SKILL_NAMES exactly.
 */

export type SexSkillCategory =
  | 'seduction'
  | 'technique'
  | 'endurance'
  | 'domination'
  | 'submission'
  | 'body_magic'
  | 'acts'

export interface SexSkillNode {
  id: string
  name: string
  category: SexSkillCategory
  /** Parent skill name that must be level >= 1 to unlock this node in the tree UI */
  parentName?: string
  icon: string
  /** Short flavor for UI */
  description: string
  /** Concrete mechanical effect text (shown in UI + prompt) */
  effectByLevel: string
  /** Keywords that map this skill onto d20 checks */
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
  { id: 'acts', label: 'Акти', icon: '🔥', color: 'fuchsia', activeClass: 'bg-fuchsia-600 text-white shadow-fuchsia-600/30' },
]

/** Linear trees per category — order = progression. */
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

  // —— Інтимні акти
  {
    id: 'act_1',
    name: 'Брудні розмови',
    category: 'acts',
    icon: '🗣️',
    description: 'Брудні слова, стогін, вербальне збудження',
    effectByLevel: 'd20 dirty talk/харизма +рівень. Partner pleasure +1% за рівень на вербальних ходах. Рівень ≥3: +desire підказка AI.',
    diceKeywords: ['брудн', 'розмов', 'dirty', 'talk', 'словес', 'стогін', 'вербаль', 'харизма'],
  },
  {
    id: 'act_2',
    name: 'Дрочка руками',
    category: 'acts',
    parentName: 'Брудні розмови',
    icon: '✋',
    description: 'Майстерність ручної стимуляції партнера',
    effectByLevel: 'partner pleasure +3% за рівень на hand-ходах. d20 руки/техніка +рівень. Рівень 5: +8 flat partner pleasure на дрочці.',
    diceKeywords: ['дроч', 'ручн', 'handjob', 'руками', 'мастурб', 'стимул'],
  },
  {
    id: 'act_3',
    name: 'Мінет',
    category: 'acts',
    parentName: 'Дрочка руками',
    icon: '💋',
    description: 'Оральні ласки, ритм і техніка',
    effectByLevel: 'partner pleasure +4% за рівень на oral-ходах. d20 мінет +рівень. Рівень ≥3: швидший partner orgasm (−5 до порогу партнера наративно).',
    diceKeywords: ['мінет', 'орал', 'blowjob', 'рот', 'язик', 'смокт'],
  },
  {
    id: 'act_4',
    name: 'Глибоке горло',
    category: 'acts',
    parentName: 'Мінет',
    icon: '🌊',
    description: 'Глибоке прийняття, контроль дихання',
    effectByLevel: 'потрібен Мінет ≥1. d20 deepthroat +рівень; partner pleasure +5%×рівень. Рівень ≥3: stamina cost oral −2. Рівень 5: crit oral на 19–20.',
    diceKeywords: ['глибок', 'горл', 'deepthroat', 'deep', 'throat', 'глибина'],
  },
  {
    id: 'act_5',
    name: 'Анал',
    category: 'acts',
    parentName: 'Мінет',
    icon: '🍑',
    description: 'Анальна близькість: підготовка, темп, контроль',
    effectByLevel: 'd20 анал +рівень. Partner + lara pleasure на anal-ходах +3%×рівень. Рівень ≥2: risk-anal дозволений. Рівень ≥4: stamina floor +5 у anal.',
    diceKeywords: ['анал', 'anal', 'задн', 'попка', 'підготовк'],
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
