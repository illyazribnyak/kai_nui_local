/**
 * Cross-branch synergies for the sex skill tree.
 */

import {
  categoryLevels,
  skillLevel,
  type SkillLike,
} from '@/lib/game/skill-effects'
import { SEX_SKILL_TREE } from '@/lib/game/sex-skill-tree'

export interface SkillSynergy {
  id: string
  name: string
  icon: string
  description: string
  /** Human condition text for UI */
  condition: string
  active: (skills: SkillLike[] | null | undefined) => boolean
  effects: {
    partnerPleasureBonusPct?: number
    laraPleasureBonusPct?: number
    /** Lower Lara orgasm threshold (e.g. 10 → 90 instead of 100) */
    laraOrgasmThresholdRelief?: number
    amuletMult?: number
    dominationFloorBonus?: number
    staminaFloorBonus?: number
  }
}

export const SEX_SYNERGIES: SkillSynergy[] = [
  {
    id: 'sweet_power',
    name: 'Солодка влада',
    icon: '👑💋',
    description: 'Домінування + техніка: накази з ласками бʼють сильніше',
    condition: 'Домінування ≥2 і Техніка ≥2 (сума рівнів гілок)',
    active: (s) => categoryLevels(s, 'domination') >= 2 && categoryLevels(s, 'technique') >= 2,
    effects: { partnerPleasureBonusPct: 10 },
  },
  {
    id: 'devoted_sense',
    name: 'Віддана чутливість',
    icon: '🦋💗',
    description: 'Підкорення + чутливість: легший оргазм Лари',
    condition: 'Підкорення ≥2 і «Чутливість» ≥2',
    active: (s) => categoryLevels(s, 'submission') >= 2 && skillLevel(s, 'Чутливість') >= 2,
    effects: { laraPleasureBonusPct: 8, laraOrgasmThresholdRelief: 10 },
  },
  {
    id: 'ritual_flow',
    name: 'Ритуал потоку',
    icon: '🔮🔥',
    description: 'Магія тіла + витривалість: сильніший заряд амулета',
    condition: 'Магія тіла ≥2 і Витривалість ≥1',
    active: (s) => categoryLevels(s, 'body_magic') >= 2 && categoryLevels(s, 'endurance') >= 1,
    effects: { amuletMult: 1.25, staminaFloorBonus: 5 },
  },
  {
    id: 'aura_control',
    name: 'Аура контролю',
    icon: '✨🗣️',
    description: 'Аура бажання + владний голос: підлога domination',
    condition: '«Аура бажання» ≥3 і «Владний голос» ≥2',
    active: (s) => skillLevel(s, 'Аура бажання') >= 3 && skillLevel(s, 'Владний голос') >= 2,
    effects: { dominationFloorBonus: 10, partnerPleasureBonusPct: 5 },
  },
  {
    id: 'whisper_bind',
    name: 'Шепіт і вузол',
    icon: '💬⛓️',
    description: 'Зваблення словами + бондаж: risk-ходи стабільніші',
    condition: '«Солодкі слова» ≥2 і «Зв\'язування» ≥2',
    active: (s) => skillLevel(s, 'Солодкі слова') >= 2 && skillLevel(s, "Зв'язування") >= 2,
    effects: { partnerPleasureBonusPct: 6, laraPleasureBonusPct: 4 },
  },
]

export interface ActiveSynergy {
  id: string
  name: string
  icon: string
  description: string
  condition: string
  effects: SkillSynergy['effects']
}

export function computeActiveSynergies(
  skills: SkillLike[] | null | undefined
): ActiveSynergy[] {
  return SEX_SYNERGIES.filter((s) => s.active(skills)).map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    description: s.description,
    condition: s.condition,
    effects: s.effects,
  }))
}

export function aggregateSynergyEffects(active: ActiveSynergy[]) {
  return active.reduce(
    (acc, s) => {
      acc.partnerPleasureBonusPct += s.effects.partnerPleasureBonusPct ?? 0
      acc.laraPleasureBonusPct += s.effects.laraPleasureBonusPct ?? 0
      acc.laraOrgasmThresholdRelief = Math.max(
        acc.laraOrgasmThresholdRelief,
        s.effects.laraOrgasmThresholdRelief ?? 0
      )
      acc.amuletMult *= s.effects.amuletMult ?? 1
      acc.dominationFloorBonus += s.effects.dominationFloorBonus ?? 0
      acc.staminaFloorBonus += s.effects.staminaFloorBonus ?? 0
      return acc
    },
    {
      partnerPleasureBonusPct: 0,
      laraPleasureBonusPct: 0,
      laraOrgasmThresholdRelief: 0,
      amuletMult: 1,
      dominationFloorBonus: 0,
      staminaFloorBonus: 0,
    }
  )
}

/** Skills that just crossed 0→1+ (new tree nodes playable). */
export function detectNewlyLeveledSkills(
  before: SkillLike[] | null | undefined,
  after: SkillLike[] | null | undefined
): Array<{ name: string; from: number; to: number }> {
  const prev = new Map((before ?? []).map((s) => [s.name, s.level]))
  const out: Array<{ name: string; from: number; to: number }> = []
  for (const s of after ?? []) {
    const from = prev.get(s.name) ?? 0
    const to = s.level ?? 0
    if (to > from) out.push({ name: s.name, from, to })
  }
  return out
}

/** Tree nodes whose parent just became available (parent reached Lv≥1). */
export function detectNewlyUnlockedNodes(
  before: SkillLike[] | null | undefined,
  after: SkillLike[] | null | undefined
): string[] {
  const unlocked: string[] = []
  for (const node of SEX_SKILL_TREE) {
    if (!node.parentName) continue
    const parentBefore = skillLevel(before, node.parentName)
    const parentAfter = skillLevel(after, node.parentName)
    if (parentBefore < 1 && parentAfter >= 1) {
      unlocked.push(node.name)
    }
  }
  return unlocked
}

/** Synergies that turned on this turn. */
export function detectNewSynergies(
  before: SkillLike[] | null | undefined,
  after: SkillLike[] | null | undefined
): ActiveSynergy[] {
  const prevIds = new Set(computeActiveSynergies(before).map((s) => s.id))
  return computeActiveSynergies(after).filter((s) => !prevIds.has(s.id))
}
