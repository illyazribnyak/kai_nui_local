/**
 * User-drop Lara image gallery + rules for WHEN a photo becomes the active portrait.
 *
 * Naming convention (keywords in filename, any language of separators _ -):
 *   sexy, seductive, sensual, boudoir, intimate, afterglow, closeup
 *   beach, lagoon, jungle, temple, night, day, rain, wet
 *   dark, pregnant, tribal, ritual, confident, exhausted
 *   nude, tee, white, island
 *
 * Example: lara_sexy_beach_night.jpg → tags sexy+beach+night
 * High desire + location берег + evening → this beats generic shots.
 */

export const LARA_GALLERY_DIR = 'public/avatars/lara-gallery'
export const LARA_GALLERY_PUBLIC_PREFIX = '/avatars/lara-gallery'

export const LARA_GALLERY_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

/** Filename keywords → semantic tags */
export const GALLERY_TAG_KEYWORDS: Record<string, string[]> = {
  sexy: ['sexy', 'hot', 'erotic', 'sensual', 'спокусл', 'сексуал'],
  seductive: ['seductive', 'seduc', 'allure'],
  intimate: ['intimate', 'close', 'closeup', 'boudoir', 'інтим'],
  afterglow: ['afterglow', 'aftercare', 'after_sex', 'glow', 'після'],
  beach: ['beach', 'берег', 'lagoon', 'лагун', 'sand', 'ocean', 'море'],
  jungle: ['jungle', 'джунгл', 'forest', 'island', 'острів'],
  temple: ['temple', 'храм', 'ritual', 'ритуал', 'shrine'],
  night: ['night', 'ніч', 'nighttime', 'moon', 'darkroom'],
  day: ['day', 'день', 'daylight', 'noon', 'morning', 'ранок'],
  wet: ['wet', 'мокр', 'rain', 'дощ', 'soaked'],
  dark: ['dark', 'темн', 'shadow', 'corrupted', 'dark_lara'],
  pregnant: ['pregnant', 'вагіт', 'preg', 'belly'],
  tribal: ['tribal', 'плем', 'paint', 'bodypaint'],
  confident: ['confident', 'hero', 'впевн', 'victory'],
  exhausted: ['exhausted', 'tired', 'виснаж', 'hurt', 'wounded'],
  nude: ['nude', 'naked', 'огол', 'bare'],
  tee: ['tee', 'tshirt', 't_shirt', 'shirt', 'майк', 'white_tee'],
  fullbody: ['fullbody', 'full_body', 'body', 'standing'],
  portrait: ['portrait', 'face', 'bust', 'headshot'],
}

export type LaraGalleryItem = {
  src: string
  file: string
  label: string
  /** Semantic tags parsed from filename */
  tags: string[]
}

export type GalleryPickContext = {
  location?: string | null
  timeOfDay?: string | null
  mood?: string | null
  weather?: string | null
  desire?: number | null
  shame?: number | null
  confidence?: number | null
  isDarkLara?: boolean | null
  isPregnant?: boolean | null
  clothing?: string | null
  chapter?: string | null
  /** Sex scene currently open in UI */
  inSexScene?: boolean | null
  dayNumber?: number | null
}

export type GalleryPickResult = {
  item: LaraGalleryItem
  score: number
  /** Why this photo won (for UI / debug) */
  reasons: string[]
}

/** Turn lara_sexy_beach.jpg → "sexy beach" */
export function labelFromGalleryFilename(file: string): string {
  const base = file.replace(/\.[^.]+$/i, '')
  return base
    .replace(/^lara[_-]?/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || base
}

export function isGalleryImageFile(file: string): boolean {
  const lower = file.toLowerCase()
  if (lower === 'readme.md' || lower.startsWith('.')) return false
  return LARA_GALLERY_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/** Extract tags from filename using keyword map. */
export function tagsFromGalleryFilename(file: string): string[] {
  const raw = file
    .replace(/\.[^.]+$/i, '')
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, '_')
  const found = new Set<string>()
  for (const [tag, kws] of Object.entries(GALLERY_TAG_KEYWORDS)) {
    if (kws.some((kw) => raw.includes(kw.toLowerCase()))) found.add(tag)
  }
  // bare "night" in dark_lara handled via dark tag
  return Array.from(found)
}

export function galleryItemFromFile(file: string): LaraGalleryItem {
  return {
    file,
    src: `${LARA_GALLERY_PUBLIC_PREFIX}/${file.split('/').map(encodeURIComponent).join('/')}`,
    label: labelFromGalleryFilename(file),
    tags: tagsFromGalleryFilename(file),
  }
}

function loc(s?: string | null): string {
  return (s || '').toLowerCase()
}

/**
 * Score one gallery image against world state.
 * Higher = better match. Base 1 so empty tags still can win as last resort.
 */
export function scoreGalleryItem(
  item: LaraGalleryItem,
  ctx: GalleryPickContext
): { score: number; reasons: string[] } {
  const tags = new Set(item.tags)
  const reasons: string[] = []
  let score = 1

  const desire = Number(ctx.desire ?? 0)
  const conf = Number(ctx.confidence ?? 50)
  const shame = Number(ctx.shame ?? 0)
  const time = loc(ctx.timeOfDay)
  const location = loc(ctx.location)
  const mood = loc(ctx.mood)
  const weather = loc(ctx.weather)
  const clothing = loc(ctx.clothing)
  const chapter = loc(ctx.chapter)

  // --- Hard / strong story flags ---
  if (ctx.isDarkLara) {
    if (tags.has('dark')) {
      score += 40
      reasons.push('Темна Лара')
    } else {
      score -= 8
    }
  }
  if (ctx.isPregnant) {
    if (tags.has('pregnant')) {
      score += 45
      reasons.push('Вагітність')
    } else {
      score -= 5
    }
  }

  // --- Desire / sex ---
  if (desire >= 75) {
    if (tags.has('sexy') || tags.has('seductive') || tags.has('nude')) {
      score += 28
      reasons.push('Сильне бажання')
    }
    if (tags.has('intimate')) {
      score += 12
    }
  } else if (desire >= 50) {
    if (tags.has('sexy') || tags.has('seductive') || tags.has('intimate')) {
      score += 18
      reasons.push('Підвищене бажання')
    }
  } else if (desire >= 30) {
    if (tags.has('intimate') || tags.has('seductive')) {
      score += 10
      reasons.push('Легке збудження')
    }
    // Prefer not hyper-erotic when calm
    if (tags.has('sexy') && desire < 40) score -= 4
  } else {
    if (tags.has('sexy') || tags.has('nude')) score -= 10
    if (tags.has('confident') || tags.has('beach') || tags.has('day')) score += 4
  }

  if (ctx.inSexScene) {
    if (tags.has('sexy') || tags.has('intimate') || tags.has('nude') || tags.has('afterglow')) {
      score += 22
      reasons.push('Секс-сцена')
    }
  }

  if (mood === 'aroused' || mood === 'happy') {
    if (tags.has('afterglow') && desire >= 35 && desire < 80) {
      score += 20
      reasons.push('Після близькості / soft mood')
    }
    if (tags.has('sexy') && mood === 'aroused') score += 10
  }

  // --- Time of day ---
  if (time === 'night' || time === 'evening') {
    if (tags.has('night') || tags.has('dark') || tags.has('intimate')) {
      score += 16
      reasons.push(time === 'night' ? 'Ніч' : 'Вечір')
    }
    if (tags.has('day')) score -= 6
  }
  if (time === 'day' || time === 'morning') {
    if (tags.has('day') || tags.has('beach')) {
      score += 10
      reasons.push(time === 'morning' ? 'Ранок' : 'День')
    }
    if (tags.has('night')) score -= 8
  }

  // --- Location ---
  if (
    location.includes('берег') ||
    location.includes('лагун') ||
    location.includes('пляж') ||
    location.includes('море')
  ) {
    if (tags.has('beach')) {
      score += 24
      reasons.push('Локація: берег/лагуна')
    }
  }
  if (
    location.includes('джунгл') ||
    location.includes('мангров') ||
    location.includes('острів')
  ) {
    if (tags.has('jungle')) {
      score += 18
      reasons.push('Локація: джунглі')
    }
  }
  if (location.includes('храм') || location.includes('свящ')) {
    if (tags.has('temple') || tags.has('ritual')) {
      score += 22
      reasons.push('Локація: храм')
    }
  }
  if (location.includes('селищ') || location.includes('кай-тору')) {
    if (tags.has('tribal')) {
      score += 14
      reasons.push('Селище')
    }
  }

  // --- Weather / clothing ---
  if (weather === 'rain' || weather === 'storm') {
    if (tags.has('wet') || tags.has('night')) {
      score += 14
      reasons.push('Дощ/шторм')
    }
  }
  if (clothing.includes('біл') || clothing.includes('майк') || clothing.includes('футболка') || clothing.includes('tee')) {
    if (tags.has('tee')) {
      score += 16
      reasons.push('Одяг: майка/футболка')
    }
  }
  if (clothing.includes('ритуал') || clothing.includes('жриц')) {
    if (tags.has('ritual') || tags.has('temple')) {
      score += 18
      reasons.push('Ритуальний одяг')
    }
  }
  if (clothing.includes('плем') || clothing.includes('tribal')) {
    if (tags.has('tribal')) score += 14
  }

  // --- Stats ---
  if (conf >= 70 && shame <= 30) {
    if (tags.has('confident') || tags.has('seductive')) {
      score += 12
      reasons.push('Висока впевненість')
    }
  }
  if (mood === 'exhausted' || mood === 'sad') {
    if (tags.has('exhausted')) {
      score += 20
      reasons.push('Виснаження')
    } else if (tags.has('sexy')) score -= 8
  }

  // Chapter soft bias
  if (chapter === 'arrival' || chapter === 'jungle') {
    if (tags.has('beach') || tags.has('jungle')) score += 4
  }
  if (chapter === 'temple' || chapter === 'climax') {
    if (tags.has('temple') || tags.has('ritual') || tags.has('dark')) score += 6
  }

  // Prefer portraits for UI avatars slightly when not fullbody requested
  if (tags.has('portrait') || tags.has('closeup') || tags.has('intimate')) {
    score += 2
  }

  return { score, reasons }
}

/**
 * Pick best gallery image for current game state.
 * Returns null if gallery empty or no item scores above minScore.
 */
export function pickActiveGalleryImage(
  items: LaraGalleryItem[],
  ctx: GalleryPickContext,
  opts?: { minScore?: number }
): GalleryPickResult | null {
  if (!items?.length) return null
  const minScore = opts?.minScore ?? 8

  let best: GalleryPickResult | null = null
  for (const item of items) {
    const { score, reasons } = scoreGalleryItem(item, ctx)
    if (!best || score > best.score) {
      best = { item, score, reasons }
    }
  }
  if (!best || best.score < minScore) return null
  return best
}

/** Build context from gameState-like object + optional sex flag. */
export function galleryContextFromState(
  state: Record<string, unknown> | null | undefined,
  extra?: { inSexScene?: boolean }
): GalleryPickContext {
  const s = state || {}
  return {
    location: (s.location as string) ?? null,
    timeOfDay: (s.timeOfDay as string) ?? null,
    mood: (s.mood as string) ?? null,
    weather: (s.weather as string) ?? null,
    desire: typeof s.desire === 'number' ? s.desire : null,
    shame: typeof s.shame === 'number' ? s.shame : null,
    confidence: typeof s.confidence === 'number' ? s.confidence : null,
    isDarkLara: Boolean(s.isDarkLara),
    isPregnant: Boolean(s.isPregnant),
    clothing: (s.clothing as string) ?? null,
    chapter: (s.chapter as string) ?? null,
    dayNumber: typeof s.dayNumber === 'number' ? s.dayNumber : null,
    inSexScene: extra?.inSexScene ?? false,
  }
}
