import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildCoercionChoices,
  buildDesireImpulses,
  buildOrgasmFork,
  buildPartnerReactionChoices,
  filterPositionsForScene,
  isCoercionScene,
  isMoveAllowedInScene,
  isPositionAllowed,
  nextPressure,
  inventPartnerMemoryFact,
  upsertBodyState,
  tickBodyStates,
  getPosition,
  initialPressureForScene,
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

  it('coercion orgasm fork differs from voluntary', () => {
    const f = buildOrgasmFork({
      laraOrgasm: true,
      partnerOrgasm: true,
      multiUnlocked: true,
      edgeSkill: 2,
      partnerName: 'Грух',
      sceneType: 'coercion',
    })
    assert.ok(f.some((x) => x.id === 'break_free'))
    assert.ok(f.some((x) => x.id === 'body_betrays'))
    assert.ok(f.some((x) => x.id === 'endure'))
    assert.ok(!f.some((x) => x.id === 'continue'))
    assert.ok(f.every((x) => x.coercion))
  })

  it('coercion choices only for coercion/trap', () => {
    assert.equal(buildCoercionChoices('Грух', 'voluntary').length, 0)
    const c = buildCoercionChoices('Грух', 'coercion')
    assert.ok(c.some((x) => x.id === 'resist_str'))
    assert.ok(c.some((x) => x.id === 'submit'))
    const trap = buildCoercionChoices('Сітка', 'trap')
    assert.ok(trap[0].dc >= 16)
  })

  it('gates positions and domination moves under coercion/trap/knot', () => {
    assert.ok(isCoercionScene('coercion'))
    assert.ok(isCoercionScene('trap'))
    assert.ok(!isCoercionScene('voluntary'))

    const trapPos = filterPositionsForScene({ sceneType: 'trap' })
    assert.ok(!trapPos.some((p) => p.id === 'cowgirl'))
    assert.ok(trapPos.some((p) => p.id === 'doggy'))

    const cowgirl = isPositionAllowed('cowgirl', { sceneType: 'coercion' })
    assert.equal(cowgirl.ok, false)

    const dom = isMoveAllowedInScene(
      { id: 'dom_voice', category: 'domination' },
      { sceneType: 'coercion' }
    )
    assert.equal(dom.ok, false)

    const ride = isMoveAllowedInScene(
      { id: 'ride_main', category: 'riding' },
      { sceneType: 'trap' }
    )
    assert.equal(ride.ok, false)

    const knot = isMoveAllowedInScene(
      { id: 'dom_bind', category: 'domination' },
      { sceneType: 'voluntary', knotLocked: true }
    )
    assert.equal(knot.ok, false)

    const sub = isMoveAllowedInScene(
      { id: 'sub_yield', category: 'submission' },
      { sceneType: 'coercion' }
    )
    assert.equal(sub.ok, true)

    assert.ok(initialPressureForScene('trap') > initialPressureForScene('voluntary'))
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
