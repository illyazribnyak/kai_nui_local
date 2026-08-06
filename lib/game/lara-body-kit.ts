/**
 * Lara body kit — AI tiles only (no stock / Pexels / Unsplash / CC0 in repo).
 */

export type BodySlot = 'bust' | 'waist' | 'hips' | 'legs' | 'vulva' | 'anal'

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
    tags: ['full', 'seductive', 'aroused', 'curvy'],
    source: 'ai',
  },
  {
    id: 'bust_nude_soft',
    slot: 'bust',
    label: 'Ніжні оголені (AI)',
    description: 'М’який природний об’єм, оголений торс',
    image: '/avatars/body/bust_nude_soft.png',
    tags: ['nude', 'soft', 'sensual', 'intimate'],
    source: 'ai',
  },
  {
    id: 'bust_full_nude',
    slot: 'bust',
    label: 'Пишні оголені (AI)',
    description: 'Великий пишний оголений бюст',
    image: '/avatars/body/bust_full_nude.png',
    tags: ['nude', 'full', 'seductive', 'aroused'],
    source: 'ai',
  },
  {
    id: 'bust_nude_hard_nipples',
    slot: 'bust',
    label: 'Ероговані соски (AI)',
    description: 'Оголені груди зі збудженими твердими сосками',
    image: '/avatars/body/bust_nude_hard_nipples.png',
    tags: ['nude', 'nipples', 'aroused', 'hard'],
    source: 'ai',
  },
  {
    id: 'bust_nude_heavy_drops',
    slot: 'bust',
    label: 'Мокрі важкі груди (AI)',
    description: 'Пишні груди з краплями води',
    image: '/avatars/body/bust_nude_heavy_drops.png',
    tags: ['nude', 'wet', 'drops', 'heavy'],
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
  {
    id: 'waist_nude_toned',
    slot: 'waist',
    label: 'Оголена талія (AI)',
    description: 'Витончена талія та пупок, оголена шкіра',
    image: '/avatars/body/waist_nude_toned.png',
    tags: ['nude', 'toned', 'midriff'],
    source: 'ai',
  },
  {
    id: 'waist_nude_abs_piercing',
    slot: 'waist',
    label: 'Прес та пірсинг (AI)',
    description: 'Рельєфні кубики та пірсинг у пупку',
    image: '/avatars/body/waist_nude_abs_piercing.png',
    tags: ['nude', 'abs', 'piercing', 'athletic'],
    source: 'ai',
  },
  {
    id: 'waist_nude_soft_navel',
    slot: 'waist',
    label: 'Ніжний живіт (AI)',
    description: 'М’який жіночний живіт та гладка шкіра',
    image: '/avatars/body/waist_nude_soft_navel.png',
    tags: ['nude', 'soft', 'navel'],
    source: 'ai',
  },

  // Hips & Butt
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
    tags: ['curvy', 'seductive', 'aroused', 'full'],
    source: 'ai',
  },
  {
    id: 'hips_curvy_front',
    slot: 'hips',
    label: 'Стегна спереду (AI)',
    description: 'Оголені округлі стегна та лонок',
    image: '/avatars/body/hips_curvy_front.png',
    tags: ['nude', 'curvy', 'front', 'sensual'],
    source: 'ai',
  },
  {
    id: 'hips_curvy_butt',
    slot: 'hips',
    label: 'Сідниці ззаду (AI)',
    description: 'Округлі пружні сідниці, оголений вигляд',
    image: '/avatars/body/hips_curvy_butt.png',
    tags: ['nude', 'butt', 'curvy', 'rear'],
    source: 'ai',
  },
  {
    id: 'hips_butt_round_peach',
    slot: 'hips',
    label: 'Сідниці Персик (AI)',
    description: 'Пружний круглий "персик" сідниць',
    image: '/avatars/body/hips_butt_round_peach.png',
    tags: ['nude', 'butt', 'peach', 'round'],
    source: 'ai',
  },
  {
    id: 'hips_butt_curvy_bubble',
    slot: 'hips',
    label: 'Сідниці Bubble Butt (AI)',
    description: 'Пишний округлий латино-об’єм',
    image: '/avatars/body/hips_butt_curvy_bubble.png',
    tags: ['nude', 'butt', 'bubble', 'curvy'],
    source: 'ai',
  },
  {
    id: 'hips_butt_heart_shape',
    slot: 'hips',
    label: 'Серцеподібні сідниці (AI)',
    description: 'Витончена серцеподібна форма сідниць',
    image: '/avatars/body/hips_butt_heart_shape.png',
    tags: ['nude', 'butt', 'heart', 'sensual'],
    source: 'ai',
  },
  {
    id: 'hips_side_curve',
    slot: 'hips',
    label: 'Вигин збоку (AI)',
    description: 'Витончена лінія від талії до стегна',
    image: '/avatars/body/hips_side_curve.png',
    tags: ['nude', 'side', 'curve', 'sensual'],
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
  {
    id: 'legs_nude_long',
    slot: 'legs',
    label: 'Довгі ніжки (AI)',
    description: 'Довгі засмаглі оголені ноги',
    image: '/avatars/body/legs_nude_long.png',
    tags: ['nude', 'long', 'beach'],
    source: 'ai',
  },
  {
    id: 'legs_toned_strong',
    slot: 'legs',
    label: 'Сильні оголені (AI)',
    description: 'Треновані та підтягнуті ноги',
    image: '/avatars/body/legs_toned_strong.png',
    tags: ['nude', 'toned', 'athletic'],
    source: 'ai',
  },

  // Vulva / Pussy
  {
    id: 'vulva_shaved_smooth',
    slot: 'vulva',
    label: 'Гладка голена (AI)',
    description: 'Повністю голене лоно, гладка шкіра',
    image: '/avatars/body/vulva_shaved_smooth.png',
    tags: ['nude', 'vulva', 'shaved', 'smooth'],
    source: 'ai',
  },
  {
    id: 'vulva_neat_pubic_strip',
    slot: 'vulva',
    label: 'Акуратна смужка (AI)',
    description: 'Доглянута смужка лобкового волосся',
    image: '/avatars/body/vulva_neat_pubic_strip.png',
    tags: ['nude', 'vulva', 'strip', 'groomed'],
    source: 'ai',
  },
  {
    id: 'vulva_natural_full_pubic',
    slot: 'vulva',
    label: 'Дика природна (AI)',
    description: 'Природне густе лобкове волосся',
    image: '/avatars/body/vulva_natural_full_pubic.png',
    tags: ['nude', 'vulva', 'natural', 'bush'],
    source: 'ai',
  },
  {
    id: 'vulva_closed_innie',
    slot: 'vulva',
    label: 'Закриті губки Innie (AI)',
    description: 'Акуратні закриті зовнішні пелюстки',
    image: '/avatars/body/vulva_closed_innie.png',
    tags: ['nude', 'vulva', 'innie', 'closed'],
    source: 'ai',
  },
  {
    id: 'vulva_sensual_outie',
    slot: 'vulva',
    label: 'Соковиті губки Outie (AI)',
    description: 'Виступаючі м’які внутрішні губки',
    image: '/avatars/body/vulva_sensual_outie.png',
    tags: ['nude', 'vulva', 'outie', 'sensual'],
    source: 'ai',
  },
  {
    id: 'vulva_glistening_wet_parted',
    slot: 'vulva',
    label: 'Волога соковита (AI)',
    description: 'Розкрита лонова щілина з краплями соку',
    image: '/avatars/body/vulva_glistening_wet_parted.png',
    tags: ['nude', 'vulva', 'wet', 'parted', 'aroused'],
    source: 'ai',
  },
  {
    id: 'vulva_stretched_creampie_dew',
    slot: 'vulva',
    label: 'Після проникнення (AI)',
    description: 'Розтягнута вагіна зі спермою/соком',
    image: '/avatars/body/vulva_stretched_creampie_dew.png',
    tags: ['nude', 'vulva', 'creampie', 'stretched', 'afterglow'],
    source: 'ai',
  },

  // Anal
  {
    id: 'anal_pink_tight_closed',
    slot: 'anal',
    label: 'Тугий рожевий анус (AI)',
    description: 'Акуратний рожевий закритий сфінктер',
    image: '/avatars/body/anal_pink_tight_closed.png',
    tags: ['nude', 'anal', 'pink', 'tight'],
    source: 'ai',
  },
  {
    id: 'anal_toned_sphincter',
    slot: 'anal',
    label: 'Пружний анус (AI)',
    description: 'Мускулистий підтягнутий анус між сідницями',
    image: '/avatars/body/anal_toned_sphincter.png',
    tags: ['nude', 'anal', 'toned', 'sphincter'],
    source: 'ai',
  },
  {
    id: 'anal_stretched_rose_creampie',
    slot: 'anal',
    label: 'Після аналу (AI)',
    description: 'Розслаблений анус після анального сексу',
    image: '/avatars/body/anal_stretched_rose_creampie.png',
    tags: ['nude', 'anal', 'stretched', 'rose', 'creampie'],
    source: 'ai',
  },
]

export type BodyKitSelection = Record<BodySlot, string>

export const DEFAULT_BODY_KIT: BodyKitSelection = {
  bust: 'bust_athletic',
  waist: 'waist_toned',
  hips: 'hips_athletic',
  legs: 'legs_beach',
  vulva: 'vulva_shaved_smooth',
  anal: 'anal_pink_tight_closed',
}

export const BODY_SLOT_LABELS: Record<BodySlot, string> = {
  bust: 'Груди',
  waist: 'Талія / Живіт',
  hips: 'Стегна / Сідниці',
  legs: 'Ноги',
  vulva: 'Лоно / Вагіна',
  anal: 'Анальна зона',
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
    kit.bust = 'bust_full_nude'
    kit.hips = 'hips_curvy_front'
    kit.waist = 'waist_nude_toned'
    kit.legs = 'legs_nude_long'
  }

  // Sex scene
  if (opts.inSexScene) {
    kit.bust = 'bust_full_nude'
    kit.waist = 'waist_nude_toned'
    kit.legs = 'legs_toned_strong'
    if (
      sceneType === 'coercion' ||
      sceneType === 'trap' ||
      atmo.includes('rough') ||
      atmo.includes('dark')
    ) {
      kit.hips = 'hips_curvy_butt'
    } else if (atmo.includes('romantic') || atmo.includes('tender')) {
      kit.hips = 'hips_curvy_front'
    } else {
      kit.hips = 'hips_side_curve'
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
  return (['bust', 'waist', 'hips', 'legs', 'vulva', 'anal'] as BodySlot[]).some((s) => a[s] !== b[s])
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
      vulva: parsed.vulva && getPart(parsed.vulva) ? parsed.vulva : DEFAULT_BODY_KIT.vulva,
      anal: parsed.anal && getPart(parsed.anal) ? parsed.anal : DEFAULT_BODY_KIT.anal,
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
