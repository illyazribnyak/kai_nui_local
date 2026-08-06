/**
 * Week-1 story consistency: FACT prerequisites + mutually exclusive endings.
 * Pure helpers — applyFactUpdates / tests call these.
 */

import { getCanonEvent } from '@/lib/game/canon-events'

/** key → soft prerequisites (auto-seeded if missing). */
export const FACT_PREREQUISITES: Record<string, readonly string[]> = {
  // Tane family
  tane_guides_lara: ['met_tane'],
  tane_first_hunt: ['met_tane'],
  tane_first_intimacy: ['met_tane'],
  tane_sacred_waterfall: ['met_tane'],
  tane_confessed: ['met_tane'],
  tane_presents_lara_to_father: ['met_tane'],
  tane_life_saver: ['met_tane'],
  tane_jealousy_jack: ['met_tane'],
  tane_torn_choice: ['met_tane', 'met_leya'],
  tane_defies_makai: ['met_tane', 'met_makai'],
  tane_witnesses_makai_lara: ['met_tane', 'makai_sex_with_lara'],
  tane_chooses_lara_public: ['met_tane'],
  soul_bound_tane: ['met_tane'],

  tane_leya_siblings: ['met_tane', 'met_leya'],
  tane_leya_secret_lovers: ['met_tane', 'met_leya'],
  caught_tane_leya_intimate: ['met_tane', 'met_leya'],
  tane_leya_confrontation: ['met_leya'],
  leya_threatens_lara: ['met_leya'],
  leya_accepts_lara: ['met_leya'],
  leya_lara_first_intimacy: ['met_leya'],
  tane_leya_reconciliation: ['met_leya', 'met_tane'],
  tane_leya_triad_ritual: ['met_tane', 'met_leya'],
  leya_past_with_jack: ['met_leya'],

  makai_claims_lara: ['met_makai'],
  makai_sex_with_lara: ['met_makai'],
  makai_blesses_lara: ['met_makai'],
  makai_rejects_lara: ['met_makai'],
  makai_blood_custom_hint: ['met_makai'],
  tane_leya_father_journal: ['tane_leya_father_clue'],
  family_hearth_accepted: ['met_tane'],

  // Jack
  jack_found_alive: ['met_jack'],
  jack_offers_guide: ['met_jack'],
  jack_map_shared: ['met_jack'],
  jack_ruins_explored: ['met_jack'],
  jack_leya_confrontation: ['met_jack', 'met_leya'],
  jack_temple_hint: ['met_jack'],
  jack_loyalty_ally: ['met_jack'],
  jack_loyalty_rival: ['met_jack'],
  jack_secret: ['met_jack'],

  // Zek renegade
  zek_begs_protection: ['met_zek'],
  zek_escape_story: ['met_zek'],
  zek_death_scent: ['met_zek'],
  zek_sheltered: ['met_zek'],
  zek_kai_toru_hostility: ['met_zek'],
  zek_first_intimacy: ['met_zek'],
  zek_knot_bond: ['met_zek'],
  zek_saves_lara: ['met_zek'],
  zek_hunters: ['met_zek'],
  zek_scent_masked: ['zek_death_scent'],
  zek_naya_aid: ['met_zek'],
  zek_mark_cleansed: ['zek_death_scent'],
  zek_guide: ['met_zek'],
  zek_pack_secret: ['met_zek'],
  zek_protected: ['met_zek'],
  zek_betrayed: ['met_zek'],
  kira_demands_zek: ['met_zek'],
  kira_trade_for_zek: ['met_zek', 'met_kira'],
  zek_kira_confront: ['met_zek'],
  zek_loyal_oath: ['met_zek'],
  zek_jealousy: ['met_zek'],
  zek_free_exile: ['met_zek'],
  zek_companion: ['met_zek'],
  zek_returned: ['met_zek'],
  zek_dead: ['met_zek'],

  // Tribe entries
  guest_of_tribe: ['entered_village'],
  tribe_accepted: ['entered_village'],
  hyena_pact: ['entered_hyena_territory'],

  // Centaur arc
  xeron_demands_trial: ['met_xeron'],
  centaur_trial_won: ['entered_centaur_lands', 'met_xeron'],
  xeron_challenge_race: ['met_xeron'],
  centaur_accepted: ['centaur_trial_won'],
  xeron_respects_lara: ['met_xeron'],
  xeron_first_intimacy: ['met_xeron'],
  centaur_mate_claim: ['met_xeron'],
  hippolyta_jealousy: ['met_hippolyta'],
  hippolyta_first_intimacy: ['met_hippolyta'],
  hippolyta_sisterhood: ['met_hippolyta'],
  hippolyta_teaches_riding: ['met_hippolyta'],
  centaur_moon_run: ['entered_centaur_lands'],
  centaur_herd_challenge: ['entered_centaur_lands'],
  centaur_herd_ally: ['entered_centaur_lands'],
  centaur_exile_path: ['entered_centaur_lands'],
}

/**
 * At most one key from each group should be active.
 * Adding one removes the others (last write wins).
 */
export const FACT_MUTEX_GROUPS: readonly (readonly string[])[] = [
  ['zek_free_exile', 'zek_companion', 'zek_returned', 'zek_dead'],
  ['makai_blesses_lara', 'makai_rejects_lara'],
  ['jack_loyalty_ally', 'jack_loyalty_rival'],
  ['blood_custom_broken', 'blood_custom_continued'],
  ['zek_protected', 'zek_betrayed'],
  ['centaur_herd_ally', 'centaur_exile_path'],
]

export type FactGatePlan = {
  /** Keys to upsert (requested + auto prereqs), in order */
  toAdd: string[]
  /** Mutex victims to delete */
  toRemove: string[]
  /** Human notes for logs / optional GM notice */
  notes: string[]
}

function norm(k: string): string {
  return k
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\u0400-\u04ff-]/gi, '')
    .slice(0, 80)
}

/**
 * Expand a batch of incoming FACT keys with prereqs + mutex removals.
 * @param incoming keys the AI wants to add this turn
 * @param existing keys already in WorldFact
 */
export function planFactGateBatch(
  incoming: string[],
  existing: Iterable<string>
): FactGatePlan {
  const have = new Set([...existing].map((k) => norm(k)).filter(Boolean))
  const notes: string[] = []
  const toAdd: string[] = []
  const toRemove: string[] = []
  const removeSet = new Set<string>()

  const queue = [...new Set(incoming.map(norm).filter(Boolean))]

  const ensurePrereqs = (key: string, depth = 0) => {
    if (depth > 8) return
    const prereqs = FACT_PREREQUISITES[key]
    if (!prereqs?.length) return
    for (const p of prereqs) {
      const pk = norm(p)
      if (!pk) continue
      if (have.has(pk) || toAdd.includes(pk)) continue
      ensurePrereqs(pk, depth + 1)
      if (!have.has(pk) && !toAdd.includes(pk)) {
        toAdd.push(pk)
        notes.push(`auto-prereq: ${pk} ← ${key}`)
      }
    }
  }

  for (const key of queue) {
    ensurePrereqs(key)
    if (!toAdd.includes(key) && !have.has(key)) {
      toAdd.push(key)
    } else if (!toAdd.includes(key) && have.has(key)) {
      // re-assert / update content allowed — include for upsert
      toAdd.push(key)
    }

    // Mutex: this key wins, drop siblings
    for (const group of FACT_MUTEX_GROUPS) {
      const g = group.map(norm)
      if (!g.includes(key)) continue
      for (const other of g) {
        if (other === key) continue
        if (have.has(other) || toAdd.includes(other)) {
          removeSet.add(other)
          notes.push(`mutex: keep ${key}, drop ${other}`)
        }
      }
      // Also strip siblings from toAdd if they were in same batch earlier
      for (let i = toAdd.length - 1; i >= 0; i--) {
        if (toAdd[i] !== key && g.includes(toAdd[i])) {
          notes.push(`mutex batch: drop ${toAdd[i]} for ${key}`)
          toAdd.splice(i, 1)
        }
      }
    }
  }

  // Don't remove a key we're about to add
  for (const k of toAdd) removeSet.delete(k)
  toRemove.push(...removeSet)

  return { toAdd, toRemove, notes }
}

/** Default content when auto-seeding a prereq fact. */
export function contentForFactKey(key: string, fallback?: string): string {
  const canon = getCanonEvent(key)
  if (canon?.content) return canon.content
  if (fallback) return fallback
  return `Канонічна подія: ${key}`
}

export function categoryForFactKey(key: string, fallback = 'plot'): string {
  const canon = getCanonEvent(key)
  return canon?.category || fallback
}
