import { prisma } from '@/lib/db'
import { seedSkills } from '@/lib/seed-skills'
import { seedLocations, seedTribes } from '@/lib/seed-locations'
import { seedStarterFacts, seedStarterQuests } from '@/lib/seed-quests'
import { seedCanonNpcs } from '@/lib/seed-npcs'

/** Wipe playthrough tables (keeps save slots). */
export async function clearPlaythrough() {
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
}

/** Restore full export/slot JSON into the singleton playthrough. */
export async function restorePlaythrough(saved: any) {
  await clearPlaythrough()

  // Ensure singleton exists
  await prisma.gameState.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', gameStarted: true },
  })

  if (saved.gameState) {
    const { id, createdAt, updatedAt, ...stateData } = saved.gameState
    // Only pass known-safe fields (ignore unknown from older/newer versions)
    const allowed = [
      'strength', 'agility', 'endurance', 'charisma', 'willpower',
      'desire', 'shame', 'confidence', 'hunger', 'thirst', 'location',
      'timeOfDay', 'mood', 'isPregnant', 'pregnancyWeek', 'pregnancyFather',
      'amuletEnergy', 'dayNumber', 'isDarkLara', 'gameStarted', 'weather',
      'season', 'companionName', 'companionBonus', 'clothing', 'bodyPaint',
      'accessories', 'chapter', 'chapterLabel', 'endingPath',
    ]
    const data: any = {}
    for (const k of allowed) {
      if (stateData[k] !== undefined) data[k] = stateData[k]
    }
    if (Object.keys(data).length > 0) {
      await prisma.gameState.update({ where: { id: 'singleton' }, data })
    }
  }

  if (saved.relationships?.length > 0) {
    for (const r of saved.relationships) {
      if (!r?.name) continue
      await prisma.relationship.create({
        data: {
          name: r.name,
          bond: r.bond ?? 0,
          tribe: r.tribe ?? '',
          notes: r.notes ?? '',
          met: r.met ?? true,
          personality: r.personality ?? '',
          archetype: r.archetype ?? '',
          attitude: r.attitude ?? 'neutral',
          metOnDay: r.metOnDay ?? 1,
          trust: r.trust ?? 50,
          fear: r.fear ?? 0,
          respect: r.respect ?? 50,
        },
      })
    }
  } else {
    await seedCanonNpcs()
  }

  if (saved.inventory?.length > 0) {
    for (const i of saved.inventory) {
      if (!i?.name) continue
      await prisma.inventoryItem.create({
        data: {
          name: i.name,
          description: i.description ?? '',
          quantity: i.quantity ?? 1,
          category: i.category ?? 'misc',
        },
      })
    }
  }

  if (saved.quests?.length > 0) {
    for (const q of saved.quests) {
      if (!q?.title) continue
      await prisma.quest.create({
        data: {
          title: q.title,
          description: q.description ?? '',
          status: q.status ?? 'active',
          givenBy: q.givenBy ?? '',
        },
      })
    }
  } else {
    await seedStarterQuests()
  }

  if (saved.diary?.length > 0) {
    for (const d of saved.diary) {
      if (!d?.content) continue
      await prisma.diaryEntry.create({
        data: {
          title: d.title ?? '',
          content: d.content,
          dayNumber: d.dayNumber ?? 1,
        },
      })
    }
  }

  if (saved.skills?.length > 0) {
    for (const s of saved.skills) {
      if (!s?.name) continue
      await prisma.skill.create({
        data: {
          name: s.name,
          level: s.level ?? 0,
          xp: s.xp ?? 0,
          maxXp: s.maxXp ?? 100,
          category: s.category ?? 'base',
          description: s.description ?? '',
        },
      })
    }
  } else {
    await seedSkills()
  }

  if (saved.messages?.length > 0) {
    for (const m of saved.messages) {
      if (!m?.role || m.content === undefined) continue
      await prisma.message.create({ data: { role: m.role, content: m.content } })
    }
  }

  if (saved.summaries?.length > 0) {
    for (const s of saved.summaries) {
      if (!s?.content) continue
      await prisma.storySummary.create({
        data: { content: s.content, dayRange: s.dayRange ?? '' },
      })
    }
  }

  if (saved.locations?.length > 0) {
    for (const loc of saved.locations) {
      if (!loc?.name) continue
      await prisma.location.create({
        data: {
          name: loc.name,
          description: loc.description ?? '',
          x: loc.x ?? 50,
          y: loc.y ?? 50,
          type: loc.type ?? 'generic',
          discovered: loc.discovered ?? false,
          isCurrent: loc.isCurrent ?? false,
        },
      })
    }
  } else {
    await seedLocations()
  }

  if (saved.tribeReputations?.length > 0) {
    for (const t of saved.tribeReputations) {
      if (!t?.tribeName) continue
      await prisma.tribeReputation.create({
        data: {
          tribeName: t.tribeName,
          reputation: t.reputation ?? 0,
          status: t.status ?? 'neutral',
        },
      })
    }
  } else {
    await seedTribes()
  }

  if (saved.achievements?.length > 0) {
    for (const a of saved.achievements) {
      if (!a?.name) continue
      await prisma.achievement.create({
        data: {
          name: a.name,
          description: a.description ?? '',
          icon: a.icon ?? '🏆',
        },
      })
    }
  }

  if (saved.diseases?.length > 0) {
    for (const d of saved.diseases) {
      if (!d?.name) continue
      await prisma.disease.create({
        data: {
          name: d.name,
          description: d.description ?? '',
          source: d.source ?? '',
          severity: d.severity ?? 'mild',
          effects: d.effects ?? '',
          duration: d.duration ?? -1,
          curedBy: d.curedBy ?? '',
          turnsLeft: d.turnsLeft ?? -1,
        },
      })
    }
  }

  if (saved.worldFacts?.length > 0) {
    for (const f of saved.worldFacts) {
      if (!f?.key) continue
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
    await seedStarterFacts()
  }
}
