/** Build a compact turn log of applied tags for dev/debug UI. */

export type TagLog = {
  mode?: string
  counts: Record<string, number>
  statKeys: string[]
  relNames: string[]
  facts: string[]
  dice: number
  choices: number
  notes: string[]
}

export function buildTagLog(input: {
  mode?: string
  merged: {
    stat?: any
    rel?: any[]
    inv?: any[]
    quest?: any[]
    diary?: any[]
    skill?: any[]
    tribe?: any[]
    achievement?: any[]
    disease?: any[]
    facts?: any[]
    choices?: string[]
    diceRolls?: any[]
    sexScene?: any
  }
  completedQuests?: string[]
  timeTick?: { phaseAdvanced?: boolean; newDay?: boolean; turnCount?: number }
}): TagLog {
  const m = input.merged
  const counts: Record<string, number> = {}
  const bump = (k: string, n = 1) => {
    counts[k] = (counts[k] || 0) + n
  }

  if (m.stat && Object.keys(m.stat).length) bump('STAT', 1)
  if (m.rel?.length) bump('REL', m.rel.length)
  if (m.inv?.length) bump('INV', m.inv.length)
  if (m.quest?.length) bump('QUEST', m.quest.length)
  if (m.diary?.length) bump('DIARY', m.diary.length)
  if (m.skill?.length) bump('SKILL', m.skill.length)
  if (m.tribe?.length) bump('TRIBE', m.tribe.length)
  if (m.achievement?.length) bump('ACHIEVEMENT', m.achievement.length)
  if (m.disease?.length) bump('DISEASE', m.disease.length)
  if (m.facts?.length) bump('FACT', m.facts.length)
  if (m.diceRolls?.length) bump('DICE', m.diceRolls.length)
  if (m.choices?.length) bump('CHOICES', m.choices.length)
  if (m.sexScene) bump('SEX_SCENE', 1)

  const notes: string[] = []
  if (input.completedQuests?.length) {
    notes.push(`quests done: ${input.completedQuests.join(', ')}`)
  }
  if (input.timeTick?.newDay) notes.push('new day')
  else if (input.timeTick?.phaseAdvanced) notes.push('time phase advanced')
  if (input.timeTick?.turnCount != null) notes.push(`turn #${input.timeTick.turnCount}`)

  return {
    mode: input.mode,
    counts,
    statKeys: m.stat ? Object.keys(m.stat).filter((k) => m.stat[k] !== undefined) : [],
    relNames: (m.rel || []).map((r) => r?.name).filter(Boolean),
    facts: (m.facts || []).map((f) => f?.key || f?.name).filter(Boolean),
    dice: m.diceRolls?.length || 0,
    choices: m.choices?.length || 0,
    notes,
  }
}
