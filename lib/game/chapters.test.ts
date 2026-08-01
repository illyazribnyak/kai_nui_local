import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { chapterProgressPercent, endingFromFactKeys, inferChapter } from './chapters'

describe('inferChapter', () => {
  it('starts at arrival', () => {
    assert.equal(inferChapter('Берег острова', []).id, 'arrival')
  })
  it('detects jungle from location', () => {
    assert.equal(inferChapter('Густі джунглі', []).id, 'jungle')
  })
  it('detects temple from fact', () => {
    assert.equal(inferChapter('деінде', ['found_temple']).id, 'temple')
  })
  it('does not go backwards', () => {
    const ch = inferChapter('Берег острова', [], 'tribe')
    assert.equal(ch.id, 'tribe')
  })
})

describe('chapterProgressPercent', () => {
  it('is 0 for arrival and 100 for ending', () => {
    assert.equal(chapterProgressPercent('arrival'), 0)
    assert.equal(chapterProgressPercent('ending'), 100)
  })
})

describe('endingFromFactKeys', () => {
  it('parses ending keys', () => {
    assert.equal(endingFromFactKeys(['ending_freedom']), 'freedom')
    assert.equal(endingFromFactKeys(['other']), null)
  })
})
