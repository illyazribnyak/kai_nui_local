export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { applyStartingBuild, getStartingBuild } from '@/lib/game/starting-builds'

export async function POST(req: NextRequest) {
  try {
    let buildId: string | undefined
    try {
      const body = await req.json()
      if (body && typeof body.buildId === 'string') buildId = body.buildId
    } catch {
      /* empty body OK */
    }

    await prisma.message.deleteMany({})
    await prisma.relationship.deleteMany({})
    await prisma.disease.deleteMany({})
    await prisma.inventoryItem.deleteMany({})
    await prisma.quest.deleteMany({})
    await prisma.diaryEntry.deleteMany({})
    await prisma.skill.deleteMany({})
    await prisma.storySummary.deleteMany({})
    await prisma.location.deleteMany({})
    await prisma.tribeReputation.deleteMany({})
    await prisma.achievement.deleteMany({})
    await prisma.worldFact.deleteMany({})
    await prisma.turnSnapshot.deleteMany({}).catch(() => {})
    // Reset kinks levels/discovered (keep catalog rows if any — reseed fixes)
    try {
      await prisma.kink.deleteMany({})
    } catch {
      /* ignore */
    }

    const defaults = getStartingBuild(buildId || 'balanced').stats

    await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: {
        ...defaults,
        desire: 0,
        shame: 0,
        confidence: 50,
        location: 'Берег острова',
        isPregnant: false,
        pregnancyWeek: 0,
        pregnancyFather: null,
        amuletEnergy: 0,
        dayNumber: 1,
        isDarkLara: false,
        gameStarted: true,
        hunger: 20,
        thirst: 20,
        timeOfDay: 'day',
        mood: 'neutral',
        weather: 'clear',
        season: 'wet',
        companionName: null,
        companionBonus: null,
        clothing: 'клапті одягу',
        bodyPaint: null,
        accessories: null,
        chapter: 'arrival',
        chapterLabel: 'Прибуття',
        endingPath: null,
        turnCount: 0,
        totalTokensUsed: 0,
        activeSexJson: '',
        activeCombatJson: '',
        bodyProfileJson: '',
      },
      create: {
        id: 'singleton',
        gameStarted: true,
        activeSexJson: '',
        activeCombatJson: '',
        ...defaults,
      },
    })

    const { seedSkills } = await import('@/lib/seed-skills')
    await seedSkills()
    try {
      const { seedKinks } = await import('@/lib/seed-kinks')
      await seedKinks()
    } catch {
      /* ignore if migrate pending */
    }
    const { seedLocations, seedTribes } = await import('@/lib/seed-locations')
    await seedLocations()
    await seedTribes()
    const { seedStarterQuests, seedStarterFacts } = await import('@/lib/seed-quests')
    await seedStarterQuests()
    await seedStarterFacts()
    const { seedCanonNpcs } = await import('@/lib/seed-npcs')
    await seedCanonNpcs()

    // Apply chosen build on top of fresh seed
    const build = await applyStartingBuild(buildId || 'balanced')

    return NextResponse.json({ success: true, build: { id: build.id, name: build.name } })
  } catch (error: any) {
    console.error('Reset game error:', error)
    return NextResponse.json({ error: error?.message ?? 'Помилка скидання' }, { status: 500 })
  }
}
