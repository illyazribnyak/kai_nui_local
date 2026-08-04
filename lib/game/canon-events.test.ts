import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CANON_EVENTS,
  SIDE_QUESTS,
  TRIBE_ENTRIES,
  formatCanonEventsForPrompt,
  formatSideQuestsForPrompt,
  formatTribeEntriesForPrompt,
  formatZekArcForPrompt,
  getCanonEvent,
  getTribeEntryForLocation,
} from './canon-events'
import { QUEST_LADDER } from './quest-ladder-data'

describe('CANON_EVENTS', () => {
  it('has unique keys', () => {
    const keys = CANON_EVENTS.map((e) => e.key)
    assert.equal(keys.length, new Set(keys).size)
  })

  it('includes all ending keys', () => {
    for (const k of [
      'ending_freedom',
      'ending_priestess',
      'ending_goddess',
      'ending_destroyer',
      'ending_dark_queen',
    ]) {
      assert.ok(getCanonEvent(k), `missing ${k}`)
    }
  })

  it('includes Jack chain facts', () => {
    for (const k of [
      'met_jack',
      'jack_found_alive',
      'jack_wreck_clue',
      'jack_offers_guide',
      'jack_map_shared',
      'jack_ruins_explored',
      'jack_leya_confrontation',
      'jack_temple_hint',
      'jack_loyalty_ally',
      'jack_loyalty_rival',
    ]) {
      assert.ok(getCanonEvent(k), `missing jack fact ${k}`)
    }
  })

  it('includes tribe entry facts', () => {
    for (const k of [
      'entered_village',
      'entered_centaur_lands',
      'entered_minotaur_labyrinth',
      'entered_hyena_territory',
      'entered_boar_swamps',
    ]) {
      assert.ok(getCanonEvent(k), `missing tribe entry ${k}`)
    }
  })

  it('includes Zek renegade arc facts', () => {
    for (const k of [
      'met_zek',
      'zek_escape_clue',
      'zek_escape_story',
      'zek_death_scent',
      'zek_sheltered',
      'zek_hunters',
      'zek_mark_cleansed',
      'zek_guide',
      'zek_protected',
      'zek_betrayed',
      'zek_kira_confront',
      'zek_free_exile',
      'zek_companion',
      'zek_returned',
      'zek_dead',
    ]) {
      assert.ok(getCanonEvent(k), `missing zek fact ${k}`)
    }
  })

  it('ladder factKeys are known canon events (or intentional extras)', () => {
    const known = new Set(CANON_EVENTS.map((e) => e.key))
    for (const step of QUEST_LADDER) {
      for (const k of step.completeWhen.factKeys ?? []) {
        assert.ok(known.has(k), `ladder step «${step.title}» uses unknown fact ${k}`)
      }
    }
  })
})

describe('TRIBE_ENTRIES', () => {
  it('covers five peoples', () => {
    assert.equal(TRIBE_ENTRIES.length, 5)
    const names = TRIBE_ENTRIES.map((t) => t.tribe)
    assert.ok(names.includes('Кай-Тору'))
    assert.ok(names.includes('Кентаври'))
    assert.ok(names.includes('Мінотаври'))
    assert.ok(names.includes('Гієноїди'))
    assert.ok(names.includes('Свинолюди'))
  })

  it('resolves location to tribe entry', () => {
    assert.equal(getTribeEntryForLocation('Землі кентаврів')?.tribe, 'Кентаври')
    assert.equal(getTribeEntryForLocation('Болота свинолюдів')?.tribe, 'Свинолюди')
    assert.equal(getTribeEntryForLocation('Селище Кай-Тору')?.tribe, 'Кай-Тору')
  })

  it('each entry has matching side quest title', () => {
    const titles = new Set(SIDE_QUESTS.map((q) => q.title))
    for (const t of TRIBE_ENTRIES) {
      assert.ok(titles.has(t.entryQuestTitle), `missing quest ${t.entryQuestTitle}`)
    }
  })
})

describe('SIDE_QUESTS', () => {
  it('has unique titles', () => {
    const titles = SIDE_QUESTS.map((q) => q.title)
    assert.equal(titles.length, new Set(titles).size)
  })

  it('does not collide with main ladder titles', () => {
    const ladder = new Set(QUEST_LADDER.map((q) => q.title))
    for (const q of SIDE_QUESTS) {
      assert.ok(!ladder.has(q.title), `side quest collides: ${q.title}`)
    }
  })

  it('has full Jack chain', () => {
    const jack = SIDE_QUESTS.filter((q) => q.chain === 'jack')
    assert.ok(jack.length >= 7)
    assert.ok(jack.some((q) => q.title === 'Знайти провідника'))
    assert.ok(jack.some((q) => q.title === 'Угода з Джеком'))
    assert.ok(jack.some((q) => q.title === 'Союзник чи конкурент'))
  })

  it('has full Zek renegade chain', () => {
    const zek = SIDE_QUESTS.filter((q) => q.chain === 'zek')
    assert.ok(zek.length >= 8)
    assert.ok(zek.some((q) => q.title === 'Сліди відступника'))
    assert.ok(zek.some((q) => q.title === 'Таємниця втечі'))
    assert.ok(zek.some((q) => q.title === 'Зняти мітку смерті'))
    assert.ok(zek.some((q) => q.title === 'Доля відступника'))
  })
})

describe('prompt formatters', () => {
  it('includes key event names', () => {
    const block = formatCanonEventsForPrompt()
    assert.match(block, /met_tane/)
    assert.match(block, /treasure_found/)
    assert.match(block, /ending_freedom/)
    assert.match(block, /jack_offers_guide/)
  })

  it('lists side quest hooks with Jack section', () => {
    const block = formatSideQuestsForPrompt()
    assert.match(block, /Останнє бажання шаманки/)
    assert.match(block, /Ланцюг Джека/)
    assert.match(block, /Вхід: Болота свинолюдів/)
  })

  it('describes different tribe reactions', () => {
    const block = formatTribeEntriesForPrompt()
    assert.match(block, /Кентаври/)
    assert.match(block, /Матріархат/)
    assert.match(block, /трофей/i)
    assert.match(block, /право чужинки/i)
  })

  it('describes Zek renegade arc', () => {
    const block = formatZekArcForPrompt()
    assert.match(block, /death-scent|запах смерті/i)
    assert.match(block, /відступник/i)
    assert.match(block, /zek_escape_story/)
  })

  it('lists Zek section in side quests', () => {
    const block = formatSideQuestsForPrompt()
    assert.match(block, /Арка Зека/)
    assert.match(block, /Зняти мітку смерті/)
  })
})
