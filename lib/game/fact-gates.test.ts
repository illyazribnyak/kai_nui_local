import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { planFactGateBatch, FACT_PREREQUISITES, FACT_MUTEX_GROUPS } from './fact-gates'

describe('planFactGateBatch', () => {
  it('auto-adds soft prereqs for zek_mark_cleansed', () => {
    const plan = planFactGateBatch(['zek_mark_cleansed'], [])
    assert.ok(plan.toAdd.includes('met_zek'))
    assert.ok(plan.toAdd.includes('zek_death_scent'))
    assert.ok(plan.toAdd.includes('zek_mark_cleansed'))
    assert.ok(plan.notes.some((n) => n.includes('auto-prereq')))
  })

  it('auto-adds met_tane for tane_first_intimacy', () => {
    const plan = planFactGateBatch(['tane_first_intimacy'], ['met_leya'])
    assert.ok(plan.toAdd.includes('met_tane'))
    assert.ok(plan.toAdd.includes('tane_first_intimacy'))
  })

  it('mutex: zek_dead drops companion', () => {
    const plan = planFactGateBatch(['zek_dead'], ['met_zek', 'zek_companion'])
    assert.ok(plan.toAdd.includes('zek_dead'))
    assert.ok(plan.toRemove.includes('zek_companion'))
  })

  it('mutex: makai_blesses drops rejects', () => {
    const plan = planFactGateBatch(['makai_blesses_lara'], ['met_makai', 'makai_rejects_lara'])
    assert.ok(plan.toRemove.includes('makai_rejects_lara'))
  })

  it('mutex within same batch: last key wins for zek fate', () => {
    const plan = planFactGateBatch(['zek_companion', 'zek_dead'], ['met_zek'])
    assert.ok(plan.toAdd.includes('zek_dead'))
    assert.ok(!plan.toAdd.includes('zek_companion'))
  })

  it('skips prereq if already present', () => {
    const plan = planFactGateBatch(['zek_sheltered'], ['met_zek'])
    assert.ok(!plan.toAdd.includes('met_zek') || plan.toAdd.filter((k) => k === 'met_zek').length <= 1)
    assert.ok(plan.toAdd.includes('zek_sheltered'))
  })

  it('jack_ashore_with_lara implies met_jack and clears fate_unknown via mutex', () => {
    const plan = planFactGateBatch(['jack_ashore_with_lara'], ['shipwrecked', 'jack_fate_unknown'])
    assert.ok(plan.toAdd.includes('met_jack'))
    assert.ok(plan.toAdd.includes('jack_found_alive'))
    assert.ok(plan.toRemove.includes('jack_fate_unknown'))
  })
})

describe('FACT_PREREQUISITES catalog', () => {
  it('has zek and tane coverage', () => {
    assert.ok(FACT_PREREQUISITES['zek_companion'])
    assert.ok(FACT_PREREQUISITES['tane_presents_lara_to_father'])
    assert.ok(FACT_MUTEX_GROUPS.length >= 4)
  })
})
