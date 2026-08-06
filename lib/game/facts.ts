import { prisma } from '@/lib/db'
import { endingFromFactKeys, inferChapter } from '@/lib/game/chapters'
import {
  categoryForFactKey,
  contentForFactKey,
  planFactGateBatch,
} from '@/lib/game/fact-gates'

export interface FactUpdate {
  _action?: 'add' | 'remove'
  key?: string
  category?: string
  content?: string
  name?: string // alias for key
}

function normalizeKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\u0400-\u04ff-]/gi, '')
    .slice(0, 80)
}

export type ApplyFactResult = {
  added: string[]
  removed: string[]
  notes: string[]
}

/**
 * Apply FACT_ADD / FACT_REMOVE with soft prereqs + mutex groups.
 */
export async function applyFactUpdates(
  factUpdates: FactUpdate[],
  dayNumber: number
): Promise<ApplyFactResult> {
  const result: ApplyFactResult = { added: [], removed: [], notes: [] }
  if (!factUpdates?.length) return result

  const existingRows = await prisma.worldFact.findMany({ select: { key: true } })
  const existingKeys = existingRows.map((r) => r.key)

  const removes = factUpdates.filter((f) => f._action === 'remove')
  const adds = factUpdates.filter((f) => f._action !== 'remove')

  for (const f of removes) {
    const rawKey = f.key || f.name
    if (!rawKey) continue
    const key = normalizeKey(rawKey)
    if (!key) continue
    await prisma.worldFact.deleteMany({ where: { key } }).catch(() => {})
    result.removed.push(key)
  }

  // Content/category map from AI payloads
  const meta = new Map<string, { content?: string; category?: string }>()
  const incomingKeys: string[] = []
  for (const f of adds) {
    const rawKey = f.key || f.name
    if (!rawKey) continue
    const key = normalizeKey(rawKey)
    if (!key) continue
    incomingKeys.push(key)
    meta.set(key, {
      content: f.content ? String(f.content).slice(0, 1000) : undefined,
      category: f.category ? String(f.category).slice(0, 40) : undefined,
    })
  }

  if (!incomingKeys.length) return result

  // After explicit removes, recompute existing set
  const existingAfterRemove = new Set(existingKeys)
  for (const k of result.removed) existingAfterRemove.delete(k)

  const plan = planFactGateBatch(incomingKeys, existingAfterRemove)
  result.notes.push(...plan.notes)

  for (const key of plan.toRemove) {
    await prisma.worldFact.deleteMany({ where: { key } }).catch(() => {})
    result.removed.push(key)
  }

  for (const key of plan.toAdd) {
    const m = meta.get(key)
    const content = (m?.content || contentForFactKey(key)).toString().slice(0, 1000)
    const category = (m?.category || categoryForFactKey(key)).toString().slice(0, 40)

    await prisma.worldFact.upsert({
      where: { key },
      update: { content, category, dayNumber },
      create: { key, content, category, dayNumber },
    })
    result.added.push(key)
  }

  if (result.notes.length) {
    console.info('[fact-gates]', result.notes.join(' | '))
  }

  return result
}

/** Recompute chapter / ending from location + facts and persist. */
export async function refreshChapterProgress(
  location?: string | null,
  explicitChapter?: string | null
): Promise<{ chapter: string; chapterLabel: string; endingPath: string | null }> {
  const facts = await prisma.worldFact.findMany({ select: { key: true } })
  const keys = facts.map((f) => f.key)
  const state = await prisma.gameState.findUnique({ where: { id: 'singleton' } })

  const inferred = inferChapter(
    location ?? state?.location,
    keys,
    explicitChapter || state?.chapter
  )

  let endingPath = endingFromFactKeys(keys) || state?.endingPath || null
  let chapter = inferred.id
  let chapterLabel = inferred.label

  if (explicitChapter) {
    const { CHAPTERS } = await import('@/lib/game/chapters')
    const found = CHAPTERS.find((c) => c.id === explicitChapter)
    if (found) {
      chapter = found.id
      chapterLabel = found.label
    }
  }

  if (endingPath) {
    chapter = 'ending'
    chapterLabel = 'Фінал'
  }

  await prisma.gameState.update({
    where: { id: 'singleton' },
    data: { chapter, chapterLabel, endingPath },
  })

  return { chapter, chapterLabel, endingPath }
}
