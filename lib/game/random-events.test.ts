import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  RANDOM_EVENTS,
  eligibleEvents,
  eventChance,
  isTravelIntent,
  rollRandomEvent,
  formatRolledEventForPrompt,
  getRandomEventById,
} from './random-events'

describe('RANDOM_EVENTS catalog', () => {
  it('has unique ids', () => {
    const ids = RANDOM_EVENTS.map((e) => e.id)
    assert.equal(ids.length, new Set(ids).size)
  })

  it('has raids on Kai-Toru and ambushes', () => {
    assert.ok(getRandomEventById('hyena_raid_kai_toru'))
    assert.ok(getRandomEventById('boar_raid_kai_toru'))
    assert.ok(getRandomEventById('hyena_ambush'))
    assert.ok(getRandomEventById('boar_ambush'))
  })

  it('has Zek renegade random beats', () => {
    assert.ok(getRandomEventById('hyena_zek_flee'))
    assert.ok(getRandomEventById('zek_escape_traces'))
    assert.ok(getRandomEventById('zek_hunters_ambush'))
    assert.ok(getRandomEventById('zek_offers_body'))
    assert.ok(getRandomEventById('kira_ultimatum_zek'))
    assert.ok(getRandomEventById('zek_saves_in_ambush'))
  })

  it('is a large pool', () => {
    assert.ok(RANDOM_EVENTS.length >= 100, `got ${RANDOM_EVENTS.length}`)
  })

  it('covers beach, caves, village extras', () => {
    assert.ok(getRandomEventById('wreck_debris'))
    assert.ok(getRandomEventById('cave_collapse'))
    assert.ok(getRandomEventById('night_raid_alarm'))
    assert.ok(getRandomEventById('centaur_race_challenge'))
    assert.ok(getRandomEventById('eclipse_shadow'))
  })
})

describe('isTravelIntent', () => {
  it('detects Ukrainian travel verbs', () => {
    assert.equal(isTravelIntent('Йду в джунглі'), true)
    assert.equal(isTravelIntent('Підемо до селища'), true)
    assert.equal(isTravelIntent('Просто дивлюсь на море'), false)
  })
})

describe('eligibleEvents', () => {
  it('filters hyena events near hyena territory', () => {
    const pool = eligibleEvents({ location: 'Територія гієноїдів' })
    assert.ok(pool.some((e) => e.id === 'hyena_ambush' || e.id === 'hyena_scouts'))
  })

  it('allows village raids in Kai-Toru', () => {
    const pool = eligibleEvents({ location: 'Селище Кай-Тору' })
    assert.ok(pool.some((e) => e.id === 'hyena_raid_kai_toru'))
    assert.ok(pool.some((e) => e.id === 'boar_raid_kai_toru'))
  })

  it('excludes companion talk without companion', () => {
    const pool = eligibleEvents({ location: 'Джунглі', companionName: null })
    assert.ok(!pool.some((e) => e.id === 'companion_talk'))
  })
})

describe('rollRandomEvent', () => {
  it('always rolls something on travel with deterministic rng', () => {
    let i = 0
    const seq = [0.01, 0.5, 0.3, 0.9, 0.2]
    const rng = () => seq[i++ % seq.length]
    const rolled = rollRandomEvent(
      { location: 'Джунглі', message: 'Йду глибше в джунглі', mode: 'adventure' },
      rng
    )
    assert.ok(rolled)
    assert.ok(rolled!.event.id)
    assert.ok(rolled!.d20 >= 1 && rolled!.d20 <= 20)
  })

  it('can return null when chance fails and no travel', () => {
    const rng = () => 0.99 // high rolls fail chance checks
    const rolled = rollRandomEvent(
      { location: 'Берег острова', message: 'Дивлюсь на хвилі', mode: 'dialogue' },
      rng
    )
    // dialogue low chance + high rng → often null
    assert.equal(rolled, null)
  })
})

describe('eventChance', () => {
  it('is higher for adventure travel', () => {
    const base = eventChance({ location: 'Джунглі', mode: 'adventure', message: 'стій' })
    const travel = eventChance({
      location: 'Джунглі',
      mode: 'adventure',
      message: 'Йду в джунглі',
    })
    assert.ok(travel > base)
  })
})

describe('formatRolledEventForPrompt', () => {
  it('includes forced event title', () => {
    const event = getRandomEventById('boar_ambush')!
    const text = formatRolledEventForPrompt({ event, d20: 3, forced: true })
    assert.match(text, /Напад свинолюдів/)
    assert.match(text, /ОБОВ'ЯЗКОВО/)
  })
})
