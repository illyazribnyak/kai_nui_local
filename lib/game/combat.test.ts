import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  CANON_ENEMIES,
  createSeededRng,
  getPlayerCombatArsenal,
  resolveCombatTurn,
} from './combat'

describe('createSeededRng', () => {
  it('is deterministic', () => {
    const a = createSeededRng(42)
    const b = createSeededRng(42)
    const seqA = [a(), a(), a()]
    const seqB = [b(), b(), b()]
    assert.deepEqual(seqA, seqB)
  })
})

describe('resolveCombatTurn', () => {
  const enemy = { ...CANON_ENEMIES.generic_beast }
  const gs = {
    id: 'singleton',
    strength: 6,
    agility: 8,
    endurance: 7,
    charisma: 7,
    willpower: 5,
    desire: 0,
    amuletEnergy: 20,
  } as any

  it('deals damage and can finish with fixed rng', () => {
    // rng always ~0.99 → roll 20 crit
    const rng = () => 0.99
    const r = resolveCombatTurn('unarmed', enemy, enemy.hp, 80, [], gs, rng)
    assert.equal(r.roll, 20)
    assert.equal(r.isCrit, true)
    assert.ok(r.playerDamageDealt > 0)
  })

  it('amulet blast applies stun and damage', () => {
    const r = resolveCombatTurn('amulet_blast', enemy, 40, 80, [], gs, () => 0.5)
    assert.ok(r.playerDamageDealt > 0)
    assert.equal(r.statusApplied, 'stunned')
    assert.equal(r.enemyDamageDealt, 0)
  })

  it('block reduces enemy damage', () => {
    const open = resolveCombatTurn('unarmed', enemy, 40, 80, [], gs, () => 0.5)
    const blocked = resolveCombatTurn('block', enemy, 40, 80, [], gs, () => 0.5)
    // enemy still alive both cases; block should deal less or equal enemy dmg to player when enemy hits
    if (open.enemyHpRemaining > 0 && blocked.enemyHpRemaining > 0) {
      assert.ok(blocked.enemyDamageDealt <= open.enemyDamageDealt)
    }
  })
})

describe('getPlayerCombatArsenal', () => {
  it('adds spear when in inventory', () => {
    const a = getPlayerCombatArsenal(
      [{ name: 'Спис', quantity: 1, category: 'зброя', description: '' } as any],
      null
    )
    assert.ok(a.hasSpear)
    assert.ok(a.availableActions.some((x) => x.id === 'spear_attack'))
  })
})
