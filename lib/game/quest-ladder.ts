import { prisma } from '@/lib/db'

/**
 * Story quest ladder tied to chapters.
 * Completing location/facts unlocks the next active quest.
 */
export const QUEST_LADDER = [
  {
    title: 'Вижити на березі',
    description: 'Знайти прісну воду й щось їстівне. Не померти в перший день.',
    chapter: 'arrival',
    givenBy: 'Система',
    completeWhen: {
      locations: ['водоспад', 'лагуна', 'джунгл'],
      factKeys: ['found_fresh_water', 'found_food', 'entered_jungle'],
      inventoryCategories: ['їжа'],
    },
  },
  {
    title: 'Увійти в джунглі',
    description: 'Залишити берег і просунутись углиб острова.',
    chapter: 'jungle',
    givenBy: 'Система',
    completeWhen: {
      locations: ['джунгл', 'водоспад', 'мангров'],
      factKeys: ['entered_jungle'],
    },
  },
  {
    title: 'Знайти людей острова',
    description: 'Знайти сліди племені Кай-Тору або інших мешканців.',
    chapter: 'tribe',
    givenBy: 'Система',
    completeWhen: {
      locations: ['кай-тору', 'селищ'],
      factKeys: ['met_kai_toru', 'entered_village', 'met_tane', 'met_leya'],
      metNpc: ['Тане', 'Лея', 'Макаї', 'Найя'],
    },
  },
  {
    title: 'Зрозуміти амулет',
    description: 'Дізнатися, чому амулет теплішає і як він пов\'язаний зі Скарбом Атлантів.',
    chapter: 'depths',
    givenBy: 'Система',
    completeWhen: {
      factKeys: ['amulet_awakened', 'learned_amulet_secret', 'spoke_with_naya'],
      locations: ['храм', 'свяще', 'печер', 'руїн'],
    },
  },
  {
    title: 'Шлях до храму',
    description: 'Дістатися храму насолоди / центрального святилища острова.',
    chapter: 'temple',
    givenBy: 'Система',
    completeWhen: {
      locations: ['храм'],
      factKeys: ['found_temple', 'temple_opened'],
    },
  },
  {
    title: 'Скарб Атлантів',
    description: 'Знайти артефакт і зробити вибір — свобода, влада чи руйнування.',
    chapter: 'climax',
    givenBy: 'Система',
    completeWhen: {
      factKeys: ['treasure_found', 'ending_freedom', 'ending_priestess', 'ending_goddess', 'ending_destroyer', 'ending_dark_queen'],
    },
  },
] as const

export async function seedQuestLadder() {
  for (const q of QUEST_LADDER) {
    const existing = await prisma.quest.findUnique({ where: { title: q.title } })
    if (!existing) {
      // Only first quest starts active; rest locked as active but "pending" via description order
      // Simpler: all active, auto-complete advances narrative
      await prisma.quest.create({
        data: {
          title: q.title,
          description: q.description,
          status: q.title === QUEST_LADDER[0].title ? 'active' : 'active',
          givenBy: q.givenBy,
        },
      })
    }
  }
}

function matchesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase()
  return needles.some((n) => h.includes(n.toLowerCase()))
}

/** Auto-complete ladder quests from current world state. Returns newly completed titles. */
export async function syncQuestLadder(): Promise<string[]> {
  const state = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
  const locations = await prisma.location.findMany()
  const facts = await prisma.worldFact.findMany()
  const rels = await prisma.relationship.findMany({ where: { met: true } })
  const inventory = await prisma.inventoryItem.findMany()
  const quests = await prisma.quest.findMany()

  const factKeys = new Set(facts.map((f) => f.key.toLowerCase()))
  const metNames = new Set(rels.map((r) => r.name.toLowerCase()))
  const discoveredLocs = locations.filter((l) => l.discovered || l.isCurrent)
  const currentLoc = state?.location ?? ''
  const completedNow: string[] = []

  for (const step of QUEST_LADDER) {
    const quest = quests.find((q) => q.title === step.title)
    if (!quest || quest.status === 'completed') continue

    const cw = step.completeWhen as {
      locations?: readonly string[]
      factKeys?: readonly string[]
      metNpc?: readonly string[]
      inventoryCategories?: readonly string[]
    }

    let done = false

    if (cw.locations?.length) {
      if (matchesAny(currentLoc, [...cw.locations])) done = true
      if (discoveredLocs.some((l) => matchesAny(l.name, [...cw.locations!]))) done = true
    }
    if (cw.factKeys?.length) {
      if (cw.factKeys.some((k) => factKeys.has(k.toLowerCase()))) done = true
    }
    if (cw.metNpc?.length) {
      if (cw.metNpc.some((n) => metNames.has(n.toLowerCase()))) done = true
    }
    if (cw.inventoryCategories?.length) {
      if (inventory.some((i) => cw.inventoryCategories!.some((c) => (i.category || '').includes(c) || (i.name || '').toLowerCase().includes('вод') || (i.name || '').toLowerCase().includes('фрукт') || (i.name || '').toLowerCase().includes('їж')))) {
        done = true
      }
    }

    if (done) {
      await prisma.quest.update({
        where: { title: step.title },
        data: { status: 'completed' },
      })
      completedNow.push(step.title)
    }
  }

  return completedNow
}
