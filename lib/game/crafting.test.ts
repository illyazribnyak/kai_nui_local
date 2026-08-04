import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CRAFTING_RECIPES,
  canCraftRecipe,
  formatRecipeLine,
  formatRecipesForPrompt,
  getInventoryCount,
} from './crafting'

describe('crafting recipes', () => {
  it('has stable unique ids', () => {
    const ids = CRAFTING_RECIPES.map((r) => r.id)
    assert.equal(ids.length, new Set(ids).size)
  })

  it('getInventoryCount prefers exact name', () => {
    const inv = [
      { name: 'Ліана', quantity: 2 },
      { name: 'Цілюще листя', quantity: 1 },
    ]
    assert.equal(getInventoryCount(inv, 'Ліана'), 2)
    assert.equal(getInventoryCount(inv, 'Обсидіан'), 0)
  })

  it('canCraftRecipe checks all ingredients', () => {
    const bandage = CRAFTING_RECIPES.find((r) => r.id === 'bandage')!
    assert.equal(
      canCraftRecipe(
        [
          { name: 'Цілюще листя', quantity: 1 },
          { name: 'Ліана', quantity: 1 },
        ],
        bandage
      ),
      true
    )
    assert.equal(canCraftRecipe([{ name: 'Ліана', quantity: 1 }], bandage), false)
  })

  it('formatRecipesForPrompt lists every recipe name', () => {
    const block = formatRecipesForPrompt()
    for (const r of CRAFTING_RECIPES) {
      assert.ok(block.includes(r.name), `missing ${r.name}`)
      assert.ok(formatRecipeLine(r).includes(r.name))
    }
  })

  it('UI recipe names match prompt block (craft match)', () => {
    const prompt = formatRecipesForPrompt()
    for (const r of CRAFTING_RECIPES) {
      for (const ing of r.ingredients) {
        assert.ok(
          prompt.includes(ing.name),
          `prompt missing ingredient "${ing.name}" for ${r.name}`
        )
      }
      assert.ok(prompt.includes(formatRecipeLine(r).split(' → ')[1].replace(/ x\d+$/, '') || r.name) || prompt.includes(r.name))
    }
  })

  it('every recipe has at least one ingredient and positive result qty', () => {
    for (const r of CRAFTING_RECIPES) {
      assert.ok(r.ingredients.length >= 1)
      assert.ok(r.resultQuantity >= 1)
      assert.ok(r.name.trim().length > 0)
    }
  })
})
