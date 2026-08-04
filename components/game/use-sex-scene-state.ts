'use client'

import { useCallback, useState } from 'react'
import type {
  ComboData,
  ContextBonusData,
  DiceRollData,
  ErogenousZoneData,
  LaraDialogueOption,
  MultiOrgasmData,
  PartnerReactionData,
  PenisStatsData,
  PhaseData,
  PleasureData,
  SceneMoodData,
  SceneSummaryData,
  SexChoiceOption,
  SexSceneData,
  SexTempo,
  StaminaData,
} from '@/lib/game/sex-types'

export function useSexSceneState() {
  const [sexScene, setSexScene] = useState<SexSceneData | null>(null)
  const [pleasure, setPleasure] = useState<PleasureData>({ lara: 0, partner: 0 })
  const [diceRoll, setDiceRoll] = useState<DiceRollData | null>(null)
  const [sceneSummary, setSceneSummary] = useState<SceneSummaryData | null>(null)
  const [sexChoices, setSexChoices] = useState<SexChoiceOption[]>([])
  const [phase, setPhase] = useState<PhaseData | null>(null)
  const [stamina, setStamina] = useState<StaminaData | null>(null)
  const [combo, setCombo] = useState<ComboData | null>(null)
  const [domination, setDomination] = useState(0)
  const [reactions, setReactions] = useState<PartnerReactionData[]>([])
  const [erogenousZone, setErogenousZone] = useState<ErogenousZoneData | null>(null)
  const [contextBonuses, setContextBonuses] = useState<ContextBonusData[]>([])
  const [sceneMood, setSceneMood] = useState<SceneMoodData | null>(null)
  const [laraDialogue, setLaraDialogue] = useState<LaraDialogueOption[]>([])
  const [multiOrgasm, setMultiOrgasm] = useState<MultiOrgasmData | null>(null)
  const [penisStats, setPenisStats] = useState<PenisStatsData | null>(null)
  const [activeTempo, setActiveTempo] = useState<SexTempo>('medium')

  const clearTurnChoices = useCallback(() => {
    setSexChoices([])
    setLaraDialogue([])
    setMultiOrgasm(null)
  }, [])

  const applySexSceneStart = useCallback((data: SexSceneData) => {
    setSexScene(data)
    setPleasure({ lara: 0, partner: 0 })
    setSexChoices([])
    setSceneSummary(null)
    setPenisStats(null)
    setPhase({ phase: data.phase || 'foreplay', label: 'Прелюдія' })
    setStamina({ value: 100, tempo: 'medium' })
    setCombo(null)
    setDomination(0)
    setReactions([])
    setSceneMood(null)
    setLaraDialogue([])
    setMultiOrgasm(null)
    setActiveTempo('medium')
    if (data.context_bonuses) setContextBonuses(data.context_bonuses)
  }, [])

  const clearAfterSceneSummary = useCallback(() => {
    setSceneSummary(null)
    setSexScene(null)
    setPleasure({ lara: 0, partner: 0 })
    setPhase(null)
    setStamina(null)
    setCombo(null)
    setDomination(0)
    setReactions([])
    setContextBonuses([])
    setSceneMood(null)
    setLaraDialogue([])
    setMultiOrgasm(null)
    setPenisStats(null)
    setActiveTempo('medium')
  }, [])

  return {
    sexScene,
    setSexScene,
    pleasure,
    setPleasure,
    diceRoll,
    setDiceRoll,
    sceneSummary,
    setSceneSummary,
    sexChoices,
    setSexChoices,
    phase,
    setPhase,
    stamina,
    setStamina,
    combo,
    setCombo,
    domination,
    setDomination,
    reactions,
    setReactions,
    erogenousZone,
    setErogenousZone,
    contextBonuses,
    setContextBonuses,
    sceneMood,
    setSceneMood,
    laraDialogue,
    setLaraDialogue,
    multiOrgasm,
    setMultiOrgasm,
    penisStats,
    setPenisStats,
    activeTempo,
    setActiveTempo,
    clearTurnChoices,
    applySexSceneStart,
    clearAfterSceneSummary,
  }
}
