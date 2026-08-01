import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildSurvivalWarnings,
  createDefaultGameState,
  formatMessageHtml,
  getTimeOfDayLabel,
} from './ui-labels'

describe('formatMessageHtml', () => {
  it('formats bold and newlines', () => {
    assert.equal(formatMessageHtml('**hi**\nthere'), '<strong>hi</strong><br/>there')
  })
})

describe('createDefaultGameState', () => {
  it('starts at beach day 1', () => {
    const g = createDefaultGameState()
    assert.equal(g.location, 'Берег острова')
    assert.equal(g.dayNumber, 1)
    assert.equal(g.turnCount, 0)
  })
})

describe('buildSurvivalWarnings', () => {
  it('flags critical thirst', () => {
    const w = buildSurvivalWarnings(10, 85, [])
    assert.ok(w.some((x) => x.includes('Спрага')))
  })
  it('lists diseases', () => {
    const w = buildSurvivalWarnings(0, 0, ['Лихоманка'])
    assert.ok(w[0].includes('Лихоманка'))
  })
})

describe('getTimeOfDayLabel', () => {
  it('maps night', () => {
    assert.equal(getTimeOfDayLabel('night'), 'Ніч')
  })
})
