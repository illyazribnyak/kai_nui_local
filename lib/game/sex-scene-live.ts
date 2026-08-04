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
  lastReaction?: string | null
): PartnerReactionChoice[] {
  const who = partnerName || 'партнер'
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
  id: 'continue' | 'end' | 'edge' | 'switch_focus'
  label: string
  icon: string
  prompt: string
  needsMulti?: boolean
  needsEdge?: boolean
}

export function buildOrgasmFork(opts: {
  laraOrgasm: boolean
  partnerOrgasm: boolean
  multiUnlocked: boolean
  edgeSkill: number
  partnerName?: string
}): OrgasmForkOption[] {
  const who = opts.partnerName || 'партнер'
  const optsList: OrgasmForkOption[] = []
  if (opts.laraOrgasm || opts.partnerOrgasm) {
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
  }
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

export function buildFreeActions(partnerName?: string): FreeAction[] {
  const who = partnerName || 'партнер'
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

export function buildFitMicroActions(locked: boolean): FitMicroAction[] {
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
