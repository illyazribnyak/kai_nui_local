export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const slots = await prisma.saveSlot.findMany({ orderBy: { slotNumber: 'asc' } })
    return Response.json({
      slots: slots.map(s => ({
        slotNumber: s.slotNumber,
        name: s.name,
        updatedAt: s.updatedAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Get saves error:', error)
    return Response.json({ error: 'Помилка завантаження збережень' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slotNumber, name } = await request.json()
    if (typeof slotNumber !== 'number' || slotNumber < 1 || slotNumber > 5) {
      return Response.json({ error: 'Слот 1-5' }, { status: 400 })
    }

    // Gather full game state
    const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
    const relationships = await prisma.relationship.findMany()
    const inventory = await prisma.inventoryItem.findMany()
    const quests = await prisma.quest.findMany()
    const diary = await prisma.diaryEntry.findMany()
    const skills = await prisma.skill.findMany()
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'asc' }, take: 200 })
    const summaries = await prisma.storySummary.findMany({ orderBy: { createdAt: 'asc' } })
    const locations = await prisma.location.findMany()
    const tribeReputations = await prisma.tribeReputation.findMany()
    const achievements = await prisma.achievement.findMany()
    const diseases = await prisma.disease.findMany()

    const data = JSON.stringify({ gameState, relationships, inventory, quests, diary, skills, messages: messages.map(m => ({ role: m.role, content: m.content })), summaries: summaries.map(s => ({ content: s.content, dayRange: s.dayRange })), locations, tribeReputations, achievements, diseases })

    const slotName = name || `День ${gameState?.dayNumber ?? 1} — ${gameState?.location ?? 'Острів'}`

    await prisma.saveSlot.upsert({
      where: { slotNumber },
      update: { data, name: slotName },
      create: { slotNumber, data, name: slotName },
    })

    return Response.json({ success: true, name: slotName })
  } catch (error: any) {
    console.error('Save error:', error)
    return Response.json({ error: 'Помилка збереження' }, { status: 500 })
  }
}
