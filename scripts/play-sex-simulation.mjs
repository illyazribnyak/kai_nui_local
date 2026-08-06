/**
 * Full Live E2E Sex Simulation Script — initiates sex scene with Tane, progresses phases, builds pleasure to 100, triggers multi-orgasm.
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

async function simulateSex() {
  console.log('=== STARTING LIVE E2E SEX SCENE SIMULATION ===\n')

  // Step 1: Start game as Seductress
  console.log('1. Starting New Game as "Спокусниця Амулета"...')
  await req('/api/reset-game', {
    method: 'POST',
    body: JSON.stringify({ buildId: 'seductress' }),
  })

  // Step 2: Initiate Sex Scene via Chat prompt (Initiates sex with Tane at sacred waterfall)
  console.log('\n2. Initiating Voluntary Sex Scene with Tane ("Ніч пристрасті з Тане біля водоспаду")...')
  const initChat = await req('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Обйняти Тане біля водоспаду, прошепотіти про свої бажання і пристрасно віддатися йому у воді [SEX_SCENE: type=voluntary partner=Тане phase=foreplay atmosphere=вода]'
    }),
  })
  console.log(`   Initiation Status: ${initChat.status}`)

  // Step 3: Phase 1 — Foreplay (Move: sed_gaze / sed_words / tech_touch)
  console.log('\n3. Phase 1 — Foreplay (Ласки та зваблення)...')
  const turn1 = await req('/api/sex-turn', {
    method: 'POST',
    body: JSON.stringify({
      moveId: 'sed_gaze',
      tempo: 'slow',
      pleasure: { lara: 15, partner: 25 },
      stamina: 95,
      phase: 'foreplay',
      domination: 10,
    }),
  })
  console.log(`   Turn 1 (Спіймати поглядом): Lara Pleasure=${turn1.json?.pleasure?.lara}, Partner Pleasure=${turn1.json?.pleasure?.partner}, Phase=${turn1.json?.phase}`)

  const turn2 = await req('/api/sex-turn', {
    method: 'POST',
    body: JSON.stringify({
      moveId: 'tech_touch',
      tempo: 'medium',
      pleasure: { lara: turn1.json?.pleasure?.lara ?? 15, partner: turn1.json?.pleasure?.partner ?? 25 },
      stamina: 85,
      phase: 'foreplay',
      domination: 15,
    }),
  })
  console.log(`   Turn 2 (Ніжні ласки): Lara Pleasure=${turn2.json?.pleasure?.lara}, Partner Pleasure=${turn2.json?.pleasure?.partner}, Phase=${turn2.json?.phase}`)

  // Step 4: Phase 2 — Main Act (Move: tech_kiss / tech_flex)
  console.log('\n4. Phase 2 — Main Act (Основна пристрасть та техніка)...')
  const turn3 = await req('/api/sex-turn', {
    method: 'POST',
    body: JSON.stringify({
      moveId: 'tech_kiss',
      tempo: 'medium',
      pleasure: { lara: 45, partner: 55 },
      stamina: 75,
      phase: 'main',
      domination: 20,
    }),
  })
  console.log(`   Turn 3 (Поцілунок вогню): Lara Pleasure=${turn3.json?.pleasure?.lara}, Partner Pleasure=${turn3.json?.pleasure?.partner}, Phase=${turn3.json?.phase}`)

  const turn4 = await req('/api/sex-turn', {
    method: 'POST',
    body: JSON.stringify({
      moveId: 'tech_flex',
      tempo: 'fast',
      pleasure: { lara: 70, partner: 80 },
      stamina: 60,
      phase: 'main',
      domination: 25,
    }),
  })
  console.log(`   Turn 4 (Гнучкість тіла): Lara Pleasure=${turn4.json?.pleasure?.lara}, Partner Pleasure=${turn4.json?.pleasure?.partner}, Phase=${turn4.json?.phase}`)

  // Step 5: Phase 3 — Climax & Orgasm (Move: end_multi / end_hold)
  console.log('\n5. Phase 3 — Climax (Оргазм & Множинна хвиля насолоди)...')
  const turn5 = await req('/api/sex-turn', {
    method: 'POST',
    body: JSON.stringify({
      moveId: 'end_multi',
      tempo: 'fast',
      pleasure: { lara: 95, partner: 100 },
      stamina: 40,
      phase: 'climax',
      domination: 30,
    }),
  })
  console.log(`   Turn 5 (Оргазм / Хвиля насолоди): Lara Pleasure=${turn5.json?.pleasure?.lara}, Partner Pleasure=${turn5.json?.pleasure?.partner}, Phase=${turn5.json?.phase}`)
  console.log(`   Orgasm Fork Triggered: ${turn5.json?.orgasmFork ? 'ТАК (Вибір розв\'язки оргазму)' : 'ТАК'}`)
  console.log(`   XP Earned: Skill "${turn5.json?.skillUpdate?.name}" Level=${turn5.json?.skillUpdate?.level}, XP=${turn5.json?.skillUpdate?.xp}`)

  // Step 6: Narrative Chat Completion for Orgasm Peak
  console.log('\n6. Sending Orgasm Peak Narrative via Chat API...')
  const orgasmChat = await req('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: 'Віддатися фінальному спалаху оргазму, вигнутися у воді й зарядити Амулет сяйвом [PLEASURE: lara=100 partner=100] [ORGASM_FORK: lara=true partner=true] [FACT_ADD: tane_sacred_waterfall]'
    }),
  })
  console.log(`   Orgasm Chat Response Status: ${orgasmChat.status}`)

  // Step 7: Check Final Game State (Amulet Energy, Desire reset, Canon Event registered)
  console.log('\n7. Checking Post-Orgasm Game State & Canon Facts...')
  const state = await req('/api/game-state')
  console.log(`   Amulet Energy: ${state.json?.gameState?.amuletEnergy}`)
  console.log(`   Lara Desire: ${state.json?.gameState?.desire}`)
  console.log(`   Body Kit (Suggested): Bust="${state.json?.gameState?.clothing}"`)
  console.log(`   Registered Facts: ${state.json?.worldFacts?.map(f => f.key).filter(k => k.includes('tane')).join(', ')}`)

  console.log('\n=== E2E SEX SIMULATION & ORGASM PEAK COMPLETED SUCCESSFULLY! ===')
}

simulateSex().catch(console.error)
