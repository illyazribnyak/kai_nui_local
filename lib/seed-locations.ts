import { prisma } from '@/lib/db'

// Координати — % від розміру карти (0-100)
const ISLAND_LOCATIONS = [
  { name: 'Берег острова', x: 75, y: 85, type: 'beach', description: 'Піщаний берег, де Лара опинилася після аварії', discovered: true },
  { name: 'Джунглі', x: 55, y: 65, type: 'jungle', description: 'Густі тропічні зарості' },
  { name: 'Водоспад у джунглях', x: 45, y: 55, type: 'water', description: 'Кришталева купіль з водоспадом' },
  { name: 'Селище Кай-Тору', x: 35, y: 45, type: 'village', description: 'Головне селище племені Кай-Тору' },
  { name: 'Печери', x: 25, y: 35, type: 'cave', description: 'Темні печери в скелях' },
  { name: 'Священна гора', x: 30, y: 20, type: 'mountain', description: 'Вулкан в центрі острова' },
  { name: 'Землі кентаврів', x: 20, y: 55, type: 'territory', description: 'Територія племені кентаврів' },
  { name: 'Болота свинолюдів', x: 65, y: 40, type: 'swamp', description: 'Смердючі болота свинолюдів' },
  { name: 'Лабіринт мінотаврів', x: 50, y: 30, type: 'ruins', description: 'Древній лабіринт під скелями' },
  { name: 'Територія гієноїдів', x: 70, y: 25, type: 'territory', description: 'Небезпечна територія гієноїдів' },
  { name: 'Храм насолоди', x: 40, y: 15, type: 'temple', description: 'Древній храм з еротичними рельєфами' },
  { name: 'Північний берег', x: 50, y: 8, type: 'beach', description: 'Дикий кам’янистий берег' },
  { name: 'Лагуна', x: 85, y: 60, type: 'water', description: 'Тиха лагуна з теплою водою' },
  { name: 'Руїни стародавнього міста', x: 15, y: 70, type: 'ruins', description: 'Залишки давньої цивілізації' },
  { name: 'Мангровий ліс', x: 80, y: 45, type: 'jungle', description: 'Мангровий ліс біля побережжя' },
]

const TRIBES = [
  { tribeName: 'Кай-Тору', reputation: 0, status: 'neutral' },
  { tribeName: 'Кентаври', reputation: 0, status: 'neutral' },
  { tribeName: 'Мінотаври', reputation: 0, status: 'neutral' },
  { tribeName: 'Свинолюди', reputation: -10, status: 'neutral' },
  { tribeName: 'Гієноїди', reputation: -20, status: 'unfriendly' },
]

export async function seedLocations() {
  const count = await prisma.location.count()
  if (count > 0) return
  await prisma.location.createMany({
    data: ISLAND_LOCATIONS.map(loc => ({
      name: loc.name,
      description: loc.description,
      x: loc.x,
      y: loc.y,
      type: loc.type,
      discovered: loc.discovered ?? false,
      isCurrent: loc.name === 'Берег острова',
    })),
  })
}

export async function seedTribes() {
  const count = await prisma.tribeReputation.count()
  if (count > 0) return
  await prisma.tribeReputation.createMany({ data: TRIBES })
}
