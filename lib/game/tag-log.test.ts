import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildTagLog } from './tag-log'

describe('buildTagLog', () => {
  it('counts tags', () => {
    const log = buildTagLog({
      mode: 'adventure',
      merged: {
        stat: { hunger: 30 },
        rel: [{ name: 'Тане' }],
        facts: [{ key: 'entered_jungle' }],
        choices: ['a', 'b'],
        diceRolls: [{ skill: 'сила' }],
      },
      completedQuests: ['Вижити на березі'],
      timeTick: { phaseAdvanced: true, turnCount: 3 },
    })
    assert.equal(log.mode, 'adventure')
    assert.equal(log.counts.STAT, 1)
    assert.equal(log.counts.REL, 1)
    assert.equal(log.counts.FACT, 1)
    assert.equal(log.dice, 1)
    assert.equal(log.choices, 2)
    assert.ok(log.notes.some((n) => n.includes('Вижити')))
  })
})
