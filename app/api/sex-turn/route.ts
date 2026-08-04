export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/game/rate-limit'
import { applySkillUpdates } from '@/lib/game/apply-updates'
import { clamp } from '@/lib/game/json'
import {
  buildSexMoveChatMessage,
  resolveSexTurn,
} from '@/lib/game/sex-turn'
import { listAvailableSexMoves } from '@/lib/game/sex-moves'
import { computeSkillModifiers } from '@/lib/game/skill-effects'
import {
  detectNewSynergies,
  detectNewlyLeveledSkills,
  detectNewlyUnlockedNodes,
} from '@/lib/game/sex-synergies'

/**
 * POST /api/sex-turn
 * Body: {
 *   moveId: string
 *   tempo?: string
 *   pleasure?: { lara, partner }
 *   stamina?: number
 *   phase?: string
 *   domination?: number
 *   orgasmChain?: number
 * }
 * Resolves skill-move meters + guaranteed XP. Client then sends narrative via /api/chat.
 */
export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit('sex-turn', { limit: 40, windowMs: 60_000 })
    if (!limited.ok) {
      return NextResponse.json({ error: 'Занадто багато запитів' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const moveId = String(body?.moveId || '')
    if (!moveId) {
      return NextResponse.json({ error: 'moveId обовʼязковий' }, { status: 400 })
    }

    const [skills, gameState] = await Promise.all([
      prisma.skill.findMany(),
      prisma.gameState.findUnique({ where: { id: 'singleton' } }),
    ])

    const result = resolveSexTurn(
      moveId,
      {
        pleasure: {
          lara: Number(body?.pleasure?.lara ?? 0),
          partner: Number(body?.pleasure?.partner ?? 0),
        },
        stamina: Number(body?.stamina ?? 100),
        phase: String(body?.phase || 'foreplay'),
        domination: Number(body?.domination ?? 0),
        tempo: String(body?.tempo || 'medium'),
        amuletEnergy: Number(body?.amuletEnergy ?? gameState?.amuletEnergy ?? 0),
        partnerName: body?.partnerName ? String(body.partnerName) : undefined,
        orgasmChain: Number(body?.orgasmChain ?? 0),
        sceneType: body?.sceneType != null ? String(body.sceneType) : null,
        knotLocked: Boolean(body?.knotLocked),
      },
      skills
    )

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, code: result.code },
        { status: result.code === 'UNKNOWN_MOVE' ? 404 : 400 }
      )
    }

    // Guaranteed skill XP
    await applySkillUpdates(result.xpGrants.map((g) => ({ name: g.name, xp: g.xp })))

    // Optional amulet energy bump
    if (result.amuletGain > 0 && gameState) {
      const next = clamp((gameState.amuletEnergy ?? 0) + result.amuletGain, 0, 100)
      await prisma.gameState.update({
        where: { id: 'singleton' },
        data: { amuletEnergy: next },
      })
    }

    const updatedSkills = await prisma.skill.findMany()
    const updatedState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
    const mods = computeSkillModifiers(updatedSkills)

    const skillProgress = {
      levelUps: detectNewlyLeveledSkills(skills, updatedSkills),
      treeUnlocks: detectNewlyUnlockedNodes(skills, updatedSkills),
      newSynergies: detectNewSynergies(skills, updatedSkills).map((s) => ({
        id: s.id,
        name: s.name,
        icon: s.icon,
        description: s.description,
      })),
    }

    return NextResponse.json({
      success: true,
      result,
      chatMessage: buildSexMoveChatMessage(result),
      skills: updatedSkills,
      gameState: updatedState,
      skillProgress,
      skillModifiers: {
        multiOrgasmUnlocked: mods.multiOrgasmUnlocked,
        partnerPleasureBonusPct: mods.partnerPleasureBonusPct,
        laraPleasureBonusPct: mods.laraPleasureBonusPct,
        staminaFloor: mods.staminaFloor,
        dominationBias: mods.dominationBias,
        laraOrgasmThreshold: mods.laraOrgasmThreshold,
        synergies: mods.synergies.map((s) => ({ id: s.id, name: s.name, icon: s.icon })),
      },
    })
  } catch (e: any) {
    console.error('sex-turn error:', e)
    return NextResponse.json({ error: e?.message ?? 'sex-turn failed' }, { status: 500 })
  }
}

/** GET — list moves for current skills (HUD bootstrap). */
export async function GET() {
  try {
    const [skills, gameState] = await Promise.all([
      prisma.skill.findMany(),
      prisma.gameState.findUnique({ where: { id: 'singleton' } }),
    ])
    const mods = computeSkillModifiers(skills)
    const moves = listAvailableSexMoves(skills, {
      phase: 'foreplay',
      multiUnlocked: mods.multiOrgasmUnlocked,
      amuletEnergy: gameState?.amuletEnergy ?? 0,
    }).map((a) => ({
      id: a.move.id,
      label: a.move.label,
      icon: a.move.icon,
      unlocked: a.unlocked,
      reason: a.reason,
      skillName: a.move.skillName,
      description: a.move.description,
      minLevel: a.move.minLevel,
      skillLevel: a.skillLevel,
    }))
    return NextResponse.json({ moves, skillModifiers: mods })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}
