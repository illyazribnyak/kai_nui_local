/**
 * Lara body kit (constructor): modular part tiles for bust / waist / hips / legs.
 *
 * Sources:
 * - AI-generated style-matched tiles (public/avatars/body/*.png)
 * - Free stock under Pexels / Unsplash licenses (public/avatars/body/stock/*)
 *   See public/avatars/body/stock/ATTRIBUTION.md
 */

export type BodySlot = 'bust' | 'waist' | 'hips' | 'legs'

export type BodyPartSource = 'ai' | 'pexels' | 'unsplash' | 'cc0'

export type BodyPartOption = {
  id: string
  slot: BodySlot
  label: string
  description: string
  image: string
  /** Soft tags for auto-pick from game state */
  tags: string[]
  source: BodyPartSource
  /** License / page URL for free stock */
  licenseUrl?: string
  licenseName?: string
}

export const BODY_PARTS: BodyPartOption[] = [
  // ── Bust (AI + stock crop) ──────────────────────────────────────────────
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
    description: 'Кроп з free stock, Pexels License (не nude)',
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
    description: 'Wikimedia Commons · CC0 Public Domain · nude crop',
    image: '/avatars/body/stock/stock_bust_cc0_nude.png',
    tags: ['nude', 'cc0', 'stock', 'photo', 'seductive', 'aroused'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },

  // ── Waist ───────────────────────────────────────────────────────────────
  {
    id: 'waist_toned',
    slot: 'waist',
    label: 'Підтягнута (AI)',
    description: 'Тон, midriff, стиль гри',
    image: '/avatars/body/waist_toned.png',
    tags: ['default', 'athletic', 'confident'],
    source: 'ai',
  },
  {
    id: 'waist_stock_abs',
    slot: 'waist',
    label: 'Фітнес прес (Unsplash)',
    description: 'Free stock, Unsplash License',
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
    description: 'Free stock, Unsplash License',
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
    description: 'Wikimedia Commons · CC0 · nude midriff crop',
    image: '/avatars/body/stock/stock_waist_cc0_nude.png',
    tags: ['nude', 'cc0', 'stock', 'photo'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },

  // ── Hips ────────────────────────────────────────────────────────────────
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
    description: 'Кроп нижньої частини, Pexels License',
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
    description: 'Wikimedia Commons · CC0 · hips crop',
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
    description: 'Wikimedia Commons · CC0 · butt photo',
    image: '/avatars/body/stock/stock_hips_cc0_butt.png',
    tags: ['nude', 'cc0', 'stock', 'photo', 'curvy', 'seductive'],
    source: 'cc0',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },

  // ── Legs ────────────────────────────────────────────────────────────────
  {
    id: 'legs_beach',
    slot: 'legs',
    label: 'Пляжні (AI)',
    description: 'Стиль гри, берег',
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
    description: 'Nati — woman legs on sandy beach · free commercial',
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
    description: 'Yan Krukau — walking barefoot · free commercial',
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
    description: 'Free stock, Unsplash License',
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
    description: 'Wikimedia Commons · CC0 · legs crop',
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
    kit.bust = 'bust_cc0_nude'
    kit.hips = 'hips_cc0_butt'
    kit.waist = 'waist_cc0_nude'
    kit.legs = 'legs_cc0_nude'
  }
  if (look.includes('confident') || conf >= 70) {
    kit.legs = 'legs_stock_unsplash_yoga'
    kit.waist = 'waist_stock_abs'
  }
  if (look.includes('exhausted') || look.includes('default')) {
    kit.legs = 'legs_stock_pexels_beach'
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

/** Free stock sources used in the kit (for UI / docs). */
export const STOCK_REFERENCE_NOTES = [
  {
    region: 'Ноги / beach',
    source: 'Pexels',
    url: 'https://www.pexels.com/photo/woman-legs-on-sandy-beach-9872348/',
    license: 'Pexels License (free commercial)',
    note: 'Використано як stock_legs_pexels_beach',
  },
  {
    region: 'Ноги / beach walk',
    source: 'Pexels',
    url: 'https://www.pexels.com/photo/legs-of-woman-in-shorts-walking-barefoot-on-beach-5215385/',
    license: 'Pexels License',
    note: 'Використано як stock_legs_pexels_walk',
  },
  {
    region: 'Талія / fitness',
    source: 'Unsplash',
    url: 'https://unsplash.com/license',
    license: 'Unsplash License',
    note: 'Кропи abs/fitness → waist stock tiles',
  },
] as const
