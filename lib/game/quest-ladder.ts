import { prisma } from '@/lib/db'
import { QUEST_LADDER } from '@/lib/game/quest-ladder-data'
import { isLadderStepComplete } from '@/lib/game/quest-step'

export { QUEST_LADDER, QUEST_LADDER_TITLES } from '@/lib/game/quest-ladder-data'

export async function seedQuestLadder() {
  for (let i = 0; i < QUEST_LADDER.length; i++) {
    const q = QUEST_LADDER[i]
    const status = i === 0 ? 'active' : 'locked'
    await prisma.quest.upsert({
      where: { title: q.title },
      update: {
        // Keep status/progress; refresh copy when ladder text changes
        description: q.description,
        givenBy: q.givenBy,
      },
      create: {
        title: q.title,
        description: q.description,
        status,
        givenBy: q.givenBy,
      },
    })
  }
  await normalizeQuestLadderStatuses()
}

/**
 * Ensure only the first non-completed ladder quest is active; later ones locked.
 */
export async function normalizeQuestLadderStatuses(): Promise<void> {
  const quests = await prisma.quest.findMany()
  let openedNext = false
  for (const step of QUEST_LADDER) {
    const q = quests.find((x) => x.title === step.title)
    if (!q) continue
    if (q.status === 'completed' || q.status === 'failed') continue
    if (!openedNext) {
      if (q.status !== 'active') {
        await prisma.quest.update({ where: { id: q.id }, data: { status: 'active' } })
      }
      openedNext = true
    } else if (q.status !== 'locked') {
      await prisma.quest.update({ where: { id: q.id }, data: { status: 'locked' } })
    }
  }
}

/** Auto-complete ladder quests sequentially. Returns newly completed titles. */
export async function syncQuestLadder(): Promise<string[]> {
  await normalizeQuestLadderStatuses()

  const state = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  const locations = await prisma.location.findMany()
  const facts = await prisma.worldFact.findMany()
  const rels = await prisma.relationship.findMany({ where: { met: true } })
  const inventory = await prisma.inventoryItem.findMany()
  const quests = await prisma.quest.findMany()

  const ctx = {
    currentLoc: state?.location ?? '',
    discoveredLocs: locations.filter((l) => l.discovered || l.isCurrent),
    factKeys: new Set(facts.map((f) => f.key.toLowerCase())),
    metNames: new Set(rels.map((r) => r.name.toLowerCase())),
    inventory,
  }

  const completedNow: string[] = []

  for (let i = 0; i < QUEST_LADDER.length; i++) {
    const step = QUEST_LADDER[i]
    const quest = quests.find((q) => q.title === step.title)
    if (!quest || quest.status === 'completed' || quest.status === 'failed') continue

    if (i > 0) {
      const prev = quests.find((q) => q.title === QUEST_LADDER[i - 1].title)
      if (!prev || prev.status !== 'completed') break
    }

    if (quest.status !== 'active') continue
    if (!isLadderStepComplete(step, ctx)) break

    await prisma.quest.update({
      where: { title: step.title },
      data: { status: 'completed' },
    })
    completedNow.push(step.title)
    quest.status = 'completed'

    const next = QUEST_LADDER[i + 1]
    if (next) {
      const nq = quests.find((q) => q.title === next.title)
      if (nq && nq.status !== 'completed') {
        await prisma.quest.update({
          where: { title: next.title },
          data: { status: 'active' },
        })
        nq.status = 'active'
      }
    }
  }

  return completedNow
}
