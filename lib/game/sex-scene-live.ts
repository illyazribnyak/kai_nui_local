/**
 * Live sex-scene interactivity: pressure, body states, positions,
 * orgasm fork, partner reactions, partner memory, fit strip, desire impulse.
 */

import { clamp } from '@/lib/game/json'
import {
  evaluateSizeFit,
  type FitTier,
  type OrificeKind,
  type SizeFitResult,
} from '@/lib/game/body-capacity'
import type { SkillLike } from '@/lib/game/body-capacity'
import type { PenisStatsData } from '@/lib/game/sex-types'

// ─── Scene type / coercion ─────────────────────────────────────────────────

export type SexSceneType =
  | 'voluntary'
  | 'coercion'
  | 'trap'
  | 'ritual'
  | 'trade'

export function normalizeSceneType(type?: string | null): SexSceneType {
  const t = String(type || 'voluntary').toLowerCase().trim()
  if (
    t === 'voluntary' ||
    t === 'coercion' ||
    t === 'trap' ||
    t === 'ritual' ||
    t === 'trade'
  ) {
    return t
  }
  // LLM sometimes uses UA synonyms
  if (/примус|force|non.?consent|rape/.test(t)) return 'coercion'
  if (/пастк|trap|сітк/.test(t)) return 'trap'
  if (/ритуал/.test(t)) return 'ritual'
  if (/торг|trade|обмін/.test(t)) return 'trade'
  return 'voluntary'
}

/** Against will: coercion or physical trap */
export function isCoercionScene(type?: string | null): boolean {
  const t = normalizeSceneType(type)
  return t === 'coercion' || t === 'trap'
}

export function isTrapScene(type?: string | null): boolean {
  return normalizeSceneType(type) === 'trap'
}

export function sceneTypeLabel(type?: string | null): string {
  switch (normalizeSceneType(type)) {
    case 'coercion':
      return 'Примус'
    case 'trap':
      return 'Пастка'
    case 'ritual':
      return 'Ритуал'
    case 'trade':
      return 'Обмін'
    default:
      return 'Добровільно'
  }
}

export function sceneTypeBanner(type?: string | null): {
  title: string
  subtitle: string
  tone: 'danger' | 'ritual' | 'trade' | 'safe'
} | null {
  const t = normalizeSceneType(type)
  if (t === 'coercion') {
    return {
      title: '⛓️ Примус',
      subtitle: 'Не її воля — можна опиратись (Сила / Спритність / Харизма) або піддатись',
      tone: 'danger',
    }
  }
  if (t === 'trap') {
    return {
      title: '🪤 Пастка',
      subtitle: 'Фізично обмежена — менше поз і «веселих» ходів, втеча складніша',
      tone: 'danger',
    }
  }
  if (t === 'ritual') {
    return {
      title: '🔮 Ритуал',
      subtitle: 'Секс як обряд — правила племʼя / амулет',
      tone: 'ritual',
    }
  }
  if (t === 'trade') {
    return {
      title: '🤝 Обмін',
      subtitle: 'Угода тілом — можна торгуватись, але ціна реальна',
      tone: 'trade',
    }
  }
  return null
}

/** Starting pressure for non-voluntary scenes */
export function initialPressureForScene(type?: string | null): number {
  const t = normalizeSceneType(type)
  if (t === 'trap') return 55
  if (t === 'coercion') return 40
  if (t === 'ritual') return 25
  return 15
}

// ─── Positions (F) ─────────────────────────────────────────────────────────

export type SexPositionId =
  | 'missionary'
  | 'cowgirl'
  | 'doggy'
  | 'oral'
  | 'standing'
  | 'side'

export type SexPositionDef = {
  id: SexPositionId
  label: string
  icon: string
  /** Default orifice for fit */
  orifice: OrificeKind
  dominationHint: number
  prompt: string
}

export const SEX_POSITIONS: SexPositionDef[] = [
  {
    id: 'missionary',
    label: 'Місіонерська',
    icon: '🛏️',
    orifice: 'vaginal',
    dominationHint: 0,
    prompt: 'Лара приймає місіонерську позу — близько, обличчя до обличчя.',
  },
  {
    id: 'cowgirl',
    label: 'Зверху',
    icon: '🏇',
    orifice: 'vaginal',
    dominationHint: 15,
    prompt: 'Лара сідає зверху і бере контроль ритму.',
  },
  {
    id: 'doggy',
    label: 'Ззаду',
    icon: '🐕',
    orifice: 'vaginal',
    dominationHint: -10,
    prompt: 'Лара стає рачки — глибше, інтенсивніше.',
  },
  {
    id: 'oral',
    label: 'Рот',
    icon: '💋',
    orifice: 'oral',
    dominationHint: -5,
    prompt: 'Лара переходить до оральної ласки.',
  },
  {
    id: 'standing',
    label: 'Стоячи',
    icon: '🦵',
    orifice: 'vaginal',
    dominationHint: 5,
    prompt: 'Вони притискаються стоячи — нестійко, гаряче.',
  },
  {
    id: 'side',
    label: 'На боці',
    icon: '🌙',
    orifice: 'vaginal',
    dominationHint: 0,
    prompt: 'Лара лягає на бік — повільніше, глибше відчуття.',
  },
]

export function getPosition(id: string | null | undefined): SexPositionDef {
  return SEX_POSITIONS.find((p) => p.id === id) || SEX_POSITIONS[0]
}

/**
 * Gate positions by scene type / knot lock.
 * Trap: only forced-friendly poses. Coercion: no Lara-on-top control.
 */
export function filterPositionsForScene(opts: {
  sceneType?: string | null
  knotLocked?: boolean
}): SexPositionDef[] {
  if (opts.knotLocked) {
    // UI freezes current; list still returns all but locked flag prevents switch
    return SEX_POSITIONS
  }
  if (isTrapScene(opts.sceneType)) {
    return SEX_POSITIONS.filter(
      (p) => p.id === 'missionary' || p.id === 'doggy' || p.id === 'oral'
    )
  }
  if (isCoercionScene(opts.sceneType)) {
    // Partner leads — no cowgirl (Lara control), no free standing dance
    return SEX_POSITIONS.filter((p) => p.id !== 'cowgirl')
  }
  return SEX_POSITIONS
}

export function isPositionAllowed(
  positionId: string,
  opts: { sceneType?: string | null; knotLocked?: boolean }
): { ok: true } | { ok: false; reason: string } {
  if (opts.knotLocked) {
    return { ok: false, reason: 'У замку — позу змінити не можна' }
  }
  const allowed = filterPositionsForScene(opts)
  if (!allowed.some((p) => p.id === positionId)) {
    if (isTrapScene(opts.sceneType)) {
      return { ok: false, reason: 'Пастка: ця поза недоступна' }
    }
    if (isCoercionScene(opts.sceneType)) {
      return { ok: false, reason: 'Примус: партнер не дає тобі вести' }
    }
    return { ok: false, reason: 'Поза недоступна' }
  }
  return { ok: true }
}

/**
 * Server/client gate for skill moves under coercion / trap / knot.
 */
export function isMoveAllowedInScene(
  move: { id: string; category: string; label?: string },
  opts: { sceneType?: string | null; knotLocked?: boolean }
): { ok: true } | { ok: false; reason: string } {
  if (opts.knotLocked) {
    if (
      move.category === 'domination' ||
      move.category === 'riding' ||
      move.id.startsWith('pos_') ||
      move.id === 'sed_dance'
    ) {
      return { ok: false, reason: 'У замку вузла — цей хід недоступний' }
    }
  }
  if (!isCoercionScene(opts.sceneType)) return { ok: true }

  if (move.category === 'domination') {
    return { ok: false, reason: 'Примус: домінування недоступне' }
  }
  if (move.category === 'riding') {
    return { ok: false, reason: 'Примус: ти не зверху і не ведеш' }
  }
  if (move.id === 'end_control' || move.category === 'edging') {
    return { ok: false, reason: 'Примус: контроль темпу не у тебе' }
  }
  if (isTrapScene(opts.sceneType)) {
    if (move.category === 'public' || move.id === 'sed_dance' || move.id === 'pub_show') {
      return { ok: false, reason: 'Пастка: немає простору для шоу' }
    }
  }
  return { ok: true }
}

// ─── Coercion resist / submit choices ──────────────────────────────────────

export type CoercionChoice = {
  id: 'resist_str' | 'resist_agi' | 'resist_cha' | 'submit' | 'freeze'
  label: string
  icon: string
  prompt: string
  /** Attribute hint for LLM dice */
  skillHint: string
  dc: number
  /** Softer / no roll */
  safe?: boolean
}

export function buildCoercionChoices(
  partnerName?: string | null,
  sceneType?: string | null
): CoercionChoice[] {
  if (!isCoercionScene(sceneType)) return []
  const who = partnerName || 'агресор'
  const trap = isTrapScene(sceneType)
  const baseDc = trap ? 16 : 14
  return [
    {
      id: 'resist_str',
      label: 'Сила',
      icon: '💪',
      skillHint: 'Сила',
      dc: baseDc,
      prompt: `Лара намагається відштовхнути ${who} силою (кидок Сила DC${baseDc}). Якщо успіх — шанс вирватись; якщо провал — гірше.`,
    },
    {
      id: 'resist_agi',
      label: 'Втекти',
      icon: '🏃',
      skillHint: 'Спритність',
      dc: trap ? baseDc + 1 : baseDc,
      prompt: `Лара рветься вислизнути від ${who} (кидок Спритність DC${trap ? baseDc + 1 : baseDc}). ${trap ? 'Пастка ускладнює втечу.' : ''}`,
    },
    {
      id: 'resist_cha',
      label: 'Вмовити',
      icon: '🗣️',
      skillHint: 'Харизма',
      dc: baseDc + 1,
      prompt: `Лара намагається словами / поглядом зупинити ${who} (кидок Харизма DC${baseDc + 1}).`,
    },
    {
      id: 'submit',
      label: 'Піддатись',
      icon: '🙇',
      skillHint: '—',
      dc: 0,
      safe: true,
      prompt: `Лара перестає опиратись — тіло піддається ${who}, навіть якщо розум проти. Може прокачати кінк «Безсилля».`,
    },
    {
      id: 'freeze',
      label: 'Заціпеніти',
      icon: '🧊',
      skillHint: '—',
      dc: 0,
      safe: true,
      prompt: `Лара заціпеніла: ні боротьби, ні згоди — тіло «не тут». ${who} діє, вона майже не реагує голосом.`,
    },
  ]
}

// ─── Control mode (G) ──────────────────────────────────────────────────────

export type SexControlMode = 'moves' | 'free'

// ─── Body states (I) ───────────────────────────────────────────────────────

export type BodyStateId =
  | 'lubed'
  | 'tense'
  | 'knot_lock'
  | 'stretched'
  | 'overfull'
  | 'sore'
  | 'pheromones'
  | 'shaking'

export type BodyStateChip = {
  id: BodyStateId
  label: string
  icon: string
  /** Remaining sex-turns; -1 = until scene end */
  turnsLeft: number
  tone: 'good' | 'bad' | 'neutral' | 'hot'
}

export const BODY_STATE_META: Record<
  BodyStateId,
  Omit<BodyStateChip, 'turnsLeft'>
> = {
  lubed: { id: 'lubed', label: 'Змазана', icon: '💧', tone: 'good' },
  tense: { id: 'tense', label: 'Напружена', icon: '😬', tone: 'bad' },
  knot_lock: { id: 'knot_lock', label: 'У замку', icon: '🔒', tone: 'hot' },
  stretched: { id: 'stretched', label: 'Розтяг', icon: '↔️', tone: 'neutral' },
  overfull: { id: 'overfull', label: 'Переповнена', icon: '💦', tone: 'hot' },
  sore: { id: 'sore', label: 'Болить', icon: '🩹', tone: 'bad' },
  pheromones: { id: 'pheromones', label: 'Феромони', icon: '🌫️', tone: 'hot' },
  shaking: { id: 'shaking', label: 'Тремтить', icon: '✨', tone: 'good' },
}

export function tickBodyStates(states: BodyStateChip[]): BodyStateChip[] {
  return states
    .map((s) =>
      s.turnsLeft < 0 ? s : { ...s, turnsLeft: s.turnsLeft - 1 }
    )
    .filter((s) => s.turnsLeft !== 0)
}

export function upsertBodyState(
  states: BodyStateChip[],
  id: BodyStateId,
  turnsLeft: number
): BodyStateChip[] {
  const meta = BODY_STATE_META[id]
  const next = states.filter((s) => s.id !== id)
  next.push({ ...meta, turnsLeft })
  return next
}

export function hasBodyState(states: BodyStateChip[], id: BodyStateId): boolean {
  return states.some((s) => s.id === id)
}

// ─── Pressure / moment meter (B) ───────────────────────────────────────────

/**
 * 0–100 «тиск моменту»: зрив, біль, імпульс.
 * Raised by fast tempo, bad fit, no prep; lowered by slow, lubed, aftercare moves.
 */
export function nextPressure(
  pressure: number,
  opts: {
    tempo: string
    fitTier?: FitTier | null
    hasLubed?: boolean
    hasTense?: boolean
    fastRiskMove?: boolean
  }
): number {
  let p = pressure
  if (opts.tempo === 'fast') p += 8
  if (opts.tempo === 'slow') p -= 5
  if (opts.fitTier === 'stretch') p += 6
  if (opts.fitTier === 'extreme') p += 12
  if (opts.fitTier === 'impossible') p += 18
  if (opts.hasLubed) p -= 4
  if (opts.hasTense) p += 5
  if (opts.fastRiskMove) p += 7
  return clamp(p, 0, 100)
}

export function pressureLabel(p: number): string {
  if (p < 25) return 'Спокійно'
  if (p < 50) return 'Напруга'
  if (p < 75) return 'На межі'
  return 'Зрив близько'
}

// ─── Fit strip (C) ─────────────────────────────────────────────────────────

export type FitStripView = {
  orifice: OrificeKind
  overall: FitTier
  overallLabel: string
  insertedDepthCm: number
  partnerLengthCm: number
  partnerDiameterCm: number
  injuryDc: number
  painRiskPct: number
  lines: string[]
  locked: boolean
}

const FIT_UA: Record<FitTier, string> = {
  easy: 'легко',
  snug: 'щільно',
  stretch: 'розтягнення',
  extreme: 'екстрим',
  impossible: 'неможливо',
}

export function buildFitStrip(
  skills: SkillLike[] | null | undefined,
  penis: PenisStatsData | null | undefined,
  orifice: OrificeKind,
  locked: boolean
): FitStripView | null {
  if (!penis?.name) return null
  const fit: SizeFitResult = evaluateSizeFit(skills, penis, orifice)
  return {
    orifice,
    overall: fit.overall,
    overallLabel: FIT_UA[fit.overall],
    insertedDepthCm: fit.insertedDepthCm,
    partnerLengthCm: fit.partnerLengthCm,
    partnerDiameterCm: fit.partnerDiameterCm,
    injuryDc: fit.injuryDc,
    painRiskPct: fit.painRiskPct,
    lines: fit.lines.slice(0, 3),
    locked,
  }
}

// ─── Partner reaction buttons (A) ──────────────────────────────────────────

export type PartnerReactionChoice = {
  id: string
  label: string
  icon: string
  /** Sent as player message / free action */
  prompt: string
  risk?: boolean
}

export function buildPartnerReactionChoices(
  partnerName?: string | null,
  lastReaction?: string | null,
  sceneType?: string | null
): PartnerReactionChoice[] {
  const who = partnerName || 'партнер'
  if (isCoercionScene(sceneType)) {
    const base: PartnerReactionChoice[] = [
      {
        id: 'react_yield',
        label: 'Піддатись тілом',
        icon: '🥺',
        prompt: `Лара піддається ${who}: тіло м'якне, навіть якщо очі повні страху/гніву.`,
      },
      {
        id: 'react_fight',
        label: 'Опиратись',
        icon: '✊',
        prompt: `Лара б'ється / виривається від ${who} — ризиковано, може гірше.`,
        risk: true,
      },
      {
        id: 'react_plead',
        label: 'Благати',
        icon: '🙏',
        prompt: `Лара благає ${who} зупинитись або хоча б пом'якшити — голос зривається.`,
      },
      {
        id: 'react_shut',
        label: 'Замкнутись',
        icon: '😶',
        prompt: `Лара мовчить і закривається внутрішньо — тіло «відсутнє», поки ${who} діє.`,
      },
    ]
    return base
  }
  const base: PartnerReactionChoice[] = [
    {
      id: 'react_yield',
      label: 'Піддатись',
      icon: '🥺',
      prompt: `Лара піддається реакції ${who}: розслабляється, приймає, стогне у відповідь.`,
    },
    {
      id: 'react_pace',
      label: 'Взяти темп',
      icon: '🔥',
      prompt: `Лара перехоплює ініціативу після репліки ${who} — задає свій ритм.`,
    },
    {
      id: 'react_dirty',
      label: 'Брудніше',
      icon: '💬',
      prompt: `Лара відповідає ${who} брудніше й зухваліше, підігріваючи сцену.`,
    },
    {
      id: 'react_stop',
      label: 'Стоп / інакше',
      icon: '✋',
      prompt: `Лара коротко зупиняє ${who} і просить змінити темп або позу.`,
      risk: false,
    },
  ]
  if (lastReaction && /стогн|сид|глиб|сильніш|не зупиня/i.test(lastReaction)) {
    base.unshift({
      id: 'react_match',
      label: 'Відповісти тілом',
      icon: '💗',
      prompt: `Лара відповідає на «${lastReaction.slice(0, 40)}…» рухом стегон і стисканням.`,
    })
  }
  return base.slice(0, 4)
}

// ─── Partner memory (D) ────────────────────────────────────────────────────

const MEMORY_KEY = 'kai_nui_sex_partner_memory'

export function loadPartnerMemories(): Record<string, string[]> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}')
  } catch {
    return {}
  }
}

export function savePartnerMemory(partner: string, fact: string): string[] {
  if (typeof window === 'undefined') return [fact]
  const all = loadPartnerMemories()
  const key = partner.trim() || 'Невідомий'
  const list = all[key] || []
  const next = [fact, ...list.filter((f) => f !== fact)].slice(0, 8)
  all[key] = next
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
  return next
}

export function getPartnerMemories(partner: string): string[] {
  return loadPartnerMemories()[partner.trim()] || []
}

/** One new memory fact after a scene beat */
export function inventPartnerMemoryFact(opts: {
  partner: string
  position: SexPositionId
  laraOrgasm: boolean
  partnerOrgasm: boolean
  tempo: string
  fitTier?: FitTier | null
}): string {
  const bits: string[] = []
  if (opts.position === 'cowgirl') bits.push('любить коли Лара зверху')
  if (opts.position === 'doggy') bits.push('збуджується від пози ззаду')
  if (opts.position === 'oral') bits.push('слабкий до оральних ласк')
  if (opts.tempo === 'slow') bits.push('цінує повільний темп')
  if (opts.tempo === 'fast') bits.push(' зривається на швидкому темпі')
  if (opts.laraOrgasm) bits.push('гордий що довів Лару')
  if (opts.partnerOrgasm) bits.push('швидко кінчає від її стискання')
  if (opts.fitTier === 'stretch' || opts.fitTier === 'extreme') {
    bits.push('великий для неї — треба обережність')
  }
  if (!bits.length) bits.push('запамʼятав її запах і голос')
  return `${opts.partner}: ${bits[0]}`
}

// ─── Orgasm fork (J) ───────────────────────────────────────────────────────

export type OrgasmForkOption = {
  id:
    | 'continue'
    | 'end'
    | 'edge'
    | 'switch_focus'
    | 'endure'
    | 'break_free'
    | 'submit_deeper'
    | 'body_betrays'
  label: string
  icon: string
  prompt: string
  needsMulti?: boolean
  needsEdge?: boolean
  /** Coercion-only fork styling */
  coercion?: boolean
}

export function buildOrgasmFork(opts: {
  laraOrgasm: boolean
  partnerOrgasm: boolean
  multiUnlocked: boolean
  edgeSkill: number
  partnerName?: string
  sceneType?: string | null
}): OrgasmForkOption[] {
  const who = opts.partnerName || 'партнер'
  if (!(opts.laraOrgasm || opts.partnerOrgasm)) return []

  // Coercion / trap: different emotional fork
  if (isCoercionScene(opts.sceneType)) {
    const list: OrgasmForkOption[] = [
      {
        id: 'endure',
        label: 'Терпіти далі',
        icon: '😣',
        coercion: true,
        prompt: `Пік минув, але ${who} не відпускає. Лара терпить далі — тіло гаряче, розум холодний або зламаний.`,
      },
      {
        id: 'body_betrays',
        label: 'Тіло зрадило',
        icon: '💜',
        coercion: true,
        prompt: `Оргазм ${opts.laraOrgasm ? 'Лари' : 'партнера'} — і тіло Лари зрадило волю: тремтіння, сльози/сором/збудження змішані. Кінк «Безсилля» може прокачатись.`,
      },
      {
        id: 'break_free',
        label: 'Ривок на втечу',
        icon: '⚡',
        coercion: true,
        prompt: `На хвилі піку Лара робить ривок — спроба вирватись від ${who} (Сила/Спритність, DC високе).`,
      },
      {
        id: 'submit_deeper',
        label: 'Здатись глибше',
        icon: '⛓️',
        coercion: true,
        prompt: `Лара ламається глибше: перестає боротись, підлаштовується під ${who}. Сором + можливий бонус до кінку безсилля.`,
      },
      {
        id: 'end',
        label: 'Кінець / знесилилась',
        icon: '🌑',
        coercion: true,
        prompt: `Сцена з ${who} обривається: Лара знесилена, сцена примусу закінчується. Наслідки — сором, гнів, травма або дивний кайф.`,
      },
    ]
    return list
  }

  const optsList: OrgasmForkOption[] = []
  optsList.push({
    id: 'end',
    label: 'Завершити',
    icon: '🏁',
    prompt: `Сцена з ${who} доходить до ніжного/гарячого завершення. Лара відсторонюється після піку.`,
  })
  optsList.push({
    id: 'continue',
    label: 'Продовжити',
    icon: '🔁',
    prompt: `Після оргазму Лара не зупиняється — продовжує з ${who}, тіло ще тремтить.`,
    needsMulti: true,
  })
  if (opts.edgeSkill >= 1) {
    optsList.push({
      id: 'edge',
      label: 'Зупинитись на краю',
      icon: '⏸️',
      prompt: `Лара різко гальмує на межі (або гальмує ${who}) — еджинг, не дає зірватись одразу.`,
      needsEdge: true,
    })
  }
  optsList.push({
    id: 'switch_focus',
    label: 'Змінити фокус',
    icon: '🔄',
    prompt: `Лара змінює фокус: тепер увага на іншому типі ласки / позі з ${who}.`,
  })
  return optsList.filter((o) => {
    if (o.needsMulti && !opts.multiUnlocked) return false
    if (o.needsEdge && opts.edgeSkill < 1) return false
    return true
  })
}

// ─── Desire impulse (K) ────────────────────────────────────────────────────

export type ImpulseChoice = {
  id: string
  label: string
  icon: string
  prompt: string
  willDc: number
}

export function buildDesireImpulses(desire: number, partnerName?: string): ImpulseChoice[] {
  if (desire < 90) return []
  const who = partnerName || 'партнер'
  return [
    {
      id: 'imp_grab',
      label: 'Вхопити / насадитись',
      icon: '⚠️',
      prompt: `Бажання ${desire}: Лара імпульсивно вхоплює ${who} і насаджується глибше, майже без контролю.`,
      willDc: 14,
    },
    {
      id: 'imp_beg',
      label: 'Благати сильніше',
      icon: '🔴',
      prompt: `Бажання ${desire}: Лара благає ${who} сильніше й брудніше, голос зривається.`,
      willDc: 12,
    },
    {
      id: 'imp_resist',
      label: 'Стриматись (Воля)',
      icon: '🧠',
      prompt: `Лара стискає зуби й стримує імпульс бажання ${desire} — Воля проти тіла.`,
      willDc: 16,
    },
  ]
}

// ─── Free actions (G) when mode=free ───────────────────────────────────────

export type FreeAction = {
  id: string
  label: string
  icon: string
  prompt: string
}

export function buildFreeActions(
  partnerName?: string,
  sceneType?: string | null
): FreeAction[] {
  const who = partnerName || 'партнер'
  if (isCoercionScene(sceneType)) {
    // No romantic free control — limited reactions only
    return [
      {
        id: 'free_look',
        label: 'Дивитись / відвести очі',
        icon: '👀',
        prompt: `Лара або впирається поглядом у ${who}, або відводить очі — єдиний контроль, що лишився.`,
      },
      {
        id: 'free_whisper',
        label: 'Слова / благання',
        icon: '👄',
        prompt: `Лара щось каже ${who}: благання, лайка або тихе «ні» — без сили змінити хід.`,
      },
    ]
  }
  return [
    {
      id: 'free_kiss',
      label: 'Поцілувати',
      icon: '💋',
      prompt: `Лара притягує ${who} до поцілунку — довго, волого, без «skill move».`,
    },
    {
      id: 'free_whisper',
      label: 'Прошепотіти',
      icon: '👂',
      prompt: `Лара шепоче ${who} на вухо щось брудне або ніжне — на свій розсуд.`,
    },
    {
      id: 'free_guide',
      label: 'Направити рукою',
      icon: '✋',
      prompt: `Лара бере руку/стегна ${who} і направляє глибше або інакше.`,
    },
    {
      id: 'free_look',
      label: 'Дивитись в очі',
      icon: '👀',
      prompt: `Лара ловить погляд ${who} і не відводить очей під час руху.`,
    },
  ]
}

// ─── Depth / pace micro-actions (C) ────────────────────────────────────────

export type FitMicroAction = {
  id: 'deeper' | 'slower' | 'lube' | 'shallower'
  label: string
  icon: string
  prompt: string
  risk?: boolean
}

export function buildFitMicroActions(
  locked: boolean,
  sceneType?: string | null
): FitMicroAction[] {
  if (locked) {
    return [
      {
        id: 'slower',
        label: 'Дихати / терпіти',
        icon: '😮‍💨',
        prompt: 'Лара в «замку» — дихає, терпить, чекає поки вузол спаде.',
      },
    ]
  }
  if (isCoercionScene(sceneType)) {
    // Partner controls depth; Lara can only plead/endure/lube if allowed
    return [
      {
        id: 'slower',
        label: 'Благати повільніше',
        icon: '🙏',
        prompt: 'Лара благає сповільнитись — партнер може ігнорувати.',
      },
      {
        id: 'lube',
        label: 'Змазка / слина (якщо дають)',
        icon: '💧',
        prompt: 'Лара намагається додати слину/змазку — менше болю, якщо дозволять.',
      },
      {
        id: 'deeper',
        label: 'Прийняти глибше',
        icon: '⬇️',
        prompt: 'Лара змушена / змушує себе прийняти глибше — тиск і ризик.',
        risk: true,
      },
    ]
  }
  return [
    {
      id: 'deeper',
      label: 'Глибше',
      icon: '⬇️',
      prompt: 'Лара просить / бере глибше — більше тиску, ризик болю.',
      risk: true,
    },
    {
      id: 'shallower',
      label: 'Менш глибоко',
      icon: '⬆️',
      prompt: 'Лара регулює глибину — коротші рухи, контроль.',
    },
    {
      id: 'slower',
      label: 'Повільніше',
      icon: '🐢',
      prompt: 'Лара сповільнює темп, щоб звикнути до розміру.',
    },
    {
      id: 'lube',
      label: 'Змазка / слина',
      icon: '💧',
      prompt: 'Лара додає змазку або слину — легше ковзання, менше болю.',
    },
  ]
}

/** Apply micro-action effects on pressure / body states (client-side). */
export function applyFitMicroLocal(
  actionId: string,
  pressure: number,
  bodyStates: BodyStateChip[]
): { pressure: number; bodyStates: BodyStateChip[]; events: string[] } {
  let p = pressure
  let states = [...bodyStates]
  const events: string[] = []
  if (actionId === 'deeper') {
    p = clamp(p + 10, 0, 100)
    events.push('глибше: +тиск')
  }
  if (actionId === 'slower' || actionId === 'shallower') {
    p = clamp(p - 8, 0, 100)
    events.push('м\'якше: −тиск')
  }
  if (actionId === 'lube') {
    states = upsertBodyState(states, 'lubed', 4)
    states = states.filter((s) => s.id !== 'tense')
    p = clamp(p - 6, 0, 100)
    events.push('змазка')
  }
  return { pressure: p, bodyStates: states, events }
}
