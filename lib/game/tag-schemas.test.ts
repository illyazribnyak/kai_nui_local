import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  sanitizeStatUpdate,
  parseWithSchema,
  RelUpdateSchema,
  SkillUpdateSchema,
  TribeUpdateSchema,
} from './tag-schemas'

describe('sanitizeStatUpdate', () => {
  it('keeps valid fields and clamps via coerce', () => {
    const s = sanitizeStatUpdate({ desire: 150, location: 'Джунглі', mood: 'happy', bogus: 1 })
    assert.equal(s.desire, 100)
    assert.equal(s.location, 'Джунглі')
    assert.equal(s.mood, 'happy')
  })

  it('drops invalid mood', () => {
    const s = sanitizeStatUpdate({ mood: 'furious' })
    assert.equal(s.mood, undefined)
  })

  it('returns empty for non-object', () => {
    assert.deepEqual(sanitizeStatUpdate(null), {})
    assert.deepEqual(sanitizeStatUpdate('x'), {})
  })
})

describe('RelUpdateSchema', () => {
  it('requires name', () => {
    assert.equal(parseWithSchema(RelUpdateSchema, { bond: 3 }, 't'), null)
    const ok = parseWithSchema(RelUpdateSchema, { name: 'Тане', bond: 4, attitude: 'curious' }, 't')
    assert.ok(ok)
    assert.equal(ok!.name, 'Тане')
    assert.equal(ok!.bond, 4)
  })
})

describe('SkillUpdateSchema', () => {
  it('rejects unknown skill', () => {
    assert.equal(parseWithSchema(SkillUpdateSchema, { name: 'Неіснуюча', xp: 10 }, 's'), null)
  })

  it('accepts known skill', () => {
    const s = parseWithSchema(SkillUpdateSchema, { name: 'Ніжний дотик', xp: 15 }, 's')
    assert.ok(s)
    assert.equal(s!.xp, 15)
  })
})

describe('TribeUpdateSchema', () => {
  it('accepts valid tribe', () => {
    const t = parseWithSchema(TribeUpdateSchema, { tribe: 'Кай-Тору', change: 10 }, 't')
    assert.ok(t)
  })
})
