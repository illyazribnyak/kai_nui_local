export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { seedSkills } from '@/lib/seed-skills'

export async function POST(request: NextRequest) {
  try {
    const { slotNumber } = await request.json()
    if (typeof slotNumber !== 'number' || slotNumber < 1 || slotNumber > 5) {
      return Response.json({ error: 'Слот 1-5' }, { status: 400 })
    }

    const slot = await prisma.saveSlot.findUnique({ where: { slotNumber } })
    if (!slot) {
      return Response.json({ error: 'Збереження не знайдено' }, { status: 404 })
    }

    const saved = JSON.parse(slot.data)

    // Clear existing data
    await prisma.message.deleteMany()
    await prisma.relationship.deleteMany()
    await prisma.inventoryItem.deleteMany()
    await prisma.quest.deleteMany()
    await prisma.diaryEntry.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.storySummary.deleteMany()
    await prisma.location.deleteMany()
    await prisma.tribeReputation.deleteMany()
    await prisma.achievement.deleteMany()
    await prisma.disease.deleteMany()
    await prisma.worldFact.deleteMany()

    // Restore game state
    if (saved.gameState) {
      const { id, createdAt, updatedAt, ...stateData } = saved.gameState
      await prisma.gameState.update({ where: { id: 'singleton' }, data: stateData })
    }

    // Restore relationships
    if (saved.relationships?.length > 0) {
      for (const r of saved.relationships) {
        await prisma.relationship.create({
          data: {
            name: r.name, bond: r.bond ?? 0, tribe: r.tribe ?? '', notes: r.notes ?? '', met: r.met ?? true,
            personality: r.personality ?? '', archetype: r.archetype ?? '', attitude: r.attitude ?? 'neutral', metOnDay: r.metOnDay ?? 1,
            trust: r.trust ?? 50, fear: r.fear ?? 0, respect: r.respect ?? 50,
          },
        })
      }
    }

    // Restore inventory
    if (saved.inventory?.length > 0) {
      for (const i of saved.inventory) {
        await prisma.inventoryItem.create({
          data: { name: i.name, description: i.description ?? '', quantity: i.quantity ?? 1, category: i.category ?? 'misc' },
        })
      }
    }

    // Restore quests
    if (saved.quests?.length > 0) {
      for (const q of saved.quests) {
        await prisma.quest.create({
          data: { title: q.title, description: q.description ?? '', status: q.status ?? 'active', givenBy: q.givenBy ?? '' },
        })
      }
    }

    // Restore diary
    if (saved.diary?.length > 0) {
      for (const d of saved.diary) {
        await prisma.diaryEntry.create({
          data: { title: d.title ?? '', content: d.content, dayNumber: d.dayNumber ?? 1 },
        })
      }
    }

    // Restore skills
    if (saved.skills?.length > 0) {
      for (const s of saved.skills) {
        await prisma.skill.create({
          data: { name: s.name, level: s.level ?? 0, xp: s.xp ?? 0, maxXp: s.maxXp ?? 100, category: s.category ?? 'base', description: s.description ?? '' },
        })
      }
    } else {
      await seedSkills()
    }

    // Restore messages
    if (saved.messages?.length > 0) {
      for (const m of saved.messages) {
        await prisma.message.create({ data: { role: m.role, content: m.content } })
      }
    }

    // Restore story summaries
    if (saved.summaries?.length > 0) {
      for (const s of saved.summaries) {
        await prisma.storySummary.create({ data: { content: s.content, dayRange: s.dayRange ?? '' } })
      }
    }

    // Restore locations
    if (saved.locations?.length > 0) {
      for (const loc of saved.locations) {
        await prisma.location.create({
          data: { name: loc.name, x: loc.x, y: loc.y, type: loc.type ?? 'neutral', discovered: loc.discovered ?? false, isCurrent: loc.isCurrent ?? false },
        })
      }
    } else {
      const { seedLocations } = await import('@/lib/seed-locations')
      await seedLocations()
    }

    // Restore tribe reputations
    if (saved.tribeReputations?.length > 0) {
      for (const t of saved.tribeReputations) {
        await prisma.tribeReputation.create({
          data: { tribeName: t.tribeName, reputation: t.reputation ?? 0, status: t.status ?? 'neutral' },
        })
      }
    } else {
      const { seedTribes } = await import('@/lib/seed-locations')
      await seedTribes()
    }

    // Restore achievements
    if (saved.achievements?.length > 0) {
      for (const a of saved.achievements) {
        await prisma.achievement.create({
          data: { name: a.name, description: a.description ?? '', icon: a.icon ?? '🏆' },
        })
      }
    }

    // Restore diseases
    if (saved.diseases?.length > 0) {
      for (const d of saved.diseases) {
        await prisma.disease.create({
          data: {
            name: d.name, description: d.description ?? '', source: d.source ?? '',
            severity: d.severity ?? 'mild', effects: d.effects ?? '', duration: d.duration ?? -1,
            curedBy: d.curedBy ?? '', turnsLeft: d.turnsLeft ?? -1,
          },
        })
      }
    }

    // Restore world facts
    if (saved.worldFacts?.length > 0) {
      for (const f of saved.worldFacts) {
        await prisma.worldFact.create({
          data: {
            key: f.key,
            category: f.category ?? 'plot',
            content: f.content ?? '',
            dayNumber: f.dayNumber ?? 1,
          },
        })
      }
    } else {
      const { seedStarterFacts } = await import('@/lib/seed-quests')
      await seedStarterFacts()
    }

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Load error:', error)
    return Response.json({ error: 'Помилка завантаження' }, { status: 500 })
  }
}
