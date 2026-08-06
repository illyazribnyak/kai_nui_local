/**
 * NPC combat/social stats + sexual kinks (separate from Lara's player profile).
 * Canon cast has fixed seeds; random NPCs get deterministic tribe/archetype fills.
 */

import { clamp } from '@/lib/game/json'
import { KINK_CATALOG, findKinkDef } from '@/lib/game/kink-catalog'

export type NpcAttrStats = {
  strength: number
  agility: number
  endurance: number
  charisma: number
  willpower: number
  /** 0–100 sexual lead preference */
  dominance: number
  /** 0–100 drive */
  libido: number
}

/** kink key → level 0–5 */
export type NpcKinkMap = Record<string, number>

export type NpcProfileSeed = {
  name: string
  tribe: string
  notes: string
  personality: string
  archetype: string
  attitude: string
  trust: number
  fear: number
  respect: number
  location: string
  bond?: number
  stats: NpcAttrStats
  kinks: NpcKinkMap
}

const ATTR_KEYS = [
  'strength',
  'agility',
  'endurance',
  'charisma',
  'willpower',
] as const

export function emptyKinkMap(): NpcKinkMap {
  return {}
}

export function parseKinksJson(raw?: string | null): NpcKinkMap {
  if (!raw || raw === '{}') return {}
  try {
    const parsed = JSON.parse(raw)
    return normalizeKinkMap(parsed)
  } catch {
    return {}
  }
}

export function serializeKinks(kinks: NpcKinkMap): string {
  const clean = normalizeKinkMap(kinks)
  return JSON.stringify(clean)
}

/** Accept object map or array of {key,level} / {name,level} */
export function normalizeKinkMap(input: unknown): NpcKinkMap {
  const out: NpcKinkMap = {}
  if (!input) return out
  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== 'object') continue
      const rec = item as Record<string, unknown>
      const keyRaw = String(rec.key || rec.name || '').trim()
      if (!keyRaw) continue
      const def = findKinkDef(keyRaw) || KINK_CATALOG.find((k) => k.name === keyRaw)
      const key = def?.key || keyRaw.toLowerCase()
      if (!findKinkDef(key) && !def) continue
      out[def?.key || key] = clamp(Number(rec.level ?? rec.lv ?? 1) || 0, 0, 5)
    }
    return out
  }
  if (typeof input === 'object') {
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const def = findKinkDef(k) || KINK_CATALOG.find((x) => x.name === k)
      const key = def?.key
      if (!key) continue
      out[key] = clamp(Number(v) || 0, 0, 5)
    }
  }
  return out
}

export function mergeKinkMaps(base: NpcKinkMap, patch: NpcKinkMap): NpcKinkMap {
  return { ...base, ...patch }
}

export function hasAssignedStats(s: Partial<NpcAttrStats> | null | undefined): boolean {
  return Number(s?.strength || 0) > 0
}

function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seeded01(seed: number, salt: number): number {
  const x = Math.sin(seed * 0.0001 + salt * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function pickInt(min: number, max: number, seed: number, salt: number): number {
  const t = seeded01(seed, salt)
  return Math.round(min + t * (max - min))
}

type TribeTemplate = {
  str: [number, number]
  agi: [number, number]
  end: [number, number]
  cha: [number, number]
  will: [number, number]
  dom: [number, number]
  lib: [number, number]
  kinkPool: Array<{ key: string; min: number; max: number }>
}

const TRIBE_TEMPLATES: Record<string, TribeTemplate> = {
  'кай-тору': {
    str: [8, 14],
    agi: [8, 13],
    end: [8, 13],
    cha: [7, 14],
    will: [7, 13],
    dom: [30, 70],
    lib: [40, 80],
    kinkPool: [
      { key: 'ritual', min: 1, max: 3 },
      { key: 'praise', min: 1, max: 3 },
      { key: 'creampie', min: 0, max: 2 },
      { key: 'public', min: 0, max: 2 },
    ],
  },
  кентавр: {
    str: [12, 18],
    agi: [10, 16],
    end: [12, 18],
    cha: [6, 12],
    will: [8, 14],
    dom: [45, 80],
    lib: [50, 85],
    kinkPool: [
      { key: 'size', min: 2, max: 5 },
      { key: 'breeding', min: 1, max: 4 },
      { key: 'control', min: 1, max: 3 },
      { key: 'public', min: 1, max: 3 },
    ],
  },
  мінотавр: {
    str: [14, 20],
    agi: [6, 11],
    end: [13, 19],
    cha: [4, 10],
    will: [8, 14],
    dom: [70, 95],
    lib: [55, 90],
    kinkPool: [
      { key: 'control', min: 3, max: 5 },
      { key: 'degrade', min: 2, max: 4 },
      { key: 'size', min: 3, max: 5 },
      { key: 'breeding', min: 2, max: 4 },
      { key: 'marking', min: 1, max: 3 },
    ],
  },
  гієноїд: {
    str: [9, 14],
    agi: [11, 16],
    end: [9, 14],
    cha: [7, 13],
    will: [6, 12],
    dom: [40, 85],
    lib: [60, 95],
    kinkPool: [
      { key: 'breeding', min: 2, max: 5 },
      { key: 'creampie', min: 2, max: 4 },
      { key: 'control', min: 1, max: 4 },
      { key: 'public', min: 1, max: 3 },
      { key: 'service', min: 0, max: 3 },
    ],
  },
  свинолюд: {
    str: [12, 18],
    agi: [5, 10],
    end: [12, 18],
    cha: [3, 8],
    will: [4, 10],
    dom: [60, 95],
    lib: [70, 100],
    kinkPool: [
      { key: 'degrade', min: 2, max: 5 },
      { key: 'breeding', min: 3, max: 5 },
      { key: 'size', min: 2, max: 4 },
      { key: 'cumplay', min: 1, max: 4 },
      { key: 'control', min: 2, max: 4 },
    ],
  },
  дух: {
    str: [4, 10],
    agi: [10, 16],
    end: [14, 20],
    cha: [12, 18],
    will: [14, 20],
    dom: [50, 90],
    lib: [40, 90],
    kinkPool: [
      { key: 'ritual', min: 3, max: 5 },
      { key: 'control', min: 2, max: 5 },
      { key: 'monster', min: 1, max: 3 },
    ],
  },
  зовнішній: {
    str: [7, 13],
    agi: [7, 13],
    end: [7, 13],
    cha: [8, 14],
    will: [8, 14],
    dom: [35, 65],
    lib: [35, 75],
    kinkPool: [
      { key: 'praise', min: 0, max: 2 },
      { key: 'control', min: 0, max: 2 },
      { key: 'creampie', min: 0, max: 2 },
    ],
  },
  default: {
    str: [7, 13],
    agi: [7, 13],
    end: [7, 13],
    cha: [7, 13],
    will: [7, 13],
    dom: [35, 70],
    lib: [40, 80],
    kinkPool: [
      { key: 'praise', min: 0, max: 2 },
      { key: 'service', min: 0, max: 2 },
    ],
  },
}

function resolveTribeTemplate(tribe?: string | null): TribeTemplate {
  const t = (tribe || '').toLowerCase()
  if (t.includes('кай')) return TRIBE_TEMPLATES['кай-тору']
  if (t.includes('кентавр')) return TRIBE_TEMPLATES['кентавр']
  if (t.includes('мінотавр') || t.includes('минотавр')) return TRIBE_TEMPLATES['мінотавр']
  if (t.includes('гіє') || t.includes('гие')) return TRIBE_TEMPLATES['гієноїд']
  if (t.includes('свино')) return TRIBE_TEMPLATES['свинолюд']
  if (t.includes('дух')) return TRIBE_TEMPLATES['дух']
  if (t.includes('зовніш')) return TRIBE_TEMPLATES['зовнішній']
  if (t.includes('острів')) return TRIBE_TEMPLATES['дух']
  return TRIBE_TEMPLATES.default
}

function archetypeBias(archetype?: string | null): Partial<NpcAttrStats> {
  const a = (archetype || '').toLowerCase()
  if (a.includes('вождь') || a.includes('ватажок')) {
    return { strength: 2, charisma: 2, willpower: 2, dominance: 15 }
  }
  if (a.includes('воїн')) return { strength: 2, agility: 1, endurance: 1, dominance: 8 }
  if (a.includes('шаман') || a.includes('жриц')) {
    return { willpower: 3, charisma: 2, dominance: 5 }
  }
  if (a.includes('танц') || a.includes('спокус')) {
    return { agility: 2, charisma: 3, libido: 10, dominance: -5 }
  }
  if (a.includes('вигнанець') || a.includes('відступ')) {
    return { agility: 2, willpower: -1, dominance: -15 }
  }
  if (a.includes('торгов')) return { charisma: 2, willpower: 1, dominance: 0 }
  if (a.includes('провідник')) return { endurance: 2, agility: 1, willpower: 1 }
  return {}
}

/** Deterministic stats + kinks for a new / unseeded NPC. */
export function generateNpcProfile(opts: {
  name: string
  tribe?: string | null
  archetype?: string | null
}): { stats: NpcAttrStats; kinks: NpcKinkMap } {
  const seed = hashSeed((opts.name || 'npc') + '|' + (opts.tribe || '') + '|' + (opts.archetype || ''))
  const tpl = resolveTribeTemplate(opts.tribe)
  const bias = archetypeBias(opts.archetype)

  const stats: NpcAttrStats = {
    strength: clamp(pickInt(tpl.str[0], tpl.str[1], seed, 1) + (bias.strength || 0), 1, 20),
    agility: clamp(pickInt(tpl.agi[0], tpl.agi[1], seed, 2) + (bias.agility || 0), 1, 20),
    endurance: clamp(pickInt(tpl.end[0], tpl.end[1], seed, 3) + (bias.endurance || 0), 1, 20),
    charisma: clamp(pickInt(tpl.cha[0], tpl.cha[1], seed, 4) + (bias.charisma || 0), 1, 20),
    willpower: clamp(pickInt(tpl.will[0], tpl.will[1], seed, 5) + (bias.willpower || 0), 1, 20),
    dominance: clamp(pickInt(tpl.dom[0], tpl.dom[1], seed, 6) + (bias.dominance || 0), 0, 100),
    libido: clamp(pickInt(tpl.lib[0], tpl.lib[1], seed, 7) + (bias.libido || 0), 0, 100),
  }

  const kinks: NpcKinkMap = {}
  tpl.kinkPool.forEach((p, i) => {
    const lv = pickInt(p.min, p.max, seed, 10 + i)
    if (lv > 0 && findKinkDef(p.key)) kinks[p.key] = lv
  })
  // Always at least one kink for flavour
  if (Object.keys(kinks).length === 0) {
    kinks.praise = 1
  }
  return { stats, kinks }
}

/** Canon profiles — fixed stats & kinks for main cast. */
export const CANON_NPC_PROFILES: NpcProfileSeed[] = [
  {
    name: 'Тане',
    tribe: 'Кай-Тору',
    notes:
      'Молодий воїн Кай-Тору, син вождівської лінії. Рідний брат Леї. ⚠️ Таємний інцестуальний зв\'язок із сестрою (вже активний). Ніжний до Лари, рветься між сестрою-коханкою і новим почуттям.',
    personality: "сором'язливий, лагідний, допитливий, традиційний, вірний, пристрасний, розірваний",
    archetype: 'воїн',
    attitude: 'curious',
    trust: 40,
    fear: 10,
    respect: 45,
    location: 'Селище Кай-Тору',
    stats: {
      strength: 12,
      agility: 11,
      endurance: 11,
      charisma: 9,
      willpower: 8,
      dominance: 35,
      libido: 72,
    },
    kinks: { praise: 3, creampie: 2, breeding: 1, service: 2, ritual: 1 },
  },
  {
    name: 'Лея',
    tribe: 'Кай-Тору',
    notes:
      'Принцеса Кай-Тору, донька Макаї, рідна сестра Тане. ⚠️ Таємна коханка брата (інцест, активний на старті). Також «подруга»/колишня Джека Вейна. Ревнива до Лари.',
    personality: 'хитра, пристрасна, ревнива, гостинна, амбіційна, владна, ревнива сестра',
    archetype: 'танцівниця',
    attitude: 'wary',
    trust: 30,
    fear: 5,
    respect: 40,
    location: 'Джунглі',
    stats: {
      strength: 8,
      agility: 14,
      endurance: 10,
      charisma: 14,
      willpower: 11,
      dominance: 55,
      libido: 78,
    },
    kinks: { control: 3, public: 2, marking: 2, degrade: 1, praise: 1 },
  },
  {
    name: 'Джек Вейн',
    tribe: 'Зовнішній світ',
    notes: 'Провідник/контрабандист. Знає частину таємниць острова. Розуміє згоду.',
    personality: 'цинічний, практичний, стриманий, вірний слову, досвідчений',
    archetype: 'провідник',
    attitude: 'neutral',
    trust: 55,
    fear: 0,
    respect: 50,
    location: 'Руїни стародавнього міста',
    bond: 1,
    stats: {
      strength: 11,
      agility: 12,
      endurance: 12,
      charisma: 11,
      willpower: 13,
      dominance: 45,
      libido: 55,
    },
    kinks: { control: 2, praise: 1, creampie: 1, service: 1 },
  },
  {
    name: 'Макаї',
    tribe: 'Кай-Тору',
    notes:
      'Вождь Кай-Тору, батько Тане і Леї. Авторитет, «право чужинки». Знає (або підозрює) «ложе крові» дітей; може забрати Лару як випробування сина, благословити або відкинути. Арка: перед батьком → право батька → син проти батька → благословення/вигнання → вогнище роду.',
    personality: 'домінантний, традиційний, територіальний, мудрий, жорсткий, батьківський',
    archetype: 'вождь',
    attitude: 'wary',
    trust: 20,
    fear: 15,
    respect: 70,
    location: 'Селище Кай-Тору',
    stats: {
      strength: 15,
      agility: 10,
      endurance: 14,
      charisma: 13,
      willpower: 14,
      dominance: 85,
      libido: 70,
    },
    kinks: { control: 4, public: 3, ritual: 3, breeding: 2, marking: 2 },
  },
  {
    name: 'Найя',
    tribe: 'Кай-Тору',
    notes: 'Шаманка. Знає про амулет і храм більше, ніж каже.',
    personality: 'загадкова, мудра, маніпулятивна, духовна, терпляча',
    archetype: 'шаман',
    attitude: 'curious',
    trust: 35,
    fear: 5,
    respect: 65,
    location: 'Храм насолоди',
    stats: {
      strength: 6,
      agility: 9,
      endurance: 11,
      charisma: 14,
      willpower: 16,
      dominance: 60,
      libido: 65,
    },
    kinks: { ritual: 5, control: 3, praise: 2, service: 2, public: 2 },
  },
  {
    name: 'Араху',
    tribe: 'Острів',
    notes: 'Дух/присутність острова — може проявлятися через амулет або видіння.',
    personality: 'давній, байдужий до моралі, хтивий до енергії, загадковий',
    archetype: 'дух',
    attitude: 'neutral',
    trust: 10,
    fear: 20,
    respect: 80,
    location: 'Священна гора',
    stats: {
      strength: 8,
      agility: 14,
      endurance: 18,
      charisma: 16,
      willpower: 19,
      dominance: 75,
      libido: 80,
    },
    kinks: { ritual: 5, control: 4, monster: 3, breeding: 2, public: 2 },
  },
  {
    name: 'Ксерон',
    tribe: 'Кентаври',
    notes: 'Ватажок табуна. Гордий; близькість лише після змагання.',
    personality: 'гордий, змагальний, шляхетний, жорсткий, чесний у випробуваннях',
    archetype: 'ватажок',
    attitude: 'wary',
    trust: 25,
    fear: 5,
    respect: 60,
    location: 'Землі кентаврів',
    stats: {
      strength: 17,
      agility: 14,
      endurance: 16,
      charisma: 10,
      willpower: 12,
      dominance: 75,
      libido: 70,
    },
    kinks: { size: 4, control: 3, public: 3, breeding: 2, marking: 2 },
  },
  {
    name: 'Іпполіта',
    tribe: 'Кентаври',
    notes: 'Найшвидша в табуні. Може закохатися в сильну Лару (лесбі-лінія).',
    personality: 'швидка, горда, пристрасна, незалежна, вірна переможцям',
    archetype: 'воїн',
    attitude: 'curious',
    trust: 35,
    fear: 5,
    respect: 50,
    location: 'Землі кентаврів',
    stats: {
      strength: 13,
      agility: 17,
      endurance: 14,
      charisma: 11,
      willpower: 12,
      dominance: 55,
      libido: 75,
    },
    kinks: { control: 2, public: 2, praise: 2, marking: 1, service: 1 },
  },
  {
    name: 'Гор-Ак',
    tribe: 'Мінотаври',
    notes: 'Ватажок лабіринту. Жорстокий, не тупий; бачить слабших як гарем/здобич.',
    personality: 'домінантний, жорстокий, розумний, територіальний, гордий',
    archetype: 'ватажок',
    attitude: 'hostile',
    trust: 10,
    fear: 0,
    respect: 40,
    location: 'Лабіринт мінотаврів',
    stats: {
      strength: 19,
      agility: 8,
      endurance: 17,
      charisma: 7,
      willpower: 13,
      dominance: 95,
      libido: 85,
    },
    kinks: { control: 5, degrade: 4, size: 5, breeding: 4, marking: 3, helpless: 2 },
  },
  {
    name: 'Міра',
    tribe: 'Мінотаври',
    notes: 'Воїнка поза гаремом. Шукає спосіб скинути Гор-Ака; потенційний союз.',
    personality: 'бунтівна, сильна, обережна, цілеспрямована, чесна',
    archetype: 'воїн',
    attitude: 'wary',
    trust: 30,
    fear: 15,
    respect: 45,
    location: 'Лабіринт мінотаврів',
    stats: {
      strength: 15,
      agility: 11,
      endurance: 14,
      charisma: 9,
      willpower: 13,
      dominance: 50,
      libido: 55,
    },
    kinks: { control: 2, marking: 1, praise: 1, service: 1 },
  },
  {
    name: 'Кіра',
    tribe: 'Гієноїди',
    notes: 'Матріарх. Розумна й жорстока; гарем як влада, не романтика.',
    personality: 'маніпулятивна, домінантна, розумна, жорстока, харизматична',
    archetype: 'ватажок',
    attitude: 'curious',
    trust: 15,
    fear: 5,
    respect: 55,
    location: 'Територія гієноїдів',
    stats: {
      strength: 12,
      agility: 13,
      endurance: 12,
      charisma: 15,
      willpower: 14,
      dominance: 92,
      libido: 80,
    },
    kinks: { control: 5, degrade: 4, public: 3, marking: 4, breeding: 3, service: 2 },
  },
  {
    name: 'Зек',
    tribe: 'Гієноїди',
    notes:
      'ВІДСТУПНИК: сам вийшов зі стаї Кіри. Був «улюбленим» розплідником, зірвав ритуал повного підкорення, втік у ніч рейду. На ньому death-scent (мітка смерті) — стая мусить повернути або вбити. Знає обхідні стежки й слабкі місця патрулів. Арка: сліди → зустріч → притулок → таємниця втечі → мисливці → зняти мітку → суд Кіри → доля.',
    personality:
      'полохливий, вдячний, хитрий, відданий захиснику, знервований, сексуально досвідчений, жадібний до свободи',
    archetype: 'вигнанець',
    attitude: 'fearful',
    trust: 40,
    fear: 60,
    respect: 30,
    location: 'Джунглі',
    stats: {
      strength: 10,
      agility: 14,
      endurance: 11,
      charisma: 9,
      willpower: 7,
      dominance: 25,
      libido: 88,
    },
    kinks: { service: 4, breeding: 4, creampie: 3, helpless: 3, praise: 2, marking: 1 },
  },
  {
    name: 'Грух',
    tribe: 'Свинолюди',
    notes: 'Ватажок боліт. Хоче Лару як трофей; низький інтелект, висока небезпека.',
    personality: 'тупий, жадібний, агресивний, похотливий, впертий',
    archetype: 'ватажок',
    attitude: 'hostile',
    trust: 5,
    fear: 0,
    respect: 10,
    location: 'Болота свинолюдів',
    stats: {
      strength: 17,
      agility: 6,
      endurance: 16,
      charisma: 4,
      willpower: 5,
      dominance: 90,
      libido: 95,
    },
    kinks: { breeding: 5, degrade: 4, size: 4, cumplay: 3, control: 4, helpless: 2 },
  },
  {
    name: 'Свиноматка',
    tribe: 'Свинолюди',
    notes: 'Стара; керує розмноженням і «обміном». Може «захистити» за ціну.',
    personality: 'хитра, цинічна, меркантильна, спокійна, жорстока',
    archetype: 'торговка',
    attitude: 'neutral',
    trust: 20,
    fear: 10,
    respect: 25,
    location: 'Болота свинолюдів',
    stats: {
      strength: 8,
      agility: 7,
      endurance: 12,
      charisma: 11,
      willpower: 13,
      dominance: 70,
      libido: 40,
    },
    kinks: { control: 3, breeding: 3, degrade: 2, service: 2, cumplay: 1 },
  },
]

export function findCanonProfile(name: string): NpcProfileSeed | undefined {
  const n = (name || '').trim().toLowerCase()
  return CANON_NPC_PROFILES.find((p) => p.name.toLowerCase() === n)
}

/**
 * Resolve full profile for DB write: canon → provided → generated.
 */
export function resolveNpcProfile(opts: {
  name: string
  tribe?: string | null
  archetype?: string | null
  /** Partial from LLM */
  stats?: Partial<NpcAttrStats> | null
  kinks?: unknown
}): { stats: NpcAttrStats; kinks: NpcKinkMap; from: 'canon' | 'provided' | 'generated' } {
  const canon = findCanonProfile(opts.name)
  const providedKinks = normalizeKinkMap(opts.kinks)
  const hasProvStats = hasAssignedStats(opts.stats || undefined)
  const hasProvKinks = Object.keys(providedKinks).length > 0

  if (canon && !hasProvStats) {
    return {
      stats: { ...canon.stats },
      kinks: hasProvKinks ? mergeKinkMaps(canon.kinks, providedKinks) : { ...canon.kinks },
      from: 'canon',
    }
  }

  if (hasProvStats) {
    const s = opts.stats!
    const base = canon?.stats || generateNpcProfile(opts).stats
    return {
      stats: {
        strength: clamp(Number(s.strength ?? base.strength) || base.strength, 1, 20),
        agility: clamp(Number(s.agility ?? base.agility) || base.agility, 1, 20),
        endurance: clamp(Number(s.endurance ?? base.endurance) || base.endurance, 1, 20),
        charisma: clamp(Number(s.charisma ?? base.charisma) || base.charisma, 1, 20),
        willpower: clamp(Number(s.willpower ?? base.willpower) || base.willpower, 1, 20),
        dominance: clamp(Number(s.dominance ?? base.dominance) || base.dominance, 0, 100),
        libido: clamp(Number(s.libido ?? base.libido) || base.libido, 0, 100),
      },
      kinks: hasProvKinks
        ? providedKinks
        : canon
          ? { ...canon.kinks }
          : generateNpcProfile(opts).kinks,
      from: 'provided',
    }
  }

  const gen = generateNpcProfile(opts)
  return {
    stats: gen.stats,
    kinks: hasProvKinks ? providedKinks : gen.kinks,
    from: 'generated',
  }
}

export function formatNpcKinksLine(kinks: NpcKinkMap): string {
  const parts = Object.entries(kinks)
    .filter(([, lv]) => lv > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, lv]) => {
      const def = findKinkDef(key)
      return `${def?.icon || '🎭'}${def?.name || key} Lv${lv}`
    })
  return parts.join(', ')
}

export function formatNpcProfileForPrompt(r: {
  name: string
  tribe?: string | null
  archetype?: string | null
  bond?: number
  attitude?: string | null
  trust?: number
  fear?: number
  respect?: number
  personality?: string | null
  notes?: string | null
  strength?: number
  agility?: number
  endurance?: number
  charisma?: number
  willpower?: number
  dominance?: number
  libido?: number
  kinksJson?: string | null
  kinks?: NpcKinkMap
}): string {
  let stats = {
    strength: Number(r.strength) || 0,
    agility: Number(r.agility) || 0,
    endurance: Number(r.endurance) || 0,
    charisma: Number(r.charisma) || 0,
    willpower: Number(r.willpower) || 0,
    dominance: Number(r.dominance) || 50,
    libido: Number(r.libido) || 50,
  }
  let kinks = r.kinks || parseKinksJson(r.kinksJson)
  if (!hasAssignedStats(stats)) {
    const resolved = resolveNpcProfile({
      name: r.name,
      tribe: r.tribe,
      archetype: r.archetype,
    })
    stats = resolved.stats
    if (Object.keys(kinks).length === 0) kinks = resolved.kinks
  }

  const kinkLine = formatNpcKinksLine(kinks)
  return (
    `${r.name} (${r.tribe || '?'}, ${r.archetype || '?'}): Bond ${r.bond ?? 0}/10, ` +
    `ставлення: ${r.attitude || 'neutral'}, довіра:${r.trust ?? 50} страх:${r.fear ?? 0} повага:${r.respect ?? 50}` +
    ` | статы: С${stats.strength} Спр${stats.agility} Вит${stats.endurance} Хар${stats.charisma} Вол${stats.willpower}` +
    ` дом:${stats.dominance} лібідо:${stats.libido}` +
    (kinkLine ? ` | кінки: ${kinkLine}` : '') +
    (r.personality ? ` [риси: ${r.personality}]` : '') +
    (r.notes ? ` — ${r.notes}` : '')
  )
}

export function clampNpcStats(s: Partial<NpcAttrStats>): NpcAttrStats {
  return {
    strength: clamp(Number(s.strength) || 1, 1, 20),
    agility: clamp(Number(s.agility) || 1, 1, 20),
    endurance: clamp(Number(s.endurance) || 1, 1, 20),
    charisma: clamp(Number(s.charisma) || 1, 1, 20),
    willpower: clamp(Number(s.willpower) || 1, 1, 20),
    dominance: clamp(Number(s.dominance) || 50, 0, 100),
    libido: clamp(Number(s.libido) || 50, 0, 100),
  }
}

export { ATTR_KEYS }
