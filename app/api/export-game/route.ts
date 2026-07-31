export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/** Download full playthrough as JSON (backup without DB slots). */
export async function GET() {
  try {
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
    const worldFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })

    const payload = {
      exportedAt: new Date().toISOString(),
      version: 2,
      gameState,
      relationships,
      inventory,
      quests,
      diary,
      skills,
      messages: messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
      summaries: summaries.map((s) => ({ content: s.content, dayRange: s.dayRange })),
      locations,
      tribeReputations,
      achievements,
      diseases,
      worldFacts,
    }

    const body = JSON.stringify(payload, null, 2)
    const day = gameState?.dayNumber ?? 1
    const filename = `kai-nui-day${day}-${Date.now()}.json`

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: error?.message ?? 'Export failed' }, { status: 500 })
  }
}
