import { prisma } from '@/lib/db'
import {
  CANON_NPC_PROFILES,
  serializeKinks,
  type NpcProfileSeed,
} from '@/lib/game/npc-profile'

function toCreateData(npc: NpcProfileSeed) {
  return {
    name: npc.name,
    bond: npc.bond ?? 0,
    tribe: npc.tribe,
    notes: npc.notes,
    met: false,
    personality: npc.personality,
    archetype: npc.archetype,
    attitude: npc.attitude,
    trust: npc.trust,
    fear: npc.fear,
    respect: npc.respect,
    location: npc.location,
    metOnDay: 0,
    strength: npc.stats.strength,
    agility: npc.stats.agility,
    endurance: npc.stats.endurance,
    charisma: npc.stats.charisma,
    willpower: npc.stats.willpower,
    dominance: npc.stats.dominance,
    libido: npc.stats.libido,
    kinksJson: serializeKinks(npc.kinks),
  }
}

/** Canon cast — pre-seeded, met:false until player meets them. */
export async function seedCanonNpcs() {
  for (const npc of CANON_NPC_PROFILES) {
    const data = toCreateData(npc)
    await prisma.relationship.upsert({
      where: { name: npc.name },
      update: {
        // Fill empty lore / stats without wiping progress (met, bond, trust…)
        tribe: npc.tribe,
        notes: npc.notes,
        personality: npc.personality,
        archetype: npc.archetype,
        location: npc.location,
        // Only assign combat/sex profile if never set (strength 0)
        // Prisma can't do conditional easily — we check after
      },
      create: data,
    })

    // Patch stats/kinks for existing rows that lack them
    const existing = await prisma.relationship.findUnique({ where: { name: npc.name } })
    if (existing && (existing.strength == null || existing.strength <= 0)) {
      await prisma.relationship.update({
        where: { name: npc.name },
        data: {
          strength: npc.stats.strength,
          agility: npc.stats.agility,
          endurance: npc.stats.endurance,
          charisma: npc.stats.charisma,
          willpower: npc.stats.willpower,
          dominance: npc.stats.dominance,
          libido: npc.stats.libido,
          kinksJson: serializeKinks(npc.kinks),
        },
      })
    } else if (existing && (!existing.kinksJson || existing.kinksJson === '{}')) {
      await prisma.relationship.update({
        where: { name: npc.name },
        data: { kinksJson: serializeKinks(npc.kinks) },
      })
    }
  }
}
