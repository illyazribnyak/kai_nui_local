/**
 * Dynamic system-prompt slices: only inject heavy arc blocks when relevant.
 * Reduces token noise and keeps the GM focused on active story.
 */

import {
  formatCanonEventsForPrompt,
  formatCentaurArcForPrompt,
  formatSideQuestsForPrompt,
  formatTaneLeyaArcForPrompt,
  formatTribeEntriesForPrompt,
  formatZekArcForPrompt,
} from '@/lib/game/canon-events'

export type PromptDynamicInput = {
  factKeys: Iterable<string>
  location?: string | null
  companionName?: string | null
  metNpc?: Iterable<string>
  chapter?: string | null
}

function setOf(v: Iterable<string> | undefined): Set<string> {
  return new Set([...(v || [])].map((x) => String(x).toLowerCase().trim()).filter(Boolean))
}

function locHas(loc: string, ...needles: string[]): boolean {
  const l = loc.toLowerCase()
  return needles.some((n) => l.includes(n.toLowerCase()))
}

export function shouldIncludeZekArc(input: PromptDynamicInput): boolean {
  const facts = setOf(input.factKeys)
  const loc = input.location || ''
  const companion = (input.companionName || '').toLowerCase()
  if (companion.includes('зек')) return true
  if ([...facts].some((k) => k.includes('zek') || k === 'met_kira' || k === 'hyena_pact')) {
    return true
  }
  if (locHas(loc, 'гієн', 'hyena', 'мангров')) return true
  return false
}

export function shouldIncludeTaneFamilyArc(input: PromptDynamicInput): boolean {
  const facts = setOf(input.factKeys)
  const loc = input.location || ''
  const met = setOf(input.metNpc)
  if (met.has('тане') || met.has('лея') || met.has('макаї')) return true
  if (
    [...facts].some(
      (k) =>
        k.includes('tane') ||
        k.includes('leya') ||
        k.includes('makai') ||
        k === 'entered_village' ||
        k === 'guest_of_tribe' ||
        k.includes('blood_custom') ||
        k === 'family_hearth_accepted'
    )
  ) {
    return true
  }
  if (locHas(loc, 'кай-тору', 'селищ', 'водоспад')) return true
  // Early game: light hook only after beach — still show short if in tribe chapter
  if ((input.chapter || '').toLowerCase() === 'tribe') return true
  return false
}

export function shouldIncludeJackChain(input: PromptDynamicInput): boolean {
  const facts = setOf(input.factKeys)
  const met = setOf(input.metNpc)
  if (met.has('джек вейн') || met.has('джек')) return true
  return [...facts].some((k) => k.includes('jack'))
}

export function shouldIncludeCentaurArc(input: PromptDynamicInput): boolean {
  const facts = setOf(input.factKeys)
  const loc = input.location || ''
  const met = setOf(input.metNpc)
  if (met.has('ксерон') || met.has('іпполіта') || met.has('ипполита')) return true
  if (
    [...facts].some(
      (k) =>
        k.includes('centaur') ||
        k.includes('xeron') ||
        k.includes('hippolyta')
    )
  ) {
    return true
  }
  if (locHas(loc, 'кентавр', 'centaur', 'луки', 'східн')) return true
  return false
}

/** Compact “what is true now” for the GM — prefers plot/npc over starter hooks. */
export function formatActiveStoryBrief(
  worldFacts: { key: string; category?: string; content?: string }[],
  max = 18
): string {
  if (!worldFacts?.length) {
    return '\n--- АКТИВНИЙ СЮЖЕТ ---\n(Ще немає WorldFact — став FACT_ADD на ключові події.)\n---\n'
  }

  const deprioritize = new Set([
    'shipwrecked',
    'goal_atlantis_treasure',
    'canon_cast',
    'jack_mission_hook',
    'tribes_react_differently',
    'zek_renegade_hook',
    'tane_family_hook',
  ])

  const scored = [...worldFacts].map((f) => {
    let score = 0
    const cat = (f.category || '').toLowerCase()
    if (cat === 'npc' || cat === 'plot') score += 3
    if (cat === 'secret' || cat === 'ritual') score += 2
    if (deprioritize.has(f.key)) score -= 5
    if (f.key.startsWith('ending_')) score += 10
    if (f.key.includes('zek') || f.key.includes('tane') || f.key.includes('jack')) score += 1
    return { f, score }
  })
  scored.sort((a, b) => b.score - a.score)

  const pick = scored.slice(0, max).map(({ f }) => {
    const body = (f.content || f.key).toString().slice(0, 120)
    return `• ${f.key}: ${body}`
  })

  return (
    `\n--- АКТИВНИЙ СЮЖЕТ (сервер; не супереч) ---\n` +
    pick.join('\n') +
    `\nВсього фактів: ${worldFacts.length}. Нові канонічні події → FACT_ADD з точним snake_case ключем.\n---\n`
  )
}

/**
 * Heavy lore blocks: always tribe entries + slim canon list;
 * full Zek / Tane / side-quest chains only when relevant.
 */
export function formatDynamicLoreBlocks(input: PromptDynamicInput): string {
  const zek = shouldIncludeZekArc(input)
  const tane = shouldIncludeTaneFamilyArc(input)
  const jack = shouldIncludeJackChain(input)
  const centaur = shouldIncludeCentaurArc(input)

  // Fewer canon lines early / when arcs not open
  const factCount = [...setOf(input.factKeys)].length
  const canonMax = factCount < 8 ? 45 : factCount < 25 ? 70 : 90

  const chains: Array<'jack' | 'zek' | 'tane_family' | 'centaur' | 'tribe_entry'> = [
    'tribe_entry',
  ]
  if (jack) chains.push('jack')
  if (zek) chains.push('zek')
  if (tane) chains.push('tane_family')
  if (centaur) chains.push('centaur')

  const parts: string[] = []
  parts.push(formatTribeEntriesForPrompt())
  parts.push(formatCanonEventsForPrompt(canonMax))
  parts.push(
    formatSideQuestsForPrompt({
      chains,
      includeOther: jack || tane || zek || centaur,
    })
  )

  if (zek) {
    parts.push(formatZekArcForPrompt())
  } else {
    parts.push(
      `\n--- АРКА ЗЕКА (стисло) ---\n` +
        `Повний бріф з'явиться біля гієноїдів / після сліду відступника / met_zek. ` +
        `Не вигадуй Зека «заблукалим» — він злочинець стаї з death-scent.\n---\n`
    )
  }

  if (tane) {
    parts.push(formatTaneLeyaArcForPrompt())
  } else {
    parts.push(
      `\n--- АРКА РОДУ (стисло) ---\n` +
        `Повний бріф після met_tane / селище Кай-Тору. ` +
        `Тане+Лея = брат/сестра + інцест (канон); Макаї = батько.\n---\n`
    )
  }

  if (centaur) {
    parts.push(formatCentaurArcForPrompt())
  } else {
    parts.push(
      `\n--- АРКА КЕНТАВРІВ (стисло) ---\n` +
        `Повний бріф на землях кентаврів / met_xeron. Спочатку trial, потім близькість.\n---\n`
    )
  }

  if (!jack && !zek && !tane && !centaur) {
    parts.push(
      `\n--- ПОБІЧНІ АРКИ ---\n` +
        `Джек / Зек / рід Тане / кентаври — за слідами; не форсуй усі одразу.\n---\n`
    )
  }

  return parts.join('')
}
