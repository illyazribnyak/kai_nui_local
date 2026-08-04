import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml, formatMessageHtmlSafe } from './html'

describe('escapeHtml', () => {
  it('escapes angle brackets and ampersands', () => {
    assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;')
    assert.equal(escapeHtml('a & b'), 'a &amp; b')
    assert.equal(escapeHtml('"x"'), '&quot;x&quot;')
  })
})

describe('formatMessageHtmlSafe', () => {
  it('escapes HTML then applies bold', () => {
    const out = formatMessageHtmlSafe('**hi** <b>x</b>')
    assert.ok(out.includes('<strong>hi</strong>'))
    assert.ok(out.includes('&lt;b&gt;x&lt;/b&gt;'))
    assert.ok(!out.includes('<b>x</b>'))
  })

  it('converts newlines', () => {
    assert.equal(formatMessageHtmlSafe('a\nb'), 'a<br/>b')
  })
})
