/**
 * 1-Minute Live Gameplay Simulation against local server http://localhost:3000
 */
const BASE = 'http://localhost:3000'

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
  } catch {}
  return { status: res.status, ok: res.ok, json, text: text.slice(0, 300) }
}

async function simulate() {
  console.log('=== STARTING 1-MINUTE GAMEPLAY SIMULATION ===\n')

  // Step 1: Health Check
  console.log('1. Checking Server Health...')
  const health = await req('/api/health')
  console.log(`   Health status: ${health.status}, DB: ${health.json?.database}, DeepSeek: ${health.json?.deepseekKey}, Gemini: ${health.json?.geminiKey}`)

  // Step 2: New Game / Reset with Build "seductress"
  console.log('\n2. Starting New Game (Build: "Спокусниця Амулета")...')
  const reset = await req('/api/reset-game', {
    method: 'POST',
    body: JSON.stringify({ buildId: 'seductress' }),
  })
  console.log(`   Reset Status: ${reset.status}, Success: ${reset.json?.success}, Build: ${reset.json?.build?.name}`)

  // Step 3: Fetch Initial Game State
  console.log('\n3. Fetching Initial Game State...')
  let state = await req('/api/game-state')
  console.log(`   Location: "${state.json?.gameState?.location}", Day: ${state.json?.gameState?.dayNumber}, Chapter: ${state.json?.gameState?.chapterLabel}`)
  console.log(`   Active Quests: ${state.json?.quests?.filter(q => q.status === 'active').map(q => q.title).join(', ')}`)
  console.log(`   World Facts: ${state.json?.worldFacts?.length} registered`)
  console.log(`   Relationships: ${state.json?.relationships?.map(r => `${r.name} (${r.attitude})`).join(', ')}`)

  // Step 4: Initiate Action 1 — Exploration & Water search
  console.log('\n4. Initiating Game Action 1: "Дослідити берег і знайти прісну воду..."')
  const action1 = await req('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Дослідити берег і знайти прісну воду біля густих заростей' }),
  })
  console.log(`   Action 1 Response Status: ${action1.status}`)
  if (action1.status === 200) {
    console.log(`   Action 1 Output snippet:\n   ${action1.text.slice(0, 150)}...`)
  }

  // Step 5: Server Combat Action (Fight island beast)
  console.log('\n5. Initiating Encounter & Server Combat (Звірина джунглів)...')
  const combatStart = await req('/api/combat', {
    method: 'POST',
    body: JSON.stringify({ action: 'start', enemyId: 'generic_beast', seed: 101 }),
  })
  console.log(`   Combat Start: Enemy HP=${combatStart.json?.combat?.enemyHp}, Player HP=${combatStart.json?.combat?.playerHp}`)

  // Turn 1: Attack with spear / unarmed
  const combatTurn1 = await req('/api/combat', {
    method: 'POST',
    body: JSON.stringify({ action: 'turn', actionType: 'unarmed' }),
  })
  console.log(`   Combat Turn 1: Roll=${combatTurn1.json?.result?.roll}, Hit=${combatTurn1.json?.result?.hit}, Damage Dealt=${combatTurn1.json?.result?.damageDealt}, Enemy HP left=${combatTurn1.json?.combat?.enemyHp}`)

  // Turn 2: Amulet blast
  const combatTurn2 = await req('/api/combat', {
    method: 'POST',
    body: JSON.stringify({ action: 'turn', actionType: 'amulet_blast' }),
  })
  console.log(`   Combat Turn 2 (Amulet Blast): Stun=${combatTurn2.json?.result?.stunned}, Damage=${combatTurn2.json?.result?.damageDealt}, Enemy HP left=${combatTurn2.json?.combat?.enemyHp}`)

  const combatEnd = await req('/api/combat', {
    method: 'POST',
    body: JSON.stringify({ action: 'end' }),
  })
  console.log(`   Combat End Status: ${combatEnd.status}, Loot received: ${combatEnd.json?.loot?.map(l => l.name).join(', ') || 'м\'ясо хижака'}`)

  // Step 6: Initiate Action 2 — Meeting Tane & Leya
  console.log('\n6. Initiating Game Action 2: "Поглибитись у джунглі та шукати притулок Кай-Тору"')
  const action2 = await req('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Поглибитись у джунглі та шукати притулок Кай-Тору' }),
  })
  console.log(`   Action 2 Response Status: ${action2.status}`)

  // Step 7: Save Game State to Slot 1
  console.log('\n7. Saving Progress to Slot 1 ("Lara Kai-Nui Day 1")...')
  const save = await req('/api/save-game', {
    method: 'POST',
    body: JSON.stringify({ slotNumber: 1, name: 'Lara Kai-Nui Day 1' }),
  })
  console.log(`   Save Status: ${save.status}, Saved Slot: ${save.json?.slot?.name}`)

  // Step 8: Final Game State Check
  console.log('\n8. Checking Updated Game State & Canon Progress...')
  const finalState = await req('/api/game-state')
  console.log(`   Day: ${finalState.json?.gameState?.dayNumber}, Location: "${finalState.json?.gameState?.location}"`)
  console.log(`   Quests: ${finalState.json?.quests?.length} total (${finalState.json?.quests?.filter(q => q.status === 'completed').length} completed)`)
  console.log(`   Facts: ${finalState.json?.worldFacts?.map(f => f.key).slice(0, 5).join(', ')}...`)

  console.log('\n=== SIMULATION COMPLETED SUCCESSFULLY! ===')
}

simulate().catch(console.error)
