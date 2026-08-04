import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  resolveLaraLookKey,
  getLaraAvatarFromState,
  buildLaraAppearance,
  LARA_LOOKS,
} from './lara-appearance'

describe('resolveLaraLookKey', () => {
  it('defaults to classic without state', () => {
    assert.equal(resolveLaraLookKey(null), 'classic')
  })

  it('dark lara wins', () => {
    assert.equal(resolveLaraLookKey({ isDarkLara: true, isPregnant: true, desire: 90 }), 'dark')
  })

  it('pregnant when not dark', () => {
    assert.equal(resolveLaraLookKey({ isPregnant: true, clothing: 'клапті' }), 'pregnant')
  })

  it('aroused at high desire', () => {
    assert.equal(resolveLaraLookKey({ desire: 80, clothing: 'шкіряний одяг', dayNumber: 5 }), 'aroused')
  })

  it('seductive at mid-high desire', () => {
    assert.equal(resolveLaraLookKey({ desire: 60, clothing: 'шкіряний одяг', dayNumber: 5 }), 'seductive')
  })

  it('intimate at mild desire', () => {
    assert.equal(resolveLaraLookKey({ desire: 40, clothing: 'шкіряний одяг', dayNumber: 8 }), 'intimate')
  })

  it('tribal from clothing', () => {
    assert.equal(resolveLaraLookKey({ clothing: ' племінний одяг', desire: 10 }), 'tribal')
  })

  it('exhausted from hunger beats mild desire', () => {
    assert.equal(
      resolveLaraLookKey({ hunger: 80, thirst: 20, clothing: 'шкіряний одяг', dayNumber: 5, desire: 20 }),
      'exhausted'
    )
  })

  it('default early beach survivor', () => {
    assert.equal(resolveLaraLookKey({ dayNumber: 1, clothing: 'клапті одягу', desire: 0 }), 'default')
  })
})

describe('getLaraAvatarFromState', () => {
  it('returns erotic path for high desire', () => {
    const p = getLaraAvatarFromState({ desire: 85, dayNumber: 5, clothing: 'шкіряний одяг' })
    assert.equal(p, LARA_LOOKS.aroused.avatar)
  })

  it('dark uses seductive dark asset', () => {
    assert.equal(getLaraAvatarFromState({ isDarkLara: true }), LARA_LOOKS.dark.avatar)
    assert.match(LARA_LOOKS.dark.avatar, /dark_seductive|dark/)
  })
})

describe('buildLaraAppearance', () => {
  it('includes body capacity and erotic looks in gallery', () => {
    const a = buildLaraAppearance({ clothing: 'клапті одягу', dayNumber: 1, desire: 50 }, [])
    assert.ok(a.bodySummary.some((s) => s.includes('Вагіна')))
    assert.ok(a.unlockedLooks.some((l) => l.key === 'seductive' || l.key === 'aroused'))
  })
})
