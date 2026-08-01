export interface GameState {
  id: string
  strength: number
  agility: number
  endurance: number
  charisma: number
  willpower: number
  desire: number
  shame: number
  confidence: number
  hunger: number
  thirst: number
  location: string
  timeOfDay: string
  mood: string
  isPregnant: boolean
  pregnancyWeek: number
  pregnancyFather: string | null
  amuletEnergy: number
  dayNumber: number
  isDarkLara: boolean
  gameStarted: boolean
  weather: string
  season: string
  companionName: string | null
  companionBonus: string | null
  clothing: string
  bodyPaint: string | null
  accessories: string | null
  chapter: string
  chapterLabel: string
  endingPath: string | null
  turnCount: number
}

export interface WorldFactData {
  id: string
  key: string
  category: string
  content: string
  dayNumber: number
}

export interface MessageData {
  id: string
  role: string
  content: string
  createdAt: string
}

export interface RelationshipData {
  id: string
  name: string
  bond: number
  tribe: string
  notes: string
  met: boolean
  personality: string
  archetype: string
  attitude: string
  metOnDay: number
  trust: number
  fear: number
  respect: number
}

export interface DiseaseData {
  id: string
  name: string
  description: string
  source: string
  severity: string
  effects: string
  duration: number
  curedBy: string
  turnsLeft: number
}

export interface StatUpdate {
  strength?: number
  agility?: number
  endurance?: number
  charisma?: number
  willpower?: number
  desire?: number
  shame?: number
  confidence?: number
  location?: string
  isPregnant?: boolean
  pregnancyWeek?: number
  pregnancyFather?: string | null
  amuletEnergy?: number
  dayNumber?: number
  isDarkLara?: boolean
  weather?: string
  season?: string
  companionName?: string | null
  companionBonus?: string | null
  clothing?: string
  bodyPaint?: string | null
  accessories?: string | null
}

export interface RelationshipUpdate {
  name: string
  bond?: number
  tribe?: string
  notes?: string
  met?: boolean
  personality?: string
  archetype?: string
  attitude?: string
  trust?: number
  fear?: number
  respect?: number
}

export interface DiseaseUpdate {
  action: 'add' | 'remove' | 'tick'
  name: string
  description?: string
  source?: string
  severity?: string
  effects?: string
  duration?: number
  curedBy?: string
}

export interface InventoryItemData {
  id: string
  name: string
  description: string
  quantity: number
  category: string
}

export interface QuestData {
  id: string
  title: string
  description: string
  status: string
  givenBy: string
}

export interface DiaryEntryData {
  id: string
  title: string
  content: string
  dayNumber: number
  createdAt: string
}

export interface InventoryUpdate {
  action: 'add' | 'remove' | 'update'
  name: string
  description?: string
  quantity?: number
  category?: string
}

export interface QuestUpdate {
  action: 'add' | 'complete' | 'fail' | 'update'
  title: string
  description?: string
  givenBy?: string
}

export interface DiaryUpdate {
  title?: string
  content: string
}

export interface SkillData {
  id: string
  name: string
  level: number
  xp: number
  maxXp: number
  category: string
  description: string
}

export interface SkillUpdate {
  name: string
  xp: number
}

export interface LocationData {
  id: string
  name: string
  description: string
  x: number
  y: number
  type: string
  discovered: boolean
  isCurrent: boolean
}

export interface TribeReputationData {
  id: string
  tribeName: string
  reputation: number
  status: string
}

export interface AchievementData {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string
}
