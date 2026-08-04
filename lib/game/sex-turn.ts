/**
 * Server-authoritative sex turn resolution (skill moves + meters).
 */

import { clamp } from '@/lib/game/json'
import {
  computeSkillModifiers,
  skillLevel,
  type SkillLike,
} from '@/lib/game/skill-effects'
import {
  findSexMove,
  listAvailableSexMoves,
  phaseKey,
  tempoKey,
  type SexMove,
} from '@/lib/game/sex-moves'

export interface SexTurnStateIn {
  pleasure: { lara: number; partner: number }
  stamina: number
  phase: string
  domination: number
  tempo: string
  amuletEnergy?: number
  partnerName?: string
  orgasmChain?: number
}

export interface SexTurnXpGrant {
  name: string
  xp: number
}

export interface SexTurnResult {
  ok: true
  move: { id: string; label: string; skillName: string; icon: string }
  pleasure: { lara: number; partner: number }
  pleasureDelta: { lara: number; partner: number }
  stamina: number
  staminaCost: number
  phase: 'foreplay' | 'main' | 'climax'
  phaseLabel: string
  phaseChanged: boolean
  domination: number
  xpGrants: SexTurnXpGrant[]
  events: string[]
  laraOrgasm: boolean
  partnerOrgasm: boolean
  multiOrgasm: null | {
    chain: number
    multiplier: number
    stamina_cost: number
    can_continue: boolean
  }
  amuletGain: number
  narrativeHint: string
  playerMessage: string
  availableMoves: Array<{
    id: string
    label: string
    icon: string
    unlocked: boolean
    reason?: string
    skillName: string
    description: string
  }>
  applied: string[]
}

export type SexTurnError = { ok: false; error: string; code: string }

const PHASE_LABEL: Record<'foreplay' | 'main' | 'climax', string> = {
  foreplay: 'Прелюдія',
  main: 'Основна дія',
  climax: 'Кульмінація',
}

function tempoMult(tempo: 'slow' | 'medium' | 'fast'): number {
  if (tempo === 'slow') return 0.75
  if (tempo === 'fast') return 1.35
  return 1
}

function phaseMult(phase: 'foreplay' | 'main' | 'climax'): number {
  if (phase === 'foreplay') return 0.85
  if (phase === 'climax') return 1.35
  return 1
}

function inferPhase(
  lara: number,
  partner: number,
  current: 'foreplay' | 'main' | 'climax',
  skills: SkillLike[] | null | undefined
): 'foreplay' | 'main' | 'climax' {
  // Capstone: Майстерність рук Lv5 → main earlier
  const hands = skillLevel(skills, 'Майстерність рук')
  const mainAt = hands >= 5 ? 30 : 40
  const climaxAt = 80

  const peak = Math.max(lara, partner)
  let next = current
  if (peak >= climaxAt || (lara >= 75 && partner >= 75)) next = 'climax'
  else if (partner >= mainAt || lara >= mainAt + 10) next = 'main'
  // never go backwards
  const order = { foreplay: 0, main: 1, climax: 2 }
  if (order[next] < order[current]) return current
  return next
}

/**
 * Pure resolution of one skill-move turn.
 */
export function resolveSexTurn(
  moveId: string,
  state: SexTurnStateIn,
  skills: SkillLike[] | null | undefined
): SexTurnResult | SexTurnError {
  const move = findSexMove(moveId)
  if (!move) return { ok: false, error: 'Невідомий хід', code: 'UNKNOWN_MOVE' }

  const mods = computeSkillModifiers(skills)
  const tempo = tempoKey(state.tempo)
  const phaseBefore = phaseKey(state.phase)

  const availability = listAvailableSexMoves(skills, {
    phase: phaseBefore,
    multiUnlocked: mods.multiOrgasmUnlocked,
    amuletEnergy: state.amuletEnergy ?? 0,
  })
  const slot = availability.find((a) => a.move.id === moveId)
  if (!slot?.unlocked) {
    return {
      ok: false,
      error: slot?.reason ?? 'Хід недоступний',
      code: 'LOCKED',
    }
  }

  const cost = move.staminaCost[tempo]
  // Tireless reduces fast cost
  const tireless = skillLevel(skills, 'Невтомність')
  const adjustedCost =
    tempo === 'fast' && tireless > 0 ? Math.max(1, cost - tireless) : cost

  let stamina = Number(state.stamina ?? 100)
  if (stamina < adjustedCost && stamina <= mods.staminaFloor) {
    return { ok: false, error: 'Недостатньо стаміни', code: 'NO_STAMINA' }
  }

  const tMult = tempoMult(tempo)
  const pMult = phaseMult(phaseBefore)

  let dPartner =
    move.pleasure.partner *
    (1 + mods.partnerPleasureBonusPct / 100) *
    tMult *
    pMult
  let dLara =
    move.pleasure.lara *
    (1 + mods.laraPleasureBonusPct / 100) *
    tMult *
    pMult

  // Skill level scales the move a bit
  const lv = skillLevel(skills, move.skillName)
  const lvScale = 1 + lv * 0.04
  dPartner *= lvScale
  dLara *= lvScale

  // Dom/sub category flavor
  if (move.category === 'submission') dLara *= 1.1
  if (move.category === 'technique') dPartner *= 1.05

  dPartner = Math.round(dPartner)
  dLara = Math.round(dLara)

  const lara0 = clamp(Number(state.pleasure?.lara ?? 0), 0, 100)
  const partner0 = clamp(Number(state.pleasure?.partner ?? 0), 0, 100)
  let lara = clamp(lara0 + dLara, 0, 100)
  let partner = clamp(partner0 + dPartner, 0, 100)

  stamina = stamina - adjustedCost
  if (stamina < mods.staminaFloor) stamina = mods.staminaFloor
  stamina = clamp(stamina, 0, 100)

  let domination = Number(state.domination ?? 0) + (move.dominationDelta ?? 0)
  // Passive bias from skills (small, once per turn)
  domination += Math.round(mods.dominationBias * 0.15)
  if (mods.dominationFloor != null) domination = Math.max(domination, mods.dominationFloor)
  domination = clamp(domination, -100, 100)

  const phase = inferPhase(lara, partner, phaseBefore, skills)
  const phaseChanged = phase !== phaseBefore

  const events: string[] = []
  const applied: string[] = [
    `${move.label}: partner +${dPartner}, lara +${dLara}, stamina −${adjustedCost}`,
  ]
  if (phaseChanged) {
    events.push(`phase:${phase}`)
    applied.push(`Фаза → ${PHASE_LABEL[phase]}`)
  }

  let laraOrgasm = false
  let partnerOrgasm = false
  let multiOrgasm: SexTurnResult['multiOrgasm'] = null
  let amuletGain = 0
  let chain = Number(state.orgasmChain ?? 0)

  // Orgasm thresholds (skills + synergies)
  const laraThreshold = mods.laraOrgasmThreshold ?? 100
  if (lara >= laraThreshold) {
    laraOrgasm = true
    events.push('orgasm:lara')
    lara = clamp(lara - 35, 20, 100)
    // Amulet from body magic
    const baseGain = 10 + skillLevel(skills, 'Ритуал насолоди') * 1
    amuletGain = Math.round(baseGain * mods.amuletGainMultiplier)
    if (mods.amuletGainMin > 0) amuletGain = Math.max(amuletGain, mods.amuletGainMin)
    if (move.id === 'mag_ecstasy') {
      amuletGain = Math.round(amuletGain * 1.5)
    }
    applied.push(`Оргазм Лари, amulet +${amuletGain}`)
  }
  if (partner >= 100) {
    partnerOrgasm = true
    events.push('orgasm:partner')
    partner = clamp(partner - 40, 15, 100)
    applied.push('Оргазм партнера')
  }

  // Multi attempt
  if (move.requiresMulti || (laraOrgasm && move.id === 'end_multi')) {
    if (!mods.multiOrgasmUnlocked) {
      events.push('multi:blocked')
    } else {
      chain = Math.max(1, chain) + (laraOrgasm ? 1 : 0)
      const stamCost = 25 + chain * 5
      const canContinue =
        mods.multiOrgasmEasyContinue ? stamina >= 25 : stamina >= stamCost
      multiOrgasm = {
        chain,
        multiplier: Number((1.4 + chain * 0.2).toFixed(2)),
        stamina_cost: stamCost,
        can_continue: canContinue,
      }
      events.push(`multi:chain_${chain}`)
      applied.push(`Multi-orgasm chain x${chain}`)
    }
  }

  const xpGrants: SexTurnXpGrant[] = [{ name: move.skillName, xp: move.xp }]
  // Small passive XP for holding phase
  if (phase === 'main' || phase === 'climax') {
    const endName = 'Тривала насолода'
    if (skillLevel(skills, endName) >= 0 && move.skillName !== endName) {
      xpGrants.push({ name: endName, xp: 4 })
    }
  }

  const narrativeHint = [
    `МЕТРИКИ (сервер, не змінюй цифри):`,
    `Фаза: ${PHASE_LABEL[phase]}${phaseChanged ? ' (зміна)' : ''}`,
    `Задоволення Лари: ${lara}% (Δ+${dLara})`,
    `Задоволення партнера${state.partnerName ? ` (${state.partnerName})` : ''}: ${partner}% (Δ+${dPartner})`,
    `Стаміна: ${stamina}% (витрата ${adjustedCost}, темп ${tempo})`,
    `Domination: ${domination}`,
    laraOrgasm ? 'Подія: оргазм Лари' : null,
    partnerOrgasm ? 'Подія: оргазм партнера' : null,
    multiOrgasm ? `Multi chain ${multiOrgasm.chain}` : null,
    amuletGain ? `Амулет +${amuletGain}` : null,
    `Хід навички: ${move.skillName} — опиши сцену українською, 18+, без суперечності метрикам.`,
  ]
    .filter(Boolean)
    .join('\n')

  const availableMoves = listAvailableSexMoves(skills, {
    phase,
    multiUnlocked: mods.multiOrgasmUnlocked,
    amuletEnergy: (state.amuletEnergy ?? 0) + amuletGain,
  }).map((a) => ({
    id: a.move.id,
    label: a.move.label,
    icon: a.move.icon,
    unlocked: a.unlocked,
    reason: a.reason,
    skillName: a.move.skillName,
    description: a.move.description,
  }))

  return {
    ok: true,
    move: {
      id: move.id,
      label: move.label,
      skillName: move.skillName,
      icon: move.icon,
    },
    pleasure: { lara, partner },
    pleasureDelta: { lara: dLara, partner: dPartner },
    stamina,
    staminaCost: adjustedCost,
    phase,
    phaseLabel: PHASE_LABEL[phase],
    phaseChanged,
    domination,
    xpGrants,
    events,
    laraOrgasm,
    partnerOrgasm,
    multiOrgasm,
    amuletGain,
    narrativeHint,
    playerMessage: move.playerPrompt,
    availableMoves,
    applied,
  }
}

export function buildSexMoveChatMessage(result: SexTurnResult): string {
  return [
    `[Хід навички: ${result.move.icon} ${result.move.label}]`,
    result.playerMessage,
    '',
    result.narrativeHint,
  ].join('\n')
}
