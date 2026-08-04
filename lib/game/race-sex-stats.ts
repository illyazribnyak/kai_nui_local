/**
 * Canonical sexual anatomy stats by race + named NPCs.
 * Server clamps LLM [PENIS_STATS] into these ranges so species stay distinct.
 */

import { clamp } from '@/lib/game/json'
import type { PenisStatsData } from '@/lib/game/sex-types'

export type SexRiskLevel = 'Низький' | 'Середній' | 'Високий' | 'Дуже високий'

export type RaceSexKey =
  | 'kai_toru'
  | 'centaur'
  | 'minotaur'
  | 'boar'
  | 'hyenoid'
  | 'spirit'
  | 'outsider'
  | 'unknown'

export type RaceSexDef = {
  key: RaceSexKey
  /** Display race label (Ukrainian) */
  raceLabel: string
  organType: string
  lengthMin: number
  lengthMax: number
  girthMin: number
  girthMax: number
  cumMin: number
  cumMax: number
  staminaMin: number
  staminaMax: number
  refractoryMin: number
  refractoryMax: number
  foreskinDefault: boolean
  shapeDefault: string
  headDefault: string
  veinsDefault: string
  ballsDefault: string
  cumDescDefault: string
  specialDefault: string | null
  riskDefault: SexRiskLevel
  /** Soft max depth into human (cm); null = full length ok */
  maxPenetrationCm: number | null
  /** Knot/lock duration minutes (hyenoid) */
  lockMin?: number
  lockMax?: number
  pregnancyBasePct: number
  diseaseNote?: string
  compatibilityNote: string
  aliases: string[]
}

/** Male anatomy ranges from game lore. */
export const RACE_SEX_DEFS: RaceSexDef[] = [
  {
    key: 'kai_toru',
    raceLabel: 'Кай-Тору',
    organType: 'Людський',
    // Realistic erect: ~11–16 cm typical; island warriors slightly higher avg
    lengthMin: 11.5,
    lengthMax: 16.5,
    // girth_* = diameter ⌀ cm (обхват ≈ π×⌀)
    girthMin: 3.1,
    girthMax: 4.6,
    cumMin: 2.5,
    cumMax: 8,
    staminaMin: 3,
    staminaMax: 7,
    refractoryMin: 15,
    refractoryMax: 35,
    foreskinDefault: true,
    shapeDefault: 'Прямий',
    headDefault: 'Середня, рожева',
    veinsDefault: 'Помірно',
    ballsDefault: 'Середні',
    cumDescDefault: 'Густа, біла',
    specialDefault: null,
    riskDefault: 'Низький',
    maxPenetrationCm: null,
    pregnancyBasePct: 10,
    compatibilityNote: 'Повна сумісність з людиною.',
    aliases: ['кай-тору', 'кай тору', 'людина', 'людський', 'human', 'kai-toru', 'kai_toru'],
  },
  {
    key: 'outsider',
    raceLabel: 'Зовнішній світ',
    organType: 'Людський',
    lengthMin: 12,
    lengthMax: 17,
    girthMin: 3.2,
    girthMax: 4.7,
    cumMin: 2.5,
    cumMax: 9,
    staminaMin: 3,
    staminaMax: 8,
    refractoryMin: 18,
    refractoryMax: 40,
    foreskinDefault: true,
    shapeDefault: 'Прямий',
    headDefault: 'Середня',
    veinsDefault: 'Помірно',
    ballsDefault: 'Середні',
    cumDescDefault: 'Густа, біла',
    specialDefault: null,
    riskDefault: 'Низький',
    maxPenetrationCm: null,
    pregnancyBasePct: 10,
    compatibilityNote: 'Людська анатомія; Джек та інші «ззовні».',
    aliases: ['зовнішній', 'outsider', 'європеєць', 'людина ззовні'],
  },
  {
    key: 'centaur',
    raceLabel: 'Кентавр',
    organType: 'Кінський',
    // Fantasy horse: long shaft; only tip/first segment usable for human
    lengthMin: 38,
    lengthMax: 52,
    girthMin: 5.5,
    girthMax: 7.5,
    cumMin: 80,
    cumMax: 180,
    staminaMin: 5,
    staminaMax: 9,
    refractoryMin: 20,
    refractoryMax: 45,
    foreskinDefault: false,
    shapeDefault: 'Циліндричний, кінський',
    headDefault: 'Грибоподібна, широка',
    veinsDefault: 'Сильно виражені',
    ballsDefault: 'Дуже великі, між задніми ногами',
    cumDescDefault: 'Дуже багато, густа, мускусна',
    specialDefault: 'Втягнутий у спокої; повне проникнення в людину неможливе',
    riskDefault: 'Високий',
    maxPenetrationCm: 16,
    pregnancyBasePct: 7,
    compatibilityNote:
      'Лише перші ~15–20 см або міжстегновий. Орально — головка. Ризик травми високий.',
    aliases: ['кентавр', 'кентаври', 'centaur'],
  },
  {
    key: 'minotaur',
    raceLabel: 'Мінотавр',
    organType: 'Бичачий',
    lengthMin: 22,
    lengthMax: 32,
    girthMin: 5.5,
    girthMax: 7.5,
    cumMin: 20,
    cumMax: 55,
    staminaMin: 6,
    staminaMax: 10,
    refractoryMin: 25,
    refractoryMax: 50,
    foreskinDefault: false,
    shapeDefault: 'Товстий, з вузликами',
    headDefault: 'Широка, темно-червона',
    veinsDefault: 'Грубі',
    ballsDefault: 'Розміром з кулак',
    cumDescDefault: 'Густа, велика кількість, гаряча',
    specialDefault: 'Вузлики по довжині; без крайньої плоті',
    riskDefault: 'Дуже високий',
    maxPenetrationCm: 18,
    pregnancyBasePct: 5,
    diseaseNote: 'Алергія/жар від сім\'я можливі',
    compatibilityNote: 'Фізично небезпечно; ризик розривів. Повільна прелюдія критична.',
    aliases: ['мінотавр', 'мінотаври', 'minotaur'],
  },
  {
    key: 'boar',
    raceLabel: 'Свинолюд',
    organType: 'Свинячий (штопор)',
    lengthMin: 14,
    lengthMax: 20,
    girthMin: 2.8,
    girthMax: 4.2,
    cumMin: 4,
    cumMax: 14,
    staminaMin: 3,
    staminaMax: 6,
    refractoryMin: 8,
    refractoryMax: 18,
    foreskinDefault: true,
    shapeDefault: 'Спіральний (штопор)',
    headDefault: 'Загострена',
    veinsDefault: 'Слабко',
    ballsDefault: 'Щетина на мошонці',
    cumDescDefault: 'Рідке, з різким запахом',
    specialDefault: 'Вкручується спіраллю; неохайність',
    riskDefault: 'Середній',
    maxPenetrationCm: null,
    pregnancyBasePct: 12,
    diseaseNote: 'Високий ризик інфекцій / DISEASE',
    compatibilityNote: 'Механічно входить, але гігієна й хвороби — головна загроза.',
    aliases: ['свинолюд', 'свинолюди', 'boar', 'pigman', 'pig'],
  },
  {
    key: 'hyenoid',
    raceLabel: 'Гієноїд',
    organType: 'Собачий',
    // Canine: moderate length; knot swells larger than shaft
    lengthMin: 12,
    lengthMax: 18,
    girthMin: 2.8,
    girthMax: 4.0,
    cumMin: 3,
    cumMax: 12,
    staminaMin: 4,
    staminaMax: 8,
    refractoryMin: 10,
    refractoryMax: 22,
    foreskinDefault: true,
    shapeDefault: 'З вузлом (бульбус)',
    headDefault: 'Загострена',
    veinsDefault: 'Помірно',
    ballsDefault: 'Компактні; у спокої втягнутий',
    cumDescDefault: 'З феромонами (+Desire людині)',
    specialDefault: 'Бульбус гландіс — замок 5–15 хв; феромони',
    riskDefault: 'Середній',
    maxPenetrationCm: null,
    lockMin: 5,
    lockMax: 15,
    pregnancyBasePct: 8,
    compatibilityNote: 'Вузол «замикає» пару; після еякуляції не вийти 5–15 хв. Вразливість.',
    aliases: ['гієноїд', 'гієноїди', 'hyenoid', 'hyena', 'гієна'],
  },
  {
    key: 'spirit',
    raceLabel: 'Дух',
    organType: 'Енергетичний',
    lengthMin: 10,
    lengthMax: 40,
    girthMin: 2,
    girthMax: 8,
    cumMin: 0,
    cumMax: 5,
    staminaMin: 8,
    staminaMax: 12,
    refractoryMin: 0,
    refractoryMax: 5,
    foreskinDefault: false,
    shapeDefault: 'Змінна',
    headDefault: 'Фантомна',
    veinsDefault: 'Світло-вени енергії',
    ballsDefault: 'Немає / ілюзія',
    cumDescDefault: 'Енергетичний сплеск, без фізичної рідини',
    specialDefault: 'Фантомні кінцівки; психоделія; форма за бажанням',
    riskDefault: 'Низький',
    maxPenetrationCm: null,
    pregnancyBasePct: 3,
    compatibilityNote: 'Відчуття реальні, слідів майже немає. Ментальний ризик.',
    aliases: ['дух', 'духи', 'spirit', 'араху', 'ака-нуї'],
  },
]

/** Fixed / preferred stats for named cast (overrides race random). */
export type NamedSexOverride = Partial<PenisStatsData> & {
  name: string
  raceKey: RaceSexKey
  /** If true, length/girth/cum are fixed exactly */
  locked?: boolean
}

export const NAMED_SEX_OVERRIDES: NamedSexOverride[] = [
  {
    name: 'Тане',
    raceKey: 'kai_toru',
    locked: true,
    length_cm: 16, // canon slightly above avg
    girth_cm: 3.9,
    shape: 'Прямий',
    head: 'Середня, рожева',
    foreskin: true,
    veins: 'Помірно',
    balls: 'Середні',
    cum_ml: 8,
    cum_desc: 'Густа, біла',
    stamina_rounds: 5,
    refractory_min: 15,
    special: null,
    risk_for_lara: 'Низький',
  },
  {
    name: 'Джек Вейн',
    raceKey: 'outsider',
    locked: true,
    length_cm: 15.5,
    girth_cm: 4.0,
    shape: 'Злегка вигнутий',
    head: 'Широка',
    foreskin: true,
    veins: 'Виражені',
    balls: 'Повні',
    cum_ml: 10,
    cum_desc: 'Густа, біла',
    stamina_rounds: 6,
    refractory_min: 20,
    special: 'Досвідчений; розуміє згоду',
    risk_for_lara: 'Низький',
  },
  {
    name: 'Макаї',
    raceKey: 'kai_toru',
    locked: true,
    length_cm: 16.5,
    girth_cm: 4.4,
    shape: 'Товстий, прямий',
    head: 'Широка, темно-рожева',
    foreskin: true,
    veins: 'Сильні',
    balls: 'Важкі',
    cum_ml: 12,
    cum_desc: 'Густа, багато',
    stamina_rounds: 7,
    refractory_min: 18,
    special: 'Вождь: +витривалість, домінування',
    risk_for_lara: 'Низький',
  },
  {
    name: 'Зек',
    raceKey: 'hyenoid',
    locked: true,
    length_cm: 15,
    girth_cm: 3.3,
    shape: 'З вузлом (бульбус)',
    head: 'Загострена',
    foreskin: true,
    veins: 'Помірно',
    balls: 'Компактні; у спокої втягнутий',
    cum_ml: 10,
    cum_desc: 'З феромонами — підсилює Desire',
    stamina_rounds: 5,
    refractory_min: 12,
    special: 'Бульбус — замок ~8–12 хв; відступник, вдячний',
    risk_for_lara: 'Середній',
  },
  {
    name: 'Ксерон',
    raceKey: 'centaur',
    locked: true,
    length_cm: 46,
    girth_cm: 6.4,
    shape: 'Циліндричний, кінський',
    head: 'Грибоподібна, темна',
    foreskin: false,
    veins: 'Сильно виражені',
    balls: 'Дуже великі',
    cum_ml: 160,
    cum_desc: 'Дуже багато, мускусна',
    stamina_rounds: 7,
    refractory_min: 30,
    special: 'Ватажок табуна; max ~16 см у людину (решта зовні)',
    risk_for_lara: 'Високий',
  },
  {
    name: 'Гор-Ак',
    raceKey: 'minotaur',
    locked: true,
    length_cm: 28,
    girth_cm: 6.8,
    shape: 'Товстий, з вузликами',
    head: 'Широка, темно-червона',
    foreskin: false,
    veins: 'Грубі',
    balls: 'З кулак',
    cum_ml: 50,
    cum_desc: 'Густа, гаряча, багато',
    stamina_rounds: 9,
    refractory_min: 35,
    special: 'Ватажок; вузлики; дуже небезпечний розмір',
    risk_for_lara: 'Дуже високий',
  },
  {
    name: 'Грух',
    raceKey: 'boar',
    locked: true,
    length_cm: 18,
    girth_cm: 3.5,
    shape: 'Спіральний (штопор)',
    head: 'Загострена',
    foreskin: true,
    veins: 'Слабко',
    balls: 'Щетина',
    cum_ml: 15,
    cum_desc: 'Рідке, сморідке',
    stamina_rounds: 4,
    refractory_min: 10,
    special: 'Вкручується; високий ризик інфекції',
    risk_for_lara: 'Середній',
  },
  {
    name: 'Араху',
    raceKey: 'spirit',
    locked: true,
    length_cm: 20,
    girth_cm: 4,
    shape: 'Змінна енергія',
    head: 'Фантомна',
    foreskin: false,
    veins: 'Світло',
    balls: 'Ілюзія',
    cum_ml: 0,
    cum_desc: 'Сплеск енергії, без рідини',
    stamina_rounds: 10,
    refractory_min: 0,
    special: 'Форма за волею; психоделія',
    risk_for_lara: 'Низький',
  },
]

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, ' ')
}

export function resolveRaceKey(
  raceOrTribe?: string | null,
  name?: string | null
): RaceSexKey {
  const named = name ? findNamedOverride(name) : undefined
  if (named) return named.raceKey

  const r = norm(raceOrTribe || '')
  if (!r) return 'unknown'
  for (const def of RACE_SEX_DEFS) {
    if (def.aliases.some((a) => r.includes(a) || a.includes(r))) return def.key
    if (r.includes(norm(def.raceLabel))) return def.key
  }
  // tribe name hints
  if (r.includes('кай')) return 'kai_toru'
  if (r.includes('кентавр')) return 'centaur'
  if (r.includes('мінотавр') || r.includes('минотавр')) return 'minotaur'
  if (r.includes('свино')) return 'boar'
  if (r.includes('гіє') || r.includes('гие')) return 'hyenoid'
  if (r.includes('дух') || r.includes('острів')) return 'spirit'
  if (r.includes('зовніш')) return 'outsider'
  return 'unknown'
}

export function getRaceSexDef(key: RaceSexKey): RaceSexDef | undefined {
  return RACE_SEX_DEFS.find((d) => d.key === key)
}

export function findNamedOverride(name: string): NamedSexOverride | undefined {
  const n = norm(name)
  return NAMED_SEX_OVERRIDES.find((o) => norm(o.name) === n || n.includes(norm(o.name)))
}

function hashSeed(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic float 0..1 from seed + salt */
function seeded01(seed: number, salt: number): number {
  const x = Math.sin(seed * 0.0001 + salt * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function pickRange(min: number, max: number, seed: number, salt: number, decimals = 1): number {
  const t = seeded01(seed, salt)
  const v = min + t * (max - min)
  const p = 10 ** decimals
  return Math.round(v * p) / p
}

export type GeneratePenisOpts = {
  name: string
  race?: string | null
  tribe?: string | null
  /** If provided, used instead of hash for random ranges */
  rng?: () => number
}

function applyNamedAndMechanics(
  base: PenisStatsData,
  named: NamedSexOverride | undefined,
  def: RaceSexDef
): PenisStatsData {
  let out = { ...base }
  if (named) {
    const { name: _n, raceKey: _rk, locked: _l, ...rest } = named
    const nd = getRaceSexDef(named.raceKey) ?? def
    out = {
      ...out,
      ...rest,
      name: base.name,
      race: nd.raceLabel,
      type: nd.organType,
      max_penetration_cm: nd.maxPenetrationCm,
      pregnancy_base_pct: nd.pregnancyBasePct,
      compatibility: nd.compatibilityNote,
    }
    if (nd.lockMin != null && nd.lockMax != null && out.lock_minutes == null) {
      out.lock_minutes = Math.round((nd.lockMin + nd.lockMax) / 2)
    }
    if (nd.diseaseNote) out.disease_note = nd.diseaseNote
  }
  return decorateSpecial(out, def)
}

function decorateSpecial(stats: PenisStatsData, def: RaceSexDef): PenisStatsData {
  const out = { ...stats }
  if (def.maxPenetrationCm != null) {
    const s = out.special != null ? String(out.special) : ''
    if (!s || !/проник|max|см у|глибин/i.test(s)) {
      out.special = s
        ? `${s}; макс. ~${def.maxPenetrationCm} см у людину`
        : `Макс. проникнення в людину ~${def.maxPenetrationCm} см`
    }
  }
  // Derived realism fields (diameter stored in girth_cm)
  const diam = Number(out.girth_cm) || 3.5
  const len = Number(out.length_cm) || 14
  const usable =
    out.max_penetration_cm != null
      ? Math.min(len, Number(out.max_penetration_cm))
      : len
  out.circumference_cm = Math.round(Math.PI * diam * 10) / 10
  // Rough cylinder volume of insertable shaft (ml ≈ cm³)
  out.volume_est_ml = Math.round(Math.PI * (diam / 2) ** 2 * usable * 10) / 10
  out.usable_length_cm = Math.round(usable * 10) / 10
  // Hyenoid knot swells ~30–50% over shaft diameter
  if (def.key === 'hyenoid') {
    out.knot_diameter_cm = Math.round(diam * 1.4 * 10) / 10
  }
  return out
}

/**
 * Build full penis stats for a partner — named locks win, else race ranges.
 * Pure (no recursion). Deterministic per name unless rng passed.
 */
export function generatePenisStats(opts: GeneratePenisOpts): PenisStatsData {
  const name = (opts.name || 'Невідомий').trim()
  const named = findNamedOverride(name)
  const raceKey =
    named?.raceKey ?? resolveRaceKey(opts.race || opts.tribe, name)
  const def = getRaceSexDef(raceKey === 'unknown' ? 'kai_toru' : raceKey) ?? RACE_SEX_DEFS[0]
  const seed = hashSeed(name + '|' + def.key)

  const rng = opts.rng
  const range = (min: number, max: number, salt: number, decimals = 1) => {
    if (rng) {
      const v = min + rng() * (max - min)
      const p = 10 ** decimals
      return Math.round(v * p) / p
    }
    return pickRange(min, max, seed, salt, decimals)
  }

  let base: PenisStatsData = {
    name,
    race: def.raceLabel,
    type: def.organType,
    length_cm: range(def.lengthMin, def.lengthMax, 1, 1),
    girth_cm: range(def.girthMin, def.girthMax, 2, 1),
    shape: def.shapeDefault,
    head: def.headDefault,
    foreskin: def.foreskinDefault,
    veins: def.veinsDefault,
    balls: def.ballsDefault,
    cum_ml: Math.round(range(def.cumMin, def.cumMax, 3, 0)),
    cum_desc: def.cumDescDefault,
    stamina_rounds: Math.round(range(def.staminaMin, def.staminaMax, 4, 0)),
    refractory_min: Math.round(range(def.refractoryMin, def.refractoryMax, 5, 0)),
    special: def.specialDefault,
    risk_for_lara: def.riskDefault,
    max_penetration_cm: def.maxPenetrationCm,
    pregnancy_base_pct: def.pregnancyBasePct,
    compatibility: def.compatibilityNote,
  }

  if (def.lockMin != null && def.lockMax != null) {
    base.lock_minutes = Math.round(range(def.lockMin, def.lockMax, 6, 0))
    const sp = base.special ? String(base.special) : ''
    if (!/замок|вузол|бульбус/i.test(sp)) {
      base.special = `${sp ? sp + '; ' : ''}замок ~${base.lock_minutes} хв`
    }
  }
  if (def.diseaseNote) base.disease_note = def.diseaseNote

  return applyNamedAndMechanics(base, named, def)
}

/**
 * Clamp / fill LLM payload so it stays within race canon.
 * Named locked fields always win.
 */
export function sanitizePenisStats(
  raw: Partial<PenisStatsData> | null | undefined,
  hints?: { name?: string; race?: string | null }
): PenisStatsData | null {
  if (!raw && !hints?.name) return null
  const name = String(raw?.name || hints?.name || '').trim()
  if (!name) return null

  const named = findNamedOverride(name)
  const raceKey =
    named?.raceKey ?? resolveRaceKey(raw?.race || hints?.race, name)
  const def = getRaceSexDef(raceKey === 'unknown' ? 'kai_toru' : raceKey) ?? RACE_SEX_DEFS[0]

  // Deterministic fill for missing fields (no sanitize recursion)
  const generated = generatePenisStats({
    name,
    race: raw?.race || hints?.race || def.raceLabel,
  })

  const num = (v: unknown, fallback: number, min: number, max: number, dec = 1): number => {
    const n = Number(v)
    if (!Number.isFinite(n)) return fallback
    const p = 10 ** dec
    return Math.round(clamp(n, min, max) * p) / p
  }

  // If fully locked named, ignore wild LLM numbers
  if (named?.locked) {
    return generatePenisStats({ name, race: def.raceLabel })
  }

  const out: PenisStatsData = {
    ...generated,
    name,
    race: def.raceLabel,
    type: String(raw?.type || generated.type || def.organType).slice(0, 60),
    length_cm: num(raw?.length_cm, Number(generated.length_cm), def.lengthMin, def.lengthMax, 1),
    girth_cm: num(raw?.girth_cm, Number(generated.girth_cm), def.girthMin, def.girthMax, 1),
    shape: String(raw?.shape || generated.shape || def.shapeDefault).slice(0, 80),
    head: String(raw?.head || generated.head || def.headDefault).slice(0, 80),
    foreskin:
      typeof raw?.foreskin === 'boolean' ? raw.foreskin : Boolean(generated.foreskin),
    veins: String(raw?.veins || generated.veins || def.veinsDefault).slice(0, 80),
    balls: String(raw?.balls || generated.balls || def.ballsDefault).slice(0, 80),
    cum_ml: num(raw?.cum_ml, Number(generated.cum_ml), def.cumMin, def.cumMax, 0),
    cum_desc: String(raw?.cum_desc || generated.cum_desc || def.cumDescDefault).slice(0, 120),
    stamina_rounds: num(
      raw?.stamina_rounds,
      Number(generated.stamina_rounds),
      def.staminaMin,
      def.staminaMax,
      0
    ),
    refractory_min: num(
      raw?.refractory_min,
      Number(generated.refractory_min),
      def.refractoryMin,
      def.refractoryMax,
      0
    ),
    special:
      raw?.special !== undefined
        ? raw.special === null
          ? null
          : String(raw.special).slice(0, 160)
        : (generated.special as string | null),
    risk_for_lara: normalizeRisk(raw?.risk_for_lara) || def.riskDefault,
    max_penetration_cm: def.maxPenetrationCm,
    pregnancy_base_pct: def.pregnancyBasePct,
    compatibility: def.compatibilityNote,
  }

  if (def.lockMin != null && def.lockMax != null) {
    out.lock_minutes = num(
      raw?.lock_minutes ?? generated.lock_minutes,
      Math.round((def.lockMin + def.lockMax) / 2),
      def.lockMin,
      def.lockMax,
      0
    )
  }
  if (def.diseaseNote) out.disease_note = def.diseaseNote

  return decorateSpecial(out, def)
}

function normalizeRisk(raw: unknown): SexRiskLevel | null {
  if (raw == null) return null
  const s = String(raw).toLowerCase()
  if (s.includes('дуже')) return 'Дуже високий'
  if (s.includes('висок') || s.includes('high')) return 'Високий'
  if (s.includes('серед') || s.includes('med')) return 'Середній'
  if (s.includes('низ') || s.includes('low')) return 'Низький'
  if (['Низький', 'Середній', 'Високий', 'Дуже високий'].includes(String(raw))) {
    return String(raw) as SexRiskLevel
  }
  return null
}

/** Compact prompt block for GM. */
export function formatRaceSexStatsForPrompt(): string {
  const lines = RACE_SEX_DEFS.filter((d) => d.key !== 'unknown').map((d) => {
    const pen = d.maxPenetrationCm != null ? `; max у людину ~${d.maxPenetrationCm} см` : ''
    const lock =
      d.lockMin != null ? `; замок ${d.lockMin}–${d.lockMax} хв` : ''
    return (
      `• ${d.raceLabel} (${d.organType}): ${d.lengthMin}–${d.lengthMax} см, ⌀ ${d.girthMin}–${d.girthMax}, ` +
      `${d.cumMin}–${d.cumMax} мл, ризик ${d.riskDefault}${pen}${lock}`
    )
  })
  const named = NAMED_SEX_OVERRIDES.map(
    (n) =>
      `• ${n.name}: ${n.length_cm} см / ⌀ ${n.girth_cm} (${getRaceSexDef(n.raceKey)?.raceLabel})` +
      (n.special ? ` — ${n.special}` : '')
  )
  return (
    `\n--- СЕКС-СТАТИ ВИДІВ (сервер clamp PENIS_STATS; не виходь за діапазони) ---\n` +
    lines.join('\n') +
    `\nКанон імена (фіксовано):\n` +
    named.join('\n') +
    `\nТане ЗАВЖДИ 16 см. Кентавр — не повне проникнення. Гієноїд — вузол. Свинолюд — інфекція. ` +
    `PENIS_STATS один раз на партнера на сцену. Описуй special/risk у наративі.\n---\n`
  )
}

/** Mechanical helpers for future sex-turn integration */
export function injuryDcFromStats(stats: PenisStatsData): number {
  const len = Number(stats.length_cm) || 15
  const girth = Number(stats.girth_cm) || 4
  let dc = 8 + Math.floor((len - 15) / 3) + Math.floor((girth - 4) * 2)
  const risk = String(stats.risk_for_lara || '')
  if (risk.includes('Дуже')) dc += 6
  else if (risk.includes('Висок')) dc += 4
  else if (risk.includes('Серед')) dc += 2
  return clamp(dc, 8, 22)
}

export function effectivePenetrationCm(stats: PenisStatsData): number {
  const len = Number(stats.length_cm) || 15
  const max = stats.max_penetration_cm != null ? Number(stats.max_penetration_cm) : null
  if (max != null && Number.isFinite(max)) return Math.min(len, max)
  return len
}
