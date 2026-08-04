import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { computeLaraBodyStats } from './lara-body-stats'

describe('computeLaraBodyStats', () => {
  it('returns orifice capacity and extra meters', () => {
    const s = computeLaraBodyStats(
      [
        { name: 'Вагінальна місткість', level: 3 },
        { name: 'Глибина вагіни', level: 2 },
        { name: 'Анал', level: 2 },
        { name: 'Глибоке горло', level: 3 },
        { name: 'Гнучкість тіла', level: 2 },
        { name: 'Множинне задоволення', level: 2 },
      ],
      { desire: 40, confidence: 55, shame: 10, endurance: 8, willpower: 9, amuletEnergy: 20 }
    )
    assert.ok(s.capacity.vaginal.maxDiameterCm > s.capacity.vaginal.comfortDiameterCm)
    assert.ok(s.capacity.oral.maxDepthCm >= s.capacity.oral.comfortDepthCm)
    assert.ok(s.meters.length >= 10)
    assert.ok(s.meters.some((m) => m.key === 'flexibility'))
    assert.ok(s.meters.some((m) => m.key === 'gag'))
    assert.ok(s.meters.some((m) => m.key === 'multi'))
    assert.ok(s.meters.every((m) => m.value >= 0 && m.value <= 100))
  })

  it('marks pregnancy meter when pregnant', () => {
    const s = computeLaraBodyStats([], {
      isPregnant: true,
      pregnancyWeek: 8,
      desire: 30,
    })
    const womb = s.meters.find((m) => m.key === 'womb')
    assert.ok(womb)
    assert.match(womb!.label, /Вагіт/)
    assert.ok(womb!.value >= 40)
  })
})
