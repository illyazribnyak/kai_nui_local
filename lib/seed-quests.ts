import { prisma } from '@/lib/db'

const STARTER_QUESTS = [
  {
    title: 'Вижити на березі',
    description: 'Знайти воду, їжу та зрозуміти, де ти опинилась.',
    status: 'active',
    givenBy: 'Система',
  },
  {
    title: 'Дослідити острів',
    description: 'Піти в джунглі і знайти ознаки цивілізації.',
    status: 'active',
    givenBy: 'Система',
  },
  {
    title: 'Зрозуміти амулет',
    description: 'Дізнатися, чому амулет теплішає і як він пов\'язаний зі Скарбом Атлантів.',
    status: 'active',
    givenBy: 'Система',
  },
]

export async function seedStarterQuests() {
  for (const q of STARTER_QUESTS) {
    await prisma.quest.upsert({
      where: { title: q.title },
      update: {},
      create: q,
    })
  }
}

const STARTER_FACTS = [
  {
    key: 'shipwrecked',
    category: 'plot',
    content: 'Лара зазнала корабельної аварії і опинилась на острові сама, лише з амулетом.',
    dayNumber: 1,
  },
  {
    key: 'goal_atlantis_treasure',
    category: 'plot',
    content: 'Мета: знайти легендарний Скарб Атлантів у центральному храмі острова.',
    dayNumber: 1,
  },
]

export async function seedStarterFacts() {
  for (const f of STARTER_FACTS) {
    await prisma.worldFact.upsert({
      where: { key: f.key },
      update: {},
      create: f,
    })
  }
}
