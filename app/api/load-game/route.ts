export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { restorePlaythrough } from '@/lib/game/restore-save'

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
    await restorePlaythrough(saved)

    return Response.json({ success: true })
  } catch (error: any) {
    console.error('Load error:', error)
    return Response.json({ error: error?.message ?? 'Помилка завантаження' }, { status: 500 })
  }
}
