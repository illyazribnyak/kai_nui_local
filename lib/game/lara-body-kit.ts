/**
 * Lara body kit: AI tiles + free-licensed stock (Pexels / Unsplash / CC0).
 * Do not add porn-site / Reddit assets to this catalog or to git.
 */

export type BodySlot = 'bust' | 'waist' | 'hips' | 'legs'

export type BodyPartSource = 'ai' | 'pexels' | 'unsplash' | 'cc0'

export type BodyPartOption = {
  id: string
  slot: BodySlot
  label: string
  description: string
  image: string
  tags: string[]
  source: BodyPartSource
  licenseUrl?: string
  licenseName?: string
}

export const BODY_PARTS: BodyPartOption[] = [
  // Bust
  {
    id: 'bust_athletic',
    slot: 'bust',
    label: 'Атлетичні (AI)',
    description: 'Спортивний середній розмір, стиль гри',
    image: '/avatars/body/bust_athletic.png',
    tags: ['default', 'athletic', 'ragged'],
    source: 'ai',
  },
  {
    id: 'bust_full',
    slot: 'bust',
    label: 'Повні (AI)',
    description: 'Більш виражений об\'єм',
    image: '/avatars/body/bust_full.png',
    tags: ['full', 'seductive', 'aroused', 'curvy'],
    source: 'ai',
  },
  {
    id: 'bust_stock_beach',
    slot: 'bust',
    label: 'Пляж (Pexels)',
    description: 'Free stock crop · Pexels License',
    image: '/avatars/body/stock/stock_bust_pexels_beach.png',
    tags: ['beach', 'stock', 'photo'],
    source: 'pexels',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
  },
  {
    id: 'bust_cc0_nude',
    slot: 'bust',
    label: 'Оголені (CC0)',
    description: 'Wikimedia Commons · CC0 Public Domain',
    image: '/avatars/body/stock/stock_bust_cc0_nude.png',
    tags: ['nude', 'cc0', 'stock', 'photo', 'seductive', 'aroused'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },

  // Waist
  {
    id: 'waist_toned',
    slot: 'waist',
    label: 'Підтягнута (AI)',
    description: 'Тон, midriff',
    image: '/avatars/body/waist_toned.png',
    tags: ['default', 'athletic', 'confident'],
    source: 'ai',
  },
  {
    id: 'waist_stock_abs',
    slot: 'waist',
    label: 'Фітнес (Unsplash)',
    description: 'Free stock · Unsplash License',
    image: '/avatars/body/stock/stock_waist_unsplash_abs.png',
    tags: ['athletic', 'toned', 'stock', 'photo'],
    source: 'unsplash',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
  },
  {
    id: 'waist_stock_fitness',
    slot: 'waist',
    label: 'Тренування (Unsplash)',
    description: 'Free stock · Unsplash License',
    image: '/avatars/body/stock/stock_waist_unsplash_fitness.png',
    tags: ['athletic', 'stock', 'photo'],
    source: 'unsplash',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
  },
  {
    id: 'waist_cc0_nude',
    slot: 'waist',
    label: 'Оголена талія (CC0)',
    description: 'Wikimedia Commons · CC0',
    image: '/avatars/body/stock/stock_waist_cc0_nude.png',
    tags: ['nude', 'cc0', 'stock', 'photo'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },

  // Hips
  {
    id: 'hips_athletic',
    slot: 'hips',
    label: 'Атлетичні (AI)',
    description: 'Спортивні форми',
    image: '/avatars/body/hips_athletic.png',
    tags: ['default', 'athletic'],
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
    tags: ['curvy', 'seductive', 'aroused', 'full'],
    source: 'ai',
  },
  {
    id: 'hips_stock_beach',
    slot: 'hips',
    label: 'Пляж (Pexels)',
    description: 'Free stock crop · Pexels License',
    image: '/avatars/body/stock/stock_hips_pexels_beach.png',
    tags: ['beach', 'stock', 'photo'],
    source: 'pexels',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
  },
  {
    id: 'hips_cc0_nude',
    slot: 'hips',
    label: 'Оголені стегна (CC0)',
    description: 'Wikimedia Commons · CC0',
    image: '/avatars/body/stock/stock_hips_cc0_nude.png',
    tags: ['nude', 'cc0', 'stock', 'photo', 'curvy'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  {
    id: 'hips_cc0_butt',
    slot: 'hips',
    label: 'Сідниці (CC0)',
    description: 'Wikimedia Commons · CC0',
    image: '/avatars/body/stock/stock_hips_cc0_butt.png',
    tags: ['nude', 'cc0', 'stock', 'photo', 'curvy', 'seductive'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
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
  {
    id: 'legs_stock_pexels_beach',
    slot: 'legs',
    label: 'Ноги · пляж (Pexels)',
    description: 'Free commercial · Pexels',
    image: '/avatars/body/stock/stock_legs_pexels_beach.png',
    tags: ['beach', 'stock', 'photo', 'default'],
    source: 'pexels',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/photo/woman-legs-on-sandy-beach-9872348/',
  },
  {
    id: 'legs_stock_pexels_walk',
    slot: 'legs',
    label: 'Ноги · хода (Pexels)',
    description: 'Free commercial · Pexels',
    image: '/avatars/body/stock/stock_legs_pexels_walk.png',
    tags: ['beach', 'stock', 'photo'],
    source: 'pexels',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/photo/legs-of-woman-in-shorts-walking-barefoot-on-beach-5215385/',
  },
  {
    id: 'legs_stock_unsplash_yoga',
    slot: 'legs',
    label: 'Ноги · йога (Unsplash)',
    description: 'Free commercial · Unsplash',
    image: '/avatars/body/stock/stock_legs_unsplash_yoga.png',
    tags: ['athletic', 'toned', 'stock', 'photo'],
    source: 'unsplash',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
  },
  {
    id: 'legs_cc0_nude',
    slot: 'legs',
    label: 'Оголені ноги (CC0)',
    description: 'Wikimedia Commons · CC0',
    image: '/avatars/body/stock/stock_legs_cc0_nude.png',
    tags: ['nude', 'cc0', 'stock', 'photo'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
]

export type BodyKitSelection = Record<BodySlot, string>

export const DEFAULT_BODY_KIT: BodyKitSelection = {
  bust: 'bust_athletic',
  waist: 'waist_toned',
  hips: 'hips_athletic',
  legs: 'legs_stock_pexels_beach',
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
  /** Sex scene active or recent climax */
  inSexScene?: boolean
  sexAtmosphere?: string | null
  sexSceneType?: string | null
}

/**
 * Auto-pick body parts from game events / state.
 * Player does not choose tiles — kit follows narrative context.
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
  const reasons: string[] = []

  // Base: beach / ragged arrival
  if (loc.includes('берег') || loc.includes('пляж') || cloth.includes('клапт')) {
    kit.legs = 'legs_stock_pexels_beach'
    kit.bust = 'bust_stock_beach'
    kit.hips = 'hips_stock_beach'
    reasons.push('берег/пляж')
  }

  // Athletic / confident exploration
  if (look.includes('confident') || conf >= 70 || mood === 'confident' || mood === 'happy') {
    kit.legs = 'legs_stock_unsplash_yoga'
    kit.waist = 'waist_stock_abs'
    kit.hips = 'hips_athletic'
    reasons.push('впевненість')
  }

  // Tribal / jungle clothing
  if (look.includes('tribal') || cloth.includes('ліан') || cloth.includes('шкір') || cloth.includes('пояс')) {
    kit.bust = 'bust_full'
    kit.hips = 'hips_curvy'
    kit.legs = 'legs_toned'
    reasons.push('племʼя/одяг')
  }

  // Exhausted / low stamina vibes
  if (look.includes('exhausted') || mood === 'scared' || mood === 'exhausted') {
    kit.bust = 'bust_athletic'
    kit.hips = 'hips_slim'
    kit.legs = 'legs_beach'
    kit.waist = 'waist_toned'
    reasons.push('втома/страх')
  }

  // Night / dark Lara
  if (opts.isDarkLara || look.includes('dark') || time === 'night') {
    kit.bust = 'bust_full'
    kit.hips = 'hips_curvy'
    reasons.push('ніч/темна')
  }

  // Rising desire → more body emphasis (butt/hips)
  if (desire >= 35 && desire < 60) {
    kit.hips = 'hips_curvy'
    kit.bust = 'bust_full'
    reasons.push('бажання↑')
  }

  // High desire / seductive looks → nude stock emphasis
  if (
    look.includes('aroused') ||
    look.includes('seductive') ||
    look.includes('intimate') ||
    desire >= 60 ||
    cloth.includes('гола') ||
    cloth.includes('nude') ||
    cloth.includes('роздяг')
  ) {
    kit.bust = 'bust_cc0_nude'
    kit.hips = 'hips_cc0_butt'
    kit.waist = 'waist_cc0_nude'
    kit.legs = 'legs_cc0_nude'
    reasons.push('високе бажання / оголеність')
  }

  // Sex scene active — strongest override
  if (opts.inSexScene) {
    kit.bust = 'bust_cc0_nude'
    kit.waist = 'waist_cc0_nude'
    kit.legs = 'legs_cc0_nude'
    // Coercion / rough → more exposed hips emphasis
    if (
      sceneType === 'coercion' ||
      sceneType === 'trap' ||
      atmo.includes('rough') ||
      atmo.includes('dark')
    ) {
      kit.hips = 'hips_cc0_butt'
      reasons.push('секс: примус/жорстко')
    } else if (atmo.includes('romantic') || atmo.includes('tender')) {
      kit.hips = 'hips_cc0_nude'
      reasons.push('секс: ніжно')
    } else {
      kit.hips = 'hips_cc0_butt'
      reasons.push('секс-сцена')
    }
  }

  // Pregnant
  if (opts.isPregnant || look.includes('pregnant')) {
    kit.bust = 'bust_full'
    kit.waist = 'waist_toned'
    kit.hips = 'hips_curvy'
    reasons.push('вагітність')
  }

  // High shame after events — slightly more covered default AI
  if (shame >= 70 && !opts.inSexScene && desire < 50) {
    kit.bust = 'bust_athletic'
    kit.hips = 'hips_athletic'
    kit.legs = 'legs_beach'
    reasons.push('сором')
  }

  void reasons // available for UI via suggestBodyKitWithReasons
  return kit
}

export function suggestBodyKitWithReasons(opts: BodyKitContext = {}): {
  kit: BodyKitSelection
  reasons: string[]
} {
  // Re-run logic collecting reasons (duplicate light pass)
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

/** True if two kits differ */
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
