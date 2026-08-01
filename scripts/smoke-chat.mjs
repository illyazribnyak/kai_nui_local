/**
 * Live chat smoke: one turn + game-state after.
 * Usage: node scripts/smoke-chat.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3001'

async function main() {
  console.log('Health…')
  const h = await fetch(`${BASE}/api/health`).then((r) => r.json())
  console.log('  database=', h.database, 'deepseekKey=', h.deepseekKey, 'ok=', h.ok)
  if (!h.deepseekKey) {
    console.error('FAIL: deepseekKey false — restart server after setting .env')
    process.exit(1)
  }

  console.log('Reset…')
  const reset = await fetch(`${BASE}/api/reset-game`, { method: 'POST' })
  console.log('  reset', reset.status)

  console.log('Chat turn: Оглянутися навколо…')
  const t0 = Date.now()
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Оглянутися навколо на березі' }),
  })
  if (!res.ok) {
    const t = await res.text()
    console.error('FAIL chat', res.status, t.slice(0, 400))
    process.exit(1)
  }

  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  let chunks = 0
  let done = null
  let partial = ''

  while (true) {
    const { done: d, value } = await reader.read()
    if (d) break
    partial += dec.decode(value, { stream: true })
    const lines = partial.split('\n')
    partial = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const msg = JSON.parse(line.slice(6))
        if (msg.type === 'chunk') {
          chunks++
          buf += msg.content || ''
        } else if (msg.type === 'done') {
          done = msg
        } else if (msg.type === 'error') {
          console.error('STREAM ERROR', msg.message)
          process.exit(1)
        }
      } catch {
        /* ignore */
      }
    }
  }

  const ms = Date.now() - t0
  console.log(`  stream ok in ${ms}ms, chunks=${chunks}, textLen=${buf.length}`)
  console.log('  preview:', buf.replace(/\s+/g, ' ').slice(0, 220))

  if (!done) {
    console.error('FAIL: no done event')
    process.exit(1)
  }

  console.log('  promptMode=', done.promptMode)
  console.log('  choices=', (done.choices || []).slice(0, 4))
  console.log('  tagLog=', JSON.stringify(done.tagLog?.counts || {}))
  console.log('  hunger=', done.gameState?.hunger, 'thirst=', done.gameState?.thirst)
  console.log('  turnCount=', done.gameState?.turnCount, 'timeOfDay=', done.gameState?.timeOfDay)
  console.log('  location=', done.gameState?.location)
  console.log('  completedQuests=', done.completedQuests)

  // Redo turn
  console.log('Redo turn…')
  const redo = await fetch(`${BASE}/api/redo-turn`, { method: 'POST' })
  const redoJ = await redo.json()
  console.log('  redo', redo.status, redoJ.userMessage ? 'has message' : redoJ.error)

  // Save
  console.log('Save slot 1…')
  const save = await fetch(`${BASE}/api/save-game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotNumber: 1, name: 'after-chat-smoke' }),
  })
  console.log('  save', save.status, (await save.json()).success)

  console.log('\nALL CHAT SMOKE PASSED')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
