import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generatePenisStats,
  sanitizePenisStats,
  resolveRaceKey,
  effectivePenetrationCm,
  injuryDcFromStats,
  formatRaceSexStatsForPrompt,
  getRaceSexDef,
} from './race-sex-stats'

describe('resolveRaceKey', () => {
  it('maps tribes and aliases', () => {
    assert.equal(resolveRaceKey('Кентаври'), 'centaur')
    assert.equal(resolveRaceKey('гієноїд'), 'hyenoid')
    assert.equal(resolveRaceKey('Свинолюди'), 'boar')
    assert.equal(resolveRaceKey(null, 'Тане'), 'kai_toru')
    assert.equal(resolveRaceKey(null, 'Зек'), 'hyenoid')
  })
})

describe('generatePenisStats', () => {
  it('locks Tane at 16 cm', () => {
    const s = generatePenisStats({ name: 'Тане' })
    assert.equal(s.length_cm, 16)
    assert.equal(s.race, 'Кай-Тору')
    assert.equal(s.risk_for_lara, 'Низький')
  })

  it('gives Zek hyenoid knot', () => {
    const s = generatePenisStats({ name: 'Зек' })
    assert.equal(s.race, 'Гієноїд')
    assert.equal(s.length_cm, 15)
    assert.ok(s.lock_minutes != null && s.lock_minutes >= 5)
    assert.ok(s.knot_diameter_cm != null && Number(s.knot_diameter_cm) > Number(s.girth_cm))
    assert.match(String(s.special || ''), /вузол|замок|бульбус/i)
  })

  it('gives Xeron centaur size and depth cap', () => {
    const s = generatePenisStats({ name: 'Ксерон' })
    assert.equal(s.race, 'Кентавр')
    assert.ok(Number(s.length_cm) >= 38)
    assert.equal(s.max_penetration_cm, 16)
    assert.ok(effectivePenetrationCm(s) <= 16)
    assert.ok(Number(s.usable_length_cm) <= 16)
    assert.ok(Number(s.circumference_cm) > Number(s.girth_cm))
  })

  it('gives Gor-Ak deadly minotaur stats', () => {
    const s = generatePenisStats({ name: 'Гор-Ак' })
    assert.equal(s.race, 'Мінотавр')
    assert.ok(Number(s.length_cm) >= 22)
    assert.equal(s.risk_for_lara, 'Дуже високий')
  })

  it('rolls generic hyenoid in range', () => {
    const s = generatePenisStats({ name: 'Патрульний-3', race: 'Гієноїди' })
    const def = getRaceSexDef('hyenoid')!
    assert.ok(Number(s.length_cm) >= def.lengthMin && Number(s.length_cm) <= def.lengthMax)
    assert.ok(s.lock_minutes != null)
  })

  it('is deterministic for same name', () => {
    const a = generatePenisStats({ name: 'Воїн Кіа', race: 'Кай-Тору' })
    const b = generatePenisStats({ name: 'Воїн Кіа', race: 'Кай-Тору' })
    assert.equal(a.length_cm, b.length_cm)
    assert.equal(a.girth_cm, b.girth_cm)
  })
})

describe('sanitizePenisStats', () => {
  it('clamps centaur LLM lie to race range', () => {
    const s = sanitizePenisStats({
      name: 'Жеребець',
      race: 'Кентавр',
      length_cm: 16, // LLM mistake
      girth_cm: 4,
      cum_ml: 8,
    })
    assert.ok(s)
    assert.ok(Number(s!.length_cm) >= 38)
    assert.equal(s!.max_penetration_cm, 16)
    assert.equal(s!.risk_for_lara, 'Високий')
  })

  it('forces Tane even if LLM sends 40 cm', () => {
    const s = sanitizePenisStats({
      name: 'Тане',
      race: 'Кай-Тору',
      length_cm: 40,
      girth_cm: 8,
    })
    assert.equal(s!.length_cm, 16)
    assert.equal(s!.girth_cm, 3.9)
  })

  it('clamps minotaur too small up into range', () => {
    const s = sanitizePenisStats({
      name: 'Бик-вартовий',
      race: 'Мінотавр',
      length_cm: 12,
      girth_cm: 3,
    })
    assert.ok(Number(s!.length_cm) >= 22)
    assert.ok(Number(s!.girth_cm) >= 5.5)
  })

  it('returns null without name', () => {
    assert.equal(sanitizePenisStats({ length_cm: 16 }), null)
  })
})

describe('injuryDcFromStats', () => {
  it('is higher for minotaur than human', () => {
    const human = generatePenisStats({ name: 'Тане' })
    const bull = generatePenisStats({ name: 'Гор-Ак' })
    assert.ok(injuryDcFromStats(bull) > injuryDcFromStats(human))
  })
})

describe('formatRaceSexStatsForPrompt', () => {
  it('mentions races and Tane', () => {
    const t = formatRaceSexStatsForPrompt()
    assert.match(t, /Кентавр/)
    assert.match(t, /Тане/)
    assert.match(t, /Гієноїд|вузол/i)
  })
})
