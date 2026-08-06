/**
 * Secondary analyzer pass for missed STAT/INV/REL tags.
 */

import { callAnalyzerLLM, type TokenUsage } from '@/lib/llm/client'
import { SKILL_NAMES } from '@/lib/game/constants'
import { safeParseJSON } from '@/lib/game/json'

export async function analyzeResponseForMissedUpdates(
  aiResponse: string,
  playerMessage: string,
  currentInventory: any[],
  currentRelationships: any[],
  gameState: any
): Promise<{
  statUpdates: any
  invUpdates: any[]
  relUpdates: any[]
  questUpdates: any[]
  diaryUpdates: any[]
  skillUpdates: any[]
  tribeUpdates: any[]
  achievementUpdates: any[]
  usage: TokenUsage
  provider: string
}> {
  const emptyResult = {
    statUpdates: {},
    invUpdates: [],
    relUpdates: [],
    questUpdates: [],
    diaryUpdates: [],
    skillUpdates: [],
    tribeUpdates: [],
    achievementUpdates: [],
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    provider: 'none',
  }

  const currentInvStr = currentInventory.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'порожній'
  const currentRelStr = currentRelationships.map(r => `${r.name}: bond ${r.bond}`).join(', ') || 'немає'

  const prompt = `Ти — аналізатор тексту гри. Прочитай відповідь Game Master і визнач ВСІ зміни стану гри, які відбулися в тексті, але можливо не були оформлені тегами.

Поточний стан:
- Інвентар: ${currentInvStr}
- Стосунки: ${currentRelStr}
- Desire: ${gameState?.desire ?? 0}, Shame: ${gameState?.shame ?? 0}, Confidence: ${gameState?.confidence ?? 50}
- Локація: ${gameState?.location ?? 'невідомо'}
- AmuletEnergy: ${gameState?.amuletEnergy ?? 0}

Дія гравця: ${playerMessage}

Відповідь Game Master:
${aiResponse.substring(0, 6000)}

Проаналізуй текст і поверни JSON з усіма змінами, які ОПИСАНІ В ТЕКСТІ. Шукай:
1. Предмети, які Лара знайшла, підібрала, отримала, з'їла, використала, втратила
2. Нових NPC, яких зустріла, або зміни в стосунках
3. Зміни desire, shame, confidence, location, amuletEnergy, hunger, thirst, mood, timeOfDay
4. Сексуальні сцени → які навички задіяні
5. Нові квести або виконані
6. Значущі події для щоденника
7. Зміни репутації племен (Кай-Тору, Кентаври, Мінотаври, Свинолюди, Гієноїди)
8. Досягнення (значущі події вперше)

Відповідь JSON:
{
  "stat_updates": {"desire": 25, "location": "Джунглі", "hunger": 35, "mood": "happy"} або {} якщо немає змін,
  "inv_updates": [{"action":"add","name":"назва","description":"опис","quantity":1,"category":"категорія"}] або [],
  "rel_updates": [{"name":"Ім'я","bond":3,"tribe":"Плем'я","met":true}] або [],
  "quest_updates": [{"action":"add","title":"назва","description":"опис"}] або [],
  "diary_updates": [{"title":"назва","content":"текст"}] або [],
  "skill_updates": [{"name":"Ніжний дотик","xp":15}] або [],
  "tribe_updates": [{"tribe":"Кай-Тору","change":10}] або [],
  "achievement_updates": [{"name":"Назва","description":"опис","icon":"🏆"}] або []
}

Доступні навички: ${SKILL_NAMES.join(', ')}
Категорії інвентаря: зброя, їжа, ресурс, одяг, артефакт, інструмент, misc

Відповідай ТІЛЬКИ чистим JSON, без пояснень.`

  try {
    const res = await callAnalyzerLLM(prompt, { maxTokens: 2000, temperature: 0.1, jsonMode: true })
    if (!res.text) return { ...emptyResult, usage: res.usage, provider: res.provider }

    const parsed = safeParseJSON(res.text, 'analyzer-llm')
    if (!parsed) return { ...emptyResult, usage: res.usage, provider: res.provider }
    return {
      statUpdates: parsed?.stat_updates ?? {},
      invUpdates: parsed?.inv_updates ?? [],
      relUpdates: parsed?.rel_updates ?? [],
      questUpdates: parsed?.quest_updates ?? [],
      diaryUpdates: parsed?.diary_updates ?? [],
      skillUpdates: parsed?.skill_updates ?? [],
      tribeUpdates: parsed?.tribe_updates ?? [],
      achievementUpdates: parsed?.achievement_updates ?? [],
      usage: res.usage,
      provider: res.provider,
    }
  } catch (e: any) {
    console.error('Analyzer error:', e?.message)
    return emptyResult
  }
}


// === МЕРЖ ОНОВЛЕНЬ: DeepSeek теги + Gemini аналіз ===
