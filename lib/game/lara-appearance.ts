/**
 * Lara visual / body appearance from game state + skills.
 * Drives multi-avatar selection and the Lara character card.
 */

import type { GameState } from '@/lib/types'
import {
  computeAllOrificeCapacities,
  type OrificeCapacity,
} from '@/lib/game/body-capacity'
import type { SkillLike } from '@/lib/game/body-capacity'

export type LaraLookKey =
  | 'classic'
  | 'default'
  | 'tribal'
  | 'ritual'
  | 'dark'
  | 'pregnant'
  | 'confident'
  | 'exhausted'
  | 'aroused'
  | 'seductive'
  | 'afterglow'
  | 'intimate'

export type LaraLookDef = {
  key: LaraLookKey
  label: string
  description: string
  avatar: string
  /** CSS ring / accent for card */
  accent: string
  erotic?: boolean
}

export const LARA_LOOKS: Record<LaraLookKey, LaraLookDef> = {
  classic: {
    key: 'classic',
    label: 'Класика',
    description: 'Базовий портрет дослідниці',
    avatar: '/avatars/lara.png',
    accent: 'ring-emerald-500/50',
  },
  default: {
    key: 'default',
    label: 'Після аварії',
    description: 'Клапті одягу, берег, виживання',
    avatar: '/avatars/lara_default.png',
    accent: 'ring-amber-500/50',
  },
  tribal: {
    key: 'tribal',
    label: 'Племінний стиль',
    description: 'Одяг острова, намисто, розпис',
    avatar: '/avatars/lara_tribal.png',
    accent: 'ring-orange-500/50',
  },
  ritual: {
    key: 'ritual',
    label: 'Ритуал',
    description: 'Церемоніальний вигляд, амулет',
    avatar: '/avatars/lara_ritual.png',
    accent: 'ring-violet-500/50',
  },
  dark: {
    key: 'dark',
    label: 'Темна спокуса',
    description: 'Темна Лара — небезпечна, чуттєва',
    avatar: '/avatars/lara_dark_seductive.png',
    accent: 'ring-purple-600/70',
    erotic: true,
  },
  pregnant: {
    key: 'pregnant',
    label: 'Вагітність',
    description: 'Магічна вагітність острова',
    avatar: '/avatars/lara_pregnant.png',
    accent: 'ring-rose-400/50',
  },
  confident: {
    key: 'confident',
    label: 'Впевнена',
    description: 'Висока впевненість, низький сором',
    avatar: '/avatars/lara_confident.png',
    accent: 'ring-sky-400/50',
  },
  exhausted: {
    key: 'exhausted',
    label: 'Виснажена',
    description: 'Голод, спрага, втома',
    avatar: '/avatars/lara_exhausted.png',
    accent: 'ring-slate-500/50',
  },
  aroused: {
    key: 'aroused',
    label: 'Збуджена',
    description: 'Високе бажання — рум\'янець, погляд',
    avatar: '/avatars/lara_aroused.png',
    accent: 'ring-red-500/60',
    erotic: true,
  },
  seductive: {
    key: 'seductive',
    label: 'Спокуслива',
    description: 'Впевнена еротика, напівусмішка',
    avatar: '/avatars/lara_seductive.png',
    accent: 'ring-pink-500/60',
    erotic: true,
  },
  afterglow: {
    key: 'afterglow',
    label: 'Після близькості',
    description: 'Розпатлане волосся, afterglow',
    avatar: '/avatars/lara_afterglow.png',
    accent: 'ring-rose-500/60',
    erotic: true,
  },
  intimate: {
    key: 'intimate',
    label: 'Інтимна',
    description: 'М\'яке світло, відкритий комір, близькість',
    avatar: '/avatars/lara_intimate.png',
    accent: 'ring-fuchsia-500/50',
    erotic: true,
  },
}

export type LaraAppearance = {
  look: LaraLookDef
  /** All looks that currently make sense (gallery) */
  unlockedLooks: LaraLookDef[]
  clothingLabel: string
  bodyPaintLabel: string | null
  accessoriesLabel: string | null
  bodySummary: string[]
  capacity: {
    vaginal: OrificeCapacity
    anal: OrificeCapacity
    oral: OrificeCapacity
  }
  tags: string[]
}

function clothingTier(clothing?: string | null): 'ragged' | 'leather' | 'tribal' | 'ritual' | 'none' | 'other' {
  const c = (clothing || '').toLowerCase()
  if (!c || c.includes('клапт') || c.includes('порван') || c.includes('ragged')) return 'ragged'
  if (c.includes('нічо') || c.includes('гола') || c.includes('nude') || c === 'nothing') return 'none'
  if (c.includes('ритуал') || c.includes('жриц') || c.includes('ceremony')) return 'ritual'
  if (c.includes('плем') || c.includes('tribal') || c.includes('намист') || c.includes('пір') || c.includes('кістк'))
    return 'tribal'
  if (c.includes('шкір') || c.includes('leather')) return 'leather'
  return 'other'
}

/**
 * Priority pick of current portrait from game state.
 * Erotic looks prioritized when desire/mood/clothing fit.
 */
export function resolveLaraLookKey(state: Partial<GameState> | null | undefined): LaraLookKey {
  if (!state) return 'classic'
  if (state.isDarkLara) return 'dark'
  if (state.isPregnant) return 'pregnant'

  const desire = Number(state.desire ?? 0)
  const mood = (state.mood || '').toLowerCase()
  const cloth = clothingTier(state.clothing)
  const conf = Number(state.confidence ?? 50)
  const shame = Number(state.shame ?? 0)

  // After intimacy / aftercare mood
  if (mood === 'aroused' && desire >= 40 && desire < 75) return 'afterglow'
  if (mood === 'happy' && desire >= 50 && conf >= 55) return 'afterglow'

  // Peak arousal
  if (desire >= 75 || mood === 'aroused') return 'aroused'

  // Nude / minimal clothing → intimate
  if (cloth === 'none') return 'intimate'

  // High desire but not peak
  if (desire >= 55) return 'seductive'

  // Survival stress
  const hunger = Number(state.hunger ?? 0)
  const thirst = Number(state.thirst ?? 0)
  if (hunger >= 70 || thirst >= 70 || mood === 'exhausted') return 'exhausted'

  if (cloth === 'ritual') return 'ritual'
  if (cloth === 'tribal' || (state.bodyPaint && String(state.bodyPaint).length > 2)) return 'tribal'

  // Confident seduction (erotic confident)
  if (conf >= 70 && shame <= 35) return desire >= 30 ? 'seductive' : 'confident'

  // Mid desire → intimate soft look
  if (desire >= 35) return 'intimate'

  if ((state.dayNumber ?? 1) <= 3 || cloth === 'ragged') return 'default'

  return 'classic'
}

export function getLaraAvatarFromState(state?: Partial<GameState> | null): string {
  const key = resolveLaraLookKey(state)
  return LARA_LOOKS[key].avatar
}

/** Looks the player has "earned" / can preview on the card. */
export function getUnlockedLaraLooks(state?: Partial<GameState> | null): LaraLookDef[] {
  const keys = new Set<LaraLookKey>(['classic', 'default', 'seductive', 'intimate'])
  if (!state) {
    return ['classic', 'default', 'seductive', 'intimate'].map((k) => LARA_LOOKS[k as LaraLookKey])
  }

  if (state.isDarkLara) keys.add('dark')
  if (state.isPregnant) keys.add('pregnant')

  const cloth = clothingTier(state.clothing)
  if (cloth === 'ritual' || (state.amuletEnergy ?? 0) >= 40) keys.add('ritual')
  if (cloth === 'tribal' || state.bodyPaint) keys.add('tribal')
  if (cloth === 'none') keys.add('intimate')

  const conf = Number(state.confidence ?? 50)
  if (conf >= 55) keys.add('confident')
  if (conf >= 60) keys.add('seductive')

  const desire = Number(state.desire ?? 0)
  if (desire >= 25) keys.add('intimate')
  if (desire >= 40) keys.add('aroused')
  if (desire >= 50) keys.add('afterglow')
  if (desire >= 55) keys.add('seductive')

  const hunger = Number(state.hunger ?? 0)
  if (hunger >= 40 || (state.dayNumber ?? 1) >= 2) keys.add('exhausted')

  // Always show active look
  keys.add(resolveLaraLookKey(state))

  // Stable order: erotic first after classic/default for gallery
  const order: LaraLookKey[] = [
    'classic',
    'default',
    'intimate',
    'seductive',
    'aroused',
    'afterglow',
    'confident',
    'tribal',
    'ritual',
    'pregnant',
    'dark',
    'exhausted',
  ]
  return order.filter((k) => keys.has(k)).map((k) => LARA_LOOKS[k])
}

export function buildLaraAppearance(
  state: Partial<GameState> | null | undefined,
  skills?: SkillLike[] | null
): LaraAppearance {
  const look = LARA_LOOKS[resolveLaraLookKey(state)]
  const capacity = computeAllOrificeCapacities(skills)
  const clothingLabel = state?.clothing?.trim() || 'клапті одягу'
  const bodyPaintLabel = state?.bodyPaint?.trim() || null
  const accessoriesLabel = state?.accessories?.trim() || null

  const bodySummary: string[] = []
  bodySummary.push(
    `Вагіна: ⌀ ${capacity.vaginal.comfortDiameterCm}–${capacity.vaginal.maxDiameterCm} см, ` +
      `глибина ${capacity.vaginal.comfortDepthCm}–${capacity.vaginal.maxDepthCm} см`
  )
  bodySummary.push(
    `Анал: ⌀ ${capacity.anal.comfortDiameterCm}–${capacity.anal.maxDiameterCm} см, ` +
      `глибина ${capacity.anal.comfortDepthCm}–${capacity.anal.maxDepthCm} см`
  )
  bodySummary.push(
    `Горло: глибина ${capacity.oral.comfortDepthCm}–${capacity.oral.maxDepthCm} см (скіли мінету/DT)`
  )

  const tags: string[] = []
  if (state?.isDarkLara) tags.push('Темна Лара')
  if (state?.isPregnant) {
    tags.push(`Вагітна · тиждень ${state.pregnancyWeek ?? '?'}`)
    if (state.pregnancyFather) tags.push(`Батько: ${state.pregnancyFather}`)
  }
  if (state?.companionName) tags.push(`З: ${state.companionName}`)
  if ((state?.desire ?? 0) >= 60) tags.push('Сильне бажання')
  if ((state?.desire ?? 0) >= 40 && (state?.desire ?? 0) < 60) tags.push('Збуджена')
  if ((state?.confidence ?? 0) >= 70) tags.push('Впевнена')
  if ((state?.shame ?? 0) >= 60) tags.push('Сором')
  if ((state?.amuletEnergy ?? 0) >= 30) tags.push('Амулет заряджений')
  if (look.erotic) tags.push('Еротичний look')

  return {
    look,
    unlockedLooks: getUnlockedLaraLooks(state),
    clothingLabel,
    bodyPaintLabel,
    accessoriesLabel,
    bodySummary,
    capacity,
    tags,
  }
}

export function formatLaraAppearanceForPrompt(
  state: Partial<GameState> | null | undefined,
  skills?: SkillLike[] | null
): string {
  const a = buildLaraAppearance(state, skills)
  return [
    '=== ЗОВНІШНІСТЬ І ТІЛО ЛАРИ ===',
    `Портрет/стан: ${a.look.label} — ${a.look.description}` +
      (a.look.erotic ? ' (еротичний look)' : ''),
    `Одяг: ${a.clothingLabel}`,
    a.bodyPaintLabel ? `Розпис: ${a.bodyPaintLabel}` : null,
    a.accessoriesLabel ? `Прикраси: ${a.accessoriesLabel}` : null,
    ...a.bodySummary.map((s) => `• ${s}`),
    a.tags.length ? `Теги: ${a.tags.join(' · ')}` : null,
    'Описуй зовнішність узгоджено з одягом/станом/desire. Зміни одягу → STAT clothing.',
    'При desire≥55 — чуттєвіший опис тіла/погляду; після сексу — afterglow (розпатлане волосся, рум\'янець).',
  ]
    .filter(Boolean)
    .join('\n')
}
