/**
 * Deterministic server-side craft & consume (no LLM).
 */

import { prisma } from '@/lib/db'
import { clamp } from '@/lib/game/json'
import {
  canCraftRecipe,
  findInventoryItem,
  findRecipeById,
  getConsumeEffect,
  type CraftingRecipe,
} from '@/lib/game/crafting'

export type CraftResult =
  | {
      ok: true
      recipe: CraftingRecipe
      message: string
      inventory?: { name: string; quantity: number; category: string; description: string }[]
    }
  | { ok: false; error: string; code?: string }

export type ConsumeResult =
  | {
      ok: true
      itemName: string
      message: string
      hunger: number
      thirst: number
      hungerDelta: number
      thirstDelta: number
    }
  | { ok: false; error: string; code?: string }

export async function craftRecipeById(recipeId: string): Promise<CraftResult> {
  const recipe = findRecipeById(recipeId)
  if (!recipe) {
    return { ok: false, error: 'Невідомий рецепт', code: 'UNKNOWN_RECIPE' }
  }

  const inventory = await prisma.inventoryItem.findMany()
  if (!canCraftRecipe(inventory, recipe)) {
    return { ok: false, error: 'Не вистачає інгредієнтів', code: 'MISSING_INGREDIENTS' }
  }

  // Resolve rows to deduct
  const deductions: Array<{ name: string; quantity: number }> = []
  for (const ing of recipe.ingredients) {
    const row = findInventoryItem(inventory, ing.name)
    if (!row || row.quantity < ing.quantity) {
      return { ok: false, error: `Немає: ${ing.name}`, code: 'MISSING_INGREDIENTS' }
    }
    deductions.push({ name: row.name, quantity: ing.quantity })
  }

  await prisma.$transaction(async (tx) => {
    for (const d of deductions) {
      const existing = await tx.inventoryItem.findUnique({ where: { name: d.name } })
      if (!existing) throw new Error(`Missing ${d.name}`)
      if (existing.quantity <= d.quantity) {
        await tx.inventoryItem.delete({ where: { name: d.name } })
      } else {
        await tx.inventoryItem.update({
          where: { name: d.name },
          data: { quantity: { decrement: d.quantity } },
        })
      }
    }

    await tx.inventoryItem.upsert({
      where: { name: recipe.name },
      update: {
        quantity: { increment: recipe.resultQuantity },
        category: recipe.category,
        description: recipe.description,
      },
      create: {
        name: recipe.name,
        quantity: recipe.resultQuantity,
        category: recipe.category,
        description: recipe.description,
      },
    })
  })

  // Small skill XP for crafting success (server-side, no LLM)
  try {
    const skillName = 'Торгівля' // barter/craft-adjacent social skill
    const existing = await prisma.skill.findUnique({ where: { name: skillName } })
    if (existing && existing.level < 5) {
      const maxXpByLevel = [100, 150, 225, 350, 500]
      let newXp = existing.xp + 8
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
        where: { name: skillName },
        data: { xp: newXp, level: newLevel, maxXp: newMaxXp },
      })
    }
  } catch {
    /* ignore */
  }

  const inventoryAfter = await prisma.inventoryItem.findMany()

  return {
    ok: true,
    recipe,
    message: `Створено: ${recipe.name}${recipe.resultQuantity > 1 ? ` ×${recipe.resultQuantity}` : ''}`,
    inventory: inventoryAfter,
  }
}

export async function consumeInventoryItem(itemName: string): Promise<ConsumeResult> {
  const name = itemName?.trim()
  if (!name) return { ok: false, error: 'Назва предмета обовʼязкова', code: 'BAD_REQUEST' }

  const item = await prisma.inventoryItem.findFirst({
    where: {
      OR: [
        { name },
        { name: { contains: name } },
      ],
    },
  })
  if (!item) {
    return { ok: false, error: 'Предмет не знайдено в інвентарі', code: 'NOT_FOUND' }
  }

  const effect = getConsumeEffect(item.name, item.category)
  if (!effect) {
    return { ok: false, error: 'Цей предмет не можна спожити', code: 'NOT_CONSUMABLE' }
  }

  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  const hunger = clamp((gameState?.hunger ?? 0) + effect.hungerDelta, 0, 100)
  const thirst = clamp((gameState?.thirst ?? 0) + effect.thirstDelta, 0, 100)
  const amuletEnergyDelta = item.name.toLowerCase().includes('амулет') || item.name.toLowerCase().includes('резонанс') ? 15 : 0
  const amuletEnergy = Math.max(0, (gameState?.amuletEnergy ?? 0) + amuletEnergyDelta)

  const isIntimateToy = item.category === 'інтимне' || item.name.toLowerCase().includes('фалоімітатор') || item.name.toLowerCase().includes('plug') || item.name.toLowerCase().includes('пута') || item.name.toLowerCase().includes('намистин') || item.name.toLowerCase().includes('вібрируючий')
  const desireDelta = isIntimateToy ? 20 : 0
  const desire = clamp((gameState?.desire ?? 0) + desireDelta, 0, 100)

  await prisma.$transaction(async (tx) => {
    if (item.quantity <= 1) {
      await tx.inventoryItem.delete({ where: { id: item.id } })
    } else {
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: { quantity: { decrement: 1 } },
      })
    }
    await tx.gameState.update({
      where: { id: 'singleton' },
      data: { hunger, thirst, amuletEnergy, desire },
    })
  })



  return {
    ok: true,
    itemName: item.name,
    message: `Спожито: ${item.name} (${effect.label})`,
    hunger,
    thirst,
    hungerDelta: effect.hungerDelta,
    thirstDelta: effect.thirstDelta,
  }
}
