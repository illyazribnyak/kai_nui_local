import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { planSideQuestCompletions } from './side-quest-sync'

describe('planSideQuestCompletions', () => {
  it('completes Zek meet quest when met_zek present', () => {
    const done = planSideQuestCompletions(
      ['met_zek'],
      ['Зустріч із відступником', 'Сліди відступника']
    )
    assert.ok(done.includes('Зустріч із відступником'))
  })

  it('completes blessing quest on either branch key', () => {
    const done = planSideQuestCompletions(
      ['makai_rejects_lara'],
      ['Благословення або вигнання']
    )
    assert.ok(done.includes('Благословення або вигнання'))
  })

  it('ignores quests not in open list', () => {
    const done = planSideQuestCompletions(['met_zek'], ['Інший квест'])
    assert.equal(done.length, 0)
  })

  it('ignores open quests without matching facts', () => {
    const done = planSideQuestCompletions(
      ['found_fresh_water'],
      ['Зустріч із відступником']
    )
    assert.equal(done.length, 0)
  })
})
