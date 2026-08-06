export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { detectPromptMode } from '@/lib/prompt-mode'
import { buildTagLog } from '@/lib/game/tag-log'
import { rateLimit } from '@/lib/game/rate-limit'
import { DEFAULT_TURN_CHOICES } from '@/lib/game/ui-labels'
import { callNarratorLLMStream, type TokenUsage } from '@/lib/llm/client'
import { MAX_CONTEXT_MESSAGES, MAX_PLAYER_MESSAGE_LENGTH } from '@/lib/game/constants'
import { applyAllUpdates } from '@/lib/game/apply-updates'
import { applySurvivalDefaults, parseNarrativeStats, tickDiseases } from '@/lib/game/survival'
import { resolveDiceRolls } from '@/lib/game/dice'
import { syncQuestLadder } from '@/lib/game/quest-ladder'
import { syncSideQuestsFromFacts } from '@/lib/game/side-quest-sync'
import { rollRandomEvent } from '@/lib/game/random-events'
import { applyNewDaySurvival, applyServerTimeTick } from '@/lib/game/time-tick'
import { saveTurnSnapshot } from '@/lib/game/turn-snapshot'
import { needsDeepAnalysis } from '@/lib/game/needs-analysis'
import { applySexSkillModifiers } from '@/lib/game/skill-effects'
import { filterAndEnrichSexChoices } from '@/lib/game/sex-choices-gate'
import {
  detectNewSynergies,
  detectNewlyLeveledSkills,
  detectNewlyUnlockedNodes,
} from '@/lib/game/sex-synergies'
import { applyKinkTriggers, listKinks } from '@/lib/game/kink-service'
import { seedKinks } from '@/lib/seed-kinks'
import { computeKinkModifiers } from '@/lib/game/kink-effects'
import {
  buildSystemPrompt,
  parseDeepSeekTags,
  cleanDisplayContent,
  mergeUpdates,
  compressOldMessages,
  analyzeResponseForMissedUpdates,
} from '@/lib/game/chat'

export async function POST(request: NextRequest) {
  try {
    // Soft rate limit: 20 requests / minute per process (local single-player)
    const rl = rateLimit('chat:global', { limit: 20, windowMs: 60_000 })
    if (!rl.ok) {
      return new Response(
        JSON.stringify({
          error: `Забагато запитів. Зачекай ~${Math.ceil(rl.retryAfterMs / 1000)} с.`,
          code: 'RATE_LIMIT',
        }),
        { status: 429 }
      )
    }

    const { message, provider } = await request.json()
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Повідомлення обов\'язкове' }), { status: 400 })
    }
    if (message.length > MAX_PLAYER_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: `Повідомлення задовге (макс. ${MAX_PLAYER_MESSAGE_LENGTH} символів)` }), { status: 400 })
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim()
    const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim()
    const hasGemini = Boolean(geminiKey && !geminiKey.includes('встав') && geminiKey.length >= 8)
    const hasDeepSeek = Boolean(deepseekKey && !deepseekKey.includes('встав') && deepseekKey.length >= 8)

    if (!hasGemini && !hasDeepSeek) {
      return new Response(
        JSON.stringify({
          error: 'Не налаштовано ключі доступу. Встав DEEPSEEK_API_KEY або GEMINI_API_KEY у файл .env і перезапусти проєкт.',
          code: 'MISSING_API_KEY',
        }),
        { status: 503 }
      )
    }

    // Get game state
    let gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
    if (!gameState) {
      gameState = await prisma.gameState.create({ data: { id: 'singleton', gameStarted: true } })
    }

    const relationships = await prisma.relationship.findMany({ where: { met: true } })
    const inventory = await prisma.inventoryItem.findMany()
    const quests = await prisma.quest.findMany()
    const skills = await prisma.skill.findMany()
    const summaries = await prisma.storySummary.findMany({ orderBy: { createdAt: 'asc' } })
    const tribeReps = await prisma.tribeReputation.findMany()

    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: MAX_CONTEXT_MESSAGES,
    })
    recentMessages.reverse()

    // Snapshot BEFORE this turn mutates world (for redo)
    await saveTurnSnapshot(message)
    await prisma.message.create({ data: { role: 'user', content: message } })

    const diseases = await prisma.disease.findMany()
    const worldFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })
    const promptMode = detectPromptMode(message)
    const rolledEvent = rollRandomEvent({
      location: gameState?.location ?? 'Берег острова',
      chapter: gameState?.chapter,
      timeOfDay: gameState?.timeOfDay,
      weather: gameState?.weather,
      mode: promptMode,
      message,
      dayNumber: gameState?.dayNumber,
      companionName: gameState?.companionName,
      isDarkLara: gameState?.isDarkLara,
    })
    const systemPrompt = buildSystemPrompt(
      gameState,
      relationships,
      inventory,
      quests,
      skills,
      summaries,
      tribeReps,
      diseases,
      worldFacts,
      promptMode,
      rolledEvent
    )
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...(recentMessages?.map?.((m: any) => ({
        role: m?.role === 'user' ? 'user' : 'assistant',
        content: m?.content ?? '',
      })) ?? []),
      { role: 'user', content: message },
    ]

    const narratorLLM = await callNarratorLLMStream({
      messages: llmMessages,
      provider: provider || 'auto',
    })

    const stream = new ReadableStream({
      async start(controller) {
        const reader = narratorLLM.stream.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let fullContent = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunkText = decoder.decode(value, { stream: true })
            if (chunkText) {
              fullContent += chunkText
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunkText })}\n\n`))
            }
          }

          const turnStartTime = Date.now()
          const narratorUsage = narratorLLM.getUsage()

          // 1. Parse AI tags
          const deepseekParsed = parseDeepSeekTags(fullContent)

          // 2. Smart Analyzer Trigger (Runs only if explicit tags missing or in dual mode)
          const shouldRunAnalyzer = provider === 'dual' || (provider !== 'deepseek' && needsDeepAnalysis(fullContent, deepseekParsed))
          let geminiAnalysis: any = {
            statUpdates: {},
            invUpdates: [],
            relUpdates: [],
            questUpdates: [],
            diaryUpdates: [],
            skillUpdates: [],
            tribeUpdates: [],
            achievementUpdates: [],
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            provider: 'skipped',
          }

          if (shouldRunAnalyzer) {
            geminiAnalysis = await analyzeResponseForMissedUpdates(
              fullContent, message, inventory, relationships, gameState
            )
          }

          const analyzerUsage = geminiAnalysis.usage

          // 3. Merge updates
          const merged = mergeUpdates(deepseekParsed, geminiAnalysis)

          // 4. Clean content from tags
          const displayContent = cleanDisplayContent(fullContent)

          // 5. Save assistant message
          await prisma.message.create({ data: { role: 'assistant', content: displayContent } })

          // 5.5 Server-side survival + narrative fallbacks + time tick
          merged.stat = applySurvivalDefaults(merged.stat, gameState)
          merged.stat = parseNarrativeStats(fullContent, merged.stat)
          const timeTick = applyServerTimeTick(merged.stat, gameState)
          merged.stat = timeTick.stat
          if (timeTick.newDay) {
            merged.stat = applyNewDaySurvival(merged.stat)
          }

          // 5.6 Sex skill tree + kinks: mechanical modifiers
          try {
            await seedKinks()
          } catch { /* ignore if table missing mid-migrate */ }
          let kinksForMods: any[] = []
          try {
            kinksForMods = await listKinks()
          } catch {
            kinksForMods = []
          }
          const sexSkillResult = applySexSkillModifiers(merged as any, skills, kinksForMods)

          // 5.6b Skill-gated SEX_CHOICES (filter risk + inject skill moves)
          const phaseForGate =
            merged.phase?.phase ||
            merged.sexScene?.phase ||
            'foreplay'
          const inSexContext = Boolean(
            merged.sexScene ||
            merged.sexChoices?.length ||
            merged.pleasure ||
            merged.sceneSummary ||
            merged.multiOrgasm
          )
          let sexChoicesGate: ReturnType<typeof filterAndEnrichSexChoices> | null = null
          if (inSexContext || merged.sexChoices?.length) {
            sexChoicesGate = filterAndEnrichSexChoices(merged.sexChoices, skills, {
              phase: phaseForGate,
              amuletEnergy: Number(merged.stat?.amuletEnergy ?? gameState?.amuletEnergy ?? 0),
            })
            merged.sexChoices = sexChoicesGate.choices
            sexSkillResult.applied.push(...sexChoicesGate.applied)
          }

          // Apply amulet_gain from scene summary into STAT if AI forgot absolute energy
          if (merged.sceneSummary?.amulet_gain != null) {
            const gain = Math.max(0, Number(merged.sceneSummary.amulet_gain) || 0)
            if (gain > 0) {
              const base = Number(
                merged.stat?.amuletEnergy ?? gameState?.amuletEnergy ?? 0
              )
              // If stat already absolute and higher, keep; else add gain once
              if (merged.stat?.amuletEnergy == null) {
                merged.stat = { ...(merged.stat || {}), amuletEnergy: Math.min(100, base + gain) }
              }
            }
          }

          // 5.7 Fair server-side dice re-roll (+ skill tree bonuses)
          const resolvedDice = resolveDiceRolls(merged.diceRolls || [], gameState, skills)
          merged.diceRolls = resolvedDice

          // 6. Apply all updates (FACT gates: soft prereqs + mutex endings)
          await applyAllUpdates(merged, gameState?.dayNumber ?? 1)
          await tickDiseases()
          // Ladder + side quests auto-complete from WorldFact keys
          const completedLadder = await syncQuestLadder()
          const completedSide = await syncSideQuestsFromFacts()
          const completedQuests = [...completedLadder, ...completedSide]

          // 6b. Kinks — apply XP from tags / fetish / narrative
          let kinkProgress: Awaited<ReturnType<typeof applyKinkTriggers>> = []
          try {
            const narrativeForKink = displayContent || fullContent
            const explicitKeys = [...(merged.kinkTriggers || [])]
            // Coercion / trap scenes always tick «Безсилля»
            const sceneType = String(merged.sexScene?.type || '').toLowerCase()
            if (sceneType === 'coercion' || sceneType === 'trap') {
              explicitKeys.push({ key: 'helpless', xp: 14 })
            }
            // Also on scene end if narrative reeks of force (fallback when START type missed)
            if (
              merged.sceneSummary &&
              /примус|проти волі|безсил|пастк|forced|coercion/i.test(narrativeForKink)
            ) {
              explicitKeys.push({ key: 'helpless', xp: 10 })
            }
            kinkProgress = await applyKinkTriggers({
              narrativeText: narrativeForKink,
              explicitKeys,
              fetishName: merged.sceneSummary?.new_fetish || null,
              skills,
            })
          } catch (e) {
            console.warn('kink trigger error', e)
          }

          // Pregnancy / amulet / shame from kinks (post-mod; persist shame if needed)
          try {
            const kinksNow = await listKinks()
            const km = computeKinkModifiers(kinksNow)
            if (merged.sceneSummary?.pregnancy_risk != null && km.pregnancyRiskMult > 1) {
              merged.sceneSummary.pregnancy_risk = Math.min(
                100,
                Math.round(Number(merged.sceneSummary.pregnancy_risk) * km.pregnancyRiskMult)
              )
            }
            if (merged.sceneSummary?.amulet_gain != null && km.amuletGainMult > 1) {
              const gain = Math.round(Number(merged.sceneSummary.amulet_gain) * km.amuletGainMult)
              merged.sceneSummary.amulet_gain = gain
              const base = Number(gameState?.amuletEnergy ?? 0)
              await prisma.gameState.update({
                where: { id: 'singleton' },
                data: { amuletEnergy: Math.min(100, base + Math.max(0, gain - Number(merged.sceneSummary.amulet_gain || gain))) },
              }).catch(() => {})
            }
            if (km.shameRelief > 0) {
              const shame = Number(gameState?.shame ?? 0)
              const nextShame = Math.max(0, shame - km.shameRelief)
              await prisma.gameState.update({
                where: { id: 'singleton' },
                data: { shame: nextShame },
              }).catch(() => {})
            }
          } catch { /* ignore */ }

          // Default choices if AI forgot
          let finalChoices: string[] = merged.choices?.length ? [...merged.choices] : []
          if (finalChoices.length === 0 && !merged.sexChoices?.length) {
            finalChoices = [...DEFAULT_TURN_CHOICES]
          }

          // Token Usage Calculation
          const promptTokens = (narratorUsage.promptTokens || 0) + (analyzerUsage?.promptTokens || 0)
          const completionTokens = (narratorUsage.completionTokens || 0) + (analyzerUsage?.completionTokens || 0)
          const turnTotalTokens = promptTokens + completionTokens
          const durationMs = Date.now() - turnStartTime

          if (turnTotalTokens > 0) {
            await prisma.gameState.update({
              where: { id: 'singleton' },
              data: {
                totalTokensUsed: { increment: turnTotalTokens },
              },
            })
          }

          // 6c. Persist active sex scene so HUD survives reload
          let activeSexPayload: any = null
          try {
            const {
              parseActiveSexJson,
              serializeActiveSex,
              mergeActiveSexState,
            } = await import('@/lib/game/active-sex')
            const prev = parseActiveSexJson((gameState as any)?.activeSexJson)
            const next = mergeActiveSexState(prev, {
              sexScene: merged.sexScene,
              pleasure: merged.pleasure,
              phase: merged.phase,
              stamina: merged.stamina,
              domination: merged.domination,
              penisStats: merged.penisStats,
              sexChoices: merged.sexChoices,
              sceneSummary: merged.sceneSummary,
            })
            activeSexPayload = next
            await prisma.gameState.update({
              where: { id: 'singleton' },
              data: { activeSexJson: serializeActiveSex(next) },
            })
          } catch (e) {
            console.warn('active sex persist error', e)
          }

          // 7. Fetch updated state and send to client
          const updatedState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
          const updatedRels = await prisma.relationship.findMany({
            where: {
              OR: [
                { met: true },
                {
                  name: {
                    in: [
                      'Тане',
                      'Лея',
                      'Джек Вейн',
                      'Макаї',
                      'Найя',
                      'Араху',
                      'Ксерон',
                      'Іпполіта',
                      'Гор-Ак',
                      'Міра',
                      'Кіра',
                      'Зек',
                      'Грух',
                      'Свиноматка',
                    ],
                  },
                },
              ],
            },
            orderBy: { name: 'asc' },
          })
          const updatedInv = await prisma.inventoryItem.findMany()
          const updatedQuests = await prisma.quest.findMany()
          const updatedDiary = await prisma.diaryEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
          const updatedSkills = await prisma.skill.findMany()
          const updatedTribes = await prisma.tribeReputation.findMany()
          const updatedLocations = await prisma.location.findMany()
          const updatedAchievements = await prisma.achievement.findMany({ orderBy: { unlockedAt: 'desc' } })
          const updatedDiseases = await prisma.disease.findMany()
          const updatedFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })
          let updatedKinks: any[] = []
          try {
            updatedKinks = await listKinks()
          } catch {
            updatedKinks = []
          }

          // Skill progression feedback for client toasts
          const skillLevelUps = detectNewlyLeveledSkills(skills, updatedSkills)
          const skillTreeUnlocks = detectNewlyUnlockedNodes(skills, updatedSkills)
          const newSynergies = detectNewSynergies(skills, updatedSkills)

          const tagLog = {
            ...buildTagLog({
              mode: promptMode,
              merged: { ...merged, choices: finalChoices, diceRolls: resolvedDice },
              completedQuests,
              timeTick: {
                phaseAdvanced: timeTick.phaseAdvanced,
                newDay: timeTick.newDay,
                turnCount: timeTick.turnCount,
              },
            }),
            skillEffects: sexSkillResult.applied,
            skillModifiers: {
              multiOrgasmUnlocked: sexSkillResult.modifiers.multiOrgasmUnlocked,
              partnerPleasureBonusPct: sexSkillResult.modifiers.partnerPleasureBonusPct,
              laraPleasureBonusPct: sexSkillResult.modifiers.laraPleasureBonusPct,
              staminaFloor: sexSkillResult.modifiers.staminaFloor,
              dominationBias: sexSkillResult.modifiers.dominationBias,
              laraOrgasmThreshold: sexSkillResult.modifiers.laraOrgasmThreshold,
              synergies: sexSkillResult.modifiers.synergies.map((s) => ({
                id: s.id,
                name: s.name,
                icon: s.icon,
              })),
            },
            sexChoicesGate: sexChoicesGate
              ? { removedRisk: sexChoicesGate.removedRisk, injected: sexChoicesGate.injected }
              : null,
          }

          const analyzerLabel = geminiAnalysis.provider === 'gemini'
            ? 'Gemini 2.0 Flash'
            : (geminiAnalysis.provider === 'deepseek'
              ? 'DeepSeek Chat'
              : 'Смарт-пропуск (теги ідеальні)')

          const tokenUsagePayload = {
            provider: `${narratorLLM.providerLabel} + ${analyzerLabel}`,
            narratorProvider: narratorLLM.providerLabel,
            analyzerProvider: analyzerLabel,
            providerKey: narratorLLM.provider,
            model: narratorLLM.model,
            promptTokens,
            completionTokens,
            analyzerTokens: analyzerUsage?.totalTokens || 0,
            totalTokens: turnTotalTokens,
            cumulativeTotalTokens: updatedState?.totalTokensUsed ?? 0,
            durationMs,
            smartSkipped: geminiAnalysis.provider === 'skipped',
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            gameState: updatedState,
            relationships: updatedRels,
            inventory: updatedInv,
            quests: updatedQuests,
            diary: updatedDiary,
            skills: updatedSkills,
            tribeReputations: updatedTribes,
            locations: updatedLocations,
            achievements: updatedAchievements,
            diseases: updatedDiseases,
            worldFacts: updatedFacts,
            completedQuests,
            promptMode,
            tagLog,
            tokenUsage: tokenUsagePayload,
            timeTick: {
              phaseAdvanced: timeTick.phaseAdvanced,
              newDay: timeTick.newDay,
              turnCount: timeTick.turnCount,
              timeOfDay: merged.stat.timeOfDay,
              dayNumber: merged.stat.dayNumber,
            },
            choices: finalChoices,
            diceRolls: merged.diceRolls,
            sexScene: merged.sexScene || activeSexPayload?.sexScene || null,
            phase: merged.phase || activeSexPayload?.phase || null,
            pleasure: merged.pleasure || activeSexPayload?.pleasure || null,
            stamina: merged.stamina || activeSexPayload?.stamina || null,
            combo: merged.combo,
            domination:
              merged.domination !== null && merged.domination !== undefined
                ? merged.domination
                : activeSexPayload?.domination ?? null,
            reactions: merged.reactions,
            erogenousZones: merged.erogenousZones,
            sexChoices: merged.sexChoices || activeSexPayload?.sexChoices || [],
            sceneSummary: merged.sceneSummary,
            activeSex: activeSexPayload,
            sceneMood: merged.sceneMood,
            laraDialogue: merged.laraDialogue,
            multiOrgasm: merged.multiOrgasm,
            penisStats: merged.penisStats,
            kinks: updatedKinks,
            skillProgress: {
              levelUps: skillLevelUps,
              treeUnlocks: skillTreeUnlocks,
              newSynergies: newSynergies.map((s) => ({
                id: s.id,
                name: s.name,
                icon: s.icon,
                description: s.description,
              })),
              kinkProgress,
              sceneEnded: Boolean(merged.sceneSummary),
            },
          })}\n\n`))

          // 8. Auto-compress history if needed
          compressOldMessages().catch(e => console.error('Background compress error:', e))

        } catch (error: any) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error?.message ?? 'Помилка стріму' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Внутрішня помилка сервера' }), { status: 500 })
  }
}
