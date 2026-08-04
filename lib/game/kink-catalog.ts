/**
 * Kink catalog — preferences with levels 0–5 (separate from skill tree).
 * Skill = how; Kink = what turns Lara on / what she craves.
 */

export interface KinkDefinition {
  key: string
  name: string
  icon: string
  category: 'desire' | 'power' | 'body' | 'social' | 'magic'
  description: string
  /** Lv1–5 meaning */
  levelMeanings: [string, string, string, string, string]
  /** Keywords for auto-detect from scene text / tags */
  triggerKeywords: string[]
  /** Linked skill names — XP bonus when those skills used */
  relatedSkills: string[]
  effectByLevel: string
}

export const KINK_CATALOG: KinkDefinition[] = [
  {
    key: 'breeding',
    name: 'Запліднення',
    icon: '🤰',
    category: 'desire',
    description: 'Тяга до зачаття, «залишити насіння»',
    levelMeanings: ['цікавість', 'збуджує думка', 'просить всередині', 'благає завагітніти', 'одержимість'],
    triggerKeywords: ['вагіт', 'заплід', 'насін', 'breed', 'зачат', 'дитин'],
    relatedSkills: ['Анал', 'Глибоке горло', 'Кремпай', 'Ризик насіння'],
    effectByLevel: 'pregnancy_risk ×(1+0.12×Lv). Desire + після finish-всередині.',
  },
  {
    key: 'creampie',
    name: 'Кремпай',
    icon: '💦',
    category: 'body',
    description: 'Оргазм партнера всередині',
    levelMeanings: ['подобається', 'хоче відчувати', 'просить глибше', 'не випускає', 'ритуал кремпаю'],
    triggerKeywords: ['кремпай', 'всередині', 'кінчити в', 'creampie', 'наповн'],
    relatedSkills: ['Мінет-оргазм', 'Горло-фініш', 'Кремпай', 'Прийняти все'],
    effectByLevel: 'amulet_gain +Lv; partner finish pleasure +3%×Lv.',
  },
  {
    key: 'public',
    name: 'Публічність',
    icon: '👀',
    category: 'social',
    description: 'Секс де можуть побачити / ритуал на людях',
    levelMeanings: ['сором + іскра', 'подобається ризик', 'хоче свідків', 'вимагає очей', 'повна exhibition'],
    triggerKeywords: ['публіч', 'на очах', 'ритуал', 'плем', 'дивлят', 'exhibition', 'свідк'],
    relatedSkills: ['Натяк на людях', 'Секс на виду', 'Ритуальне шоу', 'Спокусливий танець'],
    effectByLevel: 'shame −2×Lv після публічної сцени; NPC desire; tribe rep ±.',
  },
  {
    key: 'size',
    name: 'Розмір',
    icon: '📏',
    category: 'body',
    description: 'Тяга до великих / «не влізе»',
    levelMeanings: ['цікаво', 'хоче більше', 'боїться+хоче', 'ламає себе', 'тільки великі'],
    triggerKeywords: ['велик', 'товст', 'не вліз', 'розтяг', 'size', 'гігант'],
    relatedSkills: ['Глибоке горло', 'Глибокий анал', 'Подолання рефлекса'],
    effectByLevel: 'DC vs large races −Lv; deepthroat/anal pleasure +2%×Lv.',
  },
  {
    key: 'monster',
    name: 'Нелюдь',
    icon: '🐺',
    category: 'desire',
    description: 'Секс з не-людськими расами острова',
    levelMeanings: ['табу', 'спроба', 'смак', 'полювання', 'тільки «вони»'],
    triggerKeywords: ['кентавр', 'мінотавр', 'гієн', 'свино', 'нелюд', 'звір', 'monster'],
    relatedSkills: ['Аура бажання', 'Повна довіра', 'Глибоке горло'],
    effectByLevel: 'bond з non-human +; fear checks легші; scene unlocks.',
  },
  {
    key: 'marking',
    name: 'Мітки',
    icon: '💋',
    category: 'power',
    description: 'Засоси, укуси, «я твій»',
    levelMeanings: ['поцілунок-слід', 'засос', 'укус', 'мітка власності', 'ритуал мітки'],
    triggerKeywords: ['мітк', 'засос', 'укус', 'познач', 'marks', 'власніст'],
    relatedSkills: ['Покарання та нагорода', 'Владний голос'],
    effectByLevel: 'marks days +Lv; REL respect/fear; shame −.',
  },
  {
    key: 'praise',
    name: 'Похвала',
    icon: '🌸',
    category: 'power',
    description: '«Розумниця», soft praise kink',
    levelMeanings: ['приємно чути', 'тане', 'благає похвали', 'оргазм від слів', 'повна залежність'],
    triggerKeywords: ['розумниц', 'молодец', 'хорош', 'praise', 'пиша'],
    relatedSkills: ['Покірність', 'Прохання та благання', 'Aftercare'],
    effectByLevel: 'lara pleasure +2%×Lv у sub-сценах; bond +.',
  },
  {
    key: 'degrade',
    name: 'Приниження',
    icon: '⛓️',
    category: 'power',
    description: 'Грубі слова, «брудна» роль',
    levelMeanings: ['щипає', 'збуджує', 'просить жорсткіше', 'ламається', 'живиться приниженням'],
    triggerKeywords: ['шлюх', 'брудн', 'приниз', 'деград', 'whore', 'сук'],
    relatedSkills: ['Брудна домінація', 'Порно-голос', 'Повна влада'],
    effectByLevel: 'dom path pleasure +; fear/respect; risk verbal free at Lv≥3.',
  },
  {
    key: 'cumplay',
    name: 'Сперма',
    icon: '🤍',
    category: 'body',
    description: 'На тіло, обличчя, «прикрасити»',
    levelMeanings: ['не проти', 'хоче на груди', 'на обличчя', 'ритуал', 'одержимість'],
    triggerKeywords: ['на облич', 'на груди', 'облити', 'cum', 'сперм', 'кінчити на'],
    relatedSkills: ['Ручний фініш', 'Мінет-оргазм', 'Прийняти все'],
    effectByLevel: 'finish-on-body pleasure +; amulet +Lv/2.',
  },
  {
    key: 'control',
    name: 'Контроль',
    icon: '🎮',
    category: 'power',
    description: 'Вести, забороняти, дозволяти',
    levelMeanings: ['ініціатива', 'керує', 'ламає волю', 'повний контроль', 'бог сесії'],
    triggerKeywords: ['дозвіл', 'забороня', 'наказу', 'контроль', 'слухай'],
    relatedSkills: ['Еджинг', 'Заборона оргазму', 'Повна влада'],
    effectByLevel: 'domination floor +2×Lv; edge moves сильніші.',
  },
  {
    key: 'service',
    name: 'Служіння',
    icon: '🙇',
    category: 'power',
    description: 'Бути «використаною», служити тілом',
    levelMeanings: ['хоче догодити', 'віддається', 'благає використати', 'об’єкт насолоди', 'повне service'],
    triggerKeywords: ['використ', 'служить', 'для тебе', 'service', 'угод'],
    relatedSkills: ['Покірність', 'Повна довіра', 'Мінет'],
    effectByLevel: 'sub pleasure +; partner attitude devoted path.',
  },
  {
    key: 'ritual',
    name: 'Ритуальний секс',
    icon: '🔮',
    category: 'magic',
    description: 'Секс як обряд, амулет, плем’я',
    levelMeanings: ['цікаво', 'відчуває магію', 'шукає ритуал', 'жриця насолоди', 'тіло = вівтар'],
    triggerKeywords: ['ритуал', 'обряд', 'амулет', 'жриц', 'магі.*секс', 'храм'],
    relatedSkills: ['Ритуал насолоди', 'Екстаз сили', 'Ритуальне шоу'],
    effectByLevel: 'amulet ×(1+0.08×Lv); fact/quest hooks.',
  },
  {
    key: 'helpless',
    name: 'Безсилля',
    icon: '🔗',
    category: 'power',
    description: 'Тяга до примусу / безсилля: тіло реагує, коли воля зламана',
    levelMeanings: [
      'сором + іскра',
      'збуджує думка «не можу»',
      'оргазм проти волі «смакує»',
      'шукає / провокує безсилля',
      'одержимість helplessness',
    ],
    triggerKeywords: [
      'примус',
      'безсил',
      'неволя',
      'проти волі',
      'forced',
      'coercion',
      'пастк',
      'зв\'язан',
      'зв’язан',
      'тримає силою',
      'не відпуска',
      'зґвалт',
      'rape',
      'helpless',
      'не може втект',
      'використав',
    ],
    relatedSkills: ['Покірність', 'Прохання та благання', 'Повна довіра', 'Чутливість'],
    effectByLevel:
      'у coercion/trap: lara pleasure +3%×Lv; shame relief +Lv; submission path сильніший.',
  },
]

export function findKinkDef(key: string): KinkDefinition | undefined {
  return KINK_CATALOG.find((k) => k.key === key)
}

export function detectKinkKeysFromText(text: string): string[] {
  const t = (text || '').toLowerCase()
  const hits: string[] = []
  for (const k of KINK_CATALOG) {
    if (k.triggerKeywords.some((kw) => t.includes(kw.toLowerCase()))) {
      hits.push(k.key)
    }
  }
  return hits
}

export function mapFetishNameToKey(name: string): string | null {
  const n = (name || '').toLowerCase()
  for (const k of KINK_CATALOG) {
    if (n.includes(k.name.toLowerCase()) || n.includes(k.key)) return k.key
    if (k.triggerKeywords.some((kw) => n.includes(kw.toLowerCase()))) return k.key
  }
  return null
}
