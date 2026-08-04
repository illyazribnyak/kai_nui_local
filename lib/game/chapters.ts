/** Story chapters / progress toward endings. */

export interface ChapterDef {
  id: string
  label: string
  order: number
  description: string
  /** Location name substrings that unlock this chapter */
  locationHints: string[]
  /** WorldFact keys that unlock this chapter */
  factKeys: string[]
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 'arrival',
    label: 'Прибуття',
    order: 0,
    description: 'Лара на березі після аварії',
    locationHints: ['берег'],
    factKeys: [],
  },
  {
    id: 'jungle',
    label: 'Джунглі',
    order: 1,
    description: 'Дослідження острова, перші знахідки',
    locationHints: ['джунгл', 'водоспад', 'лагуна', 'мангров'],
    factKeys: ['entered_jungle', 'found_fresh_water', 'found_food', 'first_night_survived'],
  },
  {
    id: 'tribe',
    label: 'Племена',
    order: 2,
    description: 'Зустріч з Кай-Тору та іншими племенами',
    locationHints: ['кай-тору', 'селищ', 'кентавр', 'мінотавр', 'свинолюд', 'гієноїд', 'болот'],
    factKeys: [
      'met_kai_toru',
      'entered_village',
      'met_tribe_leader',
      'met_tane',
      'met_leya',
      'met_jack',
      'met_makai',
      'met_naya',
      'guest_of_tribe',
    ],
  },
  {
    id: 'depths',
    label: 'Глибини острова',
    order: 3,
    description: 'Печери, руїни, священна гора',
    locationHints: ['печер', 'руїн', 'свяще', 'гора', 'лабіринт'],
    factKeys: [
      'found_ruins',
      'climbed_mountain',
      'entered_caves',
      'learned_amulet_secret',
      'spoke_with_naya',
      'met_arahu',
      'other_tribe_contact',
      'entered_centaur_lands',
      'entered_minotaur_labyrinth',
      'entered_hyena_territory',
      'entered_boar_swamps',
      'jack_ruins_explored',
    ],
  },
  {
    id: 'temple',
    label: 'Храм',
    order: 4,
    description: 'Шлях до храму і Скарбу Атлантів',
    locationHints: ['храм'],
    factKeys: ['found_temple', 'temple_opened', 'amulet_awakened'],
  },
  {
    id: 'climax',
    label: 'Кульмінація',
    order: 5,
    description: 'Вибір долі острова',
    locationHints: [],
    factKeys: ['treasure_found', 'ritual_started', 'dark_lara_awake'],
  },
  {
    id: 'ending',
    label: 'Фінал',
    order: 6,
    description: 'Кінцівка',
    locationHints: [],
    factKeys: ['ending_freedom', 'ending_priestess', 'ending_goddess', 'ending_destroyer', 'ending_dark_queen'],
  },
]

export const ENDING_PATHS: Record<string, string> = {
  freedom: 'Шлях Свободи',
  priestess: 'Шлях Жриці',
  goddess: 'Шлях Богині',
  destroyer: 'Шлях Руйнівниці',
  dark_queen: 'Королева Темряви',
}

export function chapterProgressPercent(chapterId: string): number {
  const ch = CHAPTERS.find((c) => c.id === chapterId)
  if (!ch) return 0
  const max = CHAPTERS.length - 1
  return Math.round((ch.order / max) * 100)
}

/** Infer the highest unlocked chapter from location + facts. */
export function inferChapter(
  location: string | null | undefined,
  factKeys: string[],
  currentChapterId?: string | null
): ChapterDef {
  const loc = (location ?? '').toLowerCase()
  const keys = new Set(factKeys.map((k) => k.toLowerCase()))
  let best = CHAPTERS[0]

  for (const ch of CHAPTERS) {
    const byLoc = ch.locationHints.some((h) => loc.includes(h.toLowerCase()))
    const byFact = ch.factKeys.some((k) => keys.has(k.toLowerCase()))
    if (byLoc || byFact) {
      if (ch.order >= best.order) best = ch
    }
  }

  // Never go backwards unless already on ending
  if (currentChapterId) {
    const cur = CHAPTERS.find((c) => c.id === currentChapterId)
    if (cur && cur.order > best.order && currentChapterId !== 'ending') {
      return cur
    }
  }

  return best
}

export function endingFromFactKeys(factKeys: string[]): string | null {
  for (const key of factKeys) {
    if (key.startsWith('ending_')) {
      const path = key.replace(/^ending_/, '')
      if (ENDING_PATHS[path]) return path
    }
  }
  return null
}
