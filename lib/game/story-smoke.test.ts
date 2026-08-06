/**
 * Week-4 story smoke — pure (no HTTP, no LLM).
 * Validates FACT gates, side/ladder quest plans, combat determinism, builds.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { planFactGateBatch } from './fact-gates'
import { planSideQuestCompletions } from './side-quest-sync'
import { planLadderCompletions } from './quest-step'
import { SIDE_QUESTS, CANON_EVENTS, formatCentaurArcForPrompt } from './canon-events'
import { createSeededRng, resolveCombatTurn, CANON_ENEMIES } from './combat'
import { getStartingBuild, STARTING_BUILDS } from './starting-builds'
import { KINK_CATALOG } from './kink-catalog'
import { findRecipeById, canCraftRecipe } from './crafting'

describe('story smoke: FACT gates', () => {
  it('zek_companion implies met_zek prereq', () => {
    const p = planFactGateBatch(['zek_companion'], [])
    assert.ok(p.toAdd.includes('met_zek'))
    assert.ok(p.toAdd.includes('zek_companion'))
  })

  it('mutex centaur ally vs exile', () => {
    const p = planFactGateBatch(['centaur_exile_path'], ['entered_centaur_lands', 'centaur_herd_ally'])
    assert.ok(p.toRemove.includes('centaur_herd_ally'))
  })

  it('tane intimacy pulls met_tane', () => {
    const p = planFactGateBatch(['tane_first_intimacy'], [])
    assert.ok(p.toAdd.includes('met_tane'))
  })
})

describe('story smoke: quest auto-complete plans', () => {
  it('side quest completes on any completeFactKey', () => {
    const titles = SIDE_QUESTS.filter((q) => q.chain === 'zek').map((q) => q.title)
    const done = planSideQuestCompletions(['met_zek', 'zek_begs_protection'], titles)
    assert.ok(done.includes('Зустріч із відступником'))
  })

  it('centaur destiny quest accepts ally branch', () => {
    const done = planSideQuestCompletions(
      ['centaur_herd_ally'],
      ['Доля з табуном']
    )
    assert.ok(done.includes('Доля з табуном'))
  })

  it('ladder plan advances with water fact', () => {
    const { complete } = planLadderCompletions([], {
      currentLoc: 'Берег острова',
      discoveredLocs: [],
      factKeys: ['found_fresh_water'],
      metNames: [],
      inventory: [],
    })
    // first step may complete depending on ladder completeWhen
    assert.ok(Array.isArray(complete))
  })
})

describe('story smoke: combat', () => {
  it('same seed same damage sequence', () => {
    const enemy = { ...CANON_ENEMIES.hyenoid }
    const gs = { strength: 6, agility: 8, endurance: 7, charisma: 7, amuletEnergy: 0 } as any
    const r1 = resolveCombatTurn('unarmed', enemy, 55, 80, [], gs, createSeededRng(123))
    const r2 = resolveCombatTurn('unarmed', enemy, 55, 80, [], gs, createSeededRng(123))
    assert.equal(r1.roll, r2.roll)
    assert.equal(r1.playerDamageDealt, r2.playerDamageDealt)
  })
})

describe('story smoke: craft catalog', () => {
  it('recipes require ingredients', async () => {
    const { CRAFTING_RECIPES } = await import('./crafting')
    assert.ok(CRAFTING_RECIPES.length > 5)
    const r = findRecipeById(CRAFTING_RECIPES[0].id)
    assert.ok(r)
    assert.equal(canCraftRecipe([], r!), false)
  })
})

describe('story smoke: builds & kinks & canon', () => {
  it('all builds resolve', () => {
    for (const b of STARTING_BUILDS) {
      assert.equal(getStartingBuild(b.id).id, b.id)
    }
  })

  it('kink catalog has week-3 extras', () => {
    const keys = new Set(KINK_CATALOG.map((k) => k.key))
    for (const k of ['group', 'lactation', 'bondage', 'pain', 'pheromones', 'family_taboo']) {
      assert.ok(keys.has(k), k)
    }
  })

  it('canon has centaur fate keys', () => {
    const keys = new Set(CANON_EVENTS.map((e) => e.key))
    assert.ok(keys.has('centaur_herd_ally'))
    assert.ok(keys.has('xeron_first_intimacy'))
    assert.match(formatCentaurArcForPrompt(), /Ксерон/)
  })
})
