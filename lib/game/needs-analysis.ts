/**
 * Heuristic: should we run the secondary analyzer LLM after the narrator stream?
 * Used by /api/chat to save tokens when tags already look complete.
 */

export interface NarratorTagSnapshot {
  choices?: unknown[] | null
  stat?: Record<string, unknown> | null
  inv?: unknown[] | null
  rel?: unknown[] | null
}

const ITEM_HINT =
  /знайш|підібр|взял|отрим|з'їл|з’їл|випи|втрати|одяг|знахідк|піднял|схов|крафт|змайстр/i
const NPC_HINT =
  /зустріч|сказав|відповід|воїн|шаман|тане|лея|джек|вождь|найя|ксерон|гор-ак|кіра/i

function hasEntries(arr: unknown[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.length > 0
}

function hasStatKeys(stat: Record<string, unknown> | null | undefined): boolean {
  return Boolean(stat && typeof stat === 'object' && Object.keys(stat).length > 0)
}

/**
 * Returns true when the narrator output looks incomplete and needs analyzer fill-in.
 */
export function needsDeepAnalysis(
  fullContent: string,
  deepseekParsed: NarratorTagSnapshot
): boolean {
  const hasChoices = hasEntries(deepseekParsed.choices ?? null)
  const hasStat = hasStatKeys(deepseekParsed.stat ?? null)
  const hasInv = hasEntries(deepseekParsed.inv ?? null)
  const hasRel = hasEntries(deepseekParsed.rel ?? null)

  const text = fullContent || ''
  const mentionsItem = ITEM_HINT.test(text)
  const mentionsNpc = NPC_HINT.test(text)

  if (mentionsItem && !hasInv) return true
  if (mentionsNpc && !hasRel) return true
  // Choices + stat tags are expected every successful turn
  if (!hasChoices || !hasStat) return true

  return false
}
