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
  | { ok: true; recipe: CraftingRecipe; message: string }
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

  return {
    ok: true,
    recipe,
    message: `Створено: ${recipe.name}${recipe.resultQuantity > 1 ? ` ×${recipe.resultQuantity}` : ''}`,
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
      data: { hunger, thirst },
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
