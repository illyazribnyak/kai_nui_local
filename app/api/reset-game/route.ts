export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // Delete all messages
    await prisma.message.deleteMany({})
    // Delete all relationships
    await prisma.relationship.deleteMany({})
    // Delete all diseases
    await prisma.disease.deleteMany({})
    // Delete all inventory
    await prisma.inventoryItem.deleteMany({})
    // Delete all quests
    await prisma.quest.deleteMany({})
    // Delete all diary entries
    await prisma.diaryEntry.deleteMany({})
    // Delete all skills
    await prisma.skill.deleteMany({})
    // Delete story summaries
    await prisma.storySummary.deleteMany({})
    // Delete locations, tribes, achievements
    await prisma.location.deleteMany({})
    await prisma.tribeReputation.deleteMany({})
    await prisma.achievement.deleteMany({})
    await prisma.worldFact.deleteMany({})
    // Reset game state
    await prisma.gameState.upsert({
      where: { id: 'singleton' },
      update: {
        strength: 6,
        agility: 8,
        endurance: 7,
        charisma: 7,
        willpower: 8,
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
      },
      create: {
        id: 'singleton',
        gameStarted: true,
      },
    })

    // Seed initial skills, locations, tribes, quests, facts
    const { seedSkills } = await import('@/lib/seed-skills')
    await seedSkills()
    const { seedLocations, seedTribes } = await import('@/lib/seed-locations')
    await seedLocations()
    await seedTribes()
    const { seedStarterQuests, seedStarterFacts } = await import('@/lib/seed-quests')
    await seedStarterQuests()
    await seedStarterFacts()
    const { seedCanonNpcs } = await import('@/lib/seed-npcs')
    await seedCanonNpcs()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset game error:', error)
    return NextResponse.json({ error: error?.message ?? 'Помилка скидання' }, { status: 500 })
  }
}
