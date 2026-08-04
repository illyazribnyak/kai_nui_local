import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CANON_NPC_PROFILES,
  findCanonProfile,
  formatNpcProfileForPrompt,
  generateNpcProfile,
  normalizeKinkMap,
  parseKinksJson,
  resolveNpcProfile,
  serializeKinks,
} from './npc-profile'

describe('npc-profile', () => {
  it('has canon profiles with stats and kinks', () => {
    assert.ok(CANON_NPC_PROFILES.length >= 12)
    const tane = findCanonProfile('Тане')
    assert.ok(tane)
    assert.ok(tane!.stats.strength >= 1)
    assert.ok(tane!.kinks.praise)
    const zek = findCanonProfile('Зек')
    assert.ok(zek!.kinks.service >= 3)
    assert.ok(zek!.stats.dominance < 50)
  })

  it('generates deterministic profiles from name+tribe', () => {
    const a = generateNpcProfile({ name: 'Рорік', tribe: 'Кай-Тору', archetype: 'мисливець' })
    const b = generateNpcProfile({ name: 'Рорік', tribe: 'Кай-Тору', archetype: 'мисливець' })
    assert.deepEqual(a.stats, b.stats)
    assert.deepEqual(a.kinks, b.kinks)
    assert.ok(a.stats.strength >= 1 && a.stats.strength <= 20)
    assert.ok(Object.keys(a.kinks).length >= 1)
  })

  it('minotaur tribe leans strength and control kink', () => {
    const p = generateNpcProfile({ name: 'Бик-Тест', tribe: 'Мінотаври', archetype: 'воїн' })
    assert.ok(p.stats.strength >= 12)
    assert.ok(p.stats.dominance >= 50)
  })

  it('normalizes kink maps and arrays', () => {
    const m = normalizeKinkMap({ control: 4, breeding: 2, fake: 9 })
    assert.equal(m.control, 4)
    assert.equal(m.breeding, 2)
    assert.equal(m.fake, undefined)
    const arr = normalizeKinkMap([
      { key: 'helpless', level: 3 },
      { name: 'Похвала', level: 2 },
    ])
    assert.equal(arr.helpless, 3)
    assert.equal(arr.praise, 2)
  })

  it('resolve prefers canon then provided', () => {
    const c = resolveNpcProfile({ name: 'Грух' })
    assert.equal(c.from, 'canon')
    assert.ok(c.stats.strength >= 15)
    const p = resolveNpcProfile({
      name: 'Новий',
      tribe: 'Свинолюди',
      stats: { strength: 10, agility: 8, endurance: 9, charisma: 5, willpower: 6, dominance: 80, libido: 90 },
      kinks: { degrade: 4 },
    })
    assert.equal(p.from, 'provided')
    assert.equal(p.stats.strength, 10)
    assert.equal(p.kinks.degrade, 4)
  })

  it('formats prompt line with stats and kinks', () => {
    const line = formatNpcProfileForPrompt({
      name: 'Тане',
      tribe: 'Кай-Тору',
      archetype: 'воїн',
      bond: 3,
      ...findCanonProfile('Тане')!.stats,
      kinksJson: serializeKinks(findCanonProfile('Тане')!.kinks),
    })
    assert.match(line, /Тане/)
    assert.match(line, /статы/)
    assert.match(line, /кінки/)
  })

  it('roundtrips kinks json', () => {
    const j = serializeKinks({ control: 3, praise: 1 })
    const m = parseKinksJson(j)
    assert.equal(m.control, 3)
  })
})
