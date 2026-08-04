/**
 * Lara body kit (constructor): modular AI part tiles for bust / waist / hips / legs.
 *
 * Only AI tiles under public/avatars/body/*.png are committed.
 * Optional local stock (not in git): public/avatars/body/stock/ — ignored by .gitignore.
 */

export type BodySlot = 'bust' | 'waist' | 'hips' | 'legs'

export type BodyPartSource = 'ai'

export type BodyPartOption = {
  id: string
  slot: BodySlot
  label: string
  description: string
  image: string
  /** Soft tags for auto-pick from game state */
  tags: string[]
  source: BodyPartSource
}

export const BODY_PARTS: BodyPartOption[] = [
  {
    id: 'bust_athletic',
    slot: 'bust',
    label: 'Атлетичні',
    description: 'Спортивний середній розмір',
    image: '/avatars/body/bust_athletic.png',
    tags: ['default', 'athletic', 'ragged'],
    source: 'ai',
  },
  {
    id: 'bust_full',
    slot: 'bust',
    label: 'Повні',
    description: 'Більш виражений об\'єм',
    image: '/avatars/body/bust_full.png',
    tags: ['full', 'seductive', 'aroused', 'curvy'],
    source: 'ai',
  },
  {
    id: 'waist_toned',
    slot: 'waist',
    label: 'Підтягнута талія',
    description: 'Тон, midriff',
    image: '/avatars/body/waist_toned.png',
    tags: ['default', 'athletic', 'confident'],
    source: 'ai',
  },
  {
    id: 'hips_athletic',
    slot: 'hips',
    label: 'Атлетичні стегна',
    description: 'Спортивні форми',
    image: '/avatars/body/hips_athletic.png',
    tags: ['default', 'athletic'],
    source: 'ai',
  },
  {
    id: 'hips_slim',
    slot: 'hips',
    label: 'Стрункі',
    description: 'Більш вузькі стегна',
    image: '/avatars/body/hips_slim.png',
    tags: ['slim'],
    source: 'ai',
  },
  {
    id: 'hips_curvy',
    slot: 'hips',
    label: 'Пишні',
    description: 'Виражені стегна / сідниці',
    image: '/avatars/body/hips_curvy.png',
    tags: ['curvy', 'seductive', 'aroused', 'full'],
    source: 'ai',
  },
  {
    id: 'legs_beach',
    slot: 'legs',
    label: 'Пляжні ноги',
    description: 'Довгі ноги, берег',
    image: '/avatars/body/legs_beach.png',
    tags: ['default', 'beach', 'ragged'],
    source: 'ai',
  },
  {
    id: 'legs_toned',
    slot: 'legs',
    label: 'Рельєфні ноги',
    description: 'Сильні, треновані',
    image: '/avatars/body/legs_toned.png',
    tags: ['athletic', 'confident', 'toned'],
    source: 'ai',
  },
]

export type BodyKitSelection = Record<BodySlot, string>

export const DEFAULT_BODY_KIT: BodyKitSelection = {
  bust: 'bust_athletic',
  waist: 'waist_toned',
  hips: 'hips_athletic',
  legs: 'legs_beach',
}

export const BODY_SLOT_LABELS: Record<BodySlot, string> = {
  bust: 'Груди',
  waist: 'Талія',
  hips: 'Стегна / сідниці',
  legs: 'Ноги',
}

export function partsForSlot(slot: BodySlot): BodyPartOption[] {
  return BODY_PARTS.filter((p) => p.slot === slot)
}

export function getPart(id: string): BodyPartOption | undefined {
  return BODY_PARTS.find((p) => p.id === id)
}

export function resolvePartImage(selection: BodyKitSelection, slot: BodySlot): string {
  const id = selection[slot] || DEFAULT_BODY_KIT[slot]
  return getPart(id)?.image || partsForSlot(slot)[0]?.image || '/avatars/lara.png'
}

/** Auto-suggest kit from look key / desire (soft). */
export function suggestBodyKit(opts: {
  lookKey?: string
  desire?: number
  confidence?: number
}): BodyKitSelection {
  const look = (opts.lookKey || '').toLowerCase()
  const desire = opts.desire ?? 0
  const conf = opts.confidence ?? 50
  const kit = { ...DEFAULT_BODY_KIT }

  if (look.includes('aroused') || look.includes('seductive') || desire >= 60) {
    kit.bust = 'bust_full'
    kit.hips = 'hips_curvy'
  }
  if (look.includes('confident') || conf >= 70) {
    kit.legs = 'legs_toned'
    kit.waist = 'waist_toned'
  }
  if (look.includes('exhausted') || look.includes('default')) {
    kit.legs = 'legs_beach'
    kit.bust = 'bust_athletic'
  }
  return kit
}

const STORAGE_KEY = 'kai_nui_lara_body_kit'

export function loadBodyKitFromStorage(): BodyKitSelection {
  if (typeof window === 'undefined') return { ...DEFAULT_BODY_KIT }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_BODY_KIT }
    const parsed = JSON.parse(raw) as Partial<BodyKitSelection>
    return {
      bust: parsed.bust && getPart(parsed.bust) ? parsed.bust : DEFAULT_BODY_KIT.bust,
      waist: parsed.waist && getPart(parsed.waist) ? parsed.waist : DEFAULT_BODY_KIT.waist,
      hips: parsed.hips && getPart(parsed.hips) ? parsed.hips : DEFAULT_BODY_KIT.hips,
      legs: parsed.legs && getPart(parsed.legs) ? parsed.legs : DEFAULT_BODY_KIT.legs,
    }
  } catch {
    return { ...DEFAULT_BODY_KIT }
  }
}

export function saveBodyKitToStorage(kit: BodyKitSelection): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kit))
  } catch {
    /* ignore */
  }
}
