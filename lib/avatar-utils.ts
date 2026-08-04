// Avatar mapping utility — maps NPC names and races to avatar images

import { getLaraAvatarFromState } from '@/lib/game/lara-appearance'

// Unique named NPCs → exact avatar
const NAMED_AVATARS: Record<string, string> = {
  'лара': '/avatars/lara.png',
  'lara': '/avatars/lara.png',
  'лара крофт': '/avatars/lara.png',
  'джек': '/avatars/jack.png',
  'джек вейн': '/avatars/jack.png',
  'jack': '/avatars/jack.png',
  'тане': '/avatars/tane.png',
  'tane': '/avatars/tane.png',
  'лея': '/avatars/leya.png',
  'leya': '/avatars/leya.png',
  'араху': '/avatars/arahu.png',
  'arahu': '/avatars/arahu.png',
}

// Race/tribe keywords → avatar sets (leader, male, female, generic)
interface RaceAvatars {
  leader: string
  male: string[]
  female: string[]
  generic: string
}

const RACE_AVATARS: Record<string, RaceAvatars> = {
  'кай-тору': {
    leader: '/avatars/human_male_1.png',
    male: ['/avatars/human_male_1.png', '/avatars/human_male_2.png', '/avatars/human_male_3.png'],
    female: ['/avatars/human_female_1.png', '/avatars/human_female_2.png', '/avatars/human_female_3.png'],
    generic: '/avatars/human_male_1.png',
  },
  'кентавр': {
    leader: '/avatars/centaur_leader.png',
    male: ['/avatars/centaur.png'],
    female: ['/avatars/centaur_female.png'],
    generic: '/avatars/centaur.png',
  },
  'мінотавр': {
    leader: '/avatars/minotaur_leader.png',
    male: ['/avatars/minotaur.png'],
    female: ['/avatars/minotaur_female.png'],
    generic: '/avatars/minotaur.png',
  },
  'свинолюд': {
    leader: '/avatars/pigman_leader.png',
    male: ['/avatars/pigman.png'],
    female: ['/avatars/pigman_female.png'],
    generic: '/avatars/pigman.png',
  },
  'гієноїд': {
    leader: '/avatars/hyenoid_leader.png',
    male: ['/avatars/hyenoid.png'],
    female: ['/avatars/hyenoid_female.png'],
    generic: '/avatars/hyenoid.png',
  },
}

// Aliases for fuzzy matching
const RACE_ALIASES: Record<string, string> = {
  'людина': 'кай-тору',
  'людський': 'кай-тору',
  'кай тору': 'кай-тору',
  'kai-toru': 'кай-тору',
  'human': 'кай-тору',
  'кентаври': 'кентавр',
  'centaur': 'кентавр',
  'мінотаври': 'мінотавр',
  'minotaur': 'мінотавр',
  'свинолюди': 'свинолюд',
  'свинолюд': 'свинолюд',
  'pigman': 'свинолюд',
  'гієноїди': 'гієноїд',
  'hyenoid': 'гієноїд',
}

/**
 * Get avatar path for a character by name, with optional tribe/race hint.
 * Uses a deterministic hash for unnamed NPCs to always get the same avatar.
 */
export function getAvatar(
  name: string,
  options?: { tribe?: string; race?: string; gender?: string; isLeader?: boolean }
): string {
  const nameLower = name.toLowerCase().trim()

  // 1. Check exact named NPCs
  if (NAMED_AVATARS[nameLower]) {
    return NAMED_AVATARS[nameLower]
  }

  // 2. Determine race from tribe/race hint or name keywords
  let raceKey: string | null = null

  const hints = [options?.tribe, options?.race, name].filter(Boolean).map(s => s!.toLowerCase())
  for (const hint of hints) {
    // Direct match
    if (RACE_AVATARS[hint]) { raceKey = hint; break }
    // Alias match
    for (const [alias, canonical] of Object.entries(RACE_ALIASES)) {
      if (hint.includes(alias)) { raceKey = canonical; break }
    }
    if (raceKey) break
  }

  // 3. If race found, pick appropriate avatar
  if (raceKey && RACE_AVATARS[raceKey]) {
    const set = RACE_AVATARS[raceKey]

    // Leader?
    if (options?.isLeader) return set.leader

    // Gender-based
    const gender = options?.gender?.toLowerCase()
    if (gender === 'female' || gender === 'f' || gender === 'жін' || gender === 'ж') {
      return set.female[simpleHash(nameLower) % set.female.length]
    }

    // Default male for that race
    return set.male[simpleHash(nameLower) % set.male.length]
  }

  // 4. Fallback — pick a human avatar based on name hash
  const humanMales = RACE_AVATARS['кай-тору'].male
  return humanMales[simpleHash(nameLower) % humanMales.length]
}

/** Simple deterministic hash for consistent avatar assignment */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Get Lara's avatar — multi-look from game state when provided. */
export function getLaraAvatar(
  state?: Parameters<typeof getLaraAvatarFromState>[0]
): string {
  return getLaraAvatarFromState(state ?? null)
}

/** Get avatar for tribe name (for tribe reputation tab) */
export function getTribeAvatar(tribeName: string): string {
  const lower = tribeName.toLowerCase()
  const raceKey = RACE_ALIASES[lower] || lower
  if (RACE_AVATARS[raceKey]) {
    return RACE_AVATARS[raceKey].leader
  }
  return '/avatars/human_male_1.png'
}
