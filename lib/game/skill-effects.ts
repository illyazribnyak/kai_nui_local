/**
 * Server-side mechanical effects of the sex skill tree.
 * Pure functions — used by dice resolution, chat turn pipeline, and prompt builders.
 */

import { clamp } from '@/lib/game/json'
import { SEX_SKILL_TREE, type SexSkillCategory, type SexSkillNode } from '@/lib/game/sex-skill-tree'
import {
  aggregateSynergyEffects,
  computeActiveSynergies,
  type ActiveSynergy,
} from '@/lib/game/sex-synergies'

export interface SkillLike {
  name: string
  level: number
  xp?: number
  maxXp?: number
  category?: string
}

export interface SkillModifierSummary {
  /** Human-readable lines for UI / prompt */
  lines: string[]
  /** Aggregated numbers for HUD */
  diceHints: Array<{ skill: string; bonus: number }>
  multiOrgasmUnlocked: boolean
  multiOrgasmEasyContinue: boolean
  partnerPleasureBonusPct: number
  laraPleasureBonusPct: number
  staminaFloor: number
  dominationBias: number
  amuletGainMultiplier: number
  amuletGainMin: number
  seductionCritOn19: boolean
  dominationFloor: number | null
  /** Lara orgasm at 100 - relief */
  laraOrgasmThreshold: number
  synergies: ActiveSynergy[]
}

export function skillLevel(skills: SkillLike[] | null | undefined, name: string): number {
  if (!skills?.length) return 0
  const found = skills.find((s) => s.name === name)
  return clamp(Number(found?.level) || 0, 0, 5)
}

export function categoryLevels(skills: SkillLike[] | null | undefined, category: SexSkillCategory): number {
  return SEX_SKILL_TREE
    .filter((n) => n.category === category)
    .reduce((sum, n) => sum + skillLevel(skills, n.name), 0)
}

/** Bonus from skill level for d20 (matches design doc-ish curve). */
export function levelToDiceBonus(level: number): number {
  const lv = clamp(level, 0, 5)
  if (lv <= 0) return 0
  if (lv <= 2) return 1
  if (lv <= 4) return 2
  return 5
}

/**
 * Resolve extra dice bonus from sex skills for a check description/skill label.
 */
export function resolveSexSkillDiceBonus(
  skillOrStat: string | undefined,
  skills: SkillLike[] | null | undefined
): { bonus: number; matchedSkill: string | null } {
  if (!skillOrStat || !skills?.length) return { bonus: 0, matchedSkill: null }
  const key = skillOrStat.toLowerCase().trim()

  // Exact skill name match
  const exact = skills.find((s) => s.name.toLowerCase() === key)
  if (exact && exact.level > 0) {
    let bonus = levelToDiceBonus(exact.level)
    // Capstone: Аура бажання level 5 → crit on 19 handled elsewhere; level ≥3 adds +2 flat to seduction-ish
    if (exact.name === 'Аура бажання' && exact.level >= 3) bonus += 2
    if (exact.name === 'Повна влада' && exact.level >= 5) bonus += 3
    return { bonus: clamp(bonus, 0, 10), matchedSkill: exact.name }
  }

  // Keyword match against tree nodes — take best bonus
  let best = 0
  let matched: string | null = null
  for (const node of SEX_SKILL_TREE) {
    const lv = skillLevel(skills, node.name)
    if (lv <= 0) continue
    const hit = node.diceKeywords.some((kw) => key.includes(kw.toLowerCase()) || kw.toLowerCase().includes(key))
    if (!hit) continue
    let b = levelToDiceBonus(lv)
    if (node.name === 'Аура бажання' && lv >= 3) b += 2
    if (node.name === 'Повна влада' && lv >= 5) b += 3
    if (b > best) {
      best = b
      matched = node.name
    }
  }
  return { bonus: clamp(best, 0, 10), matchedSkill: matched }
}

export function computeSkillModifiers(skills: SkillLike[] | null | undefined): SkillModifierSummary {
  const multiLv = skillLevel(skills, 'Множинне задоволення')
  const tenderLv = skillLevel(skills, 'Ніжний дотик')
  const handsLv = skillLevel(skills, 'Майстерність рук')
  const kissLv = skillLevel(skills, 'Поцілунок вогню')
  const senseLv = skillLevel(skills, 'Чутливість')
  const longLv = skillLevel(skills, 'Тривала насолода')
  const tirelessLv = skillLevel(skills, 'Невтомність')
  const voiceLv = skillLevel(skills, 'Владний голос')
  const subLv = skillLevel(skills, 'Покірність')
  const fullDomLv = skillLevel(skills, 'Повна влада')
  const ritualLv = skillLevel(skills, 'Ритуал насолоди')
  const ecstasyLv = skillLevel(skills, 'Екстаз сили')
  const auraLv = skillLevel(skills, 'Аура бажання')
  const dirtyLv = skillLevel(skills, 'Брудні розмови')
  const handjobLv = skillLevel(skills, 'Дрочка руками')
  const bjLv = skillLevel(skills, 'Мінет')
  const deepLv = skillLevel(skills, 'Глибоке горло')
  const analLv = skillLevel(skills, 'Анал')

  const synergies = computeActiveSynergies(skills)
  const syn = aggregateSynergyEffects(synergies)

  let partnerPleasureBonusPct =
    tenderLv * 2 +
    handsLv * 5 +
    (handsLv >= 5 ? 10 : 0) +
    dirtyLv * 1 +
    handjobLv * 2 +
    bjLv * 3 +
    deepLv * 2 +
    analLv * 2 +
    syn.partnerPleasureBonusPct
  let laraPleasureBonusPct =
    senseLv * 2 + kissLv * 1 + dirtyLv * 1 + analLv * 1 + syn.laraPleasureBonusPct

  let staminaFloor = longLv * 3 + syn.staminaFloorBonus
  if (tirelessLv >= 5) staminaFloor = Math.max(staminaFloor, 15)

  const dominationBias = voiceLv * 5 - subLv * 5
  let dominationFloor: number | null = fullDomLv >= 3 ? 20 : null
  if (syn.dominationFloorBonus > 0) {
    dominationFloor = Math.max(dominationFloor ?? 0, syn.dominationFloorBonus)
  }

  let amuletGainMultiplier = (1 + ecstasyLv * 0.1 + ritualLv * 0.05) * syn.amuletMult
  const amuletGainMin = ecstasyLv >= 5 ? 15 : 0

  const laraOrgasmThreshold = Math.max(70, 100 - (senseLv >= 2 ? 10 : 0) - syn.laraOrgasmThresholdRelief)

  const lines: string[] = []
  for (const node of SEX_SKILL_TREE) {
    const lv = skillLevel(skills, node.name)
    if (lv <= 0) continue
    lines.push(`• ${node.name} Lv${lv}: ${node.effectByLevel}`)
  }
  for (const s of synergies) {
    lines.push(`✦ Синергія «${s.name}»: ${s.description}`)
  }

  const diceHints = SEX_SKILL_TREE
    .map((n) => {
      const lv = skillLevel(skills, n.name)
      if (lv <= 0) return null
      return { skill: n.name, bonus: levelToDiceBonus(lv) }
    })
    .filter(Boolean) as Array<{ skill: string; bonus: number }>

  return {
    lines,
    diceHints,
    multiOrgasmUnlocked: multiLv >= 2,
    multiOrgasmEasyContinue: multiLv >= 4,
    partnerPleasureBonusPct,
    laraPleasureBonusPct,
    staminaFloor,
    dominationBias,
    amuletGainMultiplier,
    amuletGainMin,
    seductionCritOn19: auraLv >= 5,
    dominationFloor,
    laraOrgasmThreshold,
    synergies,
  }
}

/**
 * Mutate merged sex-related fields according to skill tree (server authority).
 * Returns list of applied effect labels for tagLog / client.
 */
export function applySexSkillModifiers(
  merged: {
    pleasure?: { lara?: number; partner?: number } | null
    stamina?: { value?: number; tempo?: string } | null
    domination?: number | null
    multiOrgasm?: {
      chain?: number
      multiplier?: number
      stamina_cost?: number
      can_continue?: boolean
    } | null
    sceneSummary?: Record<string, any> | null
    sexChoices?: any[] | null
    diceRolls?: any[]
  },
  skills: SkillLike[] | null | undefined
): { applied: string[]; modifiers: SkillModifierSummary } {
  const modifiers = computeSkillModifiers(skills)
  const applied: string[] = []

  // Pleasure boosts
  if (merged.pleasure && typeof merged.pleasure === 'object') {
    const p = { ...merged.pleasure }
    const pl = Number(p.lara ?? 0)
    const pp = Number(p.partner ?? 0)
    if (modifiers.laraPleasureBonusPct > 0 && pl > 0) {
      p.lara = clamp(Math.round(pl * (1 + modifiers.laraPleasureBonusPct / 100)), 0, 100)
      applied.push(`Чутливість/поцілунок: +${modifiers.laraPleasureBonusPct}% pleasure Лари`)
    }
    if (modifiers.partnerPleasureBonusPct > 0 && pp > 0) {
      p.partner = clamp(Math.round(pp * (1 + modifiers.partnerPleasureBonusPct / 100)), 0, 100)
      applied.push(`Техніка: +${modifiers.partnerPleasureBonusPct}% pleasure партнера`)
    }
    merged.pleasure = p
  }

  // Stamina floor
  if (merged.stamina && typeof merged.stamina === 'object') {
    const s = { ...merged.stamina }
    const v = Number(s.value ?? 100)
    if (modifiers.staminaFloor > 0 && v < modifiers.staminaFloor) {
      s.value = modifiers.staminaFloor
      applied.push(`Витривалість: stamina floor ${modifiers.staminaFloor}`)
    }
    // Fast tempo drain reduction via tireless — bump value a bit
    const tireless = skillLevel(skills, 'Невтомність')
    if (tireless > 0 && (s.tempo === 'fast' || String(s.tempo).includes('швид'))) {
      s.value = clamp(Number(s.value ?? v) + tireless, 0, 100)
      applied.push(`Невтомність: −drain на швидкому темпі (+${tireless})`)
    }
    merged.stamina = s
  }

  // Domination bias + floor
  if (merged.domination !== null && merged.domination !== undefined) {
    let d = Number(merged.domination) + modifiers.dominationBias
    if (modifiers.dominationFloor !== null) {
      d = Math.max(d, modifiers.dominationFloor)
    }
    const clipped = clamp(d, -100, 100)
    if (clipped !== merged.domination) {
      merged.domination = clipped
      applied.push(`Dom/Sub навички: domination → ${clipped}`)
    }
  }

  // Multi-orgasm gate
  if (merged.multiOrgasm && typeof merged.multiOrgasm === 'object') {
    const mo = { ...merged.multiOrgasm }
    if (!modifiers.multiOrgasmUnlocked) {
      mo.can_continue = false
      applied.push('Множинне задоволення < 2: ланцюг заблоковано')
    } else if (modifiers.multiOrgasmEasyContinue) {
      const stam = Number(merged.stamina?.value ?? 50)
      if (stam >= 25) {
        mo.can_continue = true
        applied.push('Множинне задоволення ≥4: continue при stamina≥25')
      }
    }
    // XP multiplier nudge
    if (modifiers.multiOrgasmUnlocked && mo.multiplier) {
      const multiLv = skillLevel(skills, 'Множинне задоволення')
      mo.multiplier = Number((Number(mo.multiplier) * (1 + multiLv * 0.05)).toFixed(2))
    }
    merged.multiOrgasm = mo
  }

  // Scene summary amulet / skill xp
  if (merged.sceneSummary && typeof merged.sceneSummary === 'object') {
    const sum = { ...merged.sceneSummary }
    if (sum.amulet_gain != null) {
      let gain = Math.round(Number(sum.amulet_gain) * modifiers.amuletGainMultiplier)
      if (modifiers.amuletGainMin > 0) gain = Math.max(gain, modifiers.amuletGainMin)
      if (gain !== Number(sum.amulet_gain)) {
        sum.amulet_gain = gain
        applied.push(`Магія тіла: amulet_gain → ${gain}`)
      }
    }
    // Extra skill XP if summary names a skill
    if (sum.skill_name && sum.skill_xp) {
      const lv = skillLevel(skills, String(sum.skill_name))
      // no change required — just note
      if (lv >= 3) {
        sum.skill_xp = Math.round(Number(sum.skill_xp) * 1.15)
        applied.push(`Майстерність: +15% skill XP (${sum.skill_name})`)
      }
    }
    merged.sceneSummary = sum
  }

  // Risk choices: ensure bondage skill unlocks risk visibility (client already shows risk flag)
  if (merged.sexChoices?.length && skillLevel(skills, "Зв'язування") >= 2) {
    applied.push("Зв'язування ≥2: risk-опції дозволені")
  }

  return { applied, modifiers }
}

/** Prompt block: only active skills with mechanical lines. */
export function formatActiveSkillEffectsForPrompt(skills: SkillLike[] | null | undefined): string {
  const m = computeSkillModifiers(skills)
  if (m.lines.length === 0) {
    return 'Секс-навички: усі на 0 — Лара недосвідчена (−1 до секс-кидків наративно).'
  }
  const gates = [
    m.multiOrgasmUnlocked ? '✓ Multi-orgasm розблоковано' : '✗ Multi-orgasm заблоковано (потрібно «Множинне задоволення» ≥2)',
    m.seductionCritOn19 ? '✓ Крит зваблення на 19–20' : null,
    m.partnerPleasureBonusPct ? `Partner pleasure +${m.partnerPleasureBonusPct}%` : null,
    m.laraPleasureBonusPct ? `Lara pleasure +${m.laraPleasureBonusPct}%` : null,
    m.staminaFloor ? `Stamina floor ${m.staminaFloor}` : null,
    m.dominationBias ? `Domination bias ${m.dominationBias > 0 ? '+' : ''}${m.dominationBias}` : null,
    m.laraOrgasmThreshold < 100 ? `Порог оргазму Лари: ${m.laraOrgasmThreshold}` : null,
    m.synergies.length ? `Синергії: ${m.synergies.map((s) => s.name).join(', ')}` : null,
  ].filter(Boolean)

  return [
    '=== АКТИВНІ ЕФЕКТИ СЕКС-НАВИЧОК (ОБОВʼЯЗКОВО ВРАХОВУЙ) ===',
    ...m.lines,
    'Зведення:',
    ...gates.map((g) => `- ${g}`),
    'SEX_CHOICES: risk/бондаж лише якщо навички дозволяють (сервер відфільтрує). Краще пропонуй ходи з дерева.',
    'При d20 у сексі вказуй skill назвою навички або ключовим словом — сервер додасть бонус.',
    'Завжди видавай SKILL_UPDATE XP за релевантні дії (5–25).',
  ].join('\n')
}

export function isSkillUnlockedInTree(
  node: SexSkillNode,
  skills: SkillLike[] | null | undefined
): boolean {
  if (!node.parentName) return true
  return skillLevel(skills, node.parentName) >= 1
}
