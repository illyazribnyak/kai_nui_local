/**
 * Skill-gated SEX_CHOICES: filter AI risk options + inject guaranteed skill choices.
 */

import { listAvailableSexMoves, phaseKey } from '@/lib/game/sex-moves'
import { computeSkillModifiers, skillLevel, type SkillLike } from '@/lib/game/skill-effects'
import type { SexChoiceOption } from '@/lib/game/sex-types'

const RISK_RE =
  /ризик|бондаж|зв.?яз|укус|біль|удар|душ|force|rough|spank|whip|ремін|насиль|удерж|ризик|анал|deepthroat|глибок/i

const BONDAGE_RE = /бондаж|зв.?яз|мотуз|ремін|наруч|bondage|tie/i
const ANAL_RE = /анал|anal|попк|задн/i
const DEEP_RE = /глибок.?горл|deepthroat|deep throat/i

export interface GatedSexChoice extends SexChoiceOption {
  skillMoveId?: string
  gated?: boolean
  gateReason?: string
}

export interface SexChoicesGateResult {
  choices: GatedSexChoice[]
  applied: string[]
  removedRisk: number
  injected: number
}

function normalizeText(t: string): string {
  return t.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Filter AI sex choices by skill gates and prepend guaranteed skill-linked choices.
 */
export function filterAndEnrichSexChoices(
  aiChoices: SexChoiceOption[] | null | undefined,
  skills: SkillLike[] | null | undefined,
  opts: {
    phase?: string | null
    amuletEnergy?: number
    maxTotal?: number
  } = {}
): SexChoicesGateResult {
  const applied: string[] = []
  const mods = computeSkillModifiers(skills)
  const bondageOk = skillLevel(skills, "Зв'язування") >= 2
  const anyDom = skillLevel(skills, 'Владний голос') >= 1 || skillLevel(skills, 'Повна влада') >= 1
  const multiOk = mods.multiOrgasmUnlocked
  const analOk = skillLevel(skills, 'Анал') >= 2
  const deepOk = skillLevel(skills, 'Глибоке горло') >= 1

  const phase = phaseKey(opts.phase)
  const moves = listAvailableSexMoves(skills, {
    phase,
    multiUnlocked: multiOk,
    amuletEnergy: opts.amuletEnergy ?? 0,
  })

  // Guaranteed choices from unlocked skill moves (top 3)
  const guaranteed: GatedSexChoice[] = moves
    .filter((m) => m.unlocked)
    .slice(0, 3)
    .map((m) => ({
      text: `${m.move.icon} ${m.move.label}`,
      bonus: `🌳 ${m.move.skillName}`,
      risk: false,
      skillMoveId: m.move.id,
    }))

  if (guaranteed.length) {
    applied.push(`Інжект ${guaranteed.length} skill-choices з дерева`)
  }

  let removedRisk = 0
  const filteredAi: GatedSexChoice[] = []

  for (const raw of aiChoices ?? []) {
    if (!raw?.text) continue
    const text = String(raw.text)
    const bonus = String(raw.bonus ?? '')
    const risk = Boolean(raw.risk) || RISK_RE.test(text) || RISK_RE.test(bonus)

    if (ANAL_RE.test(text) || ANAL_RE.test(bonus)) {
      if (!analOk && risk) {
        removedRisk++
        applied.push(`Прибрано anal-risk (потрібен «Анал» ≥2): ${text.slice(0, 40)}`)
        continue
      }
    }
    if (DEEP_RE.test(text) || DEEP_RE.test(bonus)) {
      if (!deepOk) {
        removedRisk++
        applied.push(`Прибрано deepthroat (потрібен «Глибоке горло»): ${text.slice(0, 40)}`)
        continue
      }
    }

    if (risk) {
      if (BONDAGE_RE.test(text) || BONDAGE_RE.test(bonus)) {
        if (!bondageOk) {
          removedRisk++
          applied.push(`Прибрано risk (бондаж): ${text.slice(0, 40)}`)
          continue
        }
      } else if (!anyDom && !bondageOk && !analOk) {
        // General rough risk needs at least some dom/bondage/anal skill
        removedRisk++
        applied.push(`Прибрано risk (нема dom/acts-навичок): ${text.slice(0, 40)}`)
        continue
      }
    }

    // Multi-wave text without skill
    if (/мульти|хвил|ланцюг орган/i.test(text) && !multiOk) {
      removedRisk++
      applied.push(`Прибрано multi-choice: ${text.slice(0, 40)}`)
      continue
    }

    filteredAi.push({
      text,
      bonus: bonus || (risk ? '⚠️ ризик' : '+насолода'),
      risk,
    })
  }

  if (removedRisk) applied.push(`Відфільтровано risk-опцій: ${removedRisk}`)

  // Dedupe by normalized text
  const seen = new Set<string>()
  const merged: GatedSexChoice[] = []
  for (const c of [...guaranteed, ...filteredAi]) {
    const key = normalizeText(c.text)
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(c)
  }

  const maxTotal = opts.maxTotal ?? 6
  const choices = merged.slice(0, maxTotal)

  return {
    choices,
    applied,
    removedRisk,
    injected: guaranteed.length,
  }
}
