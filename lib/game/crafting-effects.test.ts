import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  canCraftRecipe,
  findRecipeById,
  getConsumeEffect,
  isConsumable,
} from './crafting'

describe('server craft helpers', () => {
  it('finds recipes by id', () => {
    const r = findRecipeById('cooked_fish')
    assert.ok(r)
    assert.equal(r!.name, 'Жарена риба')
  })

  it('canCraftRecipe requires all ingredients', () => {
    const r = findRecipeById('bandage')!
    assert.equal(canCraftRecipe([], r), false)
    assert.equal(
      canCraftRecipe(
        [
          { name: 'Цілюще листя', quantity: 1 },
          { name: 'Ліана', quantity: 1 },
        ],
        r
      ),
      true
    )
  })

  it('getConsumeEffect for cooked fish', () => {
    const e = getConsumeEffect('Жарена риба', 'їжа')
    assert.ok(e)
    assert.equal(e!.hungerDelta, -35)
  })

  it('isConsumable for water-like names', () => {
    assert.equal(isConsumable('Чиста вода', 'напій'), true)
    assert.equal(isConsumable('Обсидіановий спис', 'зброя'), false)
  })
})
