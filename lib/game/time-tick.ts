import { clamp } from '@/lib/game/json'
import { VALID_TIMES } from '@/lib/game/constants'

const PHASES = ['morning', 'day', 'evening', 'night'] as const
/** Actions per time-of-day phase before advancing. */
export const ACTIONS_PER_PHASE = 3

export type TimeTickResult = {
  stat: Record<string, any>
  phaseAdvanced: boolean
  newDay: boolean
  turnCount: number
}

/**
 * Server-authoritative turn clock: every action increments turnCount;
 * every ACTIONS_PER_PHASE actions advances timeOfDay; night→morning bumps dayNumber.
 * Hunger/thirst always get a floor tick if AI omitted them (via survival) — this only handles time.
 */
export function applyServerTimeTick(
  stat: Record<string, any>,
  gameState: {
    turnCount?: number | null
    timeOfDay?: string | null
    dayNumber?: number | null
  } | null
): TimeTickResult {
  const turnCount = (gameState?.turnCount ?? 0) + 1
  const next: Record<string, any> = { ...stat, turnCount }

  let phaseAdvanced = false
  let newDay = false

  if (turnCount > 0 && turnCount % ACTIONS_PER_PHASE === 0) {
    const currentRaw = (stat.timeOfDay || gameState?.timeOfDay || 'day') as string
    let idx = PHASES.indexOf(currentRaw as (typeof PHASES)[number])
    if (idx < 0) idx = 1 // default day
    const nextIdx = (idx + 1) % PHASES.length
    next.timeOfDay = PHASES[nextIdx]
    phaseAdvanced = true

    if (PHASES[nextIdx] === 'morning' && PHASES[idx] === 'night') {
      const day = Number(stat.dayNumber ?? gameState?.dayNumber ?? 1)
      next.dayNumber = day + 1
      newDay = true
    }
  } else if (stat.timeOfDay !== undefined) {
    // AI may still set timeOfDay mid-phase; accept only valid values
    if (!(VALID_TIMES as readonly string[]).includes(stat.timeOfDay)) {
      delete next.timeOfDay
    }
  }

  // Soft hunger/thirst floor if values look stale (AI set same as before without increase)
  // Survival defaults already handled separately.

  return { stat: next, phaseAdvanced, newDay, turnCount }
}

/** Extra hunger/thirst on new day morning. */
export function applyNewDaySurvival(stat: Record<string, any>): Record<string, any> {
  const next = { ...stat }
  if (next.hunger !== undefined) next.hunger = clamp(Number(next.hunger) + 5, 0, 100)
  if (next.thirst !== undefined) next.thirst = clamp(Number(next.thirst) + 8, 0, 100)
  return next
}
