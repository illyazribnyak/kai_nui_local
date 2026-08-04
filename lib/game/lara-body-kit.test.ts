import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BODY_PARTS,
  DEFAULT_BODY_KIT,
  partsForSlot,
  suggestBodyKit,
  getPart,
  STOCK_REFERENCE_NOTES,
} from './lara-body-kit'

describe('BODY_PARTS', () => {
  it('has all four slots covered', () => {
    for (const slot of ['bust', 'waist', 'hips', 'legs'] as const) {
      assert.ok(partsForSlot(slot).length >= 1, slot)
    }
  })

  it('unique ids', () => {
    const ids = BODY_PARTS.map((p) => p.id)
    assert.equal(ids.length, new Set(ids).size)
  })

  it('default kit parts exist', () => {
    for (const id of Object.values(DEFAULT_BODY_KIT)) {
      assert.ok(getPart(id), id)
    }
  })
})

describe('suggestBodyKit', () => {
  it('picks CC0 nude parts when aroused', () => {
    const k = suggestBodyKit({ lookKey: 'aroused', desire: 80 })
    assert.equal(k.bust, 'bust_cc0_nude')
    assert.equal(k.hips, 'hips_cc0_butt')
  })
})

describe('STOCK_REFERENCE_NOTES', () => {
  it('documents free stock sources', () => {
    assert.ok(STOCK_REFERENCE_NOTES.length >= 2)
    assert.ok(STOCK_REFERENCE_NOTES.some((n) => n.source === 'Pexels'))
  })
})

describe('licensed stock parts', () => {
  it('includes pexels/unsplash parts with license urls', () => {
    const stock = BODY_PARTS.filter((p) => p.source === 'pexels' || p.source === 'unsplash')
    assert.ok(stock.length >= 5)
    for (const p of stock) {
      assert.ok(p.licenseName, p.id)
      assert.ok(p.licenseUrl, p.id)
      assert.match(p.image, /\/stock\//)
    }
  })
})
