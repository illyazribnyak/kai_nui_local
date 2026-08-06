import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseDeepSeekTags, cleanDisplayContent, mergeUpdates } from './parse-tags'

describe('parseDeepSeekTags', () => {
  it('parses STAT and FACT', () => {
    const raw =
      'Текст [STAT_UPDATE]{"desire":40,"location":"Джунглі"}[/STAT_UPDATE] ' +
      '[FACT_ADD]{"key":"met_tane","category":"npc","content":"зустрів"}[/FACT_ADD] кінець'
    const p = parseDeepSeekTags(raw)
    assert.equal(p.stat.desire, 40)
    assert.equal(p.facts.length, 1)
    assert.equal(p.facts[0].key, 'met_tane')
  })

  it('parses choices', () => {
    const raw = '[CHOICES]{"options":["А","Б"]}[/CHOICES]'
    const p = parseDeepSeekTags(raw)
    assert.deepEqual(p.choices, ['А', 'Б'])
  })
})

describe('cleanDisplayContent', () => {
  it('strips tags', () => {
    const raw = 'Привіт [FACT_ADD]{"key":"x"}[/FACT_ADD] світе'
    const cleaned = cleanDisplayContent(raw).replace(/\s+/g, ' ').trim()
    assert.equal(cleaned, 'Привіт світе')
    assert.ok(!cleaned.includes('FACT_ADD'))
  })
})

describe('mergeUpdates', () => {
  it('prefers deepseek over gemini for same inv name', () => {
    const ds = {
      stat: { desire: 10 },
      inv: [{ name: 'Спис', quantity: 1 }],
      rel: [],
      quest: [],
      diary: [],
      skill: [],
      tribe: [],
      achievement: [],
      disease: [],
      facts: [],
      choices: [],
      diceRolls: [],
      sexScene: null,
      phase: null,
      pleasure: null,
      stamina: null,
      combo: null,
      domination: null,
      reactions: [],
      erogenousZones: [],
      sexChoices: [],
      sceneSummary: null,
      sceneMood: null,
      laraDialogue: [],
      multiOrgasm: null,
      penisStats: null,
    }
    const gem = {
      statUpdates: { desire: 5 },
      invUpdates: [{ name: 'Спис', quantity: 9 }],
      relUpdates: [],
      questUpdates: [],
      diaryUpdates: [],
      skillUpdates: [],
      tribeUpdates: [],
      achievementUpdates: [],
    }
    const m = mergeUpdates(ds as any, gem as any)
    assert.equal(m.stat.desire, 10)
    assert.equal(m.inv.length, 1)
    assert.equal(m.inv[0].quantity, 1)
  })
})
