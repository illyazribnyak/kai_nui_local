export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/game/rate-limit'
import {
  endServerCombat,
  getActiveCombat,
  serverCombatTurn,
  startServerCombat,
} from '@/lib/game/server-combat'
import type { CombatActionType } from '@/lib/game/combat'
import { getPlayerCombatArsenal } from '@/lib/game/combat'
import { prisma } from '@/lib/db'

const ACTIONS: CombatActionType[] = [
  'obsidian_attack',
  'spear_attack',
  'bow_shot',
  'unarmed',
  'block',
  'dodge',
  'amulet_blast',
  'seduce',
]

/**
 * POST /api/combat
 * { action: 'start', enemyId?, contextText?, seed? }
 * { action: 'turn', actionType: CombatActionType }
 * { action: 'status' }
 * { action: 'end' }
 *
 * Server rolls damage, applies loot / amulet / skill XP. No LLM.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit('combat', { limit: 60, windowMs: 60_000 })
    if (!limited.ok) {
      return NextResponse.json({ error: 'Занадто багато запитів' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const action = String(body?.action || '')

    if (action === 'start') {
      const result = await startServerCombat({
        enemyId: body?.enemyId ? String(body.enemyId) : undefined,
        contextText: body?.contextText ? String(body.contextText) : undefined,
        seed: body?.seed != null ? Number(body.seed) : undefined,
      })
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
      return NextResponse.json({
        success: true,
        combat: result.combat,
        arsenal: result.arsenal,
      })
    }

    if (action === 'turn') {
      const actionType = String(body?.actionType || '') as CombatActionType
      if (!ACTIONS.includes(actionType)) {
        return NextResponse.json({ error: 'Невідомий actionType' }, { status: 400 })
      }
      const result = await serverCombatTurn(actionType)
      if (!result.ok) {
        const status = result.code === 'NO_COMBAT' ? 409 : 400
        return NextResponse.json({ error: result.error, code: result.code }, { status })
      }
      return NextResponse.json({
        success: true,
        result: result.result,
        combat: result.combat,
        arsenal: result.arsenal,
        amuletEnergy: result.amuletEnergy,
      })
    }

    if (action === 'status') {
      const combat = await getActiveCombat()
      const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
      const inventory = await prisma.inventoryItem.findMany()
      const arsenal = getPlayerCombatArsenal(inventory as any, gameState as any)
      return NextResponse.json({ success: true, combat, arsenal })
    }

    if (action === 'end') {
      await endServerCombat()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'action: start | turn | status | end' },
      { status: 400 }
    )
  } catch (e: any) {
    console.error('combat API error:', e)
    return NextResponse.json({ error: e?.message ?? 'Combat failed' }, { status: 500 })
  }
}
