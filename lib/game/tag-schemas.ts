import { z } from 'zod'
import {
  SKILL_NAMES,
  VALID_ATTITUDES,
  VALID_MOODS,
  VALID_SEASONS,
  VALID_TIMES,
  VALID_TRIBES,
  VALID_WEATHER,
} from '@/lib/game/constants'

/** Coerce + clamp (AI often sends out-of-range values). */
const num = (min: number, max: number) =>
  z.coerce
    .number()
    .finite()
    .transform((n) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min)))

const oneOf = (allowed: readonly string[]) =>
  z.string().refine((s) => allowed.includes(s), { message: 'invalid enum' })

export const StatUpdateSchema = z
  .object({
    strength: num(1, 20).optional(),
    agility: num(1, 20).optional(),
    endurance: num(1, 20).optional(),
    charisma: num(1, 20).optional(),
    willpower: num(1, 20).optional(),
    desire: num(0, 100).optional(),
    shame: num(0, 100).optional(),
    confidence: num(0, 100).optional(),
    hunger: num(0, 100).optional(),
    thirst: num(0, 100).optional(),
    amuletEnergy: num(0, 9999).optional(),
    dayNumber: num(1, 9999).optional(),
    pregnancyWeek: num(0, 40).optional(),
    turnCount: num(0, 999999).optional(),
    location: z.string().min(1).max(120).optional(),
    isPregnant: z.boolean().optional(),
    pregnancyFather: z.union([z.string().max(80), z.null()]).optional(),
    isDarkLara: z.boolean().optional(),
    timeOfDay: oneOf(VALID_TIMES).optional(),
    mood: oneOf(VALID_MOODS).optional(),
    weather: oneOf(VALID_WEATHER).optional(),
    season: oneOf(VALID_SEASONS).optional(),
    companionName: z.union([z.string().max(80), z.null()]).optional(),
    companionBonus: z.union([z.string().max(120), z.null()]).optional(),
    clothing: z.string().max(120).optional(),
    bodyPaint: z.union([z.string().max(120), z.null()]).optional(),
    accessories: z.union([z.string().max(120), z.null()]).optional(),
    chapter: z.string().max(40).optional(),
    chapterLabel: z.string().max(80).optional(),
    endingPath: z.union([z.string().max(40), z.null()]).optional(),
  })
  .passthrough()

export const RelUpdateSchema = z.object({
  name: z.string().min(1).max(80),
  bond: num(0, 10).optional(),
  tribe: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
  met: z.boolean().optional(),
  personality: z.string().max(500).optional(),
  archetype: z.string().max(100).optional(),
  attitude: oneOf(VALID_ATTITUDES).optional(),
  trust: num(0, 100).optional(),
  fear: num(0, 100).optional(),
  respect: num(0, 100).optional(),
})

export const InvUpdateSchema = z.object({
  action: z.enum(['add', 'remove', 'update']).optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  quantity: num(1, 999).optional(),
  category: z.string().max(40).optional(),
})

export const QuestUpdateSchema = z.object({
  action: z.enum(['add', 'complete', 'fail', 'update']).optional(),
  title: z.string().min(1).max(160),
  description: z.string().max(800).optional(),
  givenBy: z.string().max(80).optional(),
})

export const DiaryUpdateSchema = z.object({
  title: z.string().max(160).optional(),
  content: z.string().min(1).max(5000),
})

export const SkillUpdateSchema = z
  .object({
    name: z.string().min(1),
    xp: num(1, 500),
  })
  .refine((d) => (SKILL_NAMES as readonly string[]).includes(d.name), {
    message: 'unknown skill',
  })

export const TribeUpdateSchema = z
  .object({
    tribe: z.string().min(1),
    change: num(-100, 100),
  })
  .refine((d) => (VALID_TRIBES as readonly string[]).includes(d.tribe), {
    message: 'unknown tribe',
  })

export const AchievementSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  icon: z.string().max(16).optional(),
})

export const DiseaseSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(400).optional(),
  source: z.string().max(120).optional(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  effects: z.string().max(300).optional(),
  duration: z.coerce.number().optional(),
  curedBy: z.string().max(200).optional(),
  _action: z.enum(['add', 'remove']).optional(),
})

export const FactSchema = z
  .object({
    key: z.string().min(1).max(80).optional(),
    name: z.string().min(1).max(80).optional(),
    category: z.string().max(40).optional(),
    content: z.string().max(1000).optional(),
    _action: z.enum(['add', 'remove']).optional(),
  })
  .refine((d) => Boolean(d.key || d.name), { message: 'key required' })

export const DiceSchema = z.object({
  skill: z.string().max(80).optional(),
  stat: z.string().max(80).optional(),
  dc: num(1, 30).optional(),
  bonus: num(-5, 15).optional(),
  description: z.string().max(200).optional(),
  roll: num(1, 20).optional(),
  total: num(-10, 50).optional(),
  result: z.string().optional(),
  keepRoll: z.boolean().optional(),
})

export function parseWithSchema<T>(
  schema: z.ZodType<T>,
  raw: unknown,
  label: string
): T | null {
  const r = schema.safeParse(raw)
  if (!r.success) {
    console.warn(
      `[zod:${label}]`,
      r.error.issues
        .slice(0, 3)
        .map((i) => i.message)
        .join('; ')
    )
    return null
  }
  return r.data
}

/** Soft-parse STAT: drop invalid keys instead of rejecting whole object. */
export function sanitizeStatUpdate(raw: unknown): Record<string, any> {
  if (!raw || typeof raw !== 'object') return {}
  const r = StatUpdateSchema.safeParse(raw)
  if (r.success) {
    const out: Record<string, any> = {}
    for (const [k, v] of Object.entries(r.data as any)) {
      if (v !== undefined) out[k] = v
    }
    return out
  }
  const out: Record<string, any> = {}
  const obj = raw as Record<string, any>
  for (const key of Object.keys(obj)) {
    const partial = StatUpdateSchema.safeParse({ [key]: obj[key] })
    if (partial.success && (partial.data as any)[key] !== undefined) {
      out[key] = (partial.data as any)[key]
    }
  }
  return out
}
