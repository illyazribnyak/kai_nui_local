import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { needsDeepAnalysis } from './needs-analysis'

const complete = {
  choices: ['Оглянутись', 'Йти далі'],
  stat: { desire: 10, location: 'Берег' },
  inv: [{ name: 'Камінь', action: 'add' }],
  rel: [{ name: 'Тане', bond: 1 }],
}

describe('needsDeepAnalysis', () => {
  it('skips when tags look complete and no missing mentions', () => {
    assert.equal(
      needsDeepAnalysis('Лара стоїть на піску. Повітря вологе.', complete),
      false
    )
  })

  it('runs when choices missing', () => {
    assert.equal(
      needsDeepAnalysis('Текст.', { ...complete, choices: [] }),
      true
    )
  })

  it('runs when stat missing', () => {
    assert.equal(
      needsDeepAnalysis('Текст.', { ...complete, stat: {} }),
      true
    )
  })

  it('runs when item mentioned but no inv tags', () => {
    assert.equal(
      needsDeepAnalysis('Лара знайшла гостру палицю біля рифів.', {
        ...complete,
        inv: [],
      }),
      true
    )
  })

  it('runs when NPC mentioned but no rel tags', () => {
    assert.equal(
      needsDeepAnalysis('Тане сказав, що попереду джунглі.', {
        ...complete,
        rel: [],
      }),
      true
    )
  })

  it('does not require inv when no item hint', () => {
    assert.equal(
      needsDeepAnalysis('Лара слухає шум хвиль.', {
        choices: ['Сісти'],
        stat: { thirst: 5 },
        inv: [],
        rel: [],
      }),
      false
    )
  })
})
