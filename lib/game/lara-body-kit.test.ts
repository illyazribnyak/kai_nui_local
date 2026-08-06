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

  it('is AI-only (no stock sources)', () => {
    assert.ok(BODY_PARTS.every((p) => p.source === 'ai'))
    assert.ok(BODY_PARTS.every((p) => !p.image.includes('/stock/')))
  })

  it('default kit parts exist', () => {
    for (const id of Object.values(DEFAULT_BODY_KIT)) {
      assert.ok(getPart(id), id)
    }
  })
})

describe('suggestBodyKit', () => {
  it('picks fuller AI parts when aroused', () => {
    const k = suggestBodyKit({ lookKey: 'aroused', desire: 80 })
    assert.equal(k.bust, 'bust_full_nude')
    assert.equal(k.hips, 'hips_curvy_front')
  })

  it('uses curvy hips in sex scene', () => {
    const k = suggestBodyKit({
      desire: 40,
      inSexScene: true,
      sexSceneType: 'coercion',
    })
    assert.equal(k.hips, 'hips_curvy_butt')
    assert.equal(k.bust, 'bust_full_nude')
  })

  it('uses beach AI on shore', () => {
    const k = suggestBodyKit({
      location: 'Берег острова',
      desire: 10,
      clothing: 'клапті одягу',
    })
    assert.equal(k.legs, 'legs_beach')
  })
})
