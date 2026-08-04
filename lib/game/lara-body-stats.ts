/**
 * Extended Lara body stats for the «Місткість» panel.
 * Capacity (vagina/anal/throat) + secondary body/sex metrics from skills + state.
 */

import { clamp } from '@/lib/game/json'
import {
  computeAllOrificeCapacities,
  type OrificeCapacity,
  type SkillLike,
} from '@/lib/game/body-capacity'

function skillLevel(skills: SkillLike[] | null | undefined, name: string): number {
  if (!skills?.length) return 0
  const found = skills.find((s) => s.name === name)
  return clamp(Number(found?.level) || 0, 0, 5)
}

export type BodyMeter = {
  key: string
  label: string
  icon: string
  /** 0–100 display */
  value: number
  /** short unit or suffix e.g. «%», «Lv» */
  unit: string
  /** comfort / current */
  detail: string
  tone: 'pink' | 'rose' | 'orange' | 'amber' | 'violet' | 'cyan' | 'emerald' | 'slate'
}

export type LaraBodyStats = {
  capacity: {
    vaginal: OrificeCapacity
    anal: OrificeCapacity
    oral: OrificeCapacity
  }
  meters: BodyMeter[]
  notes: string[]
}

/**
 * Build body capacity + secondary meters for UI.
 */
export function computeLaraBodyStats(
  skills: SkillLike[] | null | undefined,
  gameState?: {
    desire?: number | null
    shame?: number | null
    confidence?: number | null
    endurance?: number | null
    willpower?: number | null
    isPregnant?: boolean
    pregnancyWeek?: number | null
    amuletEnergy?: number | null
  } | null
): LaraBodyStats {
  const capacity = computeAllOrificeCapacities(skills)
  const desire = Number(gameState?.desire ?? 0)
  const shame = Number(gameState?.shame ?? 0)
  const confidence = Number(gameState?.confidence ?? 50)
  const endurance = Number(gameState?.endurance ?? 7)
  const willpower = Number(gameState?.willpower ?? 8)
  const amulet = Number(gameState?.amuletEnergy ?? 0)

  const flex = skillLevel(skills, 'Гнучкість тіла')
  const tireless = skillLevel(skills, 'Невтомність')
  const multi = skillLevel(skills, 'Множинне задоволення')
  const sense = skillLevel(skills, 'Чутливість')
  const ride = skillLevel(skills, 'Вершниця') || skillLevel(skills, 'Глибока їзда')
  const gag = skillLevel(skills, 'Подолання рефлекса')
  const deep = skillLevel(skills, 'Глибоке горло')
  const hand = skillLevel(skills, 'Дрочка руками') || skillLevel(skills, 'Майстерність рук')
  const cream = skillLevel(skills, 'Кремпай') || skillLevel(skills, 'Прийняти всередині')
  const after = skillLevel(skills, 'Aftercare') || skillLevel(skills, 'Цілюща ласка')
  const edge = skillLevel(skills, 'Еджинг')

  // Derived 0–100 meters
  const flexPct = clamp(flex * 18 + endurance * 2, 0, 100)
  const gagControlPct = clamp(gag * 18 + deep * 8 + willpower * 2, 0, 100)
  const multiPct = clamp(multi * 18 + sense * 6 + desire * 0.15, 0, 100)
  const sexStaminaPct = clamp(tireless * 16 + endurance * 4 + flex * 4, 8, 100)
  const lubePct = clamp(25 + desire * 0.55 + sense * 6 + capacity.vaginal.prepLv * 5, 0, 100)
  const recoveryPct = clamp(20 + after * 14 + tireless * 8 + endurance * 3 - shame * 0.15, 5, 100)
  const cervixPct = clamp(
    capacity.vaginal.depthLv * 16 + capacity.vaginal.capacityLv * 6 + ride * 8,
    0,
    100
  )
  const hipControlPct = clamp(ride * 18 + flex * 10 + skillLevel(skills, 'Контроль тіла') * 8, 0, 100)
  const handGripPct = clamp(hand * 18 + skillLevel(skills, 'Майстерність рук') * 10, 0, 100)
  const bodySensePct = clamp(sense * 16 + desire * 0.25 + confidence * 0.2, 0, 100)
  const bodyConfidencePct = clamp(confidence * 0.7 + (100 - shame) * 0.3 + multi * 4, 0, 100)
  const amuletLinkPct = clamp(amulet + skillLevel(skills, 'Ритуал насолоди') * 8, 0, 100)
  const wombReadyPct = gameState?.isPregnant
    ? clamp(40 + Number(gameState.pregnancyWeek || 0) * 4, 40, 100)
    : clamp(cream * 12 + desire * 0.2 + capacity.vaginal.capacityLv * 6, 0, 85)

  const meters: BodyMeter[] = [
    {
      key: 'flexibility',
      label: 'Гнучкість тазу',
      icon: '🤸',
      value: flexPct,
      unit: '%',
      detail: `Гнучкість тіла Lv${flex}`,
      tone: 'cyan',
    },
    {
      key: 'gag',
      label: 'Контроль блювотного',
      icon: '😮',
      value: gagControlPct,
      unit: '%',
      detail: `Рефлекс Lv${gag} · DT Lv${deep}`,
      tone: 'violet',
    },
    {
      key: 'multi',
      label: 'Мульти-оргазм',
      icon: '💜',
      value: multiPct,
      unit: '%',
      detail: `Множинне Lv${multi}`,
      tone: 'pink',
    },
    {
      key: 'stamina',
      label: 'Секс-витривалість',
      icon: '🔥',
      value: sexStaminaPct,
      unit: '%',
      detail: `Невтомність Lv${tireless} · ВИТ ${endurance}`,
      tone: 'orange',
    },
    {
      key: 'lube',
      label: 'Природна змазка',
      icon: '💧',
      value: lubePct,
      unit: '%',
      detail: `Бажання ${desire} · чутливість Lv${sense}`,
      tone: 'cyan',
    },
    {
      key: 'recovery',
      label: 'Відновлення тіла',
      icon: '🩹',
      value: recoveryPct,
      unit: '%',
      detail: `Aftercare Lv${after}`,
      tone: 'emerald',
    },
    {
      key: 'cervix',
      label: 'Толеранс глибини (шийка)',
      icon: '🎯',
      value: cervixPct,
      unit: '%',
      detail: `Глибина вагіни Lv${capacity.vaginal.depthLv}`,
      tone: 'rose',
    },
    {
      key: 'hips',
      label: 'Контроль стегон',
      icon: '🏇',
      value: hipControlPct,
      unit: '%',
      detail: `Вершниця/їзда Lv${ride}`,
      tone: 'amber',
    },
    {
      key: 'hands',
      label: 'Сила рук / хват',
      icon: '✋',
      value: handGripPct,
      unit: '%',
      detail: `Руки Lv${hand}`,
      tone: 'slate',
    },
    {
      key: 'sense',
      label: 'Чутливість шкіри',
      icon: '✨',
      value: bodySensePct,
      unit: '%',
      detail: `Чутливість Lv${sense}`,
      tone: 'pink',
    },
    {
      key: 'confidence',
      label: 'Впевненість тіла',
      icon: '🪞',
      value: bodyConfidencePct,
      unit: '%',
      detail: `Впевненість ${confidence} · сором ${shame}`,
      tone: 'emerald',
    },
    {
      key: 'womb',
      label: gameState?.isPregnant ? 'Вагітність / матка' : 'Готовність матки',
      icon: '🤰',
      value: wombReadyPct,
      unit: '%',
      detail: gameState?.isPregnant
        ? `Тиждень ${gameState.pregnancyWeek ?? '?'}`
        : `Кремпай/ризик Lv${cream}`,
      tone: 'rose',
    },
    {
      key: 'edge',
      label: 'Контроль краю',
      icon: '⏸️',
      value: clamp(edge * 18 + willpower * 3, 0, 100),
      unit: '%',
      detail: `Еджинг Lv${edge}`,
      tone: 'violet',
    },
    {
      key: 'amulet',
      label: 'Звʼязок амулета з тілом',
      icon: '🔮',
      value: amuletLinkPct,
      unit: '%',
      detail: `Енергія амулета ${amulet}`,
      tone: 'violet',
    },
  ]

  const notes: string[] = []
  notes.push(...capacity.vaginal.notes.slice(0, 2))
  notes.push(...capacity.anal.notes.slice(0, 2))
  if (capacity.oral.depthLv >= 3) notes.push('Горло: глибоке тренування активне')
  if (multi >= 2) notes.push('Мульти-оргазм відкритий (навичка ≥2)')
  if (desire >= 70) notes.push('Високе бажання: змазка й чутливість підвищені')
  if (shame >= 60) notes.push('Високий сором: трохи гірше відновлення тіла')

  return { capacity, meters, notes: notes.slice(0, 8) }
}
