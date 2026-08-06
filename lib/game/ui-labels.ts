/** Pure UI label helpers (no React) — shared by client + tests. */

export function formatMessageHtml(content: string): string {
  if (!content) return ''
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
}

export function getDesireColor(desire: number): string {
  const d = desire ?? 0
  if (d <= 15) return 'bg-sky-500'
  if (d <= 35) return 'bg-emerald-500'
  if (d <= 55) return 'bg-yellow-500'
  if (d <= 75) return 'bg-orange-500'
  if (d <= 90) return 'bg-red-500'
  return 'bg-red-700 animate-pulse'
}

export function getDesireLabel(desire: number): string {
  const d = desire ?? 0
  if (d <= 15) return 'Спокій'
  if (d <= 35) return 'Цікавість'
  if (d <= 55) return 'Збудження'
  if (d <= 75) return 'Жага'
  if (d <= 90) return 'Голод'
  return 'Шаленство'
}

export function getTimeOfDayEmoji(tod: string): string {
  switch (tod) {
    case 'morning': return '🌅'
    case 'day': return '☀️'
    case 'evening': return '🌇'
    case 'night': return '🌙'
    default: return '☀️'
  }
}

export function getTimeOfDayLabel(tod: string): string {
  switch (tod) {
    case 'morning': return 'Ранок'
    case 'day': return 'День'
    case 'evening': return 'Вечір'
    case 'night': return 'Ніч'
    default: return 'День'
  }
}

export function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'happy': return '😊'
    case 'neutral': return '😐'
    case 'sad': return '😢'
    case 'scared': return '😨'
    case 'aroused': return '🥵'
    case 'angry': return '😠'
    case 'exhausted': return '😵'
    default: return '😐'
  }
}

export function getMoodLabel(mood: string): string {
  switch (mood) {
    case 'happy': return 'Щаслива'
    case 'neutral': return 'Спокійна'
    case 'sad': return 'Сумна'
    case 'scared': return 'Налякана'
    case 'aroused': return 'Збуджена'
    case 'angry': return 'Зла'
    case 'exhausted': return 'Виснажена'
    default: return 'Спокійна'
  }
}

export function getTribeStatusLabel(status: string): string {
  switch (status) {
    case 'hostile': return 'Вороже'
    case 'unfriendly': return 'Недружнє'
    case 'neutral': return 'Нейтральне'
    case 'friendly': return 'Дружнє'
    case 'ally': return 'Союзник'
    default: return 'Нейтральне'
  }
}

export function getTribeStatusColor(status: string): string {
  switch (status) {
    case 'hostile': return 'text-red-500'
    case 'unfriendly': return 'text-orange-400'
    case 'neutral': return 'text-gray-400'
    case 'friendly': return 'text-emerald-400'
    case 'ally': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

export function getHungerColor(val: number): string {
  if (val <= 30) return 'bg-emerald-500'
  if (val <= 60) return 'bg-yellow-500'
  if (val <= 80) return 'bg-orange-500'
  return 'bg-red-500 animate-pulse'
}

export const QUICK_ACTIONS = [
  { label: '👀 Оглянутися', text: 'Оглянутися навколо' },
  { label: '🚶 Йти далі', text: 'Йти далі углиб острова' },
  { label: '🍎 Шукати їжу', text: 'Пошукати їжу та воду' },
  { label: '🛡️ Оборона', text: 'Підготувати оборону' },
  { label: '💬 Говорити', text: 'Поговорити з NPC поруч' },
  { label: '🔨 Майструвати', text: 'Спробувати створити щось з наявних ресурсів' },
  { label: '💎 Амулет', text: 'Перевірити амулет на шиї' },
] as const

export const DEFAULT_TURN_CHOICES = [
  'Оглянутися навколо',
  'Йти далі',
  'Пошукати їжу та воду',
  'Перевірити амулет',
] as const

export function createDefaultGameState(overrides: Record<string, any> = {}) {
  return {
    id: 'singleton',
    strength: 4,
    agility: 6,
    endurance: 5,
    charisma: 7,
    willpower: 5,
    attractiveness: 7,
    intellect: 5,
    libido: 6,
    bodySensitivity: 7,
    bodyProfileJson: '',
    desire: 0,
    shame: 0,
    confidence: 50,
    location: 'Берег острова',
    isPregnant: false,
    pregnancyWeek: 0,
    pregnancyFather: null,
    amuletEnergy: 0,
    dayNumber: 1,
    isDarkLara: false,
    gameStarted: true,
    hunger: 20,
    thirst: 20,
    timeOfDay: 'day',
    mood: 'neutral',
    weather: 'clear',
    season: 'wet',
    companionName: null,
    companionBonus: null,
    clothing: 'клапті одягу',
    bodyPaint: null,
    accessories: null,
    chapter: 'arrival',
    chapterLabel: 'Прибуття',
    endingPath: null,
    turnCount: 0,
    ...overrides,
  }
}

export function buildSurvivalWarnings(
  hunger: number,
  thirst: number,
  diseaseNames: string[]
): string[] {
  const warnings: string[] = []
  if (thirst >= 80) warnings.push('Спрага критична')
  else if (thirst >= 60) warnings.push('Сильна спрага')
  if (hunger >= 80) warnings.push('Голод критичний')
  else if (hunger >= 60) warnings.push('Сильний голод')
  if (diseaseNames.length > 0) warnings.push(`Хвороби: ${diseaseNames.join(', ')}`)
  return warnings
}
