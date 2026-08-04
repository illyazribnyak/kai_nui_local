import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  BODY_PARTS,
  DEFAULT_BODY_KIT,
  partsForSlot,
  suggestBodyKit,
  getPart,
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

  it('licensed stock have license urls', () => {
    const stock = BODY_PARTS.filter((p) => p.source !== 'ai')
    assert.ok(stock.length >= 5)
    for (const p of stock) {
      assert.ok(p.licenseName, p.id)
      assert.ok(p.licenseUrl, p.id)
    }
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

  it('uses butt emphasis in sex scene', () => {
    const k = suggestBodyKit({
      desire: 40,
      inSexScene: true,
      sexSceneType: 'coercion',
    })
    assert.equal(k.hips, 'hips_cc0_butt')
    assert.equal(k.bust, 'bust_cc0_nude')
  })

  it('uses beach stock on shore', () => {
    const k = suggestBodyKit({
      location: 'Берег острова',
      desire: 10,
      clothing: 'клапті одягу',
    })
    assert.ok(k.legs.includes('beach') || k.legs.includes('pexels') || k.hips.includes('beach'))
  })
})
