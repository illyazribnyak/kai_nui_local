import { prisma } from '@/lib/db'
import { KINK_CATALOG } from '@/lib/game/kink-catalog'

/** Upsert all kink definitions; never resets player level/xp if already discovered. */
export async function seedKinks() {
  for (const k of KINK_CATALOG) {
    await prisma.kink.upsert({
      where: { key: k.key },
      create: {
        key: k.key,
        name: k.name,
        description: k.description,
        icon: k.icon,
        category: k.category,
        level: 0,
        xp: 0,
        maxXp: 100,
        discovered: false,
      },
      update: {
        name: k.name,
        description: k.description,
        icon: k.icon,
        category: k.category,
      },
    })
  }
}
