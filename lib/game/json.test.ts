import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { clamp, safeParseJSON } from './json'

describe('clamp', () => {
  it('clamps range', () => {
    assert.equal(clamp(5, 0, 10), 5)
    assert.equal(clamp(-1, 0, 10), 0)
    assert.equal(clamp(99, 0, 10), 10)
  })
})

describe('safeParseJSON', () => {
  it('parses plain json', () => {
    assert.deepEqual(safeParseJSON('{"a":1}', 't'), { a: 1 })
  })
  it('strips markdown fences', () => {
    assert.deepEqual(safeParseJSON('```json\n{"a":2}\n```', 't'), { a: 2 })
  })
  it('returns null on garbage', () => {
    assert.equal(safeParseJSON('not json', 't'), null)
  })
})
