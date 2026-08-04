/**
 * Lara orifice capacity / stretch vs partner size.
 * Skills (vaginal + anal + deepthroat) expand comfort/max diameter & depth.
 */

import { clamp } from '@/lib/game/json'
import type { PenisStatsData } from '@/lib/game/sex-types'
import {
  effectivePenetrationCm,
  injuryDcFromStats,
} from '@/lib/game/race-sex-stats'

/** Minimal skill shape — avoid circular import with skill-effects. */
export type SkillLike = {
  name: string
  level: number
  xp?: number
  maxXp?: number
  category?: string
}

function skillLevel(skills: SkillLike[] | null | undefined, name: string): number {
  if (!skills?.length) return 0
  const found = skills.find((s) => s.name === name)
  return clamp(Number(found?.level) || 0, 0, 5)
}

export type OrificeKind = 'vaginal' | 'anal' | 'oral'

export type FitTier = 'easy' | 'snug' | 'stretch' | 'extreme' | 'impossible'

export type OrificeCapacity = {
  orifice: OrificeKind
  /** Skill-driven stretch 0–5 (relaxation / training) */
  stretchLv: number
  /** Skill-driven girth capacity 0–5 */
  capacityLv: number
  /** Skill-driven depth 0–5 */
  depthLv: number
  /** Diameter (cm) that feels good without pain */
  comfortDiameterCm: number
  /** Hard max diameter before high injury risk */
  maxDiameterCm: number
  /** Depth that is comfortable */
  comfortDepthCm: number
  /** Hard max depth (cervix / anatomy limit, fantasy-soft) */
  maxDepthCm: number
  /** Prep skill level (0 = risky without lube/time) */
  prepLv: number
  notes: string[]
}

export type SizeFitResult = {
  orifice: OrificeKind
  partnerName: string
  partnerLengthCm: number
  partnerDiameterCm: number
  /** How much length actually enters (capped by orifice + race usable) */
  insertedDepthCm: number
  unusedLengthCm: number
  depthFit: FitTier
  girthFit: FitTier
  overall: FitTier
  /** d20 DC for injury / pain on forced full size */
  injuryDc: number
  painRiskPct: number
  pleasureModPct: number
  requiresPrep: boolean
  lines: string[]
}

// ─── Base anatomy (adult human female, soft-fantasy) ───────────────────────

const BASE = {
  vaginal: {
    comfortDiameter: 3.4,
    maxDiameter: 4.6,
    comfortDepth: 11,
    maxDepth: 14,
  },
  anal: {
    comfortDiameter: 2.6,
    maxDiameter: 3.6,
    comfortDepth: 7,
    maxDepth: 11,
  },
  oral: {
    comfortDiameter: 3.2,
    maxDiameter: 4.2,
    comfortDepth: 6, // to soft palate
    maxDepth: 9, // trained throat toward base
  },
} as const

function tierFromRatio(ratio: number): FitTier {
  // ratio = partner / comfort (for girth) or inserted/comfortDepth
  if (ratio <= 0.92) return 'easy'
  if (ratio <= 1.08) return 'snug'
  if (ratio <= 1.28) return 'stretch'
  if (ratio <= 1.55) return 'extreme'
  return 'impossible'
}

function worseTier(a: FitTier, b: FitTier): FitTier {
  const order: FitTier[] = ['easy', 'snug', 'stretch', 'extreme', 'impossible']
  return order[Math.max(order.indexOf(a), order.indexOf(b))]
}

/** Diameter from penis stats (girth_cm stored as ⌀ diameter). */
export function partnerDiameterCm(stats: PenisStatsData): number {
  const d = Number(stats.girth_cm)
  if (Number.isFinite(d) && d > 0) return d
  // fallback from length (rough)
  const len = Number(stats.length_cm) || 14
  return clamp(2.8 + len * 0.08, 2.5, 8)
}

export function circumferenceFromDiameter(diameterCm: number): number {
  return Math.round(Math.PI * diameterCm * 10) / 10
}

/**
 * Compute Lara's orifice capacity from sex skills.
 */
export function computeOrificeCapacity(
  skills: SkillLike[] | null | undefined,
  orifice: OrificeKind
): OrificeCapacity {
  if (orifice === 'vaginal') {
    const prepLv = skillLevel(skills, 'М\'який вхід')
    const capacityLv = skillLevel(skills, 'Вагінальна місткість')
    const depthLv = skillLevel(skills, 'Глибина вагіни')
    const stretchLv = Math.max(prepLv, skillLevel(skills, 'Вагінальна місткість') > 0 ? 1 : 0)
    // Also ride/flexibility help a bit
    const flex = skillLevel(skills, 'Гнучкість тіла')
    const ride = skillLevel(skills, 'Глибока їзда')

    const b = BASE.vaginal
    const comfortDiameterCm =
      b.comfortDiameter + capacityLv * 0.35 + prepLv * 0.2 + flex * 0.05
    const maxDiameterCm =
      b.maxDiameter + capacityLv * 0.45 + prepLv * 0.25 + flex * 0.08 + ride * 0.1
    const comfortDepthCm = b.comfortDepth + depthLv * 1.4 + ride * 0.4 + capacityLv * 0.3
    const maxDepthCm = b.maxDepth + depthLv * 2.0 + ride * 0.6 + capacityLv * 0.4

    const notes: string[] = []
    if (prepLv <= 0) notes.push('Без «М\'який вхід» — більше болю при великому ⌀')
    if (capacityLv >= 3) notes.push('Місткість: комфортно приймає вище середнього')
    if (depthLv >= 4) notes.push('Глибина: майже до шийки при великих партнерах')
    if (capacityLv >= 5 && depthLv >= 4) notes.push('«Size queen» потенціал (вагіна)')

    return {
      orifice: 'vaginal',
      stretchLv: clamp(prepLv + Math.floor(capacityLv / 2), 0, 5),
      capacityLv,
      depthLv,
      comfortDiameterCm: round1(comfortDiameterCm),
      maxDiameterCm: round1(maxDiameterCm),
      comfortDepthCm: round1(comfortDepthCm),
      maxDepthCm: round1(maxDepthCm),
      prepLv,
      notes,
    }
  }

  if (orifice === 'anal') {
    const prepLv = skillLevel(skills, 'Анальна підготовка')
    const capacityLv = skillLevel(skills, 'Анал')
    const depthLv = skillLevel(skills, 'Глибокий анал')
    const flex = skillLevel(skills, 'Гнучкість тіла')

    const b = BASE.anal
    // Anal is tighter; skills matter more
    const comfortDiameterCm =
      b.comfortDiameter + capacityLv * 0.28 + prepLv * 0.35 + flex * 0.05
    const maxDiameterCm =
      b.maxDiameter + capacityLv * 0.4 + prepLv * 0.4 + flex * 0.1
    const comfortDepthCm = b.comfortDepth + depthLv * 1.5 + capacityLv * 0.5 + prepLv * 0.4
    const maxDepthCm = b.maxDepth + depthLv * 2.2 + capacityLv * 0.6 + prepLv * 0.5

    const notes: string[] = []
    if (prepLv < 1) notes.push('Критично: «Анальна підготовка» Lv≥1 для безпечного входу')
    if (capacityLv >= 3) notes.push('Анал звикає до товщини')
    if (depthLv >= 4) notes.push('Глибокий анал: висока місткість по довжині')

    return {
      orifice: 'anal',
      stretchLv: clamp(prepLv, 0, 5),
      capacityLv,
      depthLv,
      comfortDiameterCm: round1(comfortDiameterCm),
      maxDiameterCm: round1(maxDiameterCm),
      comfortDepthCm: round1(comfortDepthCm),
      maxDepthCm: round1(maxDepthCm),
      prepLv,
      notes,
    }
  }

  // oral / throat
  const gagLv = skillLevel(skills, 'Подолання рефлекса')
  const deepLv = skillLevel(skills, 'Глибоке горло')
  const bjLv = skillLevel(skills, 'Мінет')
  const b = BASE.oral
  const comfortDiameterCm = b.comfortDiameter + bjLv * 0.12 + gagLv * 0.15
  const maxDiameterCm = b.maxDiameter + deepLv * 0.25 + gagLv * 0.2 + bjLv * 0.1
  // Depth: untrained tip; deepthroat Lv maps to fraction of partner — absolute cm for average
  const comfortDepthCm = b.comfortDepth + deepLv * 1.2 + gagLv * 0.5
  const maxDepthCm = b.maxDepth + deepLv * 2.0 + gagLv * 0.8

  return {
    orifice: 'oral',
    stretchLv: gagLv,
    capacityLv: Math.max(bjLv, deepLv),
    depthLv: deepLv,
    comfortDiameterCm: round1(comfortDiameterCm),
    maxDiameterCm: round1(maxDiameterCm),
    comfortDepthCm: round1(comfortDepthCm),
    maxDepthCm: round1(maxDepthCm),
    prepLv: gagLv,
    notes:
      deepLv <= 0
        ? ['Без «Глибоке горло» — лише голівка/неглибокий мінет']
        : [`Горло Lv${deepLv}: глибина прийому росте`],
  }
}

export function computeAllOrificeCapacities(skills: SkillLike[] | null | undefined) {
  return {
    vaginal: computeOrificeCapacity(skills, 'vaginal'),
    anal: computeOrificeCapacity(skills, 'anal'),
    oral: computeOrificeCapacity(skills, 'oral'),
  }
}

/**
 * Compare partner penis stats to Lara orifice (skills).
 */
export function evaluateSizeFit(
  skills: SkillLike[] | null | undefined,
  penis: PenisStatsData,
  orifice: OrificeKind = 'vaginal'
): SizeFitResult {
  const cap = computeOrificeCapacity(skills, orifice)
  const partnerLengthCm = Number(penis.length_cm) || 14
  const diam = partnerDiameterCm(penis)
  const raceUsable = effectivePenetrationCm(penis)
  const maxInsert = Math.min(raceUsable, cap.maxDepthCm)
  const comfortInsert = Math.min(raceUsable, cap.comfortDepthCm)

  // How much they try to put in: assume intent full usable
  const insertedDepthCm = round1(maxInsert)
  const unusedLengthCm = round1(Math.max(0, partnerLengthCm - insertedDepthCm))

  const depthRatio = insertedDepthCm / Math.max(0.1, cap.comfortDepthCm)
  const girthRatio = diam / Math.max(0.1, cap.comfortDiameterCm)
  let depthFit = tierFromRatio(depthRatio)
  let girthFit = tierFromRatio(girthRatio)

  if (diam > cap.maxDiameterCm * 1.02) girthFit = 'impossible'
  else if (diam > cap.maxDiameterCm * 0.95) girthFit = worseTier(girthFit, 'extreme')

  if (insertedDepthCm > cap.maxDepthCm * 1.02) depthFit = 'impossible'
  else if (raceUsable > cap.maxDepthCm && partnerLengthCm > cap.maxDepthCm) {
    // leftover length is normal (especially centaur) — not impossible, just unused
    if (depthFit === 'impossible') depthFit = 'extreme'
  }

  const overall = worseTier(depthFit, girthFit)

  let injuryDc = injuryDcFromStats(penis)
  if (orifice === 'anal') injuryDc += 2
  if (orifice === 'oral') injuryDc += 1
  if (girthFit === 'stretch') injuryDc += 2
  if (girthFit === 'extreme') injuryDc += 4
  if (girthFit === 'impossible') injuryDc += 7
  if (depthFit === 'extreme') injuryDc += 2
  if (cap.prepLv <= 0 && orifice !== 'oral') injuryDc += 2
  if (cap.prepLv >= 3) injuryDc -= 1
  injuryDc = clamp(injuryDc, 8, 24)

  const painMap: Record<FitTier, number> = {
    easy: 5,
    snug: 15,
    stretch: 35,
    extreme: 60,
    impossible: 90,
  }
  let painRiskPct = Math.max(painMap[depthFit], painMap[girthFit])
  if (cap.prepLv <= 0 && orifice === 'anal') painRiskPct = Math.min(100, painRiskPct + 20)
  if (cap.prepLv >= 4) painRiskPct = Math.max(0, painRiskPct - 15)

  // Pleasure: snug/stretch can be good if skilled; impossible hurts
  let pleasureModPct = 0
  if (overall === 'easy') pleasureModPct = 5
  if (overall === 'snug') pleasureModPct = 12
  if (overall === 'stretch') pleasureModPct = cap.capacityLv >= 2 ? 18 : 5
  if (overall === 'extreme') pleasureModPct = cap.capacityLv >= 4 ? 10 : -15
  if (overall === 'impossible') pleasureModPct = -40

  const requiresPrep =
    orifice !== 'oral' &&
    (cap.prepLv < 1 || girthFit === 'stretch' || girthFit === 'extreme' || girthFit === 'impossible')

  const lines: string[] = [
    `${orificeLabel(orifice)}: комфорт ⌀${cap.comfortDiameterCm} / макс ⌀${cap.maxDiameterCm} см; ` +
      `глибина ${cap.comfortDepthCm}–${cap.maxDepthCm} см`,
    `Партнер ${penis.name}: ${partnerLengthCm} см × ⌀${diam} см` +
      (penis.max_penetration_cm != null
        ? ` (usable ~${raceUsable} см)`
        : ''),
    `Входить ~${insertedDepthCm} см` +
      (unusedLengthCm > 0.5 ? ` (не входить ще ~${unusedLengthCm} см)` : ''),
    `Товщина: ${fitLabel(girthFit)} · Глибина: ${fitLabel(depthFit)} · Загалом: ${fitLabel(overall)}`,
    `Ризик болю ~${painRiskPct}% · DC травми ~${injuryDc}` +
      (requiresPrep ? ' · потрібна підготовка/змазка' : ''),
  ]
  if (cap.notes.length) lines.push(...cap.notes.map((n) => `• ${n}`))

  return {
    orifice,
    partnerName: String(penis.name || '?'),
    partnerLengthCm,
    partnerDiameterCm: diam,
    insertedDepthCm,
    unusedLengthCm,
    depthFit,
    girthFit,
    overall,
    injuryDc,
    painRiskPct,
    pleasureModPct,
    requiresPrep,
    lines,
  }
}

function orificeLabel(o: OrificeKind): string {
  if (o === 'vaginal') return 'Вагіна'
  if (o === 'anal') return 'Анал'
  return 'Рот/горло'
}

function fitLabel(t: FitTier): string {
  const map: Record<FitTier, string> = {
    easy: 'легко',
    snug: 'щільно',
    stretch: 'розтягнення',
    extreme: 'екстрим',
    impossible: 'неможливо без травми',
  }
  return map[t]
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/** Prompt block: Lara body capacity + optional fit vs last penis. */
export function formatBodyCapacityForPrompt(
  skills: SkillLike[] | null | undefined,
  penis?: PenisStatsData | null
): string {
  const all = computeAllOrificeCapacities(skills)
  const block = (c: OrificeCapacity) =>
    `${orificeLabel(c.orifice)}: ⌀ комфорт ${c.comfortDiameterCm} / макс ${c.maxDiameterCm} см · ` +
    `глибина ${c.comfortDepthCm}–${c.maxDepthCm} см ` +
    `(розтяг Lv${c.stretchLv}, місткість Lv${c.capacityLv}, глибина-скіл Lv${c.depthLv})`

  const lines = [
    '=== МІСТКІСТЬ ТІЛА ЛАРИ (розтягнення / вмісткість) ===',
    block(all.vaginal),
    block(all.anal),
    block(all.oral),
    'Порівнюй з PENIS_STATS партнера. Якщо ⌀/довжина > макс — біль, DC травми, часткове проникнення, або неможливість.',
    'Кентавр/мінотавр: usable length < full length. Навички вагіни/аналу підвищують ліміти.',
  ]

  if (penis?.name) {
    for (const o of ['vaginal', 'anal'] as OrificeKind[]) {
      const fit = evaluateSizeFit(skills, penis, o)
      lines.push(`--- Fit ${orificeLabel(o)} vs ${penis.name} ---`)
      lines.push(...fit.lines)
    }
  }

  return lines.join('\n')
}
