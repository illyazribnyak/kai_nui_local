import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  computeLaraBodyProfile,
  formatLaraBodyProfileForPrompt,
  parseBodyProfileJson,
  defaultBodyProfileStored,
} from './lara-body-profile'

describe('lara-body-profile', () => {
  it('defaults match Lara canon breasts C', () => {
    const p = computeLaraBodyProfile([])
    assert.equal(p.breasts.size, 'C')
    assert.ok(p.general.heightCm >= 160)
    assert.ok(p.rows.length >= 20)
    assert.match(p.summaryLine, /Груди/)
  })

  it('skills expand depth labels toward deep', () => {
    const skills = [
      { name: 'Вагінальна місткість', level: 5 },
      { name: 'Глибина вагіни', level: 5 },
      { name: 'Гра з розміром', level: 4 },
      { name: 'Глибоке горло', level: 4 },
      { name: 'Подолання рефлекса', level: 4 },
    ]
    const p = computeLaraBodyProfile(skills)
    assert.ok(p.vagina.depthCmMax > 14)
    assert.ok(['deep', 'very_deep'].includes(p.vagina.depthBand))
    assert.ok(p.mouth.gagReflex === 'weak' || p.mouth.gagReflex === 'none')
  })

  it('parses bodyProfileJson overrides', () => {
    const json = JSON.stringify({
      breasts: { size: 'D', milkiness: 'weak' },
      vagina: { appearance: 'квіткові губи', scent: 'musky' },
    })
    const p = computeLaraBodyProfile([], { bodyProfileJson: json })
    assert.equal(p.breasts.size, 'D')
    assert.equal(p.breasts.milkiness, 'weak')
    assert.match(p.vagina.appearance, /квіткові/)
    assert.equal(p.vagina.scent, 'musky')
  })

  it('parseBodyProfileJson is safe', () => {
    assert.deepEqual(parseBodyProfileJson(''), {})
    assert.deepEqual(parseBodyProfileJson('not-json'), {})
    assert.equal(defaultBodyProfileStored().breasts.size, 'C')
  })

  it('prompt formatter includes stats and orifices', () => {
    const block = formatLaraBodyProfileForPrompt([], {
      strength: 4,
      attractiveness: 7,
      libido: 6,
      bodySensitivity: 7,
    })
    assert.match(block, /Привабливість/)
    assert.match(block, /Вагіна/)
    assert.match(block, /Груди/)
    assert.match(block, /Рот\/горло/)
  })
})
