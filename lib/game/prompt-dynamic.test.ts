import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  shouldIncludeZekArc,
  shouldIncludeTaneFamilyArc,
  shouldIncludeJackChain,
  shouldIncludeCentaurArc,
  formatActiveStoryBrief,
  formatDynamicLoreBlocks,
} from './prompt-dynamic'

describe('prompt-dynamic gates', () => {
  it('zek off by default on beach', () => {
    assert.equal(
      shouldIncludeZekArc({ factKeys: ['shipwrecked'], location: 'Берег острова' }),
      false
    )
  })

  it('zek on after met_zek or hyena location', () => {
    assert.equal(shouldIncludeZekArc({ factKeys: ['met_zek'], location: 'Джунглі' }), true)
    assert.equal(
      shouldIncludeZekArc({ factKeys: [], location: 'Територія гієноїдів' }),
      true
    )
  })

  it('tane on village or met_tane', () => {
    assert.equal(
      shouldIncludeTaneFamilyArc({ factKeys: ['met_tane'], location: 'Джунглі' }),
      true
    )
    assert.equal(
      shouldIncludeTaneFamilyArc({ factKeys: [], location: 'Селище Кай-Тору' }),
      true
    )
  })

  it('jack on jack facts', () => {
    assert.equal(shouldIncludeJackChain({ factKeys: ['met_jack'] }), true)
    assert.equal(shouldIncludeJackChain({ factKeys: [] }), false)
  })

  it('centaur on lands or met_xeron', () => {
    assert.equal(
      shouldIncludeCentaurArc({ factKeys: [], location: 'Землі кентаврів' }),
      true
    )
    assert.equal(shouldIncludeCentaurArc({ factKeys: ['met_xeron'] }), true)
    assert.equal(
      shouldIncludeCentaurArc({ factKeys: ['shipwrecked'], location: 'Берег' }),
      false
    )
  })
})

describe('formatActiveStoryBrief', () => {
  it('prioritizes plot over starter hooks', () => {
    const block = formatActiveStoryBrief(
      [
        { key: 'shipwrecked', category: 'plot', content: 'аварія' },
        { key: 'met_tane', category: 'npc', content: 'зустрів Тане' },
        { key: 'zek_escape_clue', category: 'plot', content: 'сліди' },
      ],
      5
    )
    assert.match(block, /met_tane/)
    assert.match(block, /АКТИВНИЙ СЮЖЕТ/)
  })
})

describe('formatDynamicLoreBlocks', () => {
  it('uses short zek stub without zek facts', () => {
    const block = formatDynamicLoreBlocks({
      factKeys: ['shipwrecked'],
      location: 'Берег острова',
    })
    assert.match(block, /АРКА ЗЕКА \(стисло\)/)
    // Full fate ladder only in full Zek brief
    assert.doesNotMatch(block, /zek_free_exile \| zek_companion/)
    assert.doesNotMatch(block, /## Арка Зека/)
  })

  it('includes full zek brief when relevant', () => {
    const block = formatDynamicLoreBlocks({
      factKeys: ['met_zek', 'zek_death_scent'],
      location: 'Джунглі',
    })
    assert.match(block, /death-scent|запах смерті/i)
    assert.match(block, /zek_companion/)
    assert.match(block, /## Арка Зека/)
  })
})
