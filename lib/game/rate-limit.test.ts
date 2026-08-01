import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { _resetRateLimits, rateLimit } from './rate-limit'

describe('rateLimit', () => {
  it('allows under limit and blocks over', () => {
    _resetRateLimits()
    assert.equal(rateLimit('a', { limit: 2, windowMs: 60_000 }).ok, true)
    assert.equal(rateLimit('a', { limit: 2, windowMs: 60_000 }).ok, true)
    const blocked = rateLimit('a', { limit: 2, windowMs: 60_000 })
    assert.equal(blocked.ok, false)
    if (!blocked.ok) assert.ok(blocked.retryAfterMs >= 0)
  })

  it('isolates keys', () => {
    _resetRateLimits()
    assert.equal(rateLimit('x', { limit: 1, windowMs: 60_000 }).ok, true)
    assert.equal(rateLimit('y', { limit: 1, windowMs: 60_000 }).ok, true)
  })
})
