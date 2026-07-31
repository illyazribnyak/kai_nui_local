import { prisma } from '@/lib/db'
import { endingFromFactKeys, inferChapter } from '@/lib/game/chapters'

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

export async function applyFactUpdates(factUpdates: FactUpdate[], dayNumber: number) {
  for (const f of factUpdates ?? []) {
    const rawKey = f.key || f.name
    if (!rawKey) continue
    const key = normalizeKey(rawKey)
    if (!key) continue

    if (f._action === 'remove') {
      await prisma.worldFact.deleteMany({ where: { key } }).catch(() => {})
      continue
    }

    const content = (f.content || rawKey).toString().slice(0, 1000)
    const category = (f.category || 'plot').toString().slice(0, 40)

    await prisma.worldFact.upsert({
      where: { key },
      update: { content, category, dayNumber },
      create: { key, content, category, dayNumber },
    })
  }
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
    // Allow AI to set chapter via STAT_UPDATE.chapter if known
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
