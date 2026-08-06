/**
 * Auto-complete side quests (SIDE_QUESTS) when any completeFactKeys is known.
 * Complements syncQuestLadder for the main ladder.
 */

import { prisma } from '@/lib/db'
import { SIDE_QUESTS } from '@/lib/game/canon-events'

function asFactSet(keys: Iterable<string>): Set<string> {
  return new Set([...keys].map((k) => k.toLowerCase().trim()).filter(Boolean))
}

/** Pure: which side-quest titles should complete given facts? */
export function planSideQuestCompletions(
  factKeys: Iterable<string>,
  activeOrOpenTitles: Iterable<string>
): string[] {
  const facts = asFactSet(factKeys)
  const open = new Set([...activeOrOpenTitles].map((t) => t.trim()).filter(Boolean))
  const done: string[] = []

  for (const q of SIDE_QUESTS) {
    if (!open.has(q.title)) continue
    const keys = q.completeFactKeys ?? []
    if (!keys.length) continue
    // ANY key completes (branching endings: bless|reject, free|dead, …)
    if (keys.some((k) => facts.has(k.toLowerCase()))) {
      done.push(q.title)
    }
  }
  return done
}

/**
 * Mark matching active/locked side quests completed when facts satisfy them.
 * Does not touch main ladder titles (handled by syncQuestLadder).
 */
export async function syncSideQuestsFromFacts(): Promise<string[]> {
  const [facts, quests] = await Promise.all([
    prisma.worldFact.findMany({ select: { key: true } }),
    prisma.quest.findMany({
      where: { status: { in: ['active', 'locked'] } },
      select: { title: true, status: true },
    }),
  ])

  const factKeys = facts.map((f) => f.key)
  const openTitles = quests.map((q) => q.title)
  const toComplete = planSideQuestCompletions(factKeys, openTitles)

  const completed: string[] = []
  for (const title of toComplete) {
    try {
      await prisma.quest.update({
        where: { title },
        data: { status: 'completed' },
      })
      completed.push(title)
    } catch {
      /* ignore missing */
    }
  }
  return completed
}
