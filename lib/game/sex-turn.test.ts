import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveSexTurn, buildSexMoveChatMessage } from './sex-turn'
import { SEX_MOVES, allMoveSkillsExistInTree, sexMovesSkillNames } from './sex-moves'
import { SKILL_NAMES } from './constants'

const baseState = {
  pleasure: { lara: 10, partner: 10 },
  stamina: 100,
  phase: 'foreplay',
  domination: 0,
  tempo: 'medium',
  amuletEnergy: 10,
  partnerName: 'Тане',
}

describe('sex moves catalog', () => {
  it('all move skills exist in SKILL_NAMES and tree', () => {
    assert.equal(allMoveSkillsExistInTree(), true)
    for (const name of sexMovesSkillNames()) {
      assert.ok((SKILL_NAMES as readonly string[]).includes(name), name)
    }
    assert.ok(SEX_MOVES.length >= 12)
  })
})

describe('resolveSexTurn', () => {
  it('rejects unknown move', () => {
    const r = resolveSexTurn('nope', baseState, [])
    assert.equal(r.ok, false)
  })

  it('allows root touch at level 0 (training)', () => {
    const r = resolveSexTurn('tech_touch', baseState, [{ name: 'Ніжний дотик', level: 0 }])
    assert.equal(r.ok, true)
  })

  it('rejects gated multi without level', () => {
    const r = resolveSexTurn(
      'dom_bind',
      { ...baseState, phase: 'main' },
      [{ name: "Зв'язування", level: 1 }]
    )
    assert.equal(r.ok, false)
    if (!r.ok) assert.equal(r.code, 'LOCKED')
  })

  it('applies pleasure and XP for unlocked touch', () => {
    const skills = [{ name: 'Ніжний дотик', level: 2 }]
    const r = resolveSexTurn('tech_touch', baseState, skills)
    assert.equal(r.ok, true)
    if (!r.ok) return
    assert.ok(r.pleasure.partner > baseState.pleasure.partner)
    assert.ok(r.stamina < baseState.stamina)
    assert.ok(r.xpGrants.some((g) => g.name === 'Ніжний дотик' && g.xp > 0))
    assert.ok(buildSexMoveChatMessage(r).includes('Ніжні ласки') || buildSexMoveChatMessage(r).includes('ласк'))
  })

  it('advances phase when pleasure high enough', () => {
    const skills = [
      { name: 'Ніжний дотик', level: 3 },
      { name: 'Майстерність рук', level: 1 },
    ]
    const r = resolveSexTurn(
      'tech_touch',
      { ...baseState, pleasure: { lara: 20, partner: 35 }, phase: 'foreplay' },
      skills
    )
    assert.equal(r.ok, true)
    if (!r.ok) return
    // partner should cross main threshold (~40)
    assert.ok(r.pleasure.partner >= 40)
    assert.equal(r.phase, 'main')
    assert.equal(r.phaseChanged, true)
  })

  it('blocks multi move without skill', () => {
    const r = resolveSexTurn(
      'end_multi',
      { ...baseState, phase: 'climax', pleasure: { lara: 90, partner: 90 } },
      [{ name: 'Множинне задоволення', level: 1 }]
    )
    assert.equal(r.ok, false)
  })

  it('allows multi at level 2 in climax', () => {
    const r = resolveSexTurn(
      'end_multi',
      { ...baseState, phase: 'climax', pleasure: { lara: 85, partner: 70 }, stamina: 90 },
      [
        { name: 'Множинне задоволення', level: 2 },
        { name: 'Тривала насолода', level: 1 },
      ]
    )
    assert.equal(r.ok, true)
    if (!r.ok) return
    assert.ok(r.multiOrgasm || r.laraOrgasm || r.pleasure.lara > 85)
  })

  it('domination move shifts scale', () => {
    const r = resolveSexTurn(
      'dom_voice',
      baseState,
      [{ name: 'Владний голос', level: 2 }]
    )
    assert.equal(r.ok, true)
    if (!r.ok) return
    assert.ok(r.domination > 0)
  })
})
