import { prisma } from '@/lib/db'

/** Canon cast — pre-seeded, met:false until player meets them. */
const CANON_NPCS = [
  {
    name: 'Тане',
    bond: 0,
    tribe: 'Кай-Тору',
    notes: 'Молодий воїн, син/близький до вождівської лінії. Ніжний, цікавиться Ларою.',
    met: false,
    personality: 'сором\'язливий, лагідний, допитливий, традиційний, вірний',
    archetype: 'воїн',
    attitude: 'curious',
    trust: 40,
    fear: 10,
    respect: 45,
  },
  {
    name: 'Лея',
    bond: 0,
    tribe: 'Кай-Тору',
    notes: 'Жінка племені, складна історія з Джеком; має зв\'язок із Тане.',
    met: false,
    personality: 'хитра, пристрасна, ревнива, гостинна, амбіційна',
    archetype: 'танцівниця',
    attitude: 'wary',
    trust: 30,
    fear: 5,
    respect: 40,
  },
  {
    name: 'Джек Вейн',
    bond: 1,
    tribe: 'Зовнішній світ',
    notes: 'Провідник/контрабандист. Знає частину таємниць острова. Розуміє згоду.',
    met: false,
    personality: 'цинічний, практичний, стриманий, вірний слову, досвідчений',
    archetype: 'провідник',
    attitude: 'neutral',
    trust: 55,
    fear: 0,
    respect: 50,
  },
  {
    name: 'Макаї',
    bond: 0,
    tribe: 'Кай-Тору',
    notes: 'Вождь племені. Авторитетний, говорить наказами.',
    met: false,
    personality: 'домінантний, традиційний, територіальний, мудрий, жорсткий',
    archetype: 'вождь',
    attitude: 'wary',
    trust: 20,
    fear: 15,
    respect: 70,
  },
  {
    name: 'Найя',
    bond: 0,
    tribe: 'Кай-Тору',
    notes: 'Шаманка. Знає про амулет і храм більше, ніж каже.',
    met: false,
    personality: 'загадкова, мудра, маніпулятивна, духовна, терпляча',
    archetype: 'шаман',
    attitude: 'curious',
    trust: 35,
    fear: 5,
    respect: 65,
  },
  {
    name: 'Араху',
    bond: 0,
    tribe: 'Острів',
    notes: 'Дух/присутність острова — може проявлятися через амулет або видіння.',
    met: false,
    personality: 'давній, байдужий до моралі, хтивий до енергії, загадковий',
    archetype: 'дух',
    attitude: 'neutral',
    trust: 10,
    fear: 20,
    respect: 80,
  },
]

export async function seedCanonNpcs() {
  for (const npc of CANON_NPCS) {
    await prisma.relationship.upsert({
      where: { name: npc.name },
      update: {
        // Don't overwrite if already met/progressed — only fill empty personality
      },
      create: {
        ...npc,
        metOnDay: 0,
      },
    })
  }
}
