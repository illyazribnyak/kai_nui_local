import { prisma } from '@/lib/db'
import { seedQuestLadder } from '@/lib/game/quest-ladder'

export async function seedStarterQuests() {
  await seedQuestLadder()
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
  {
    key: 'canon_cast',
    category: 'world',
    content: 'Канонічні постаті острова: Тане, Лея, Джек Вейн, вождь Макаї, шаманка Найя, дух Араху.',
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
