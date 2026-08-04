import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  computeOrificeCapacity,
  evaluateSizeFit,
  circumferenceFromDiameter,
} from './body-capacity'
import { generatePenisStats } from './race-sex-stats'

describe('circumferenceFromDiameter', () => {
  it('is pi * d', () => {
    assert.equal(circumferenceFromDiameter(4), 12.6)
  })
})

describe('computeOrificeCapacity', () => {
  it('untrained vaginal is modest', () => {
    const v = computeOrificeCapacity([], 'vaginal')
    assert.ok(v.comfortDepthCm >= 10 && v.comfortDepthCm <= 13)
    assert.ok(v.maxDiameterCm < 5.5)
  })

  it('skills expand vaginal capacity and depth', () => {
    const skills = [
      { name: "М'який вхід", level: 3 },
      { name: 'Вагінальна місткість', level: 4 },
      { name: 'Глибина вагіни', level: 4 },
    ]
    const v0 = computeOrificeCapacity([], 'vaginal')
    const v1 = computeOrificeCapacity(skills, 'vaginal')
    assert.ok(v1.comfortDiameterCm > v0.comfortDiameterCm)
    assert.ok(v1.maxDepthCm > v0.maxDepthCm)
    assert.ok(v1.capacityLv === 4)
  })

  it('anal is tighter than vaginal untrained', () => {
    const v = computeOrificeCapacity([], 'vaginal')
    const a = computeOrificeCapacity([], 'anal')
    assert.ok(a.comfortDiameterCm < v.comfortDiameterCm)
    assert.ok(a.comfortDepthCm < v.comfortDepthCm)
  })
})

describe('evaluateSizeFit', () => {
  it('Tane is easy/snug for untrained vaginal', () => {
    const tane = generatePenisStats({ name: 'Тане' })
    const fit = evaluateSizeFit([], tane, 'vaginal')
    assert.ok(['easy', 'snug', 'stretch'].includes(fit.overall))
    assert.ok(fit.insertedDepthCm <= Number(tane.length_cm))
  })

  it('Xeron leaves most length outside', () => {
    const x = generatePenisStats({ name: 'Ксерон' })
    const fit = evaluateSizeFit(
      [
        { name: "М'який вхід", level: 5 },
        { name: 'Вагінальна місткість', level: 5 },
        { name: 'Глибина вагіни', level: 5 },
      ],
      x,
      'vaginal'
    )
    assert.ok(fit.unusedLengthCm > 15)
    assert.ok(fit.insertedDepthCm <= 20)
  })

  it('Gor-Ak is extreme/impossible without training', () => {
    const g = generatePenisStats({ name: 'Гор-Ак' })
    const fit = evaluateSizeFit([], g, 'vaginal')
    assert.ok(['stretch', 'extreme', 'impossible'].includes(fit.overall))
    assert.ok(fit.injuryDc >= 12)
  })

  it('anal vs hyenoid knot is riskier', () => {
    const z = generatePenisStats({ name: 'Зек' })
    const fit = evaluateSizeFit([], z, 'anal')
    assert.ok(fit.requiresPrep)
    assert.ok(fit.painRiskPct >= 15)
  })
})
