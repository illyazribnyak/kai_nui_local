export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { craftRecipeById, consumeInventoryItem } from '@/lib/game/server-craft'
import { rateLimit } from '@/lib/game/rate-limit'

/**
 * POST /api/craft
 * Body: { action: 'craft', recipeId: string }
 *    or { action: 'consume', itemName: string }
 * Deterministic inventory/stat changes — no LLM.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit('craft', { limit: 30, windowMs: 60_000 })
    if (!limited.ok) {
      return NextResponse.json({ error: 'Занадто багато запитів' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const action = body?.action as string

    if (action === 'craft') {
      const recipeId = String(body?.recipeId || '')
      if (!recipeId) {
        return NextResponse.json({ error: 'recipeId обовʼязковий' }, { status: 400 })
      }
      const result = await craftRecipeById(recipeId)
      if (!result.ok) {
        const status = result.code === 'UNKNOWN_RECIPE' ? 404 : 400
        return NextResponse.json({ error: result.error, code: result.code }, { status })
      }
      return NextResponse.json({
        success: true,
        message: result.message,
        recipe: { id: result.recipe.id, name: result.recipe.name },
      })
    }

    if (action === 'consume') {
      const itemName = String(body?.itemName || '')
      if (!itemName) {
        return NextResponse.json({ error: 'itemName обовʼязковий' }, { status: 400 })
      }
      const result = await consumeInventoryItem(itemName)
      if (!result.ok) {
        const status = result.code === 'NOT_FOUND' ? 404 : 400
        return NextResponse.json({ error: result.error, code: result.code }, { status })
      }
      return NextResponse.json({
        success: true,
        message: result.message,
        itemName: result.itemName,
        hunger: result.hunger,
        thirst: result.thirst,
        hungerDelta: result.hungerDelta,
        thirstDelta: result.thirstDelta,
      })
    }

    return NextResponse.json(
      { error: 'action має бути craft або consume' },
      { status: 400 }
    )
  } catch (e: any) {
    console.error('craft API error:', e)
    return NextResponse.json({ error: e?.message ?? 'Craft failed' }, { status: 500 })
  }
}
