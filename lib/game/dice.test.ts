import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveDiceRolls } from './dice'

describe('resolveDiceRolls', () => {
  it('keeps forced roll and computes success', () => {
    const [r] = resolveDiceRolls(
      [{ skill: 'сила', dc: 10, bonus: 2, roll: 12, keepRoll: true }],
      { strength: 6 }
    )
    assert.equal(r.roll, 12)
    assert.equal(r.total, 14)
    assert.equal(r.result, 'success')
    assert.equal(r.dc, 10)
  })

  it('critical success on natural 20', () => {
    const [r] = resolveDiceRolls(
      [{ skill: 'спритність', dc: 25, bonus: 0, roll: 20, keepRoll: true }],
      null
    )
    assert.equal(r.result, 'critical_success')
  })

  it('critical failure on natural 1', () => {
    const [r] = resolveDiceRolls(
      [{ skill: 'воля', dc: 5, bonus: 10, roll: 1, keepRoll: true }],
      null
    )
    assert.equal(r.result, 'critical_failure')
  })

  it('derives bonus from game state when bonus omitted', () => {
    const [r] = resolveDiceRolls(
      [{ skill: 'харизма', dc: 12, roll: 10, keepRoll: true }],
      { charisma: 9 }
    )
    // bonus = charisma - 5 = 4
    assert.equal(r.bonus, 4)
    assert.equal(r.total, 14)
    assert.equal(r.result, 'success')
  })

  it('handles empty rolls', () => {
    assert.deepEqual(resolveDiceRolls([], null), [])
  })
})
