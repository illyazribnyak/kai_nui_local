export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { restorePlaythrough } from '@/lib/game/restore-save'

/** Import a JSON export (from /api/export-game) into the current playthrough. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const saved = body?.data ?? body

    if (!saved || typeof saved !== 'object') {
      return NextResponse.json({ error: 'Очікується JSON об\'єкт сейву' }, { status: 400 })
    }

    // Minimal validation
    if (!saved.gameState && !saved.messages && !saved.worldFacts) {
      return NextResponse.json(
        { error: 'Не схоже на сейв Кай-Нуї (немає gameState / messages / worldFacts)' },
        { status: 400 }
      )
    }

    await restorePlaythrough(saved)

    return NextResponse.json({
      success: true,
      day: saved.gameState?.dayNumber ?? null,
      location: saved.gameState?.location ?? null,
    })
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json({ error: error?.message ?? 'Помилка імпорту' }, { status: 500 })
  }
}
