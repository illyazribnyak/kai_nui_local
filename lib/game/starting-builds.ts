/**
 * Starting builds from design pack (Соблазнителька / Витривала / Хитра).
 * Applied on new game after seedSkills/seedKinks.
 */

export type StartingBuildId = 'balanced' | 'seductress' | 'enduring' | 'cunning'

export type StartingBuild = {
  id: StartingBuildId
  name: string
  icon: string
  blurb: string
  /** Core 1–10 stats */
  stats: {
    strength: number
    agility: number
    endurance: number
    charisma: number
    willpower: number
    attractiveness: number
    intellect: number
    libido: number
    bodySensitivity: number
  }
  /** Skill levels to set after seed (0-skill rows already exist) */
  skills: { name: string; level: number }[]
  /** Kinks to discover + level */
  kinks: { key: string; level: number }[]
}

export const STARTING_BUILDS: StartingBuild[] = [
  {
    id: 'balanced',
    name: 'Дослідниця',
    icon: '🧭',
    blurb: 'Збалансований старт design pack (за замовчуванням).',
    stats: {
      strength: 4,
      agility: 6,
      endurance: 5,
      charisma: 7,
      willpower: 5,
      attractiveness: 7,
      intellect: 5,
      libido: 6,
      bodySensitivity: 7,
    },
    skills: [
      { name: 'Чарівний погляд', level: 1 },
      { name: "М'який вхід", level: 1 },
    ],
    kinks: [],
  },
  {
    id: 'seductress',
    name: 'Соблазнителька',
    icon: '🌹',
    blurb: 'Соціум + еротика: зваблення, орал, підкорення, знання рас.',
    stats: {
      strength: 3,
      agility: 6,
      endurance: 4,
      charisma: 8,
      willpower: 4,
      attractiveness: 9,
      intellect: 5,
      libido: 8,
      bodySensitivity: 8,
    },
    skills: [
      { name: 'Чарівний погляд', level: 2 },
      { name: 'Солодкі слова', level: 2 },
      { name: 'Поцілунки голівки', level: 1 },
      { name: 'Мінет', level: 1 },
      { name: "М'який вхід", level: 1 },
      { name: 'Покірність', level: 2 },
      { name: 'Знання рас', level: 1 },
      { name: 'Контроль тіла', level: 1 },
    ],
    kinks: [
      { key: 'praise', level: 1 },
      { key: 'service', level: 1 },
      { key: 'creampie', level: 1 },
    ],
  },
  {
    id: 'enduring',
    name: 'Витривала',
    icon: '🔥',
    blurb: 'Тіло й розмір: витривалість, size play, анал, бій.',
    stats: {
      strength: 6,
      agility: 5,
      endurance: 8,
      charisma: 5,
      willpower: 7,
      attractiveness: 6,
      intellect: 4,
      libido: 6,
      bodySensitivity: 5,
    },
    skills: [
      { name: 'Тривала насолода', level: 2 },
      { name: 'Невтомність', level: 1 },
      { name: 'Гра з розміром', level: 2 },
      { name: 'Анальна підготовка', level: 1 },
      { name: 'Анал', level: 1 },
      { name: 'Вагінальна місткість', level: 1 },
      { name: 'Бій без зброї', level: 1 },
      { name: 'Витривалість у бою', level: 1 },
    ],
    kinks: [
      { key: 'size', level: 2 },
      { key: 'monster', level: 1 },
      { key: 'pain', level: 1 },
    ],
  },
  {
    id: 'cunning',
    name: 'Хитра',
    icon: '🎭',
    blurb: 'Розум і маніпуляції: знання рас, обман, зваблення, домінування.',
    stats: {
      strength: 3,
      agility: 7,
      endurance: 4,
      charisma: 7,
      willpower: 6,
      attractiveness: 7,
      intellect: 8,
      libido: 5,
      bodySensitivity: 6,
    },
    skills: [
      { name: 'Знання рас', level: 2 },
      { name: 'Обман', level: 2 },
      { name: 'Чарівний погляд', level: 1 },
      { name: 'Солодкі слова', level: 1 },
      { name: 'Владний голос', level: 1 },
      { name: 'Етикет', level: 1 },
      { name: 'Торгівля', level: 1 },
    ],
    kinks: [
      { key: 'control', level: 1 },
      { key: 'degrade', level: 1 },
      { key: 'public', level: 1 },
    ],
  },
]

export function getStartingBuild(id: string | null | undefined): StartingBuild {
  return STARTING_BUILDS.find((b) => b.id === id) || STARTING_BUILDS[0]
}

const maxXpByLevel = [100, 150, 225, 350, 500]

/** Apply build stats/skills/kinks to DB after full seed. */
export async function applyStartingBuild(buildId: string | null | undefined): Promise<StartingBuild> {
  const { prisma } = await import('@/lib/db')
  const build = getStartingBuild(buildId)

  await prisma.gameState.update({
    where: { id: 'singleton' },
    data: {
      ...build.stats,
      desire: 0,
      shame: 0,
      confidence: 50,
      hunger: 20,
      thirst: 20,
    },
  })

  for (const s of build.skills) {
    const level = Math.min(5, Math.max(0, Math.floor(s.level)))
    if (level <= 0) continue
    const maxXp = maxXpByLevel[Math.min(level, 4)] ?? 100
    await prisma.skill
      .update({
        where: { name: s.name },
        data: { level, xp: 0, maxXp },
      })
      .catch(() => {
        /* unknown skill name — skip */
      })
  }

  for (const k of build.kinks) {
    const level = Math.min(5, Math.max(1, Math.floor(k.level)))
    const maxXp = maxXpByLevel[Math.min(level, 4)] ?? 100
    await prisma.kink
      .update({
        where: { key: k.key },
        data: { level, xp: 0, maxXp, discovered: true },
      })
      .catch(() => {
        /* ignore */
      })
  }

  return build
}
