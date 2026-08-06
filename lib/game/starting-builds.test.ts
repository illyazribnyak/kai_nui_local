import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { STARTING_BUILDS, getStartingBuild } from './starting-builds'
import { SKILL_NAMES } from './constants'
import { KINK_CATALOG } from './kink-catalog'

describe('starting builds', () => {
  it('has four builds including design pack trio', () => {
    assert.equal(STARTING_BUILDS.length, 4)
    assert.ok(STARTING_BUILDS.some((b) => b.id === 'seductress'))
    assert.ok(STARTING_BUILDS.some((b) => b.id === 'enduring'))
    assert.ok(STARTING_BUILDS.some((b) => b.id === 'cunning'))
  })

  it('skill names exist in SKILL_NAMES', () => {
    const known = new Set(SKILL_NAMES as readonly string[])
    for (const b of STARTING_BUILDS) {
      for (const s of b.skills) {
        assert.ok(known.has(s.name), `${b.id}: unknown skill ${s.name}`)
      }
    }
  })

  it('kink keys exist in catalog', () => {
    const known = new Set(KINK_CATALOG.map((k) => k.key))
    for (const b of STARTING_BUILDS) {
      for (const k of b.kinks) {
        assert.ok(known.has(k.key), `${b.id}: unknown kink ${k.key}`)
      }
    }
  })

  it('getStartingBuild falls back to balanced', () => {
    assert.equal(getStartingBuild('nope').id, 'balanced')
    assert.equal(getStartingBuild('seductress').name, 'Соблазнителька')
  })
})
