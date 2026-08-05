import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeActiveSexState,
  parseActiveSexJson,
  serializeActiveSex,
} from './active-sex'

describe('active-sex', () => {
  it('merges start and pleasure', () => {
    const a = mergeActiveSexState(null, {
      sexScene: { type: 'voluntary', partner: 'Тане', phase: 'foreplay' },
      pleasure: { lara: 20, partner: 15 },
    })
    assert.equal(a?.sexScene.partner, 'Тане')
    assert.equal(a?.pleasure?.lara, 20)
    const b = mergeActiveSexState(a, {
      pleasure: { lara: 50, partner: 46 },
      phase: { phase: 'main', label: 'Основна' },
    })
    assert.equal(b?.sexScene.partner, 'Тане')
    assert.equal(b?.pleasure?.lara, 50)
    assert.equal(b?.phase?.phase, 'main')
  })

  it('clears on scene summary', () => {
    const a = mergeActiveSexState(null, {
      sexScene: { type: 'voluntary', partner: 'Тане' },
    })
    const end = mergeActiveSexState(a, { sceneSummary: { partner: 'Тане' } })
    assert.equal(end, null)
    assert.equal(serializeActiveSex(null), '')
  })

  it('roundtrips json', () => {
    const raw = serializeActiveSex({
      sexScene: { type: 'coercion', partner: 'Грух' },
      pleasure: { lara: 10, partner: 30 },
    })
    const p = parseActiveSexJson(raw)
    assert.equal(p?.sexScene.type, 'coercion')
  })
})
