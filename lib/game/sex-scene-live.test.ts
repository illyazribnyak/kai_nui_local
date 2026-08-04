import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDesireImpulses,
  buildOrgasmFork,
  buildPartnerReactionChoices,
  nextPressure,
  inventPartnerMemoryFact,
  upsertBodyState,
  tickBodyStates,
  getPosition,
} from './sex-scene-live'

describe('sex-scene-live', () => {
  it('raises pressure on fast + bad fit', () => {
    const p = nextPressure(20, {
      tempo: 'fast',
      fitTier: 'extreme',
      hasTense: true,
    })
    assert.ok(p > 40)
  })

  it('builds reaction choices', () => {
    const c = buildPartnerReactionChoices('Тане', 'Він стогне сильніше')
    assert.ok(c.length >= 3)
    assert.ok(c.some((x) => x.id === 'react_yield'))
  })

  it('orgasm fork includes end and continue when multi', () => {
    const f = buildOrgasmFork({
      laraOrgasm: true,
      partnerOrgasm: false,
      multiUnlocked: true,
      edgeSkill: 2,
      partnerName: 'Тане',
    })
    assert.ok(f.some((x) => x.id === 'end'))
    assert.ok(f.some((x) => x.id === 'continue'))
    assert.ok(f.some((x) => x.id === 'edge'))
  })

  it('impulse only at desire 90+', () => {
    assert.equal(buildDesireImpulses(80).length, 0)
    assert.ok(buildDesireImpulses(95, 'Зек').length >= 2)
  })

  it('body state tick expires', () => {
    let s = upsertBodyState([], 'lubed', 2)
    s = tickBodyStates(s)
    assert.equal(s[0].turnsLeft, 1)
    s = tickBodyStates(s)
    assert.equal(s.length, 0)
  })

  it('positions known', () => {
    assert.equal(getPosition('cowgirl').icon, '🏇')
  })

  it('memory fact invents string', () => {
    const f = inventPartnerMemoryFact({
      partner: 'Тане',
      position: 'cowgirl',
      laraOrgasm: true,
      partnerOrgasm: false,
      tempo: 'slow',
    })
    assert.match(f, /Тане/)
  })
})
