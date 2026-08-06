/**
 * Server-authoritative combat session (loot, amulet, skill XP, FACT).
 * Client only renders; rolls & inventory live here.
 */

import { prisma } from '@/lib/db'
import {
  CANON_ENEMIES,
  createSeededRng,
  detectEnemyFromContext,
  getPlayerCombatArsenal,
  resolveCombatTurn,
  type CombatActionType,
  type EnemyProfile,
} from '@/lib/game/combat'
import { contentForFactKey, categoryForFactKey } from '@/lib/game/fact-gates'

export type ActiveCombatState = {
  enemyId: string
  enemy: EnemyProfile
  enemyHp: number
  laraHp: number
  laraMaxHp: number
  turn: number
  seed: number
}

function parseCombat(raw: string | null | undefined): ActiveCombatState | null {
  if (!raw || !String(raw).trim()) return null
  try {
    const o = JSON.parse(String(raw)) as ActiveCombatState
    if (!o?.enemyId || !o?.enemy) return null
    return o
  } catch {
    return null
  }
}

async function saveCombat(state: ActiveCombatState | null) {
  await prisma.gameState.update({
    where: { id: 'singleton' },
    data: { activeCombatJson: state ? JSON.stringify(state) : '' },
  })
}

async function grantLoot(loot: Array<{ name: string; quantity: number }>) {
  for (const item of loot) {
    await prisma.inventoryItem.upsert({
      where: { name: item.name },
      update: { quantity: { increment: item.quantity } },
      create: {
        name: item.name,
        quantity: item.quantity,
        category: 'трофей',
        description: 'Здобич з бою',
      },
    })
  }
}

async function grantCombatSkillXp(actionType: CombatActionType, amount = 12) {
  const skillMap: Partial<Record<CombatActionType, string>> = {
    unarmed: 'Бій без зброї',
    spear_attack: 'Зброя',
    obsidian_attack: 'Зброя',
    bow_shot: 'Зброя',
    dodge: 'Ухилення',
    block: 'Витривалість у бою',
    amulet_blast: 'Ритуал насолоди',
    seduce: 'Чарівний погляд',
  }
  const name = skillMap[actionType]
  if (!name) return
  const maxXpByLevel = [100, 150, 225, 350, 500]
  try {
    const existing = await prisma.skill.findUnique({ where: { name } })
    if (!existing || existing.level >= 5) return
    let newXp = existing.xp + amount
    let newLevel = existing.level
    let newMaxXp = existing.maxXp
    while (newXp >= newMaxXp && newLevel < 5) {
      newXp -= newMaxXp
      newLevel++
      newMaxXp = maxXpByLevel[Math.min(newLevel, 4)] ?? 500
    }
    if (newLevel >= 5) {
      newLevel = 5
      newXp = 0
      newMaxXp = 500
    }
    await prisma.skill.update({
      where: { name },
      data: { xp: newXp, level: newLevel, maxXp: newMaxXp },
    })
  } catch {
    /* skill may not exist */
  }
}

async function ensureFact(key: string, dayNumber: number) {
  await prisma.worldFact.upsert({
    where: { key },
    update: {},
    create: {
      key,
      content: contentForFactKey(key),
      category: categoryForFactKey(key, 'plot'),
      dayNumber,
    },
  })
}

export async function startServerCombat(opts: {
  enemyId?: string
  contextText?: string
  seed?: number
}): Promise<
  | { ok: true; combat: ActiveCombatState; arsenal: ReturnType<typeof getPlayerCombatArsenal> }
  | { ok: false; error: string }
> {
  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  if (!gameState) return { ok: false, error: 'Немає game state' }

  let enemy: EnemyProfile
  if (opts.enemyId && CANON_ENEMIES[opts.enemyId]) {
    enemy = { ...CANON_ENEMIES[opts.enemyId] }
  } else {
    const msgs = opts.contextText
      ? [{ role: 'assistant', content: opts.contextText }]
      : []
    enemy = { ...detectEnemyFromContext(msgs, gameState as any) }
  }

  const end = gameState.endurance ?? 5
  const laraMaxHp = 60 + end * 5
  const seed = opts.seed ?? (Date.now() % 1_000_000)

  const combat: ActiveCombatState = {
    enemyId: enemy.id,
    enemy,
    enemyHp: enemy.hp,
    laraHp: laraMaxHp,
    laraMaxHp,
    turn: 0,
    seed,
  }
  await saveCombat(combat)

  const inventory = await prisma.inventoryItem.findMany()
  const arsenal = getPlayerCombatArsenal(inventory as any, gameState as any)

  return { ok: true, combat, arsenal }
}

export async function serverCombatTurn(
  actionType: CombatActionType
): Promise<
  | {
      ok: true
      result: ReturnType<typeof resolveCombatTurn>
      combat: ActiveCombatState | null
      arsenal: ReturnType<typeof getPlayerCombatArsenal>
      amuletEnergy: number
    }
  | { ok: false; error: string; code?: string }
> {
  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  if (!gameState) return { ok: false, error: 'Немає game state', code: 'NO_STATE' }

  const combat = parseCombat(gameState.activeCombatJson)
  if (!combat) return { ok: false, error: 'Немає активного бою — спочатку start', code: 'NO_COMBAT' }

  if (actionType === 'amulet_blast' && (gameState.amuletEnergy ?? 0) < 10) {
    return { ok: false, error: 'Недостатньо енергії амулета', code: 'NO_AMULET' }
  }

  const inventory = await prisma.inventoryItem.findMany()
  // Deterministic-ish: seed + turn advances stream
  const rng = createSeededRng(combat.seed + combat.turn * 9973)

  const result = resolveCombatTurn(
    actionType,
    combat.enemy,
    combat.enemyHp,
    combat.laraHp,
    inventory as any,
    gameState as any,
    rng
  )

  combat.enemyHp = result.enemyHpRemaining
  combat.laraHp = result.laraHpRemaining
  combat.turn += 1

  let amuletEnergy = gameState.amuletEnergy ?? 0
  if (actionType === 'amulet_blast') {
    amuletEnergy = Math.max(0, amuletEnergy - 10)
    await prisma.gameState.update({
      where: { id: 'singleton' },
      data: { amuletEnergy },
    })
  }

  await grantCombatSkillXp(actionType, result.isCrit ? 18 : 12)

  if (result.isFinished) {
    if (result.isVictory) {
      if (result.lootEarned?.length) await grantLoot(result.lootEarned)
      const day = gameState.dayNumber ?? 1
      await ensureFact('predator_encounter', day)
      if (combat.enemyId === 'xeron') await ensureFact('centaur_trial_won', day)
      // Achievement
      try {
        await prisma.achievement.upsert({
          where: { name: 'Захисниця Джунглів' },
          update: {},
          create: {
            name: 'Захисниця Джунглів',
            description: 'Перемогти ворога у тактичному бою',
            icon: '⚔️',
          },
        })
      } catch {
        /* ignore */
      }
    }
    await saveCombat(null)
  } else {
    await saveCombat(combat)
  }

  const inv2 = await prisma.inventoryItem.findMany()
  const gs2 = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  const arsenal = getPlayerCombatArsenal(inv2 as any, gs2 as any)

  return {
    ok: true,
    result,
    combat: result.isFinished ? null : combat,
    arsenal,
    amuletEnergy: gs2?.amuletEnergy ?? amuletEnergy,
  }
}

export async function endServerCombat(): Promise<void> {
  await saveCombat(null)
}

export async function getActiveCombat(): Promise<ActiveCombatState | null> {
  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  return parseCombat(gameState?.activeCombatJson)
}
