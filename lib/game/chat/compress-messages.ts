/**
 * Compress old chat messages into StorySummary.
 */

import { prisma } from '@/lib/db'
import { COMPRESS_THRESHOLD, MAX_CONTEXT_MESSAGES } from '@/lib/game/constants'
import { callAnalyzerLLM } from '@/lib/llm/client'

export async function compressOldMessages(): Promise<void> {
  const totalMessages = await prisma.message.count()
  if (totalMessages < COMPRESS_THRESHOLD) return

  // Keep last MAX_CONTEXT_MESSAGES, compress the rest
  const keepMessages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: MAX_CONTEXT_MESSAGES,
  })
  const keepIds = new Set(keepMessages.map(m => m.id))

  const oldMessages = await prisma.message.findMany({
    orderBy: { createdAt: 'asc' },
    where: { id: { notIn: Array.from(keepIds) } },
  })

  if (oldMessages.length < 10) return // Not enough to compress

  // Get current game state for context
  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })

  const dialogText = oldMessages.map(m => {
    const role = m.role === 'user' ? 'ГРАВЕЦЬ' : 'МАЙСТЕР ГРИ'
    return `${role}: ${m.content.substring(0, 500)}`
  }).join('\n\n')

  const compressPrompt = `Стисни наступну історію гри у 300-500 слів. Зберігай ключові події, зустрічі з NPC, зміни стосунків, важливі рішення, сексуальні сцени та їх наслідки, здобуті та втрачені предмети. НЕ додавай свої коментарі — лише факти.

Поточний день гри: ${gameState?.dayNumber ?? 1}
Поточна локація: ${gameState?.location ?? 'невідомо'}

Діалог для стиснення (${oldMessages.length} повідомлень):

${dialogText.substring(0, 12000)}

Напиши стислий переказ українською:`

  try {
    const res = await callAnalyzerLLM(compressPrompt, { maxTokens: 1500, temperature: 0.3 })
    const summary = res.text
    if (!summary || summary.length < 50) {
      console.warn('Compression returned too short summary')
      return
    }

    // Save summary and delete old messages
    const firstDay = gameState?.dayNumber ?? 1
    await prisma.storySummary.create({
      data: {
        content: summary,
        dayRange: `День 1-${firstDay}`,
      },
    })

    // Delete compressed messages
    await prisma.message.deleteMany({
      where: { id: { in: oldMessages.map(m => m.id) } },
    })

    console.log(`Compressed ${oldMessages.length} messages into summary`)
  } catch (e: any) {
    console.error('Compression error:', e?.message)
  }
}

// === АНАЛІЗАТОР ВІДПОВІДЕЙ: Gemini → DeepSeek fallback ===
