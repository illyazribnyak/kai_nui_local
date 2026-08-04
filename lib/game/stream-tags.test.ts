import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { collectCompleteTags, safeParseJSON, stripAllTags } from './stream-tags'

describe('stream-tags', () => {
  it('stripAllTags removes complete tags', () => {
    const raw = 'Текст [STAT_UPDATE]{"desire":1}[/STAT_UPDATE] кінець'
    const cleaned = stripAllTags(raw)
    assert.ok(!cleaned.includes('STAT_UPDATE'))
    assert.ok(cleaned.includes('Текст'))
    assert.ok(cleaned.includes('кінець'))
  })

  it('stripAllTags removes incomplete trailing tags', () => {
    const raw = 'Опис [INV_UPDATE]{"name":"Палиця"'
    assert.equal(stripAllTags(raw), 'Опис')
  })

  it('collectCompleteTags finds typed payloads', () => {
    const raw = `
      [STAT_UPDATE]{"desire":20}[/STAT_UPDATE]
      [INV_UPDATE]{"action":"add","name":"Ліана"}[/INV_UPDATE]
    `
    const tags = collectCompleteTags(raw)
    assert.equal(tags.length, 2)
    assert.equal(tags[0].type, 'stat')
    assert.deepEqual(safeParseJSON(tags[0].json), { desire: 20 })
    assert.equal(tags[1].type, 'inv')
  })
})
