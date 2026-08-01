import { prisma } from '@/lib/db'
import { restorePlaythrough } from '@/lib/game/restore-save'

const SNAPSHOT_ID = 'latest'

/** Capture full playthrough BEFORE applying the next turn's mutations. */
export async function saveTurnSnapshot(userMessage: string): Promise<void> {
  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  const relationships = await prisma.relationship.findMany()
  const inventory = await prisma.inventoryItem.findMany()
  const quests = await prisma.quest.findMany()
  const diary = await prisma.diaryEntry.findMany()
  const skills = await prisma.skill.findMany()
  const messages = await prisma.message.findMany({ orderBy: { createdAt: 'asc' }, take: 300 })
  const summaries = await prisma.storySummary.findMany({ orderBy: { createdAt: 'asc' } })
  const locations = await prisma.location.findMany()
  const tribeReputations = await prisma.tribeReputation.findMany()
  const achievements = await prisma.achievement.findMany()
  const diseases = await prisma.disease.findMany()
  const worldFacts = await prisma.worldFact.findMany()

  const payload = {
    version: 2,
    userMessage,
    gameState,
    relationships,
    inventory,
    quests,
    diary,
    skills,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    summaries: summaries.map((s) => ({ content: s.content, dayRange: s.dayRange })),
    locations,
    tribeReputations,
    achievements,
    diseases,
    worldFacts,
  }

  await prisma.turnSnapshot.upsert({
    where: { id: SNAPSHOT_ID },
    update: {
      userMessage,
      data: JSON.stringify(payload),
    },
    create: {
      id: SNAPSHOT_ID,
      userMessage,
      data: JSON.stringify(payload),
    },
  })
}

/**
 * Restore pre-turn snapshot and strip the failed turn's messages.
 * Returns the original user message so the client can re-send.
 */
export async function redoLastTurn(): Promise<{ userMessage: string } | null> {
  const snap = await prisma.turnSnapshot.findUnique({ where: { id: SNAPSHOT_ID } })
  if (!snap?.data) return null

  let parsed: any
  try {
    parsed = JSON.parse(snap.data)
  } catch {
    return null
  }

  const userMessage = snap.userMessage || parsed.userMessage
  if (!userMessage) return null

  await restorePlaythrough(parsed)

  // Snapshot's messages are the state BEFORE this turn's user msg was added —
  // restorePlaythrough already applied them. Ensure no extra trailing pair.
  return { userMessage }
}
