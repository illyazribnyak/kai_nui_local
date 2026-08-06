/**
 * Parse LLM response tags + merge DeepSeek/Gemini update blobs.
 * Extracted from app/api/chat/route.ts (Week-2).
 */

import { safeParseJSON } from '@/lib/game/json'
import {
  sanitizeStatUpdate,
  parseWithSchema,
  RelUpdateSchema,
  InvUpdateSchema,
  QuestUpdateSchema,
  DiaryUpdateSchema,
  SkillUpdateSchema,
  TribeUpdateSchema,
  AchievementSchema,
  DiseaseSchema,
  FactSchema,
  DiceSchema,
} from '@/lib/game/tag-schemas'
import { sanitizePenisStats } from '@/lib/game/race-sex-stats'

export function mergeUpdates(
  deepseekUpdates: { stat: any, inv: any[], rel: any[], quest: any[], diary: any[], skill: any[], tribe: any[], achievement: any[], disease: any[], facts: any[], choices: string[], diceRolls: any[], sexScene: any, phase: any, pleasure: any, stamina: any, combo: any, domination: number | null, reactions: any[], erogenousZones: any[], sexChoices: any[], sceneSummary: any, sceneMood: any, laraDialogue: any[], multiOrgasm: any, penisStats: any, kinkTriggers?: Array<{ key: string; xp?: number }> },
  geminiUpdates: { statUpdates: any, invUpdates: any[], relUpdates: any[], questUpdates: any[], diaryUpdates: any[], skillUpdates: any[], tribeUpdates: any[], achievementUpdates: any[] }
) {
  const mergedStat = { ...geminiUpdates.statUpdates, ...deepseekUpdates.stat }

  const deepseekInvNames = new Set(deepseekUpdates.inv.map((i: any) => i.name?.toLowerCase()))
  const mergedInv = [
    ...deepseekUpdates.inv,
    ...geminiUpdates.invUpdates.filter((i: any) => !deepseekInvNames.has(i.name?.toLowerCase())),
  ]

  const deepseekRelNames = new Set(deepseekUpdates.rel.map((r: any) => r.name?.toLowerCase()))
  const mergedRel = [
    ...deepseekUpdates.rel,
    ...geminiUpdates.relUpdates.filter((r: any) => !deepseekRelNames.has(r.name?.toLowerCase())),
  ]

  const deepseekQuestTitles = new Set(deepseekUpdates.quest.map((q: any) => q.title?.toLowerCase()))
  const mergedQuest = [
    ...deepseekUpdates.quest,
    ...geminiUpdates.questUpdates.filter((q: any) => !deepseekQuestTitles.has(q.title?.toLowerCase())),
  ]

  const mergedDiary = [...deepseekUpdates.diary, ...geminiUpdates.diaryUpdates]

  const deepseekSkillNames = new Set(deepseekUpdates.skill.map((s: any) => s.name?.toLowerCase()))
  const mergedSkill = [
    ...deepseekUpdates.skill,
    ...geminiUpdates.skillUpdates.filter((s: any) => !deepseekSkillNames.has(s.name?.toLowerCase())),
  ]

  // Tribe: merge by tribe name
  const deepseekTribeNames = new Set(deepseekUpdates.tribe.map((t: any) => t.tribe?.toLowerCase()))
  const mergedTribe = [
    ...deepseekUpdates.tribe,
    ...(geminiUpdates.tribeUpdates || []).filter((t: any) => !deepseekTribeNames.has(t.tribe?.toLowerCase())),
  ]

  // Achievements: merge by name
  const deepseekAchNames = new Set(deepseekUpdates.achievement.map((a: any) => a.name?.toLowerCase()))
  const mergedAchievement = [
    ...deepseekUpdates.achievement,
    ...(geminiUpdates.achievementUpdates || []).filter((a: any) => !deepseekAchNames.has(a.name?.toLowerCase())),
  ]

  return {
    stat: mergedStat,
    inv: mergedInv,
    rel: mergedRel,
    quest: mergedQuest,
    diary: mergedDiary,
    skill: mergedSkill,
    tribe: mergedTribe,
    achievement: mergedAchievement,
    disease: deepseekUpdates.disease || [],
    facts: deepseekUpdates.facts || [],
    choices: deepseekUpdates.choices || [],
    diceRolls: deepseekUpdates.diceRolls || [],
    sexScene: deepseekUpdates.sexScene,
    phase: deepseekUpdates.phase,
    pleasure: deepseekUpdates.pleasure,
    stamina: deepseekUpdates.stamina,
    combo: deepseekUpdates.combo,
    domination: deepseekUpdates.domination,
    reactions: deepseekUpdates.reactions || [],
    erogenousZones: deepseekUpdates.erogenousZones || [],
    sexChoices: deepseekUpdates.sexChoices || [],
    sceneSummary: deepseekUpdates.sceneSummary,
    sceneMood: deepseekUpdates.sceneMood,
    laraDialogue: deepseekUpdates.laraDialogue || [],
    multiOrgasm: deepseekUpdates.multiOrgasm,
    penisStats: deepseekUpdates.penisStats,
    kinkTriggers: deepseekUpdates.kinkTriggers || [],
  }
}

// === ПАРСИНГ ТЕГІВ З ВІДПОВІДІ DEEPSEEK (з валідацією) ===

export function parseDeepSeekTags(content: string) {
  let statUpdate: any = {}
  const relUpdates: any[] = []
  const invUpdates: any[] = []
  const questUpdates: any[] = []
  const diaryUpdates: any[] = []
  const skillUpdates: any[] = []
  const tribeUpdates: any[] = []
  const achievements: any[] = []

  // STAT_UPDATE — Zod soft-sanitize
  const statMatch = content.match(/\[STAT_UPDATE\](.*?)\[\/STAT_UPDATE\]/s)
  if (statMatch?.[1]) {
    const parsed = safeParseJSON(statMatch[1].trim(), 'STAT_UPDATE')
    if (parsed) statUpdate = sanitizeStatUpdate(parsed)
  }

  // Усі множинні теги (Zod)
  for (const m of content.matchAll(/\[REL_UPDATE\](.*?)\[\/REL_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'REL_UPDATE')
    const p = parseWithSchema(RelUpdateSchema, raw, 'REL_UPDATE')
    if (p?.name) relUpdates.push(p)
  }
  for (const m of content.matchAll(/\[INV_UPDATE\](.*?)\[\/INV_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'INV_UPDATE')
    const p = parseWithSchema(InvUpdateSchema, raw, 'INV_UPDATE')
    if (p?.name) invUpdates.push(p)
  }
  for (const m of content.matchAll(/\[QUEST_UPDATE\](.*?)\[\/QUEST_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'QUEST_UPDATE')
    const p = parseWithSchema(QuestUpdateSchema, raw, 'QUEST_UPDATE')
    if (p?.title) questUpdates.push(p)
  }
  for (const m of content.matchAll(/\[DIARY_UPDATE\](.*?)\[\/DIARY_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DIARY_UPDATE')
    const p = parseWithSchema(DiaryUpdateSchema, raw, 'DIARY_UPDATE')
    if (p?.content) diaryUpdates.push(p)
  }
  for (const m of content.matchAll(/\[SKILL_UPDATE\](.*?)\[\/SKILL_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'SKILL_UPDATE')
    const p = parseWithSchema(SkillUpdateSchema, raw, 'SKILL_UPDATE')
    if (p?.name && p?.xp) skillUpdates.push(p)
  }
  for (const m of content.matchAll(/\[TRIBE_UPDATE\](.*?)\[\/TRIBE_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'TRIBE_UPDATE')
    const p = parseWithSchema(TribeUpdateSchema, raw, 'TRIBE_UPDATE')
    if (p?.tribe && p?.change !== undefined) tribeUpdates.push(p)
  }
  for (const m of content.matchAll(/\[ACHIEVEMENT\](.*?)\[\/ACHIEVEMENT\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'ACHIEVEMENT')
    const p = parseWithSchema(AchievementSchema, raw, 'ACHIEVEMENT')
    if (p?.name) achievements.push(p)
  }

  // DISEASE tags
  const diseaseUpdates: any[] = []
  for (const m of content.matchAll(/\[DISEASE_ADD\](.*?)\[\/DISEASE_ADD\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DISEASE_ADD')
    const p = parseWithSchema(DiseaseSchema, { ...(raw || {}), _action: 'add' }, 'DISEASE_ADD')
    if (p?.name) diseaseUpdates.push(p)
  }
  for (const m of content.matchAll(/\[DISEASE_REMOVE\](.*?)\[\/DISEASE_REMOVE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DISEASE_REMOVE')
    const p = parseWithSchema(DiseaseSchema, { ...(raw || {}), _action: 'remove' }, 'DISEASE_REMOVE')
    if (p?.name) diseaseUpdates.push(p)
  }

  // WORLD FACT tags
  const facts: any[] = []
  for (const m of content.matchAll(/\[FACT_ADD\](.*?)\[\/FACT_ADD\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'FACT_ADD')
    const p = parseWithSchema(FactSchema, { ...(raw || {}), _action: 'add' }, 'FACT_ADD')
    if (p) facts.push(p)
  }
  for (const m of content.matchAll(/\[FACT_REMOVE\](.*?)\[\/FACT_REMOVE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'FACT_REMOVE')
    const p = parseWithSchema(FactSchema, { ...(raw || {}), _action: 'remove' }, 'FACT_REMOVE')
    if (p) facts.push(p)
  }

  // CHOICES
  const choices: string[] = []
  const choicesMatch = content.match(/\[CHOICES\](.*?)\[\/CHOICES\]/s)
  if (choicesMatch?.[1]) {
    const parsed = safeParseJSON(choicesMatch[1].trim(), 'CHOICES')
    if (parsed?.options && Array.isArray(parsed.options)) choices.push(...parsed.options)
  }

  // DICE_ROLL
  const diceRolls: any[] = []
  for (const m of content.matchAll(/\[DICE_ROLL\](.*?)\[\/DICE_ROLL\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DICE_ROLL')
    const p = parseWithSchema(DiceSchema, raw, 'DICE_ROLL')
    if (p && (p.skill || p.stat)) diceRolls.push(p)
  }

  // SEX_SCENE_START
  let sexScene: any = null
  const sexStartMatch = content.match(/\[SEX_SCENE_START\](.*?)\[\/SEX_SCENE_START\]/s)
  if (sexStartMatch?.[1]) {
    sexScene = safeParseJSON(sexStartMatch[1].trim(), 'SEX_SCENE_START')
  }

  // PHASE
  let phase: any = null
  const phaseMatch = content.match(/\[PHASE\](.*?)\[\/PHASE\]/s)
  if (phaseMatch?.[1]) {
    phase = safeParseJSON(phaseMatch[1].trim(), 'PHASE')
  }

  // PLEASURE (dual: lara + partner)
  let pleasure: any = null
  const pleasureMatches = [...content.matchAll(/\[PLEASURE\](.*?)\[\/PLEASURE\]/gs)]
  if (pleasureMatches.length > 0) {
    const lastP = safeParseJSON(pleasureMatches[pleasureMatches.length - 1][1].trim(), 'PLEASURE')
    if (lastP) {
      pleasure = { lara: Number(lastP.lara ?? lastP.value ?? 0), partner: Number(lastP.partner ?? 0), partner_name: lastP.partner_name ?? lastP.partner ?? '' }
    }
  }

  // STAMINA
  let stamina: any = null
  const staminaMatches = [...content.matchAll(/\[STAMINA\](.*?)\[\/STAMINA\]/gs)]
  if (staminaMatches.length > 0) {
    stamina = safeParseJSON(staminaMatches[staminaMatches.length - 1][1].trim(), 'STAMINA')
  }

  // COMBO
  let combo: any = null
  const comboMatch = content.match(/\[COMBO\](.*?)\[\/COMBO\]/s)
  if (comboMatch?.[1]) {
    combo = safeParseJSON(comboMatch[1].trim(), 'COMBO')
  }

  // DOMINATION
  let domination: number | null = null
  const domMatches = [...content.matchAll(/\[DOMINATION\](.*?)\[\/DOMINATION\]/gs)]
  if (domMatches.length > 0) {
    const lastD = safeParseJSON(domMatches[domMatches.length - 1][1].trim(), 'DOMINATION')
    if (lastD?.value !== undefined) domination = Number(lastD.value)
  }

  // REACTION
  const reactions: any[] = []
  for (const m of content.matchAll(/\[REACTION\](.*?)\[\/REACTION\]/gs)) {
    const p = safeParseJSON(m[1].trim(), 'REACTION')
    if (p?.text) reactions.push(p)
  }

  // EROGENOUS
  const erogenousZones: any[] = []
  for (const m of content.matchAll(/\[EROGENOUS\](.*?)\[\/EROGENOUS\]/gs)) {
    const p = safeParseJSON(m[1].trim(), 'EROGENOUS')
    if (p?.zone) erogenousZones.push(p)
  }

  // SEX_CHOICES
  const sexChoices: any[] = []
  const sexChoicesMatch = content.match(/\[SEX_CHOICES\](.*?)\[\/SEX_CHOICES\]/s)
  if (sexChoicesMatch?.[1]) {
    const parsed = safeParseJSON(sexChoicesMatch[1].trim(), 'SEX_CHOICES')
    if (parsed?.options && Array.isArray(parsed.options)) sexChoices.push(...parsed.options)
  }

  // SEX_SCENE_END
  let sceneSummary: any = null
  const sexEndMatch = content.match(/\[SEX_SCENE_END\](.*?)\[\/SEX_SCENE_END\]/s)
  if (sexEndMatch?.[1]) {
    sceneSummary = safeParseJSON(sexEndMatch[1].trim(), 'SEX_SCENE_END')
  }

  // PENIS_STATS — clamp to race canon (Тане 16 см, кентавр 40–55, вузол гієноїда…)
  let penisStats: any = null
  const penisMatch = content.match(/\[PENIS_STATS\](.*?)\[\/PENIS_STATS\]/s)
  if (penisMatch?.[1]) {
    const raw = safeParseJSON(penisMatch[1].trim(), 'PENIS_STATS')
    if (raw && typeof raw === 'object') {
      penisStats = sanitizePenisStats(raw as any) ?? raw
    }
  }

  // SCENE_MOOD
  let sceneMood: any = null
  const moodMatches = [...content.matchAll(/\[SCENE_MOOD\](.*?)\[\/SCENE_MOOD\]/gs)]
  if (moodMatches.length > 0) {
    sceneMood = safeParseJSON(moodMatches[moodMatches.length - 1][1].trim(), 'SCENE_MOOD')
  }

  // LARA_DIALOGUE
  const laraDialogue: any[] = []
  const laraDialogueMatch = content.match(/\[LARA_DIALOGUE\](.*?)\[\/LARA_DIALOGUE\]/s)
  if (laraDialogueMatch?.[1]) {
    const parsed = safeParseJSON(laraDialogueMatch[1].trim(), 'LARA_DIALOGUE')
    if (parsed?.options && Array.isArray(parsed.options)) laraDialogue.push(...parsed.options)
  }

  // MULTI_ORGASM
  let multiOrgasm: any = null
  const multiOrgasmMatch = content.match(/\[MULTI_ORGASM\](.*?)\[\/MULTI_ORGASM\]/s)
  if (multiOrgasmMatch?.[1]) {
    multiOrgasm = safeParseJSON(multiOrgasmMatch[1].trim(), 'MULTI_ORGASM')
  }

  // KINK_TRIGGER — { key, xp? } or array
  const kinkTriggers: Array<{ key: string; xp?: number }> = []
  for (const m of content.matchAll(/\[KINK_TRIGGER\](.*?)\[\/KINK_TRIGGER\]/gs)) {
    const p = safeParseJSON(m[1].trim(), 'KINK_TRIGGER')
    if (!p) continue
    if (Array.isArray(p)) {
      for (const item of p) {
        if (item?.key) kinkTriggers.push({ key: String(item.key), xp: item.xp })
      }
    } else if (p.key) {
      kinkTriggers.push({ key: String(p.key), xp: p.xp })
    }
  }

  return { stat: statUpdate, inv: invUpdates, rel: relUpdates, quest: questUpdates, diary: diaryUpdates, skill: skillUpdates, tribe: tribeUpdates, achievement: achievements, disease: diseaseUpdates, facts, choices, diceRolls, sexScene, phase, pleasure, stamina, combo, domination, reactions, erogenousZones, sexChoices, sceneSummary, sceneMood, laraDialogue, multiOrgasm, penisStats, kinkTriggers }
}


export function cleanDisplayContent(content: string): string {
  return content
    .replace(/\[STAT_UPDATE\].*?\[\/STAT_UPDATE\]/gs, '')
    .replace(/\[REL_UPDATE\].*?\[\/REL_UPDATE\]/gs, '')
    .replace(/\[INV_UPDATE\].*?\[\/INV_UPDATE\]/gs, '')
    .replace(/\[QUEST_UPDATE\].*?\[\/QUEST_UPDATE\]/gs, '')
    .replace(/\[DIARY_UPDATE\].*?\[\/DIARY_UPDATE\]/gs, '')
    .replace(/\[SKILL_UPDATE\].*?\[\/SKILL_UPDATE\]/gs, '')
    .replace(/\[TRIBE_UPDATE\].*?\[\/TRIBE_UPDATE\]/gs, '')
    .replace(/\[ACHIEVEMENT\].*?\[\/ACHIEVEMENT\]/gs, '')
    .replace(/\[DISEASE_ADD\].*?\[\/DISEASE_ADD\]/gs, '')
    .replace(/\[DISEASE_REMOVE\].*?\[\/DISEASE_REMOVE\]/gs, '')
    .replace(/\[FACT_ADD\].*?\[\/FACT_ADD\]/gs, '')
    .replace(/\[FACT_REMOVE\].*?\[\/FACT_REMOVE\]/gs, '')
    .replace(/\[CHOICES\].*?\[\/CHOICES\]/gs, '')
    .replace(/\[DICE_ROLL\].*?\[\/DICE_ROLL\]/gs, '')
    .replace(/\[SEX_SCENE_START\].*?\[\/SEX_SCENE_START\]/gs, '')
    .replace(/\[PHASE\].*?\[\/PHASE\]/gs, '')
    .replace(/\[PLEASURE\].*?\[\/PLEASURE\]/gs, '')
    .replace(/\[STAMINA\].*?\[\/STAMINA\]/gs, '')
    .replace(/\[COMBO\].*?\[\/COMBO\]/gs, '')
    .replace(/\[DOMINATION\].*?\[\/DOMINATION\]/gs, '')
    .replace(/\[REACTION\].*?\[\/REACTION\]/gs, '')
    .replace(/\[EROGENOUS\].*?\[\/EROGENOUS\]/gs, '')
    .replace(/\[SEX_CHOICES\].*?\[\/SEX_CHOICES\]/gs, '')
    .replace(/\[SEX_SCENE_END\].*?\[\/SEX_SCENE_END\]/gs, '')
    .replace(/\[SCENE_MOOD\].*?\[\/SCENE_MOOD\]/gs, '')
    .replace(/\[LARA_DIALOGUE\].*?\[\/LARA_DIALOGUE\]/gs, '')
    .replace(/\[MULTI_ORGASM\].*?\[\/MULTI_ORGASM\]/gs, '')
    .replace(/\[PENIS_STATS\].*?\[\/PENIS_STATS\]/gs, '')
    .replace(/\[KINK_TRIGGER\].*?\[\/KINK_TRIGGER\]/gs, '')
    .trim()
}

