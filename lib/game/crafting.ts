/**
 * Single source of truth for crafting recipes (UI craft bench + LLM system prompt).
 */

export interface CraftingIngredient {
  name: string
  quantity: number
}

export interface CraftingRecipe {
  id: string
  name: string
  category: string
  description: string
  ingredients: CraftingIngredient[]
  resultQuantity: number
}

/** Canonical recipes — keep names stable for inventory matching. */
export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'obsidian_spear',
    name: 'Обсидіановий спис',
    category: 'зброя',
    description: 'Гостре обсидіанове вістря, міцно закріплене на дерев’яній палиці',
    ingredients: [
      { name: 'Гостра палиця', quantity: 1 },
      { name: 'Обсидіан', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'stone_spear',
    name: 'Кам’яний спис',
    category: 'зброя',
    description: 'Простий спис із загостреною палицею та кам’яним наконечником',
    ingredients: [
      { name: 'Гостра палиця', quantity: 1 },
      { name: 'Камінь', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'bandage',
    name: 'Цілюща пов\'язка',
    category: 'ресурс',
    description: 'Компрес з цілющого листя джунглів та гнучкої ліани для заживлення ран',
    ingredients: [
      { name: 'Цілюще листя', quantity: 1 },
      { name: 'Ліана', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'cooked_fish',
    name: 'Жарена риба',
    category: 'їжа',
    description: 'Ароматна жарена риба, що втамовує голод на 35 пунктів',
    ingredients: [
      { name: 'Сира риба', quantity: 1 },
      { name: 'Дрова', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'bow',
    name: 'Простий лук',
    category: 'зброя',
    description: 'Гнучкий дерев’яний лук з ліаною в якості тятиви',
    ingredients: [
      { name: 'Гнучка гілка', quantity: 1 },
      { name: 'Ліана', quantity: 1 },
    ],
    resultQuantity: 1,
  },
  {
    id: 'leather_clothes',
    name: 'Шкіряний одяг',
    category: 'одяг',
    description: 'Простий одяг зі шкіри, скріплений ліанами',
    ingredients: [
      { name: 'Шкіра', quantity: 1 },
      { name: 'Ліана', quantity: 1 },
    ],
    resultQuantity: 1,
  },
]

export type InventoryLike = { name: string; quantity: number }

/** Count item by exact name first, then case-insensitive substring fallback. */
export function getInventoryCount(inventory: InventoryLike[], ingredientName: string): number {
  const exact = inventory.find((i) => i.name === ingredientName)
  if (exact) return exact.quantity
  const lower = ingredientName.toLowerCase()
  const fuzzy = inventory.find((i) => i.name.toLowerCase().includes(lower) || lower.includes(i.name.toLowerCase()))
  return fuzzy ? fuzzy.quantity : 0
}

export function canCraftRecipe(inventory: InventoryLike[], recipe: CraftingRecipe): boolean {
  return recipe.ingredients.every((ing) => getInventoryCount(inventory, ing.name) >= ing.quantity)
}

export function formatRecipeLine(recipe: CraftingRecipe): string {
  const parts = recipe.ingredients.map((i) => `${i.name} x${i.quantity}`).join(' + ')
  const qty = recipe.resultQuantity > 1 ? ` x${recipe.resultQuantity}` : ''
  return `${parts} → ${recipe.name}${qty}`
}

/** Block for LLM system prompt — stays in sync with the craft bench UI. */
export function formatRecipesForPrompt(): string {
  const lines = CRAFTING_RECIPES.map((r) => `- ${formatRecipeLine(r)} [${r.category}]`)
  return [
    'Лара може створювати предмети з ресурсів в інвентарі. Перевір наявність ресурсів!',
    'Канонічні рецепти (використовуй ТОЧНІ назви предметів у INV_UPDATE):',
    ...lines,
    'При крафті: INV_UPDATE remove (ресурси) + INV_UPDATE add (новий предмет).',
    'AI може винаходити нові рецепти логічно, якщо є сенс; d20 + Спритність для складних речей.',
    'Якщо гравець каже «Змайструвати <назва>» — застосуй відповідний рецепт з цього списку.',
  ].join('\n')
}

export function craftActionText(recipeName: string): string {
  return `Змайструвати ${recipeName}`
}

export function consumeActionText(itemName: string): string {
  return `Спожити ${itemName}`
}

export function findRecipeById(id: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find((r) => r.id === id)
}

export function findRecipeByName(name: string): CraftingRecipe | undefined {
  const n = name.trim().toLowerCase()
  return CRAFTING_RECIPES.find((r) => r.name.toLowerCase() === n)
}

/** Resolve inventory row for an ingredient name (exact first, then includes). */
export function findInventoryItem(
  inventory: Array<{ id?: string; name: string; quantity: number }>,
  ingredientName: string
) {
  const exact = inventory.find((i) => i.name === ingredientName)
  if (exact) return exact
  const lower = ingredientName.toLowerCase()
  return (
    inventory.find(
      (i) => i.name.toLowerCase().includes(lower) || lower.includes(i.name.toLowerCase())
    ) ?? null
  )
}

export interface ConsumeEffect {
  hungerDelta: number
  thirstDelta: number
  label: string
}

/** Deterministic food/drink effects (negative hunger/thirst = relief). */
export function getConsumeEffect(
  itemName: string,
  category?: string
): ConsumeEffect | null {
  const n = itemName.toLowerCase()
  const cat = (category || '').toLowerCase()

  // Explicit crafted / common items
  if (n.includes('жарена риба') || n.includes('смажена риба')) {
    return { hungerDelta: -35, thirstDelta: -5, label: 'Голод −35, спрага −5' }
  }
  if (n.includes('сира риба')) {
    return { hungerDelta: -15, thirstDelta: 0, label: 'Голод −15 (сира)' }
  }
  if (n.includes('фрукт') || n.includes('банан') || n.includes('кокос') || n.includes('ягода')) {
    return { hungerDelta: -20, thirstDelta: -10, label: 'Голод −20, спрага −10' }
  }
  if (n.includes('м\'яс') || n.includes('м’яс') || n.includes('стейк')) {
    return { hungerDelta: -40, thirstDelta: 0, label: 'Голод −40' }
  }
  if (n.includes('вод') || n.includes('water')) {
    return { hungerDelta: 0, thirstDelta: -30, label: 'Спрага −30' }
  }
  if (n.includes('цілющ') || n.includes('пов\'яз') || n.includes('пов’яз')) {
    return { hungerDelta: 0, thirstDelta: 0, label: 'Використано (без їжі)' }
  }

  if (cat === 'їжа' || cat === 'food') {
    return { hungerDelta: -20, thirstDelta: -5, label: 'Голод −20, спрага −5' }
  }
  if (cat === 'напій' || cat === 'drink') {
    return { hungerDelta: 0, thirstDelta: -25, label: 'Спрага −25' }
  }

  // Heuristic fallback
  if (n.includes('їж') || n.includes('хліб') || n.includes('риба')) {
    return { hungerDelta: -15, thirstDelta: 0, label: 'Голод −15' }
  }

  return null
}

export function isConsumable(itemName: string, category?: string): boolean {
  if (getConsumeEffect(itemName, category)) return true
  const n = itemName.toLowerCase()
  const cat = (category || '').toLowerCase()
  return (
    cat === 'їжа' ||
    cat === 'food' ||
    n.includes('риба') ||
    n.includes('фрукт') ||
    n.includes('вод') ||
    n.includes('м\'яс') ||
    n.includes('м’яс')
  )
}
