import { prisma } from '@/lib/db'
import { clamp } from '@/lib/game/json'

/** If AI forgot hunger/thirst, apply a small server-side tick. */
export function applySurvivalDefaults(
  stat: Record<string, any>,
  gameState: { hunger?: number | null; thirst?: number | null } | null
): Record<string, any> {
  const next = { ...stat }
  if (next.hunger === undefined) {
    const hInc = 3 + Math.floor(Math.random() * 3)
    next.hunger = clamp((gameState?.hunger ?? 20) + hInc, 0, 100)
  }
  if (next.thirst === undefined) {
    const tInc = 3 + Math.floor(Math.random() * 3)
    next.thirst = clamp((gameState?.thirst ?? 20) + tInc, 0, 100)
  }
  return next
}

/** Parse desire/shame/confidence from narrative prose if tags missed them. */
export function parseNarrativeStats(
  fullContent: string,
  stat: Record<string, any>
): Record<string, any> {
  const next = { ...stat }
  const desireMatch = fullContent.match(/Бажання\s*[+\-]\s*(\d+)\s*\(тепер\s*(\d+)/i)
  const shameMatch = fullContent.match(/Сором\s*[+\-]\s*(\d+)\s*\(тепер\s*(\d+)/i)
  const confMatch = fullContent.match(/Впевненість\s*[+\-]\s*(\d+)\s*\(тепер\s*(\d+)/i)

  if (next.desire === undefined && desireMatch) {
    next.desire = clamp(Number(desireMatch[2]) || 0, 0, 100)
  }
  if (next.shame === undefined && shameMatch) {
    next.shame = clamp(Number(shameMatch[2]) || 0, 0, 100)
  }
  if (next.confidence === undefined && confMatch) {
    next.confidence = clamp(Number(confMatch[2]) || 0, 0, 100)
  }
  return next
}

/** Decrement disease turnsLeft; remove expired timed diseases. */
export async function tickDiseases(): Promise<void> {
  const diseases = await prisma.disease.findMany()
  for (const d of diseases) {
    if (d.turnsLeft < 0) continue // permanent until cured
    const left = d.turnsLeft - 1
    if (left <= 0) {
      await prisma.disease.delete({ where: { id: d.id } }).catch(() => {})
    } else {
      await prisma.disease.update({ where: { id: d.id }, data: { turnsLeft: left } }).catch(() => {})
    }
  }
}
