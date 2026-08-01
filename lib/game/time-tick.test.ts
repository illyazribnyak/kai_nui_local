import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ACTIONS_PER_PHASE, applyNewDaySurvival, applyServerTimeTick } from './time-tick'

describe('applyServerTimeTick', () => {
  it('increments turnCount every action', () => {
    const r = applyServerTimeTick({}, { turnCount: 0, timeOfDay: 'day', dayNumber: 1 })
    assert.equal(r.turnCount, 1)
    assert.equal(r.phaseAdvanced, false)
  })

  it('advances phase every ACTIONS_PER_PHASE turns', () => {
    // turnCount becomes 3 → advance day → evening
    const r = applyServerTimeTick({}, { turnCount: 2, timeOfDay: 'day', dayNumber: 1 })
    assert.equal(r.turnCount, 3)
    assert.equal(r.phaseAdvanced, true)
    assert.equal(r.stat.timeOfDay, 'evening')
    assert.equal(r.newDay, false)
  })

  it('starts new day on night → morning', () => {
    // next turnCount divisible by 3
    const r = applyServerTimeTick({}, { turnCount: ACTIONS_PER_PHASE * 1 - 1, timeOfDay: 'night', dayNumber: 2 })
    // turnCount 2 with ACTIONS_PER_PHASE=3 is not advance...
    // use turnCount 5 → becomes 6
    const r2 = applyServerTimeTick({}, { turnCount: 5, timeOfDay: 'night', dayNumber: 2 })
    assert.equal(r2.turnCount, 6)
    assert.equal(r2.stat.timeOfDay, 'morning')
    assert.equal(r2.newDay, true)
    assert.equal(r2.stat.dayNumber, 3)
  })
})

describe('applyNewDaySurvival', () => {
  it('bumps hunger and thirst', () => {
    const r = applyNewDaySurvival({ hunger: 20, thirst: 20 })
    assert.equal(r.hunger, 25)
    assert.equal(r.thirst, 28)
  })
})
