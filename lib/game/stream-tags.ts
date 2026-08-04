/** Pure helpers for client-side stream tag stripping / discovery. */

export type StreamTagType =
  | 'stat'
  | 'rel'
  | 'inv'
  | 'quest'
  | 'diary'
  | 'skill'
  | 'tribe'
  | 'achievement'
  | 'disease_add'
  | 'disease_remove'
  | 'dice_roll'
  | 'sex_scene_start'
  | 'phase'
  | 'pleasure'
  | 'stamina'
  | 'combo'
  | 'domination'
  | 'reaction'
  | 'erogenous'
  | 'sex_choices'
  | 'sex_scene_end'
  | 'scene_mood'
  | 'lara_dialogue'
  | 'multi_orgasm'
  | 'penis_stats'

export interface CompleteStreamTag {
  type: StreamTagType
  json: string
}

const COMPLETE_TAG_PATTERNS: { pattern: RegExp; type: StreamTagType }[] = [
  { pattern: /\[STAT_UPDATE\](.*?)\[\/STAT_UPDATE\]/gs, type: 'stat' },
  { pattern: /\[REL_UPDATE\](.*?)\[\/REL_UPDATE\]/gs, type: 'rel' },
  { pattern: /\[INV_UPDATE\](.*?)\[\/INV_UPDATE\]/gs, type: 'inv' },
  { pattern: /\[QUEST_UPDATE\](.*?)\[\/QUEST_UPDATE\]/gs, type: 'quest' },
  { pattern: /\[DIARY_UPDATE\](.*?)\[\/DIARY_UPDATE\]/gs, type: 'diary' },
  { pattern: /\[SKILL_UPDATE\](.*?)\[\/SKILL_UPDATE\]/gs, type: 'skill' },
  { pattern: /\[TRIBE_UPDATE\](.*?)\[\/TRIBE_UPDATE\]/gs, type: 'tribe' },
  { pattern: /\[ACHIEVEMENT\](.*?)\[\/ACHIEVEMENT\]/gs, type: 'achievement' },
  { pattern: /\[DISEASE_ADD\](.*?)\[\/DISEASE_ADD\]/gs, type: 'disease_add' },
  { pattern: /\[DISEASE_REMOVE\](.*?)\[\/DISEASE_REMOVE\]/gs, type: 'disease_remove' },
  { pattern: /\[DICE_ROLL\](.*?)\[\/DICE_ROLL\]/gs, type: 'dice_roll' },
  { pattern: /\[SEX_SCENE_START\](.*?)\[\/SEX_SCENE_START\]/gs, type: 'sex_scene_start' },
  { pattern: /\[PHASE\](.*?)\[\/PHASE\]/gs, type: 'phase' },
  { pattern: /\[PLEASURE\](.*?)\[\/PLEASURE\]/gs, type: 'pleasure' },
  { pattern: /\[STAMINA\](.*?)\[\/STAMINA\]/gs, type: 'stamina' },
  { pattern: /\[COMBO\](.*?)\[\/COMBO\]/gs, type: 'combo' },
  { pattern: /\[DOMINATION\](.*?)\[\/DOMINATION\]/gs, type: 'domination' },
  { pattern: /\[REACTION\](.*?)\[\/REACTION\]/gs, type: 'reaction' },
  { pattern: /\[EROGENOUS\](.*?)\[\/EROGENOUS\]/gs, type: 'erogenous' },
  { pattern: /\[SEX_CHOICES\](.*?)\[\/SEX_CHOICES\]/gs, type: 'sex_choices' },
  { pattern: /\[SEX_SCENE_END\](.*?)\[\/SEX_SCENE_END\]/gs, type: 'sex_scene_end' },
  { pattern: /\[SCENE_MOOD\](.*?)\[\/SCENE_MOOD\]/gs, type: 'scene_mood' },
  { pattern: /\[LARA_DIALOGUE\](.*?)\[\/LARA_DIALOGUE\]/gs, type: 'lara_dialogue' },
  { pattern: /\[MULTI_ORGASM\](.*?)\[\/MULTI_ORGASM\]/gs, type: 'multi_orgasm' },
  { pattern: /\[PENIS_STATS\](.*?)\[\/PENIS_STATS\]/gs, type: 'penis_stats' },
]

const TAG_NAMES = [
  'STAT_UPDATE', 'REL_UPDATE', 'INV_UPDATE', 'QUEST_UPDATE', 'DIARY_UPDATE', 'SKILL_UPDATE',
  'TRIBE_UPDATE', 'ACHIEVEMENT', 'DISEASE_ADD', 'DISEASE_REMOVE', 'FACT_ADD', 'FACT_REMOVE',
  'CHOICES', 'DICE_ROLL', 'SEX_SCENE_START', 'PHASE', 'PLEASURE', 'STAMINA', 'COMBO',
  'DOMINATION', 'REACTION', 'EROGENOUS', 'SEX_CHOICES', 'SEX_SCENE_END', 'SCENE_MOOD',
  'LARA_DIALOGUE', 'MULTI_ORGASM', 'PENIS_STATS',
]

/** Remove complete and trailing incomplete game tags from streamed text. */
export function stripAllTags(text: string): string {
  let out = text
  for (const name of TAG_NAMES) {
    out = out.replace(new RegExp(`\\[${name}\\].*?\\[\\/${name}\\]`, 'gs'), '')
  }
  for (const name of TAG_NAMES) {
    out = out.replace(new RegExp(`\\[${name}\\].*`, 'gs'), '')
  }
  return out.trim()
}

export function collectCompleteTags(accumulated: string): CompleteStreamTag[] {
  const tags: CompleteStreamTag[] = []
  for (const { pattern, type } of COMPLETE_TAG_PATTERNS) {
    pattern.lastIndex = 0
    for (const m of accumulated.matchAll(pattern)) {
      tags.push({ type, json: (m[1] ?? '').trim() })
    }
  }
  return tags
}

export function safeParseJSON(str: string): unknown {
  try {
    return JSON.parse(str)
  } catch {
    return null
  }
}
