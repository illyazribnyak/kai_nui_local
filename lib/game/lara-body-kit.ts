/**
 * Lara body kit — AI tiles only (no stock / Pexels / Unsplash / CC0 in repo).
 */

export type BodySlot = 'bust' | 'waist' | 'hips' | 'legs'

export type BodyPartSource = 'ai'

export type BodyPartOption = {
  id: string
  slot: BodySlot
  label: string
  description: string
  image: string
  tags: string[]
  source: BodyPartSource
}

export const BODY_PARTS: BodyPartOption[] = [
  // Bust
  {
    id: 'bust_athletic',
    slot: 'bust',
    label: 'Атлетичні (AI)',
    description: 'Спортивний середній розмір, стиль гри',
    image: '/avatars/body/bust_athletic.png',
    tags: ['default', 'athletic', 'ragged', 'beach'],
    source: 'ai',
  },
  {
    id: 'bust_full',
    slot: 'bust',
    label: 'Повні (AI)',
    description: "Більш виражений об'єм",
    image: '/avatars/body/bust_full.png',
    tags: ['full', 'seductive', 'aroused', 'curvy', 'nude'],
    source: 'ai',
  },

  // Waist
  {
    id: 'waist_toned',
    slot: 'waist',
    label: 'Підтягнута (AI)',
    description: 'Тон, midriff',
    image: '/avatars/body/waist_toned.png',
    tags: ['default', 'athletic', 'confident', 'toned'],
    source: 'ai',
  },

  // Hips
  {
    id: 'hips_athletic',
    slot: 'hips',
    label: 'Атлетичні (AI)',
    description: 'Спортивні форми',
    image: '/avatars/body/hips_athletic.png',
    tags: ['default', 'athletic', 'beach'],
    source: 'ai',
  },
  {
    id: 'hips_slim',
    slot: 'hips',
    label: 'Стрункі (AI)',
    description: 'Більш вузькі стегна',
    image: '/avatars/body/hips_slim.png',
    tags: ['slim'],
    source: 'ai',
  },
  {
    id: 'hips_curvy',
    slot: 'hips',
    label: 'Пишні (AI)',
    description: 'Виражені стегна / сідниці',
    image: '/avatars/body/hips_curvy.png',
    tags: ['curvy', 'seductive', 'aroused', 'full', 'nude'],
    source: 'ai',
  },

  // Legs
  {
    id: 'legs_beach',
    slot: 'legs',
    label: 'Пляжні (AI)',
    description: 'Стиль гри',
    image: '/avatars/body/legs_beach.png',
    tags: ['default', 'beach', 'ragged'],
    source: 'ai',
  },
  {
    id: 'legs_toned',
    slot: 'legs',
    label: 'Рельєфні (AI)',
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

export type BodyKitContext = {
  lookKey?: string | null
  desire?: number | null
  confidence?: number | null
  shame?: number | null
  location?: string | null
  clothing?: string | null
  mood?: string | null
  timeOfDay?: string | null
  weather?: string | null
  isDarkLara?: boolean
  isPregnant?: boolean
  inSexScene?: boolean
  sexAtmosphere?: string | null
  sexSceneType?: string | null
}

/**
 * Auto-pick body parts from game events / state (AI tiles only).
 */
export function suggestBodyKit(opts: BodyKitContext = {}): BodyKitSelection {
  const look = (opts.lookKey || '').toLowerCase()
  const desire = Number(opts.desire ?? 0)
  const conf = Number(opts.confidence ?? 50)
  const shame = Number(opts.shame ?? 0)
  const loc = (opts.location || '').toLowerCase()
  const cloth = (opts.clothing || '').toLowerCase()
  const mood = (opts.mood || '').toLowerCase()
  const time = (opts.timeOfDay || '').toLowerCase()
  const atmo = (opts.sexAtmosphere || '').toLowerCase()
  const sceneType = (opts.sexSceneType || '').toLowerCase()
  const kit = { ...DEFAULT_BODY_KIT }

  // Base: beach / ragged arrival
  if (loc.includes('берег') || loc.includes('пляж') || cloth.includes('клапт')) {
    kit.legs = 'legs_beach'
    kit.bust = 'bust_athletic'
    kit.hips = 'hips_athletic'
  }

  // Athletic / confident
  if (look.includes('confident') || conf >= 70 || mood === 'confident' || mood === 'happy') {
    kit.legs = 'legs_toned'
    kit.waist = 'waist_toned'
    kit.hips = 'hips_athletic'
  }

  // Tribal / jungle clothing
  if (look.includes('tribal') || cloth.includes('ліан') || cloth.includes('шкір') || cloth.includes('пояс')) {
    kit.bust = 'bust_full'
    kit.hips = 'hips_curvy'
    kit.legs = 'legs_toned'
  }

  // Exhausted
  if (look.includes('exhausted') || mood === 'scared' || mood === 'exhausted') {
    kit.bust = 'bust_athletic'
    kit.hips = 'hips_slim'
    kit.legs = 'legs_beach'
    kit.waist = 'waist_toned'
  }

  // Night / dark
  if (opts.isDarkLara || look.includes('dark') || time === 'night') {
    kit.bust = 'bust_full'
    kit.hips = 'hips_curvy'
  }

  // Rising desire
  if (desire >= 35 && desire < 60) {
    kit.hips = 'hips_curvy'
    kit.bust = 'bust_full'
  }

  // High desire / seductive — fuller AI forms
  if (
    look.includes('aroused') ||
    look.includes('seductive') ||
    look.includes('intimate') ||
    desire >= 60 ||
    cloth.includes('гола') ||
    cloth.includes('nude') ||
    cloth.includes('роздяг')
  ) {
    kit.bust = 'bust_full'
    kit.hips = 'hips_curvy'
    kit.waist = 'waist_toned'
    kit.legs = 'legs_toned'
  }

  // Sex scene
  if (opts.inSexScene) {
    kit.bust = 'bust_full'
    kit.waist = 'waist_toned'
    kit.legs = 'legs_toned'
    if (
      sceneType === 'coercion' ||
      sceneType === 'trap' ||
      atmo.includes('rough') ||
      atmo.includes('dark')
    ) {
      kit.hips = 'hips_curvy'
    } else if (atmo.includes('romantic') || atmo.includes('tender')) {
      kit.hips = 'hips_curvy'
    } else {
      kit.hips = 'hips_curvy'
    }
  }

  // Pregnant
  if (opts.isPregnant || look.includes('pregnant')) {
    kit.bust = 'bust_full'
    kit.waist = 'waist_toned'
    kit.hips = 'hips_curvy'
  }

  // High shame — more "default" athletic cover
  if (shame >= 70 && !opts.inSexScene && desire < 50) {
    kit.bust = 'bust_athletic'
    kit.hips = 'hips_athletic'
    kit.legs = 'legs_beach'
  }

  return kit
}

export function suggestBodyKitWithReasons(opts: BodyKitContext = {}): {
  kit: BodyKitSelection
  reasons: string[]
} {
  const kit = suggestBodyKit(opts)
  const reasons: string[] = []
  const desire = Number(opts.desire ?? 0)
  const loc = (opts.location || '').toLowerCase()
  if (opts.inSexScene) reasons.push('активна секс-сцена')
  else if (desire >= 60) reasons.push(`бажання ${desire}`)
  else if (desire >= 35) reasons.push('зростаюче бажання')
  if (loc.includes('берег') || loc.includes('пляж')) reasons.push('локація: берег')
  if (opts.isDarkLara) reasons.push('темна Лара')
  if (opts.isPregnant) reasons.push('вагітність')
  if ((opts.lookKey || '').includes('tribal')) reasons.push('look: tribal')
  if (!reasons.length) reasons.push('стан за замовчуванням')
  return { kit, reasons }
}

export function bodyKitChanged(a: BodyKitSelection, b: BodyKitSelection): boolean {
  return (['bust', 'waist', 'hips', 'legs'] as BodySlot[]).some((s) => a[s] !== b[s])
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
