import { prisma } from '@/lib/db'
import { clamp } from '@/lib/game/json'
import {
  SKILL_NAMES,
  VALID_ATTITUDES,
  VALID_MOODS,
  VALID_SEASONS,
  VALID_TIMES,
  VALID_TRIBES,
  VALID_WEATHER,
} from '@/lib/game/constants'
import { applyFactUpdates, refreshChapterProgress } from '@/lib/game/facts'

export async function applyStatUpdates(statUpdate: any) {
  if (!statUpdate || Object.keys(statUpdate).length === 0) return
  const validFields = [
    'strength', 'agility', 'endurance', 'charisma', 'willpower',
    'desire', 'shame', 'confidence', 'location', 'isPregnant',
    'pregnancyWeek', 'pregnancyFather', 'amuletEnergy', 'dayNumber',
    'isDarkLara', 'hunger', 'thirst', 'timeOfDay', 'mood', 'weather',
    'season', 'companionName', 'companionBonus', 'clothing', 'bodyPaint', 'accessories',
    'chapter', 'chapterLabel', 'endingPath',
  ]
  const updateData: any = {}
  for (const key of validFields) {
    if (statUpdate[key] === undefined) continue
    if (['desire', 'shame', 'confidence', 'hunger', 'thirst'].includes(key)) {
      updateData[key] = clamp(Number(statUpdate[key]) || 0, 0, 100)
    } else if (['strength', 'agility', 'endurance', 'charisma', 'willpower'].includes(key)) {
      updateData[key] = clamp(Number(statUpdate[key]) || 1, 1, 20)
    } else if (key === 'amuletEnergy') {
      updateData[key] = Math.max(0, Number(statUpdate[key]) || 0)
    } else if (key === 'dayNumber' || key === 'pregnancyWeek') {
      updateData[key] = Math.max(0, Number(statUpdate[key]) || 0)
    } else if (key === 'mood') {
      if ((VALID_MOODS as readonly string[]).includes(statUpdate[key])) updateData[key] = statUpdate[key]
    } else if (key === 'timeOfDay') {
      if ((VALID_TIMES as readonly string[]).includes(statUpdate[key])) updateData[key] = statUpdate[key]
    } else if (key === 'weather') {
      if ((VALID_WEATHER as readonly string[]).includes(statUpdate[key])) updateData[key] = statUpdate[key]
    } else if (key === 'season') {
      if ((VALID_SEASONS as readonly string[]).includes(statUpdate[key])) updateData[key] = statUpdate[key]
    } else if (['clothing', 'bodyPaint', 'accessories', 'companionName', 'companionBonus', 'location', 'pregnancyFather', 'chapter', 'chapterLabel', 'endingPath'].includes(key)) {
      updateData[key] = typeof statUpdate[key] === 'string' || statUpdate[key] === null
        ? statUpdate[key]
        : String(statUpdate[key])
    } else if (key === 'isPregnant' || key === 'isDarkLara') {
      updateData[key] = Boolean(statUpdate[key])
    } else {
      updateData[key] = statUpdate[key]
    }
  }
  if (Object.keys(updateData).length > 0) {
    await prisma.gameState.update({ where: { id: 'singleton' }, data: updateData })
  }
}

export async function applyRelUpdates(relUpdates: any[], dayNumber: number = 1) {
  for (const rel of relUpdates) {
    if (!rel?.name) continue
    const bondVal = rel.bond !== undefined ? clamp(Number(rel.bond) || 0, 0, 10) : undefined
    const updateData: any = {
      bond: bondVal ?? undefined,
      tribe: rel.tribe ?? undefined,
      notes: rel.notes ?? undefined,
      met: rel.met ?? true,
    }
    if (rel.personality) updateData.personality = String(rel.personality).slice(0, 500)
    if (rel.archetype) updateData.archetype = String(rel.archetype).slice(0, 100)
    if (rel.attitude && (VALID_ATTITUDES as readonly string[]).includes(rel.attitude)) {
      updateData.attitude = rel.attitude
    }
    if (rel.trust !== undefined) updateData.trust = clamp(Number(rel.trust) || 0, 0, 100)
    if (rel.fear !== undefined) updateData.fear = clamp(Number(rel.fear) || 0, 0, 100)
    if (rel.respect !== undefined) updateData.respect = clamp(Number(rel.respect) || 0, 0, 100)

    await prisma.relationship.upsert({
      where: { name: rel.name },
      update: updateData,
      create: {
        name: rel.name,
        bond: bondVal ?? 0,
        tribe: rel.tribe ?? '',
        notes: rel.notes ?? '',
        met: rel.met ?? true,
        personality: rel.personality ?? '',
        archetype: rel.archetype ?? '',
        attitude: (VALID_ATTITUDES as readonly string[]).includes(rel.attitude) ? rel.attitude : 'neutral',
        trust: rel.trust !== undefined ? clamp(Number(rel.trust) || 0, 0, 100) : 50,
        fear: rel.fear !== undefined ? clamp(Number(rel.fear) || 0, 0, 100) : 0,
        respect: rel.respect !== undefined ? clamp(Number(rel.respect) || 0, 0, 100) : 50,
        metOnDay: dayNumber,
      },
    })
  }
}

export async function applyDiseaseUpdates(diseaseUpdates: any[]) {
  for (const d of diseaseUpdates) {
    if (!d?.name) continue
    if (d._action === 'remove') {
      await prisma.disease.deleteMany({ where: { name: d.name } })
    } else {
      const validSeverity = ['mild', 'moderate', 'severe']
      await prisma.disease.upsert({
        where: { name: d.name },
        update: {
          description: d.description ?? undefined,
          severity: validSeverity.includes(d.severity) ? d.severity : 'mild',
          effects: d.effects ?? undefined,
        },
        create: {
          name: d.name,
          description: d.description ?? '',
          source: d.source ?? '',
          severity: validSeverity.includes(d.severity) ? d.severity : 'mild',
          effects: d.effects ?? '',
          duration: Number(d.duration) || -1,
          curedBy: d.curedBy ?? '',
          turnsLeft: Number(d.duration) || -1,
        },
      })
    }
  }
}

export async function applyInvUpdates(invUpdates: any[]) {
  for (const inv of invUpdates) {
    if (!inv?.name) continue
    const action = inv.action ?? 'add'
    if (action === 'add') {
      await prisma.inventoryItem.upsert({
        where: { name: inv.name },
        update: {
          quantity: { increment: Math.max(1, Number(inv.quantity) || 1) },
          description: inv.description ?? undefined,
          category: inv.category ?? undefined,
        },
        create: {
          name: inv.name,
          description: inv.description ?? '',
          quantity: Math.max(1, Number(inv.quantity) || 1),
          category: inv.category ?? 'misc',
        },
      })
    } else if (action === 'remove') {
      try {
        const existing = await prisma.inventoryItem.findUnique({ where: { name: inv.name } })
        if (existing) {
          const removeQty = Number(inv.quantity) || existing.quantity
          if (existing.quantity <= removeQty) {
            await prisma.inventoryItem.delete({ where: { name: inv.name } })
          } else {
            await prisma.inventoryItem.update({
              where: { name: inv.name },
              data: { quantity: { decrement: removeQty } },
            })
          }
        }
      } catch { /* ignore */ }
    } else if (action === 'update') {
      try {
        await prisma.inventoryItem.update({
          where: { name: inv.name },
          data: {
            description: inv.description ?? undefined,
            quantity: inv.quantity !== undefined ? Number(inv.quantity) : undefined,
            category: inv.category ?? undefined,
          },
        })
      } catch { /* ignore */ }
    }
  }
}

export async function applyQuestUpdates(questUpdates: any[]) {
  for (const q of questUpdates) {
    if (!q?.title) continue
    const action = q.action ?? 'add'
    if (action === 'add') {
      await prisma.quest.upsert({
        where: { title: q.title },
        update: { description: q.description ?? undefined, givenBy: q.givenBy ?? undefined },
        create: { title: q.title, description: q.description ?? '', status: 'active', givenBy: q.givenBy ?? '' },
      })
    } else if (action === 'complete') {
      try { await prisma.quest.update({ where: { title: q.title }, data: { status: 'completed' } }) } catch { /* ignore */ }
    } else if (action === 'fail') {
      try { await prisma.quest.update({ where: { title: q.title }, data: { status: 'failed' } }) } catch { /* ignore */ }
    } else if (action === 'update') {
      try {
        await prisma.quest.update({
          where: { title: q.title },
          data: { description: q.description ?? undefined, givenBy: q.givenBy ?? undefined },
        })
      } catch { /* ignore */ }
    }
  }
}

export async function applyDiaryUpdates(diaryUpdates: any[], dayNumber: number) {
  for (const d of diaryUpdates) {
    if (!d?.content) continue
    await prisma.diaryEntry.create({
      data: { title: d.title ?? '', content: String(d.content).slice(0, 5000), dayNumber },
    })
  }
}

export async function applySkillUpdates(skillUpdates: any[]) {
  const maxXpByLevel = [100, 150, 225, 350, 500]
  for (const su of skillUpdates) {
    if (!su?.name || !su?.xp) continue
    if (!(SKILL_NAMES as readonly string[]).includes(su.name)) {
      console.warn(`Unknown skill name: "${su.name}", skipping`)
      continue
    }
    try {
      const existing = await prisma.skill.findUnique({ where: { name: su.name } })
      if (existing && existing.level < 5) {
        let newXp = existing.xp + Math.max(1, Number(su.xp) || 0)
        let newLevel = existing.level
        let newMaxXp = existing.maxXp
        while (newXp >= newMaxXp && newLevel < 5) {
          newXp -= newMaxXp
          newLevel++
          newMaxXp = maxXpByLevel[Math.min(newLevel, 4)] ?? 500
        }
        if (newLevel >= 5) { newLevel = 5; newXp = 0; newMaxXp = 500 }
        await prisma.skill.update({
          where: { name: su.name },
          data: { xp: newXp, level: newLevel, maxXp: newMaxXp },
        })
      }
    } catch { /* ignore */ }
  }
}

export async function applyTribeUpdates(tribeUpdates: any[]) {
  for (const tu of tribeUpdates) {
    if (!tu?.tribe || !(VALID_TRIBES as readonly string[]).includes(tu.tribe)) continue
    const change = Number(tu.change) || 0
    if (change === 0) continue
    try {
      const existing = await prisma.tribeReputation.findUnique({ where: { tribeName: tu.tribe } })
      if (existing) {
        const newRep = clamp(existing.reputation + change, -100, 100)
        let status = 'neutral'
        if (newRep <= -50) status = 'hostile'
        else if (newRep <= -20) status = 'unfriendly'
        else if (newRep >= 50) status = 'ally'
        else if (newRep >= 20) status = 'friendly'
        await prisma.tribeReputation.update({
          where: { tribeName: tu.tribe },
          data: { reputation: newRep, status },
        })
      }
    } catch { /* ignore */ }
  }
}

export async function applyAchievements(achievements: any[]) {
  for (const ach of achievements) {
    if (!ach?.name) continue
    try {
      await prisma.achievement.upsert({
        where: { name: ach.name },
        update: {},
        create: {
          name: ach.name,
          description: ach.description ?? '',
          icon: ach.icon ?? '🏆',
        },
      })
    } catch { /* ignore */ }
  }
}

export async function applyLocationDiscovery(locationName: string) {
  if (!locationName) return
  try {
    await prisma.location.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } })
    // SQLite: no mode:'insensitive' — match in app code
    const allLocs = await prisma.location.findMany()
    const needle = locationName.toLowerCase()
    const loc =
      allLocs.find((l) => l.name.toLowerCase() === needle) ||
      allLocs.find((l) => l.name.toLowerCase().includes(needle) || needle.includes(l.name.toLowerCase()))
    if (loc) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { discovered: true, isCurrent: true },
      })
      return
    }
    const words = locationName.split(/\s+/).filter((w) => w.length > 3)
    for (const word of words) {
      const w = word.toLowerCase()
      const fuzzy = allLocs.find((l) => l.name.toLowerCase().includes(w))
      if (fuzzy) {
        await prisma.location.update({
          where: { id: fuzzy.id },
          data: { discovered: true, isCurrent: true },
        })
        return
      }
    }
  } catch (e) {
    console.error('Location discovery error:', e)
  }
}

/** Apply all merged updates in a consistent order. */
export async function applyAllUpdates(
  merged: {
    stat: any
    rel: any[]
    inv: any[]
    quest: any[]
    diary: any[]
    skill: any[]
    tribe: any[]
    achievement: any[]
    disease: any[]
    facts?: any[]
  },
  dayNumber: number
) {
  await applyStatUpdates(merged.stat)
  await applyRelUpdates(merged.rel, dayNumber)
  await applyInvUpdates(merged.inv)
  await applyQuestUpdates(merged.quest)
  await applyDiaryUpdates(merged.diary, dayNumber)
  await applySkillUpdates(merged.skill)
  await applyTribeUpdates(merged.tribe)
  await applyAchievements(merged.achievement)
  await applyDiseaseUpdates(merged.disease)
  await applyFactUpdates(merged.facts ?? [], dayNumber)
  if (merged.stat?.location) {
    await applyLocationDiscovery(merged.stat.location)
  }
  // Recompute story chapter after facts/location
  const loc = merged.stat?.location
  const explicitChapter = merged.stat?.chapter
  await refreshChapterProgress(loc, explicitChapter)
}
