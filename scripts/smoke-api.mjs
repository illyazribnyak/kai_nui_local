/**
 * End-to-end API smoke (no AI key required for most checks).
 * Usage: node scripts/smoke-api.mjs [baseUrl]
 */
const BASE = process.argv[2] || 'http://localhost:3001'

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    /* not json */
  }
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 200) }
}

const results = []
function check(name, pass, detail = '') {
  results.push({ name, pass, detail })
  console.log(`${pass ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
}

async function main() {
  console.log(`Smoke against ${BASE}\n`)

  // Health
  {
    const r = await req('/api/health')
    check('health responds', r.status === 200 || r.status === 503, `status=${r.status}`)
    check('health has database field', typeof r.json?.database === 'boolean', String(r.json?.database))
    check('health has deepseekKey field', typeof r.json?.deepseekKey === 'boolean')
  }

  // Game state
  let state
  {
    const r = await req('/api/game-state')
    check('game-state 200', r.status === 200, r.text)
    state = r.json
    check('game-state has gameState', !!state?.gameState)
    check('game-state has locations', (state?.locations?.length ?? 0) > 0, `n=${state?.locations?.length}`)
    check('game-state has quests', (state?.quests?.length ?? 0) > 0, `n=${state?.quests?.length}`)
    check('game-state has skills', (state?.skills?.length ?? 0) > 0, `n=${state?.skills?.length}`)
    check('game-state has worldFacts', (state?.worldFacts?.length ?? 0) > 0, `n=${state?.worldFacts?.length}`)
    check('game-state has relationships (canon)', (state?.relationships?.length ?? 0) >= 1, `n=${state?.relationships?.length}`)
  }

  // Save / load slots
  {
    const save = await req('/api/save-game', {
      method: 'POST',
      body: JSON.stringify({ slotNumber: 5, name: 'smoke-test' }),
    })
    check('save-game slot 5', save.status === 200 && save.json?.success, save.text)

    const list = await req('/api/save-game')
    check('list save slots', list.status === 200 && Array.isArray(list.json?.slots), `n=${list.json?.slots?.length}`)
    const has5 = list.json?.slots?.some((s) => s.slotNumber === 5)
    check('slot 5 listed', has5)

    const load = await req('/api/load-game', {
      method: 'POST',
      body: JSON.stringify({ slotNumber: 5 }),
    })
    check('load-game slot 5', load.status === 200 && load.json?.success, load.text)
  }

  // Export / import
  {
    const exp = await req('/api/export-game')
    check('export-game 200', exp.status === 200 && exp.json?.version, `ver=${exp.json?.version}`)
    const imp = await req('/api/import-game', {
      method: 'POST',
      body: JSON.stringify(exp.json),
    })
    check('import-game 200', imp.status === 200 && imp.json?.success, imp.text)
  }

  // Redo without snapshot may 404 — after a turn would work
  {
    const r = await req('/api/redo-turn', { method: 'POST' })
    check(
      'redo-turn responds (404 or 200)',
      r.status === 200 || r.status === 404,
      `status=${r.status}`
    )
  }

  // Chat without valid key
  {
    const r = await req('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Оглянутись' }),
    })
    if (r.status === 503 && r.json?.code === 'MISSING_API_KEY') {
      check('chat blocks without API key', true, 'MISSING_API_KEY')
    } else if (r.status === 200) {
      check('chat streams with API key', true, 'has key')
    } else if (r.status === 429) {
      check('chat rate limited', true, 'RATE_LIMIT')
    } else {
      check('chat expected 503/200/429', false, `status=${r.status} ${r.text}`)
    }
  }

  // Chat validation
  {
    const empty = await req('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: '' }),
    })
    check('chat rejects empty message', empty.status === 400, `status=${empty.status}`)

    const long = 'x'.repeat(3000)
    const tooLong = await req('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: long }),
    })
    check('chat rejects long message', tooLong.status === 400, `status=${tooLong.status}`)
  }

  // Server combat (no LLM)
  {
    const start = await req('/api/combat', {
      method: 'POST',
      body: JSON.stringify({ action: 'start', enemyId: 'generic_beast', seed: 42 }),
    })
    check('combat start 200', start.status === 200 && start.json?.success, start.text)
    check('combat has enemy HP', (start.json?.combat?.enemyHp ?? 0) > 0)

    const turn = await req('/api/combat', {
      method: 'POST',
      body: JSON.stringify({ action: 'turn', actionType: 'unarmed' }),
    })
    check('combat turn 200', turn.status === 200 && turn.json?.success, turn.text)
    check('combat turn has roll', (turn.json?.result?.roll ?? 0) >= 1)

    const end = await req('/api/combat', {
      method: 'POST',
      body: JSON.stringify({ action: 'end' }),
    })
    check('combat end 200', end.status === 200 && end.json?.success, end.text)
  }

  // Server craft (expect missing ingredients without items)
  {
    const craft = await req('/api/craft', {
      method: 'POST',
      body: JSON.stringify({ action: 'craft', recipeId: 'not-a-real-recipe' }),
    })
    check(
      'craft unknown recipe 4xx',
      craft.status === 404 || craft.status === 400,
      `status=${craft.status}`
    )
  }

  // Reset + re-seed path
  {
    const r = await req('/api/reset-game', {
      method: 'POST',
      body: JSON.stringify({ buildId: 'balanced' }),
    })
    check('reset-game 200', r.status === 200 && r.json?.success, r.text)
    check('reset returns build', !!r.json?.build?.id, String(r.json?.build?.id))
    const gs = await req('/api/game-state')
    check('after reset day=1', gs.json?.gameState?.dayNumber === 1, `day=${gs.json?.gameState?.dayNumber}`)
    check('after reset has quests', (gs.json?.quests?.length ?? 0) > 0)
    check('after reset has skills', (gs.json?.skills?.length ?? 0) > 0)
    const activeQuests = (gs.json?.quests || []).filter((q) => q.status === 'active')
    const lockedQuests = (gs.json?.quests || []).filter((q) => q.status === 'locked')
    check(
      'quest ladder has one active',
      activeQuests.length === 1,
      `active=${activeQuests.length}`
    )
    check(
      'quest ladder has locked steps',
      lockedQuests.length >= 1,
      `locked=${lockedQuests.length}`
    )
    check(
      'first active is survival quest',
      activeQuests[0]?.title === 'Вижити на березі' || activeQuests.length === 0,
      `title=${activeQuests[0]?.title}`
    )
  }

  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} passed`)
  if (failed.length) {
    console.log('Failed:')
    for (const f of failed) console.log(' -', f.name, f.detail)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
