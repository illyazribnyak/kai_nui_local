import { QUEST_LADDER } from '@/lib/game/quest-ladder-data'

export type StepContext = {
  currentLoc: string
  discoveredLocs: { name: string }[]
  factKeys: Set<string> | string[]
  metNames: Set<string> | string[]
  inventory: { name: string; category: string }[]
}

function asSet(v: Set<string> | string[]): Set<string> {
  return v instanceof Set ? v : new Set(v.map((x) => x.toLowerCase()))
}

function matchesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase()
  return needles.some((n) => h.includes(n.toLowerCase()))
}

/** Pure: is a ladder step complete given world context? */
export function isLadderStepComplete(
  step: (typeof QUEST_LADDER)[number],
  ctx: StepContext
): boolean {
  const factKeys = asSet(ctx.factKeys)
  const metNames = asSet(ctx.metNames)
  const cw = step.completeWhen as {
    locations?: readonly string[]
    factKeys?: readonly string[]
    metNpc?: readonly string[]
    inventoryCategories?: readonly string[]
    inventoryNameHints?: readonly string[]
  }

  if (cw.locations?.length) {
    if (matchesAny(ctx.currentLoc, [...cw.locations])) return true
    if (ctx.discoveredLocs.some((l) => matchesAny(l.name, [...cw.locations!]))) return true
  }
  if (cw.factKeys?.length) {
    if (cw.factKeys.some((k) => factKeys.has(k.toLowerCase()))) return true
  }
  if (cw.metNpc?.length) {
    if (cw.metNpc.some((n) => metNames.has(n.toLowerCase()))) return true
  }
  if (cw.inventoryCategories?.length || cw.inventoryNameHints?.length) {
    for (const i of ctx.inventory) {
      const cat = (i.category || '').toLowerCase()
      const name = (i.name || '').toLowerCase()
      if (cw.inventoryCategories?.some((c) => cat.includes(c.toLowerCase()))) return true
      if (cw.inventoryNameHints?.some((h) => name.includes(h.toLowerCase()))) return true
    }
  }
  return false
}

/**
 * Pure sequential evaluation: which titles become completed given prior completed set?
 * Returns newly completed titles in order (does not mutate).
 */
export function planLadderCompletions(
  alreadyCompleted: string[],
  ctx: StepContext
): { complete: string[]; nextActive: string | null } {
  const done = new Set(alreadyCompleted)
  const complete: string[] = []
  let nextActive: string | null = null

  for (let i = 0; i < QUEST_LADDER.length; i++) {
    const step = QUEST_LADDER[i]
    if (done.has(step.title)) continue
    // previous must be done
    if (i > 0 && !done.has(QUEST_LADDER[i - 1].title)) {
      nextActive = nextActive ?? step.title
      break
    }
    if (isLadderStepComplete(step, ctx)) {
      complete.push(step.title)
      done.add(step.title)
      continue
    }
    nextActive = step.title
    break
  }
  if (!nextActive) {
    const lastOpen = QUEST_LADDER.find((s) => !done.has(s.title))
    nextActive = lastOpen?.title ?? null
  }
  return { complete, nextActive }
}
