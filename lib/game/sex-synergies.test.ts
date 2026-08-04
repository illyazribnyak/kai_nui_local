import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  aggregateSynergyEffects,
  computeActiveSynergies,
  detectNewSynergies,
  detectNewlyLeveledSkills,
  detectNewlyUnlockedNodes,
} from './sex-synergies'
import { filterAndEnrichSexChoices } from './sex-choices-gate'

describe('synergies', () => {
  it('activates sweet_power with dom+tech levels', () => {
    const skills = [
      { name: 'Владний голос', level: 2 },
      { name: 'Ніжний дотик', level: 2 },
    ]
    const active = computeActiveSynergies(skills)
    assert.ok(active.some((s) => s.id === 'sweet_power'))
    const agg = aggregateSynergyEffects(active)
    assert.ok(agg.partnerPleasureBonusPct >= 10)
  })

  it('detects new synergies when crossing threshold', () => {
    const before = [{ name: 'Владний голос', level: 1 }, { name: 'Ніжний дотик', level: 2 }]
    const after = [{ name: 'Владний голос', level: 2 }, { name: 'Ніжний дотик', level: 2 }]
    const neu = detectNewSynergies(before, after)
    assert.ok(neu.some((s) => s.id === 'sweet_power'))
  })

  it('detects level-ups and unlocks', () => {
    const before = [{ name: 'Ніжний дотик', level: 0 }]
    const after = [{ name: 'Ніжний дотик', level: 1 }]
    const leveled = detectNewlyLeveledSkills(before, after)
    assert.equal(leveled[0]?.to, 1)
    const unlocks = detectNewlyUnlockedNodes(before, after)
    assert.ok(unlocks.includes('Поцілунок вогню'))
  })
})

describe('sex choices gate', () => {
  it('strips bondage risk without skill', () => {
    const r = filterAndEnrichSexChoices(
      [
        { text: 'Укусити', bonus: 'risk', risk: true },
        { text: 'Зв\'язати мотузкою', bonus: 'бондаж', risk: true },
        { text: 'Поцілувати', bonus: '+ніжність', risk: false },
      ],
      [{ name: 'Ніжний дотик', level: 0 }],
      { phase: 'foreplay' }
    )
    assert.ok(r.removedRisk >= 1)
    assert.ok(r.choices.some((c) => c.text.includes('Поцілувати') || c.skillMoveId))
  })

  it('allows bondage risk with skill', () => {
    const r = filterAndEnrichSexChoices(
      [{ text: 'Зв\'язати', bonus: 'бондаж', risk: true }],
      [
        { name: "Зв'язування", level: 2 },
        { name: 'Владний голос', level: 1 },
      ],
      { phase: 'main' }
    )
    assert.ok(r.choices.some((c) => /зв/i.test(c.text)))
  })

  it('injects skill moves as choices', () => {
    const r = filterAndEnrichSexChoices([], [{ name: 'Ніжний дотик', level: 0 }], {
      phase: 'foreplay',
    })
    assert.ok(r.injected >= 1)
    assert.ok(r.choices.some((c) => c.skillMoveId))
  })
})
