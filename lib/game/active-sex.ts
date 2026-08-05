/**
 * Persist / restore active sex-scene UI state (survives page reload).
 */

export type ActiveSexState = {
  sexScene: {
    type: string
    partner?: string
    phase?: string
    atmosphere?: string | null
    context_bonuses?: Array<{ source: string; value: string }>
    [key: string]: unknown
  }
  pleasure?: { lara: number; partner: number }
  phase?: { phase: string; label?: string } | null
  stamina?: { value: number; tempo?: string } | null
  domination?: number
  penisStats?: Record<string, unknown> | null
  sexChoices?: Array<{ text: string; bonus?: string; risk?: boolean; skillMoveId?: string }>
  updatedAt?: string
}

export function parseActiveSexJson(raw?: string | null): ActiveSexState | null {
  if (!raw || !String(raw).trim()) return null
  try {
    const data = JSON.parse(String(raw))
    if (!data?.sexScene || typeof data.sexScene !== 'object') return null
    if (!data.sexScene.type && !data.sexScene.partner) return null
    // ensure type for applySexSceneStart
    if (!data.sexScene.type) data.sexScene.type = 'voluntary'
    return data as ActiveSexState
  } catch {
    return null
  }
}

export function serializeActiveSex(state: ActiveSexState | null): string {
  if (!state?.sexScene) return ''
  return JSON.stringify({
    ...state,
    updatedAt: new Date().toISOString(),
  })
}

/**
 * Merge turn updates into previous active sex snapshot.
 * Clears when scene ends (sceneSummary present).
 */
export function mergeActiveSexState(
  previous: ActiveSexState | null,
  turn: {
    sexScene?: any
    pleasure?: any
    phase?: any
    stamina?: any
    domination?: number | null
    penisStats?: any
    sexChoices?: any
    sceneSummary?: any
  }
): ActiveSexState | null {
  if (turn.sceneSummary) return null

  const sexScene = turn.sexScene || previous?.sexScene
  if (!sexScene) return previous

  return {
    sexScene: {
      type: String(sexScene.type || previous?.sexScene?.type || 'voluntary'),
      partner: sexScene.partner ?? previous?.sexScene?.partner,
      phase: sexScene.phase ?? previous?.sexScene?.phase ?? turn.phase?.phase,
      atmosphere: sexScene.atmosphere ?? previous?.sexScene?.atmosphere ?? null,
      context_bonuses: sexScene.context_bonuses ?? previous?.sexScene?.context_bonuses,
      ...sexScene,
    },
    pleasure: turn.pleasure
      ? {
          lara: Number(turn.pleasure.lara ?? 0),
          partner: Number(turn.pleasure.partner ?? 0),
        }
      : previous?.pleasure || { lara: 0, partner: 0 },
    phase: turn.phase
      ? { phase: String(turn.phase.phase || 'foreplay'), label: turn.phase.label }
      : previous?.phase || {
          phase: String(sexScene.phase || 'foreplay'),
          label: 'Прелюдія',
        },
    stamina: turn.stamina
      ? {
          value: Number(turn.stamina.value ?? 100),
          tempo: turn.stamina.tempo,
        }
      : previous?.stamina || { value: 100, tempo: 'medium' },
    domination:
      turn.domination !== null && turn.domination !== undefined
        ? Number(turn.domination)
        : previous?.domination ?? 0,
    penisStats: turn.penisStats || previous?.penisStats || null,
    sexChoices: Array.isArray(turn.sexChoices)
      ? turn.sexChoices
      : previous?.sexChoices || [],
  }
}
