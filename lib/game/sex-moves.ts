/**
 * Skill Moves — player actions unlocked by the sex skill tree.
 * skillName must match SKILL_NAMES / seed exactly.
 */

import { skillLevel, isSkillUnlockedInTree, type SkillLike } from '@/lib/game/skill-effects'
import { findSexSkillNode, SEX_SKILL_TREE } from '@/lib/game/sex-skill-tree'

export type SexPhaseBucket = 'foreplay' | 'main' | 'climax' | 'any'

export interface SexMove {
  id: string
  skillName: string
  minLevel: number
  label: string
  icon: string
  /** Short description for HUD */
  description: string
  phase: SexPhaseBucket
  /** Stamina cost by tempo */
  staminaCost: Record<'slow' | 'medium' | 'fast', number>
  /** Base pleasure before skill multipliers */
  pleasure: { lara: number; partner: number }
  dominationDelta?: number
  /** Requires multi-orgasm unlock */
  requiresMulti?: boolean
  /** Min amulet energy (read from gameState if provided) */
  minAmulet?: number
  /** Guaranteed XP to skillName */
  xp: number
  /** Text injected into chat for the LLM */
  playerPrompt: string
  category: string
}

export const SEX_MOVES: SexMove[] = [
  // —— Зваблення
  {
    id: 'sed_gaze',
    skillName: 'Чарівний погляд',
    minLevel: 0,
    label: 'Спіймати поглядом',
    icon: '👁️',
    description: 'Флірт очима — розігріває партнера',
    phase: 'any',
    staminaCost: { slow: 2, medium: 3, fast: 4 },
    pleasure: { lara: 4, partner: 8 },
    xp: 12,
    playerPrompt: 'Лара ловить погляд партнера і тримає його, зваблюючи без слів.',
    category: 'seduction',
  },
  {
    id: 'sed_words',
    skillName: 'Солодкі слова',
    minLevel: 1,
    label: 'Солодкі слова',
    icon: '💬',
    description: 'Еротичний комплімент / шепіт',
    phase: 'any',
    staminaCost: { slow: 2, medium: 3, fast: 3 },
    pleasure: { lara: 5, partner: 10 },
    xp: 12,
    playerPrompt: 'Лара шепоче солодкі, відверті слова, розпалюючи бажання.',
    category: 'seduction',
  },
  {
    id: 'sed_dance',
    skillName: 'Спокусливий танець',
    minLevel: 1,
    label: 'Спокусливий рух',
    icon: '💃',
    description: 'Тіло в ритмі — сильний foreplay',
    phase: 'foreplay',
    staminaCost: { slow: 6, medium: 8, fast: 12 },
    pleasure: { lara: 8, partner: 14 },
    xp: 15,
    playerPrompt: 'Лара рухається повільно й зухвало, показуючи тіло в спокусливому танці.',
    category: 'seduction',
  },

  // —— Техніка
  {
    id: 'tech_touch',
    skillName: 'Ніжний дотик',
    minLevel: 0,
    label: 'Ніжні ласки',
    icon: '🌹',
    description: 'Базові ласки по тілу партнера',
    phase: 'any',
    staminaCost: { slow: 5, medium: 8, fast: 12 },
    pleasure: { lara: 8, partner: 14 },
    xp: 15,
    playerPrompt: 'Лара ніжно пестить тіло партнера, досліджуючи чутливі зони.',
    category: 'technique',
  },
  {
    id: 'tech_kiss',
    skillName: 'Поцілунок вогню',
    minLevel: 1,
    label: 'Поцілунок вогню',
    icon: '💋',
    description: 'Пристрасний поцілунок',
    phase: 'any',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 10, partner: 10 },
    xp: 14,
    playerPrompt: 'Лара цілує глибоко й пристрасно, не даючи відірватися.',
    category: 'technique',
  },
  {
    id: 'tech_flex',
    skillName: 'Гнучкість тіла',
    minLevel: 1,
    label: 'Змінити позу',
    icon: '🤸',
    description: 'Нова позиція — сильніше в main/climax',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 14 },
    pleasure: { lara: 12, partner: 16 },
    xp: 16,
    playerPrompt: 'Лара вправно змінює позу, використовуючи гнучкість тіла.',
    category: 'technique',
  },
  {
    id: 'tech_hands',
    skillName: 'Майстерність рук',
    minLevel: 1,
    label: 'Майстерність рук',
    icon: '✋',
    description: 'Вправні ласки руками',
    phase: 'any',
    staminaCost: { slow: 6, medium: 9, fast: 12 },
    pleasure: { lara: 6, partner: 18 },
    xp: 16,
    playerPrompt: 'Лара використовує вправність рук, доводячи партнера до тремтіння.',
    category: 'technique',
  },

  // —— Витривалість
  {
    id: 'end_hold',
    skillName: 'Тривала насолода',
    minLevel: 0,
    label: 'Тримати темп',
    icon: '⏱️',
    description: 'Стабільний ритм, менше втрати стаміни',
    phase: 'any',
    staminaCost: { slow: 3, medium: 5, fast: 7 },
    pleasure: { lara: 8, partner: 8 },
    xp: 12,
    playerPrompt: 'Лара тримає рівний, виснажливий для партнера темп, контролюючи дихання.',
    category: 'endurance',
  },
  {
    id: 'end_multi',
    skillName: 'Множинне задоволення',
    minLevel: 2,
    label: 'Хвиля насолоди',
    icon: '🌊',
    description: 'Спроба мульти-оргазму (потрібен Lv≥2)',
    phase: 'climax',
    staminaCost: { slow: 15, medium: 20, fast: 28 },
    pleasure: { lara: 20, partner: 12 },
    requiresMulti: true,
    xp: 20,
    playerPrompt: 'Лара не зупиняється після піку — жене тіло до наступної хвилі оргазму.',
    category: 'endurance',
  },
  {
    id: 'end_control',
    skillName: 'Контроль тіла',
    minLevel: 1,
    label: 'Контроль тіла',
    icon: '🧘',
    description: 'Затримати себе, підсилити партнера',
    phase: 'main',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 4, partner: 14 },
    xp: 14,
    playerPrompt: 'Лара стримує власний пік, віддаючи контроль і увагу партнеру.',
    category: 'endurance',
  },

  // —— Домінування
  {
    id: 'dom_voice',
    skillName: 'Владний голос',
    minLevel: 0,
    label: 'Наказ',
    icon: '🗣️',
    description: 'Командний тон',
    phase: 'any',
    staminaCost: { slow: 3, medium: 4, fast: 5 },
    pleasure: { lara: 6, partner: 10 },
    dominationDelta: 12,
    xp: 14,
    playerPrompt: 'Лара наказує низьким владним голосом, не залишаючи права відмови.',
    category: 'domination',
  },
  {
    id: 'dom_bind',
    skillName: "Зв'язування",
    minLevel: 2,
    label: "Зв'язати",
    icon: '⛓️',
    description: 'Бондаж (потрібен Lv≥2)',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 12 },
    pleasure: { lara: 8, partner: 14 },
    dominationDelta: 18,
    xp: 18,
    playerPrompt: 'Лара вправно зв\'язує партнера, забираючи контроль над тілом.',
    category: 'domination',
  },
  {
    id: 'dom_full',
    skillName: 'Повна влада',
    minLevel: 3,
    label: 'Повна влада',
    icon: '👑',
    description: 'Абсолютний контроль (Lv≥3)',
    phase: 'any',
    staminaCost: { slow: 10, medium: 12, fast: 15 },
    pleasure: { lara: 12, partner: 16 },
    dominationDelta: 25,
    xp: 22,
    playerPrompt: 'Лара бере повну владу над сценою — темп, поза і дозволи лише її.',
    category: 'domination',
  },

  // —— Підкорення
  {
    id: 'sub_yield',
    skillName: 'Покірність',
    minLevel: 0,
    label: 'Віддатися',
    icon: '🙇',
    description: 'Зняти контроль, віддати ініціативу',
    phase: 'any',
    staminaCost: { slow: 3, medium: 5, fast: 6 },
    pleasure: { lara: 12, partner: 8 },
    dominationDelta: -12,
    xp: 14,
    playerPrompt: 'Лара м\'якне, віддається, дозволяючи партнеру вести.',
    category: 'submission',
  },
  {
    id: 'sub_sense',
    skillName: 'Чутливість',
    minLevel: 1,
    label: 'Відкрити чутливість',
    icon: '💗',
    description: 'Підсилити власні відчуття',
    phase: 'any',
    staminaCost: { slow: 4, medium: 6, fast: 8 },
    pleasure: { lara: 16, partner: 6 },
    dominationDelta: -6,
    xp: 14,
    playerPrompt: 'Лара повністю відкривається відчуттям, шкіра горить від кожного дотику.',
    category: 'submission',
  },
  {
    id: 'sub_beg',
    skillName: 'Прохання та благання',
    minLevel: 1,
    label: 'Благати',
    icon: '🙏',
    description: 'Просити сильніше / більше',
    phase: 'main',
    staminaCost: { slow: 3, medium: 4, fast: 5 },
    pleasure: { lara: 10, partner: 12 },
    dominationDelta: -10,
    xp: 15,
    playerPrompt: 'Лара благає хрипким голосом — про більше, глибше, сильніше.',
    category: 'submission',
  },

  // —— Магія тіла
  {
    id: 'mag_heal',
    skillName: 'Цілюща ласка',
    minLevel: 0,
    label: 'Цілюща ласка',
    icon: '💚',
    description: 'Ніжний магічний дотик',
    phase: 'any',
    staminaCost: { slow: 5, medium: 7, fast: 9 },
    pleasure: { lara: 8, partner: 10 },
    xp: 14,
    playerPrompt: 'Лара проводить долонею з теплом амулета — ласка, що зцілює й збуджує.',
    category: 'body_magic',
  },
  {
    id: 'mag_ritual',
    skillName: 'Ритуал насолоди',
    minLevel: 1,
    label: 'Ритуал насолоди',
    icon: '🔮',
    description: 'Заряд амулета через близькість',
    phase: 'main',
    staminaCost: { slow: 8, medium: 10, fast: 12 },
    pleasure: { lara: 10, partner: 10 },
    minAmulet: 0,
    xp: 18,
    playerPrompt: 'Лара шепоче слова ритуалу; амулет пульсує в такт рухам тіл.',
    category: 'body_magic',
  },
  {
    id: 'mag_ecstasy',
    skillName: 'Екстаз сили',
    minLevel: 1,
    label: 'Екстаз сили',
    icon: '✨',
    description: 'Перетворити пік на енергію амулета',
    phase: 'climax',
    staminaCost: { slow: 12, medium: 16, fast: 20 },
    pleasure: { lara: 18, partner: 14 },
    minAmulet: 5,
    xp: 22,
    playerPrompt: 'Лара спрямовує оргазм у амулет — насолода стає магічною силою.',
    category: 'body_magic',
  },
]

export function findSexMove(id: string): SexMove | undefined {
  return SEX_MOVES.find((m) => m.id === id)
}

export interface MoveAvailability {
  move: SexMove
  unlocked: boolean
  reason?: string
  skillLevel: number
}

export function listAvailableSexMoves(
  skills: SkillLike[] | null | undefined,
  opts: {
    phase?: string | null
    multiUnlocked?: boolean
    amuletEnergy?: number
  } = {}
): MoveAvailability[] {
  const phase = (opts.phase || 'foreplay') as SexPhaseBucket
  const multi = opts.multiUnlocked ?? false
  const amulet = opts.amuletEnergy ?? 0

  return SEX_MOVES.map((move) => {
    const lv = skillLevel(skills, move.skillName)
    const node = findSexSkillNode(move.skillName)
    const treeOk = node ? isSkillUnlockedInTree(node, skills) : true

    if (!treeOk) {
      return { move, unlocked: false, reason: `Спочатку «${node?.parentName}»`, skillLevel: lv }
    }
    if (lv < move.minLevel) {
      return {
        move,
        unlocked: false,
        reason: `Потрібен ${move.skillName} Lv≥${move.minLevel}`,
        skillLevel: lv,
      }
    }
    if (move.requiresMulti && !multi) {
      return { move, unlocked: false, reason: 'Множинне задоволення Lv≥2', skillLevel: lv }
    }
    if (move.minAmulet != null && amulet < move.minAmulet) {
      return { move, unlocked: false, reason: `Амулет ≥${move.minAmulet}`, skillLevel: lv }
    }
    // Phase soft-lock: allow any-phase; for specific, still show but mark if mismatch as unlocked with note?
    // Strict: climax moves only in climax; main only main/climax; foreplay only early
    if (move.phase !== 'any') {
      const order = { foreplay: 0, main: 1, climax: 2 } as const
      const cur = order[(phase in order ? phase : 'foreplay') as keyof typeof order] ?? 0
      const need = order[move.phase as keyof typeof order] ?? 0
      if (cur < need) {
        return {
          move,
          unlocked: false,
          reason: `Фаза: ${move.phase}`,
          skillLevel: lv,
        }
      }
    }
    return { move, unlocked: true, skillLevel: lv }
  })
}

/** Prefer showing unlocked first, then locked (for HUD strip). */
export function sexMovesForHud(
  skills: SkillLike[] | null | undefined,
  opts: Parameters<typeof listAvailableSexMoves>[1] = {}
): MoveAvailability[] {
  const all = listAvailableSexMoves(skills, opts)
  const unlocked = all.filter((a) => a.unlocked)
  // Show up to 8 unlocked; if few, show locked previews of same category roots
  if (unlocked.length >= 4) return unlocked.slice(0, 10)
  const lockedPreview = all.filter((a) => !a.unlocked).slice(0, 4)
  return [...unlocked, ...lockedPreview]
}

export function tempoKey(tempo: string | undefined): 'slow' | 'medium' | 'fast' {
  const t = (tempo || 'medium').toLowerCase()
  if (t.includes('slow') || t.includes('повіл')) return 'slow'
  if (t.includes('fast') || t.includes('швид')) return 'fast'
  return 'medium'
}

export function phaseKey(phase: string | undefined | null): 'foreplay' | 'main' | 'climax' {
  const p = (phase || 'foreplay').toLowerCase()
  if (p.includes('climax') || p.includes('кульм')) return 'climax'
  if (p.includes('main') || p.includes('основ')) return 'main'
  return 'foreplay'
}

// re-export tree length sanity for tests
export function sexMovesSkillNames(): string[] {
  return [...new Set(SEX_MOVES.map((m) => m.skillName))]
}

export function allMoveSkillsExistInTree(): boolean {
  const names = new Set(SEX_SKILL_TREE.map((n) => n.name))
  return SEX_MOVES.every((m) => names.has(m.skillName))
}
