export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    let gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
    if (!gameState) {
      gameState = await prisma.gameState.create({ data: { id: 'singleton' } })
    }
    const relationships = await prisma.relationship.findMany({ where: { met: true }, orderBy: { name: 'asc' } })
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'asc' } })
    const inventory = await prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } })
    const quests = await prisma.quest.findMany({ orderBy: { createdAt: 'desc' } })
    const diary = await prisma.diaryEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    let skills = await prisma.skill.findMany()
    if (skills.length === 0) {
      const { seedSkills } = await import('@/lib/seed-skills')
      await seedSkills()
      skills = await prisma.skill.findMany()
    }

    // Seed locations and tribes if needed
    const locCount = await prisma.location.count()
    const tribeCount = await prisma.tribeReputation.count()
    if (locCount === 0 || tribeCount === 0) {
      const { seedLocations, seedTribes } = await import('@/lib/seed-locations')
      if (locCount === 0) await seedLocations()
      if (tribeCount === 0) await seedTribes()
    }

    const locations = await prisma.location.findMany()
    const tribeReputations = await prisma.tribeReputation.findMany()
    const achievements = await prisma.achievement.findMany({ orderBy: { unlockedAt: 'desc' } })
    const diseases = await prisma.disease.findMany()
    let worldFacts: any[] = []
    try {
      worldFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })
      if (worldFacts.length === 0) {
        const { seedStarterFacts, seedStarterQuests } = await import('@/lib/seed-quests')
        await seedStarterFacts()
        const questCount = await prisma.quest.count()
        if (questCount === 0) await seedStarterQuests()
        worldFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })
      }
    } catch {
      worldFacts = []
    }

    return NextResponse.json({
      gameState,
      relationships,
      inventory,
      quests,
      skills,
      locations,
      tribeReputations,
      achievements,
      diseases,
      worldFacts,
      diary: diary?.map?.((d: any) => ({
        id: d?.id,
        title: d?.title,
        content: d?.content,
        dayNumber: d?.dayNumber,
        createdAt: d?.createdAt?.toISOString?.() ?? '',
      })) ?? [],
      messages: messages?.map?.((m: any) => ({
        id: m?.id,
        role: m?.role,
        content: m?.content,
        createdAt: m?.createdAt?.toISOString?.() ?? '',
      })) ?? [],
    })
  } catch (error: any) {
    console.error('Game state GET error:', error)
    return NextResponse.json({ error: error?.message ?? 'Помилка' }, { status: 500 })
  }
}
