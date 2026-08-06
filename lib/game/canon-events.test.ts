import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CANON_EVENTS,
  SIDE_QUESTS,
  TRIBE_ENTRIES,
  formatCanonEventsForPrompt,
  formatSideQuestsForPrompt,
  formatCentaurArcForPrompt,
  formatTaneLeyaArcForPrompt,
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
      'zek_begs_protection',
      'zek_escape_story',
      'zek_death_scent',
      'zek_sheltered',
      'zek_kai_toru_hostility',
      'zek_first_intimacy',
      'zek_knot_bond',
      'zek_saves_lara',
      'zek_hunters',
      'zek_scent_masked',
      'zek_naya_aid',
      'zek_mark_cleansed',
      'zek_guide',
      'zek_pack_secret',
      'zek_protected',
      'zek_betrayed',
      'kira_demands_zek',
      'kira_trade_for_zek',
      'zek_kira_confront',
      'zek_loyal_oath',
      'zek_jealousy',
      'zek_free_exile',
      'zek_companion',
      'zek_returned',
      'zek_dead',
      'hyena_raid_kai_toru',
    ]) {
      assert.ok(getCanonEvent(k), `missing zek fact ${k}`)
    }
  })

  it('includes Tane–Leya–Makai family arc facts', () => {
    for (const k of [
      'tane_guides_lara',
      'tane_first_hunt',
      'tane_first_intimacy',
      'tane_sacred_waterfall',
      'tane_presents_lara_to_father',
      'tane_leya_siblings',
      'tane_leya_secret_lovers',
      'caught_tane_leya_intimate',
      'leya_past_with_jack',
      'tane_leya_confrontation',
      'leya_threatens_lara',
      'tane_torn_choice',
      'tane_leya_reconciliation',
      'leya_accepts_lara',
      'leya_lara_first_intimacy',
      'tane_leya_triad_ritual',
      'tane_leya_father_clue',
      'makai_blood_custom_hint',
      'tane_leya_father_journal',
      'makai_claims_lara',
      'makai_sex_with_lara',
      'tane_witnesses_makai_lara',
      'tane_defies_makai',
      'makai_blesses_lara',
      'makai_rejects_lara',
      'family_hearth_accepted',
      'tane_chooses_lara_public',
      'blood_custom_broken',
      'blood_custom_continued',
      'soul_bound_tane',
    ]) {
      assert.ok(getCanonEvent(k), `missing tane_family fact ${k}`)
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
    const ladder = new Set(QUEST_LADDER.map((q) => q.title) as string[])
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
    assert.ok(zek.length >= 12)
    assert.ok(zek.some((q) => q.title === 'Сліди відступника'))
    assert.ok(zek.some((q) => q.title === 'Ціна тіла'))
    assert.ok(zek.some((q) => q.title === 'Таємниця втечі'))
    assert.ok(zek.some((q) => q.title === 'Маска запаху'))
    assert.ok(zek.some((q) => q.title === 'Зняти мітку смерті'))
    assert.ok(zek.some((q) => q.title === 'Ультиматум Кіри'))
    assert.ok(zek.some((q) => q.title === 'Клятва вигнанця'))
    assert.ok(zek.some((q) => q.title === 'Доля відступника'))
    const known = new Set(CANON_EVENTS.map((e) => e.key))
    for (const q of zek) {
      for (const k of q.completeFactKeys ?? []) {
        assert.ok(known.has(k), `zek quest «${q.title}» unknown fact ${k}`)
      }
    }
  })

  it('has full centaur chain', () => {
    const c = SIDE_QUESTS.filter((q) => q.chain === 'centaur')
    assert.ok(c.length >= 6)
    assert.ok(c.some((q) => q.title === 'Випробування швидкості'))
    assert.ok(c.some((q) => q.title === 'Доля з табуном'))
    const known = new Set(CANON_EVENTS.map((e) => e.key))
    for (const q of c) {
      for (const k of q.completeFactKeys ?? []) {
        assert.ok(known.has(k), `centaur quest «${q.title}» unknown fact ${k}`)
      }
    }
  })

  it('has full Tane family chain', () => {
    const fam = SIDE_QUESTS.filter((q) => q.chain === 'tane_family')
    assert.ok(fam.length >= 12)
    assert.ok(fam.some((q) => q.title === 'Піти з Тане до селища'))
    assert.ok(fam.some((q) => q.title === 'Перед батьком'))
    assert.ok(fam.some((q) => q.title === 'Право батька'))
    assert.ok(fam.some((q) => q.title === 'Таємниця брата й сестри'))
    assert.ok(fam.some((q) => q.title === 'Спадок крові'))
    assert.ok(fam.some((q) => q.title === 'Син проти батька'))
    assert.ok(fam.some((q) => q.title === 'Вогнище роду'))
    const known = new Set(CANON_EVENTS.map((e) => e.key))
    for (const q of fam) {
      for (const k of q.completeFactKeys ?? []) {
        assert.ok(known.has(k), `tane_family quest «${q.title}» unknown fact ${k}`)
      }
    }
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
    assert.match(block, /відступник|втікач/i)
    assert.match(block, /zek_escape_story/)
    assert.match(block, /zek_first_intimacy/)
    assert.match(block, /kira_demands_zek/)
    assert.match(block, /Ультиматум Кіри/)
    assert.match(block, /zek_companion/)
  })

  it('lists Zek section in side quests', () => {
    const block = formatSideQuestsForPrompt()
    assert.match(block, /Арка Зека/)
    assert.match(block, /Зняти мітку смерті/)
  })

  it('describes Tane–Leya–Makai family arc', () => {
    const block = formatTaneLeyaArcForPrompt()
    assert.match(block, /брат і сестра|БРАТ І СЕСТРА/i)
    assert.match(block, /Макаї/)
    assert.match(block, /звичай крові|ложе крові/i)
    assert.match(block, /makai_claims_lara/)
    assert.match(block, /tane_leya_secret_lovers/)
    assert.match(block, /family_hearth_accepted/)
    assert.match(block, /Перед батьком/)
    assert.match(block, /Вогнище роду/)
  })

  it('lists Tane family section in side quests', () => {
    const block = formatSideQuestsForPrompt()
    assert.match(block, /Арка роду/)
    assert.match(block, /Таємниця брата й сестри/)
    assert.match(block, /Право батька/)
  })

  it('describes centaur arc', () => {
    const block = formatCentaurArcForPrompt()
    assert.match(block, /Ксерон/)
    assert.match(block, /Іпполіта/)
    assert.match(block, /centaur_trial_won/)
    assert.match(block, /centaur_herd_ally/)
  })
})
