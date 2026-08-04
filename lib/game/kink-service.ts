/**
 * Persist kink XP / discovery (uses Prisma).
 */

import { prisma } from '@/lib/db'
import { findKinkDef } from '@/lib/game/kink-catalog'
import {
  applyKinkXpLocal,
  planKinkTriggers,
  type KinkLike,
  type KinkTriggerResult,
} from '@/lib/game/kink-effects'
import type { SkillLike } from '@/lib/game/skill-effects'

export async function applyKinkTriggers(opts: {
  narrativeText?: string
  explicitKeys?: Array<{ key: string; xp?: number }>
  fetishName?: string | null
  skills?: SkillLike[] | null
}): Promise<KinkTriggerResult[]> {
  const planned = planKinkTriggers(opts)
  if (!planned.length) return []

  const results: KinkTriggerResult[] = []

  for (const p of planned) {
    const def = findKinkDef(p.key)
    if (!def) continue

    const existing = await prisma.kink.findUnique({ where: { key: p.key } })
    if (!existing) continue

    const before: KinkLike = {
      key: existing.key,
      name: existing.name,
      level: existing.level,
      xp: existing.xp,
      maxXp: existing.maxXp,
      discovered: existing.discovered,
    }
    const newlyDiscovered = !existing.discovered
    const next = applyKinkXpLocal(before, p.xp)

    await prisma.kink.update({
      where: { key: p.key },
      data: {
        level: next.level,
        xp: next.xp,
        maxXp: next.maxXp,
        discovered: true,
      },
    })

    results.push({
      key: p.key,
      name: def.name,
      icon: def.icon,
      xp: p.xp,
      fromLevel: before.discovered ? before.level : 0,
      toLevel: next.level,
      newlyDiscovered,
      leveled: next.leveled || newlyDiscovered,
    })
  }

  return results
}

export async function listKinks() {
  return prisma.kink.findMany({ orderBy: [{ discovered: 'desc' }, { level: 'desc' }, { name: 'asc' }] })
}
