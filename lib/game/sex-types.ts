/** Typed payloads for sex-scene UI + LLM tags (client + server). */

export type SexPhaseId = 'foreplay' | 'main' | 'climax' | string
export type SexTempo = 'slow' | 'medium' | 'fast' | string

export interface SexSceneData {
  type: string
  partner?: string
  phase?: SexPhaseId
  atmosphere?: string | null
  context_bonuses?: ContextBonusData[]
  [key: string]: unknown
}

export interface PleasureData {
  lara: number
  partner: number
}

export interface PhaseData {
  phase: SexPhaseId
  label?: string
}

export interface StaminaData {
  value: number
  tempo?: SexTempo
}

export interface ComboData {
  count: number
  label?: string
}

export interface PartnerReactionData {
  text: string
  emotion?: string
}

export interface ErogenousZoneData {
  zone: string
  race?: string
  bonus?: number
}

export interface ContextBonusData {
  source: string
  value: string
}

export interface SexChoiceOption {
  text: string
  bonus: string
  risk?: boolean
}

export interface SceneMoodData {
  mood: string
  label?: string
  intensity?: number
}

export interface LaraDialogueOption {
  text: string
  effect: string
  mood: string
}

export interface MultiOrgasmData {
  chain: number
  multiplier?: number
  stamina_cost?: number
  can_continue?: boolean
}

export interface PenisStatsData {
  name: string
  race?: string
  type?: string
  length_cm?: number
  girth_cm?: number
  shape?: string
  head?: string
  foreskin?: boolean
  veins?: string
  balls?: string
  cum_ml?: number
  cum_desc?: string
  stamina_rounds?: number
  refractory_min?: number
  special?: string
  risk_for_lara?: string
  [key: string]: unknown
}

export interface SceneSummaryData {
  orgasm_type?: string
  partner?: string
  lara_orgasm?: boolean
  partner_orgasm?: boolean
  combo_max?: number
  amulet_gain?: number
  skill_name?: string
  skill_xp?: number
  pregnancy_risk?: number
  new_fetish?: string
  marks?: string
  [key: string]: unknown
}

export interface DiceRollData {
  skill: string
  dc?: number
  roll?: number
  bonus?: number
  total?: number
  result?: 'success' | 'failure' | 'critical_success' | 'critical_failure' | string
  description?: string
  [key: string]: unknown
}

export interface ClientTokenUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  cumulativeTotalTokens?: number
  provider?: string
  narratorProvider?: string
  model?: string
  analyzerProvider?: string
  turnMs?: number
}

export interface TagLogData {
  counts?: Record<string, number>
  tags?: unknown[]
  [key: string]: unknown
}
