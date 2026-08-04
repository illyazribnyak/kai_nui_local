import { clamp } from '@/lib/game/json'
import { resolveSexSkillDiceBonus, type SkillLike } from '@/lib/game/skill-effects'
import { computeSkillModifiers } from '@/lib/game/skill-effects'

const STAT_MAP: Record<string, string> = {
  сила: 'strength',
  strength: 'strength',
  спритність: 'agility',
  agility: 'agility',
  витривалість: 'endurance',
  endurance: 'endurance',
  харизма: 'charisma',
  charisma: 'charisma',
  воля: 'willpower',
  willpower: 'willpower',
}

export interface DiceInput {
  skill?: string
  stat?: string
  dc?: number
  bonus?: number
  description?: string
  /** If AI already rolled — we re-roll server-side for fairness unless keepRoll */
  roll?: number
  total?: number
  result?: string
  keepRoll?: boolean
}

export interface ResolvedDice {
  skill: string
  description: string
  dc: number
  bonus: number
  roll: number
  total: number
  result: 'critical_success' | 'success' | 'failure' | 'critical_failure'
  skillBonus?: number
  matchedSkill?: string | null
}

function resolveStatBonus(
  gameState: Record<string, any> | null,
  skillOrStat?: string
): number {
  if (!skillOrStat || !gameState) return 0
  const key = STAT_MAP[skillOrStat.toLowerCase().trim()]
  if (key && typeof gameState[key] === 'number') {
    // Convert 1-20 style stat to d20 bonus-ish: (stat - 5) clamped
    return clamp((gameState[key] as number) - 5, -2, 10)
  }
  return 0
}

/** Re-roll dice on the server so outcomes are fair and consistent. */
export function resolveDiceRolls(
  rolls: DiceInput[],
  gameState: Record<string, any> | null,
  skills?: SkillLike[] | null
): ResolvedDice[] {
  const mods = computeSkillModifiers(skills)

  return (rolls ?? []).map((r) => {
    const skill = r.skill || r.stat || 'перевірка'
    const dc = clamp(Number(r.dc) || 12, 1, 30)

    const skillPart = resolveSexSkillDiceBonus(skill, skills)
    // Also match against description keywords
    const descPart = r.description
      ? resolveSexSkillDiceBonus(r.description, skills)
      : { bonus: 0, matchedSkill: null }
    const skillBonus = Math.max(skillPart.bonus, descPart.bonus)
    const matchedSkill = skillPart.bonus >= descPart.bonus ? skillPart.matchedSkill : descPart.matchedSkill

    let bonus = Number(r.bonus)
    if (Number.isNaN(bonus)) {
      bonus = resolveStatBonus(gameState, skill) + skillBonus
    } else {
      // AI provided a bonus — still add sex-skill bonus on top (capped)
      bonus = bonus + skillBonus
    }
    bonus = clamp(bonus, -5, 18)

    let roll: number
    if (r.keepRoll && r.roll !== undefined) {
      roll = clamp(Number(r.roll) || 1, 1, 20)
    } else {
      roll = Math.floor(Math.random() * 20) + 1
    }

    const total = roll + bonus
    let result: ResolvedDice['result']
    // Аура бажання Lv5: crit success on natural 19–20 for seduction-ish checks
    const seductionCrit =
      mods.seductionCritOn19 &&
      (matchedSkill === 'Аура бажання' ||
        /зваб|харизм|спокус|флірт/i.test(`${skill} ${r.description || ''}`))

    if (roll === 20 || (seductionCrit && roll >= 19)) result = 'critical_success'
    else if (roll === 1) result = 'critical_failure'
    else if (total >= dc) result = 'success'
    else result = 'failure'

    return {
      skill,
      description: r.description || skill,
      dc,
      bonus,
      roll,
      total,
      result,
      skillBonus,
      matchedSkill,
    }
  })
}
