import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { KINK_CATALOG } from './kink-catalog'
import {
  applyKinkXpLocal,
  computeKinkModifiers,
  planKinkTriggers,
} from './kink-effects'
import { detectKinkKeysFromText } from './kink-catalog'

describe('kink catalog', () => {
  it('has expanded kink catalog with 5 level meanings each', () => {
    assert.ok(KINK_CATALOG.length >= 19, `got ${KINK_CATALOG.length}`)
    for (const k of KINK_CATALOG) {
      assert.equal(k.levelMeanings.length, 5, k.key)
    }
    assert.ok(KINK_CATALOG.some((k) => k.key === 'helpless'))
  })
})

describe('kink effects', () => {
  it('detects breeding from text', () => {
    const keys = detectKinkKeysFromText('Вона благає запліднити її насінням')
    assert.ok(keys.includes('breeding'))
  })

  it('plans triggers from fetish + text', () => {
    const plan = planKinkTriggers({
      narrativeText: 'кремпай глибоко всередині',
      fetishName: 'Публічність',
      explicitKeys: [{ key: 'size', xp: 10 }],
    })
    const keys = plan.map((p) => p.key)
    assert.ok(keys.includes('creampie') || keys.includes('breeding'))
    assert.ok(keys.includes('public') || keys.includes('size'))
  })

  it('levels up from 0 on first XP', () => {
    const next = applyKinkXpLocal(
      { key: 'breeding', name: 'Запліднення', level: 0, xp: 0, discovered: false },
      15
    )
    assert.equal(next.discovered, true)
    assert.ok(next.level >= 1)
    assert.equal(next.leveled, true)
  })

  it('pregnancy mult grows with breeding level', () => {
    const m0 = computeKinkModifiers([])
    const m3 = computeKinkModifiers([
      { key: 'breeding', name: 'Запліднення', level: 3, xp: 0, discovered: true },
    ])
    assert.ok(m3.pregnancyRiskMult > m0.pregnancyRiskMult)
  })

  it('helpless boosts lara pleasure and detects coercion text', () => {
    const keys = detectKinkKeysFromText('Він тримає її силою — примус, вона безсила')
    assert.ok(keys.includes('helpless'))
    const m = computeKinkModifiers([
      { key: 'helpless', name: 'Безсилля', level: 2, xp: 0, discovered: true },
    ])
    assert.ok(m.laraPleasureBonusPct >= 6)
    assert.ok(m.shameRelief >= 2)
  })
})

