import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { detectPromptMode, modeInstructions, CHAPTER_MAP_GOALS } from './prompt-mode'

describe('detectPromptMode', () => {
  it('detects sex', () => {
    assert.equal(detectPromptMode('поцілувати його'), 'sex')
  })
  it('detects combat', () => {
    assert.equal(detectPromptMode('атакувати списом'), 'combat')
  })
  it('detects dialogue', () => {
    assert.equal(detectPromptMode('поговорити з Тане'), 'dialogue')
  })
  it('defaults to adventure', () => {
    assert.equal(detectPromptMode('піти в джунглі'), 'adventure')
  })
  it('forces sex when inSexScene', () => {
    assert.equal(detectPromptMode('нічого', { inSexScene: true }), 'sex')
  })
})

describe('modeInstructions', () => {
  it('returns non-empty for all modes', () => {
    for (const m of ['adventure', 'dialogue', 'combat', 'sex'] as const) {
      assert.ok(modeInstructions(m).length > 20)
    }
  })
})

describe('CHAPTER_MAP_GOALS', () => {
  it('has arrival goal', () => {
    assert.ok(CHAPTER_MAP_GOALS.arrival.locationHints.length > 0)
  })
})
