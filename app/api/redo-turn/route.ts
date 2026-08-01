export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { redoLastTurn } from '@/lib/game/turn-snapshot'

/** Restore pre-last-turn snapshot so the client can re-send the same action. */
export async function POST() {
  try {
    const result = await redoLastTurn()
    if (!result) {
      return NextResponse.json(
        { error: 'Немає знімка для перегравання. Зроби хоча б один хід.' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, userMessage: result.userMessage })
  } catch (error: any) {
    console.error('Redo turn error:', error)
    return NextResponse.json({ error: error?.message ?? 'Помилка redo' }, { status: 500 })
  }
}
