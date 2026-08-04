import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { convertMessagesToGemini, estimateTokens } from './client'

describe('convertMessagesToGemini', () => {
  it('converts system prompt and user/assistant messages correctly', () => {
    const messages = [
      { role: 'system', content: 'You are the game master.' },
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: 'Welcome to the island.' },
      { role: 'user', content: 'Look around.' },
    ]

    const result = convertMessagesToGemini(messages)

    assert.equal(result.systemInstruction?.parts[0].text, 'You are the game master.')
    assert.equal(result.contents.length, 3)
    assert.equal(result.contents[0].role, 'user')
    assert.equal(result.contents[0].parts[0].text, 'Hello!')
    assert.equal(result.contents[1].role, 'model')
    assert.equal(result.contents[1].parts[0].text, 'Welcome to the island.')
    assert.equal(result.contents[2].role, 'user')
    assert.equal(result.contents[2].parts[0].text, 'Look around.')
  })

  it('ensures Gemini contents array starts with user role', () => {
    const messages = [
      { role: 'system', content: 'System prompt' },
      { role: 'assistant', content: 'Assistant starts first' },
    ]

    const result = convertMessagesToGemini(messages)
    assert.equal(result.contents[0].role, 'user')
  })
})

describe('estimateTokens', () => {
  it('estimates token count proportional to text length', () => {
    assert.equal(estimateTokens(''), 0)
    assert.ok(estimateTokens('Hello world, this is a test text') > 5)
  })
})
