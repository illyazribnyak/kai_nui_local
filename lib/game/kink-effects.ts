/**
 * Server-side kink XP, levels, and mechanical modifiers.
 */

import { clamp } from '@/lib/game/json'
import {
  KINK_CATALOG,
  detectKinkKeysFromText,
  findKinkDef,
  mapFetishNameToKey,
} from '@/lib/game/kink-catalog'
import type { SkillLike } from '@/lib/game/skill-effects'
import { skillLevel } from '@/lib/game/skill-effects'

export interface KinkLike {
  key: string
  name: string
  level: number
  xp: number
  maxXp?: number
  discovered?: boolean
  icon?: string
  description?: string
}

export interface KinkModifierSummary {
  pregnancyRiskMult: number
  partnerPleasureBonusPct: number
  laraPleasureBonusPct: number
  amuletGainMult: number
  dominationFloorBonus: number
  shameRelief: number
  sizeDcRelief: number
  lines: string[]
  activeKeys: string[]
}

export function kinkLevel(kinks: KinkLike[] | null | undefined, key: string): number {
  const k = kinks?.find((x) => x.key === key)
  if (!k || !k.discovered) return 0
  return clamp(Number(k.level) || 0, 0, 5)
}

export function computeKinkModifiers(
  kinks: KinkLike[] | null | undefined
): KinkModifierSummary {
  const lines: string[] = []
  const activeKeys: string[] = []
  let pregnancyRiskMult = 1
  let partnerPleasureBonusPct = 0
  let laraPleasureBonusPct = 0
  let amuletGainMult = 1
  let dominationFloorBonus = 0
  let shameRelief = 0
  let sizeDcRelief = 0

  for (const def of KINK_CATALOG) {
    const lv = kinkLevel(kinks, def.key)
    if (lv <= 0) continue
    activeKeys.push(def.key)
    lines.push(`🎭 ${def.name} Lv${lv}: ${def.effectByLevel}`)

    if (def.key === 'breeding') pregnancyRiskMult *= 1 + 0.12 * lv
    if (def.key === 'creampie') {
      partnerPleasureBonusPct += 3 * lv
      amuletGainMult *= 1 + 0.03 * lv
    }
    if (def.key === 'public') shameRelief += 2 * lv
    if (def.key === 'size') {
      sizeDcRelief += lv
      partnerPleasureBonusPct += 2 * lv
    }
    if (def.key === 'monster') partnerPleasureBonusPct += 2 * lv
    if (def.key === 'marking') shameRelief += lv
    if (def.key === 'praise') laraPleasureBonusPct += 2 * lv
    if (def.key === 'degrade') {
      partnerPleasureBonusPct += lv
      dominationFloorBonus += lv
    }
    if (def.key === 'cumplay') {
      partnerPleasureBonusPct += lv
      amuletGainMult *= 1 + 0.02 * lv
    }
    if (def.key === 'control') dominationFloorBonus += 2 * lv
    if (def.key === 'service') laraPleasureBonusPct += 2 * lv
    if (def.key === 'ritual') amuletGainMult *= 1 + 0.08 * lv
  }

  return {
    pregnancyRiskMult,
    partnerPleasureBonusPct,
    laraPleasureBonusPct,
    amuletGainMult,
    dominationFloorBonus,
    shameRelief,
    sizeDcRelief,
    lines,
    activeKeys,
  }
}

/** Extra kink XP when related skills are high / just used */
export function relatedSkillXpBonus(
  kinkKey: string,
  skills: SkillLike[] | null | undefined
): number {
  const def = findKinkDef(kinkKey)
  if (!def) return 0
  let bonus = 0
  for (const name of def.relatedSkills) {
    const lv = skillLevel(skills, name)
    if (lv >= 1) bonus += 2
    if (lv >= 3) bonus += 3
  }
  return bonus
}

export function applyKinkXpLocal(
  kink: KinkLike,
  baseXp: number
): { level: number; xp: number; maxXp: number; leveled: boolean; discovered: boolean } {
  const maxXpByLevel = [100, 140, 200, 280, 400]
  let level = clamp(kink.level || 0, 0, 5)
  let xp = (kink.xp || 0) + Math.max(1, baseXp)
  let maxXp = kink.maxXp || maxXpByLevel[Math.min(level, 4)] || 100
  let leveled = false
  const discovered = true

  if (level <= 0) {
    level = 1
    leveled = true
    xp = Math.max(0, xp - 20) // first discover grants level 1
  }

  while (level < 5 && xp >= maxXp) {
    xp -= maxXp
    level++
    leveled = true
    maxXp = maxXpByLevel[Math.min(level, 4)] ?? 400
  }
  if (level >= 5) {
    level = 5
    xp = 0
    maxXp = 400
  }
  return { level, xp, maxXp, leveled, discovered }
}

export interface KinkTriggerResult {
  key: string
  name: string
  icon: string
  xp: number
  fromLevel: number
  toLevel: number
  newlyDiscovered: boolean
  leveled: boolean
}

/**
 * Pure: compute which kinks fire from narrative + explicit triggers + fetish name.
 */
export function planKinkTriggers(opts: {
  narrativeText?: string
  explicitKeys?: Array<{ key: string; xp?: number }>
  fetishName?: string | null
  skills?: SkillLike[] | null
}): Array<{ key: string; xp: number; source: string }> {
  const out: Array<{ key: string; xp: number; source: string }> = []
  const seen = new Set<string>()

  const add = (key: string, xp: number, source: string) => {
    if (!findKinkDef(key) || seen.has(key)) return
    seen.add(key)
    const bonus = relatedSkillXpBonus(key, opts.skills)
    out.push({ key, xp: xp + bonus, source })
  }

  for (const e of opts.explicitKeys || []) {
    add(e.key, e.xp ?? 12, 'tag')
  }
  if (opts.fetishName) {
    const k = mapFetishNameToKey(opts.fetishName)
    if (k) add(k, 15, 'fetish')
  }
  for (const key of detectKinkKeysFromText(opts.narrativeText || '')) {
    add(key, 8, 'text')
  }
  return out
}
