'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, Compass, Heart, Shield, Zap, Eye, Brain, Flame, MapPin, Swords, Baby, Gem, ChevronRight, Menu, X, Scroll, Package, BookOpen, Feather, CheckCircle, XCircle, Clock, Save, Download, Square, AlertTriangle, Upload, Undo2, MoreVertical, Target } from 'lucide-react'
import type { GameState, MessageData, RelationshipData, InventoryItemData, QuestData, DiaryEntryData, SkillData, LocationData, TribeReputationData, AchievementData, DiseaseData, WorldFactData } from '@/lib/types'
import { chapterProgressPercent, ENDING_PATHS } from '@/lib/game/chapters'
import { CHAPTER_MAP_GOALS } from '@/lib/prompt-mode'
import {
  QUICK_ACTIONS,
  buildSurvivalWarnings,
  createDefaultGameState,
  formatMessageHtml,
  getDesireColor,
  getDesireLabel,
  getHungerColor,
  getMoodEmoji,
  getMoodLabel,
  getTimeOfDayEmoji,
  getTimeOfDayLabel,
  getTribeStatusColor,
  getTribeStatusLabel,
} from '@/lib/game/ui-labels'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { getAvatar, getLaraAvatar, getTribeAvatar } from '@/lib/avatar-utils'
import Image from 'next/image'
import { DiceRollPopup, DualPleasureMeter, PhaseIndicator, StaminaBar, ComboCounter, DominationScale, PartnerReaction, SexChoiceCards, ErogenousDiscovery, ContextBonusBadges, SceneSummaryCard, SceneAtmosphere, SceneMoodIndicator, LaraDialogueCards, MultiOrgasmPopup, PenisStatsCard, TempoControlButtons } from './sex-mechanics'
import { OnboardingOverlay } from './onboarding'

type SidebarTab = 'stats' | 'inventory' | 'quests' | 'diary' | 'skills' | 'map' | 'tribes' | 'achievements' | 'characters' | 'lore'

const ATTITUDE_LABELS: Record<string, { label: string, emoji: string, color: string }> = {
  hostile: { label: 'Ворожий', emoji: '😡', color: 'text-red-500' },
  wary: { label: 'Насторожений', emoji: '😒', color: 'text-orange-400' },
  neutral: { label: 'Нейтральний', emoji: '😐', color: 'text-gray-400' },
  curious: { label: 'Зацікавлений', emoji: '🤔', color: 'text-yellow-400' },
  friendly: { label: 'Дружній', emoji: '😊', color: 'text-green-400' },
  devoted: { label: 'Відданий', emoji: '😍', color: 'text-pink-400' },
}

const SKILL_CATEGORY_NAMES: Record<string, string> = {
  seduction: '🌹 Зваблення',
  technique: '💋 Техніка',
  endurance: '🔥 Витривалість',
  domination: '⛓️ Домінування',
  submission: '🦋 Підкорення',
  body_magic: '✨ Магія тіла',
}

const INTRO_MESSAGE = `🌊 **Шторм. Темрява. Сіль на губах.**

Останній удар хвилі перевертає човен, і Лара Крафт летить у крижану безодню Тихого океану. Вода б'є в обличчя, ламає дихання, тягне на дно. Рюкзак зі спорядженням — втрачено. Зброя — на дні. Залишився лише стародавній амулет на шиї, який пульсує дивним теплом навіть у крижаній воді.

Хвилі виносять її на берег. Пісок. Теплий, білий пісок. Лара кашляє, випльовуючи солону воду, і відкриває очі.

**Острів.**

Перед нею — стіна тропічних джунглів. Повітря важке, вологе, пахне квітами та чимось... стародавнім. Амулет на грудях теплішає, його символи ледь помітно мерехтять блакитним.

Лара здіймається на ноги. Одяг порваний — від шортів та майки залишились клапті. Тіло подряпане, але нічого не зламано. Босоніж. Без зброї. Без їжі. Без зв'язку із зовнішнім світом.

Тільки амулет. І джунглі попереду.

*Хвилі позаду розбиваються об рифи. Уламки човна розкидані вздовж берега. Десь далеко в джунглях чути барабани...*

**Що робить Лара?**`

export default function GameClient() {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [relationships, setRelationships] = useState<RelationshipData[]>([])
  const [inventory, setInventory] = useState<InventoryItemData[]>([])
  const [quests, setQuests] = useState<QuestData[]>([])
  const [diary, setDiary] = useState<DiaryEntryData[]>([])
  const [skills, setSkills] = useState<SkillData[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [tribeReputations, setTribeReputations] = useState<TribeReputationData[]>([])
  const [achievements, setAchievements] = useState<AchievementData[]>([])
  const [diseases, setDiseases] = useState<DiseaseData[]>([])
  const [worldFacts, setWorldFacts] = useState<WorldFactData[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('stats')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveSlots, setSaveSlots] = useState<{slotNumber: number, name: string, updatedAt: string}[]>([])
  const [saveMode, setSaveMode] = useState<'save' | 'load'>('save')
  const [recentlyChanged, setRecentlyChanged] = useState<Set<string>>(new Set())
  const [choices, setChoices] = useState<string[]>([])
  const [sexScene, setSexScene] = useState<any>(null)
  const [pleasure, setPleasure] = useState<any>({ lara: 0, partner: 0 })
  const [diceRoll, setDiceRoll] = useState<any>(null)
  const [sceneSummary, setSceneSummary] = useState<any>(null)
  const [sexChoices, setSexChoices] = useState<any[]>([])
  const [phase, setPhase] = useState<any>(null)
  const [stamina, setStamina] = useState<any>(null)
  const [combo, setCombo] = useState<any>(null)
  const [domination, setDomination] = useState<number>(0)
  const [reactions, setReactions] = useState<any[]>([])
  const [erogenousZone, setErogenousZone] = useState<any>(null)
  const [contextBonuses, setContextBonuses] = useState<any[]>([])
  const [sceneMood, setSceneMood] = useState<any>(null)
  const [laraDialogue, setLaraDialogue] = useState<any[]>([])
  const [multiOrgasm, setMultiOrgasm] = useState<any>(null)
  const [penisStats, setPenisStats] = useState<any>(null)
  const [activeTempo, setActiveTempo] = useState<string>('medium')
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [lastPlayerMessage, setLastPlayerMessage] = useState<string | null>(null)
  const [apiKeyOk, setApiKeyOk] = useState<boolean | null>(null)
  const [apiHint, setApiHint] = useState<string>('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showHeaderMenu, setShowHeaderMenu] = useState(false)
  const [showMoreTabs, setShowMoreTabs] = useState(false)
  const [lastTagLog, setLastTagLog] = useState<any>(null)
  const [showTagLog, setShowTagLog] = useState(false)
  const [promptModeLabel, setPromptModeLabel] = useState<string | null>(null)
  const headerMenuRef = useRef<HTMLDivElement>(null)
  const processedTagsRef = useRef(0)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    chatEndRef?.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    loadGameState()
    fetch('/api/health')
      .then((r) => r.json())
      .then((h) => {
        setApiKeyOk(Boolean(h?.deepseekKey))
        setApiHint(typeof h?.hint === 'string' ? h.hint : '')
      })
      .catch(() => setApiKeyOk(null))
    try {
      if (typeof window !== 'undefined' && !localStorage.getItem('kai_nui_onboarded')) {
        setShowOnboarding(true)
      }
    } catch { /* ignore */ }
  }, [])

  const dismissOnboarding = () => {
    setShowOnboarding(false)
    try { localStorage.setItem('kai_nui_onboarded', '1') } catch { /* ignore */ }
  }

  const redoLastTurn = async () => {
    if (isLoading) return
    if (!confirm('Переграти останній хід? Стан світу відкотиться до моменту перед ним.')) return
    try {
      const res = await fetch('/api/redo-turn', { method: 'POST' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body?.error ?? 'Немає знімка')
      await loadGameState()
      const msg = body?.userMessage as string | undefined
      if (msg) {
        toast.message('Стан відкочено — повторюю хід…')
        setTimeout(() => sendMessage(msg), 120)
      } else {
        toast.success('Стан відкочено')
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Не вдалося переграти')
    }
  }

  const loadGameState = async () => {
    try {
      const res = await fetch('/api/game-state')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setGameState(data?.gameState ?? null)
      setRelationships(data?.relationships ?? [])
      setInventory(data?.inventory ?? [])
      setQuests(data?.quests ?? [])
      setDiary(data?.diary ?? [])
      setSkills(data?.skills ?? [])
      setLocations(data?.locations ?? [])
      setTribeReputations(data?.tribeReputations ?? [])
      setAchievements(data?.achievements ?? [])
      setDiseases(data?.diseases ?? [])
      setWorldFacts(data?.worldFacts ?? [])
      const msgs = data?.messages ?? []
      if (msgs.length === 0) {
        setMessages([{ id: 'intro', role: 'assistant', content: INTRO_MESSAGE, createdAt: new Date().toISOString() }])
      } else {
        setMessages(msgs)
      }
      setInitialized(true)
    } catch (error: any) {
      console.error('Load error:', error)
      setMessages([{ id: 'intro', role: 'assistant', content: INTRO_MESSAGE, createdAt: new Date().toISOString() }])
      setGameState(createDefaultGameState({ gameStarted: false }) as any)
      setInitialized(true)
    }
  }

  // === Client-side tag parsing for real-time sidebar updates ===
  const safeParseJSON = (str: string): any => {
    try { return JSON.parse(str) } catch { return null }
  }

  const stripAllTags = (text: string): string => {
    return text
      .replace(/\[STAT_UPDATE\].*?\[\/STAT_UPDATE\]/gs, '')
      .replace(/\[REL_UPDATE\].*?\[\/REL_UPDATE\]/gs, '')
      .replace(/\[INV_UPDATE\].*?\[\/INV_UPDATE\]/gs, '')
      .replace(/\[QUEST_UPDATE\].*?\[\/QUEST_UPDATE\]/gs, '')
      .replace(/\[DIARY_UPDATE\].*?\[\/DIARY_UPDATE\]/gs, '')
      .replace(/\[SKILL_UPDATE\].*?\[\/SKILL_UPDATE\]/gs, '')
      .replace(/\[TRIBE_UPDATE\].*?\[\/TRIBE_UPDATE\]/gs, '')
      .replace(/\[ACHIEVEMENT\].*?\[\/ACHIEVEMENT\]/gs, '')
      .replace(/\[DISEASE_ADD\].*?\[\/DISEASE_ADD\]/gs, '')
      .replace(/\[DISEASE_REMOVE\].*?\[\/DISEASE_REMOVE\]/gs, '')
      .replace(/\[FACT_ADD\].*?\[\/FACT_ADD\]/gs, '')
      .replace(/\[FACT_REMOVE\].*?\[\/FACT_REMOVE\]/gs, '')
      .replace(/\[CHOICES\].*?\[\/CHOICES\]/gs, '')
      .replace(/\[DICE_ROLL\].*?\[\/DICE_ROLL\]/gs, '')
      .replace(/\[SEX_SCENE_START\].*?\[\/SEX_SCENE_START\]/gs, '')
      .replace(/\[PHASE\].*?\[\/PHASE\]/gs, '')
      .replace(/\[PLEASURE\].*?\[\/PLEASURE\]/gs, '')
      .replace(/\[STAMINA\].*?\[\/STAMINA\]/gs, '')
      .replace(/\[COMBO\].*?\[\/COMBO\]/gs, '')
      .replace(/\[DOMINATION\].*?\[\/DOMINATION\]/gs, '')
      .replace(/\[REACTION\].*?\[\/REACTION\]/gs, '')
      .replace(/\[EROGENOUS\].*?\[\/EROGENOUS\]/gs, '')
      .replace(/\[SEX_CHOICES\].*?\[\/SEX_CHOICES\]/gs, '')
      .replace(/\[SEX_SCENE_END\].*?\[\/SEX_SCENE_END\]/gs, '')
      .replace(/\[SCENE_MOOD\].*?\[\/SCENE_MOOD\]/gs, '')
      .replace(/\[LARA_DIALOGUE\].*?\[\/LARA_DIALOGUE\]/gs, '')
      .replace(/\[MULTI_ORGASM\].*?\[\/MULTI_ORGASM\]/gs, '')
      .replace(/\[PENIS_STATS\].*?\[\/PENIS_STATS\]/gs, '')
      // incomplete tags (still streaming)
      .replace(/\[STAT_UPDATE\].*/gs, '')
      .replace(/\[REL_UPDATE\].*/gs, '')
      .replace(/\[INV_UPDATE\].*/gs, '')
      .replace(/\[QUEST_UPDATE\].*/gs, '')
      .replace(/\[DIARY_UPDATE\].*/gs, '')
      .replace(/\[SKILL_UPDATE\].*/gs, '')
      .replace(/\[TRIBE_UPDATE\].*/gs, '')
      .replace(/\[ACHIEVEMENT\].*/gs, '')
      .replace(/\[DISEASE_ADD\].*/gs, '')
      .replace(/\[DISEASE_REMOVE\].*/gs, '')
      .replace(/\[FACT_ADD\].*/gs, '')
      .replace(/\[FACT_REMOVE\].*/gs, '')
      .replace(/\[CHOICES\].*/gs, '')
      .replace(/\[DICE_ROLL\].*/gs, '')
      .replace(/\[SEX_SCENE_START\].*/gs, '')
      .replace(/\[PHASE\].*/gs, '')
      .replace(/\[PLEASURE\].*/gs, '')
      .replace(/\[STAMINA\].*/gs, '')
      .replace(/\[COMBO\].*/gs, '')
      .replace(/\[DOMINATION\].*/gs, '')
      .replace(/\[REACTION\].*/gs, '')
      .replace(/\[EROGENOUS\].*/gs, '')
      .replace(/\[SEX_CHOICES\].*/gs, '')
      .replace(/\[SEX_SCENE_END\].*/gs, '')
      .replace(/\[SCENE_MOOD\].*/gs, '')
      .replace(/\[LARA_DIALOGUE\].*/gs, '')
      .replace(/\[MULTI_ORGASM\].*/gs, '')
      .replace(/\[PENIS_STATS\].*/gs, '')
      .trim()
  }

  const parseStreamTagsAndApply = (accumulated: string, alreadyParsedCount: number): number => {
    // Find all complete tags in accumulated content, skip already-processed ones
    const allCompleteTags: { type: string; json: string }[] = []
    const tagPatterns = [
      { pattern: /\[STAT_UPDATE\](.*?)\[\/STAT_UPDATE\]/gs, type: 'stat' },
      { pattern: /\[REL_UPDATE\](.*?)\[\/REL_UPDATE\]/gs, type: 'rel' },
      { pattern: /\[INV_UPDATE\](.*?)\[\/INV_UPDATE\]/gs, type: 'inv' },
      { pattern: /\[QUEST_UPDATE\](.*?)\[\/QUEST_UPDATE\]/gs, type: 'quest' },
      { pattern: /\[DIARY_UPDATE\](.*?)\[\/DIARY_UPDATE\]/gs, type: 'diary' },
      { pattern: /\[SKILL_UPDATE\](.*?)\[\/SKILL_UPDATE\]/gs, type: 'skill' },
      { pattern: /\[TRIBE_UPDATE\](.*?)\[\/TRIBE_UPDATE\]/gs, type: 'tribe' },
      { pattern: /\[ACHIEVEMENT\](.*?)\[\/ACHIEVEMENT\]/gs, type: 'achievement' },
      { pattern: /\[DISEASE_ADD\](.*?)\[\/DISEASE_ADD\]/gs, type: 'disease_add' },
      { pattern: /\[DISEASE_REMOVE\](.*?)\[\/DISEASE_REMOVE\]/gs, type: 'disease_remove' },
      { pattern: /\[DICE_ROLL\](.*?)\[\/DICE_ROLL\]/gs, type: 'dice_roll' },
      { pattern: /\[SEX_SCENE_START\](.*?)\[\/SEX_SCENE_START\]/gs, type: 'sex_scene_start' },
      { pattern: /\[PHASE\](.*?)\[\/PHASE\]/gs, type: 'phase' },
      { pattern: /\[PLEASURE\](.*?)\[\/PLEASURE\]/gs, type: 'pleasure' },
      { pattern: /\[STAMINA\](.*?)\[\/STAMINA\]/gs, type: 'stamina' },
      { pattern: /\[COMBO\](.*?)\[\/COMBO\]/gs, type: 'combo' },
      { pattern: /\[DOMINATION\](.*?)\[\/DOMINATION\]/gs, type: 'domination' },
      { pattern: /\[REACTION\](.*?)\[\/REACTION\]/gs, type: 'reaction' },
      { pattern: /\[EROGENOUS\](.*?)\[\/EROGENOUS\]/gs, type: 'erogenous' },
      { pattern: /\[SEX_CHOICES\](.*?)\[\/SEX_CHOICES\]/gs, type: 'sex_choices' },
      { pattern: /\[SEX_SCENE_END\](.*?)\[\/SEX_SCENE_END\]/gs, type: 'sex_scene_end' },
      { pattern: /\[SCENE_MOOD\](.*?)\[\/SCENE_MOOD\]/gs, type: 'scene_mood' },
      { pattern: /\[LARA_DIALOGUE\](.*?)\[\/LARA_DIALOGUE\]/gs, type: 'lara_dialogue' },
      { pattern: /\[MULTI_ORGASM\](.*?)\[\/MULTI_ORGASM\]/gs, type: 'multi_orgasm' },
      { pattern: /\[PENIS_STATS\](.*?)\[\/PENIS_STATS\]/gs, type: 'penis_stats' },
    ]

    for (const { pattern, type } of tagPatterns) {
      for (const m of accumulated.matchAll(pattern)) {
        allCompleteTags.push({ type, json: m[1].trim() })
      }
    }

    if (allCompleteTags.length <= alreadyParsedCount) return alreadyParsedCount

    // Process only new tags
    const newTags = allCompleteTags.slice(alreadyParsedCount)
    const changedKeys = new Set<string>()

    for (const tag of newTags) {
      const data = safeParseJSON(tag.json)
      if (!data) continue

      if (tag.type === 'stat' && typeof data === 'object') {
        setGameState(prev => {
          if (!prev) return prev
          const updated = { ...prev }
          for (const key of Object.keys(data)) {
            if (key in prev) {
              (updated as any)[key] = data[key]
              changedKeys.add(key)
            }
          }
          return updated
        })
      } else if (tag.type === 'rel' && data?.name) {
        changedKeys.add('relationships')
        setRelationships(prev => {
          const idx = prev.findIndex(r => r.name === data.name)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], ...data }
            return updated
          }
          return [...prev, { id: `temp-${Date.now()}`, ...data, bond: data.bond ?? 0 }]
        })
      } else if (tag.type === 'inv' && data?.name) {
        changedKeys.add('inventory')
        setInventory(prev => {
          if (data.action === 'remove') return prev.filter(i => i.name !== data.name)
          const idx = prev.findIndex(i => i.name === data.name)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], quantity: data.quantity ?? updated[idx].quantity }
            return updated
          }
          return [...prev, { id: `temp-${Date.now()}`, name: data.name, quantity: data.quantity ?? 1, category: data.category ?? 'misc', description: data.description ?? '' }]
        })
      } else if (tag.type === 'quest' && data?.title) {
        changedKeys.add('quests')
        setQuests(prev => {
          const idx = prev.findIndex(q => q.title === data.title)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], ...data }
            return updated
          }
          return [...prev, { id: `temp-${Date.now()}`, title: data.title, status: data.status ?? 'active', description: data.description ?? '', givenBy: data.givenBy ?? '' } as QuestData]
        })
      } else if (tag.type === 'disease_add' && data?.name) {
        changedKeys.add('diseases')
        setDiseases(prev => {
          if (prev.some(d => d.name === data.name)) return prev
          return [...prev, { id: `temp-${Date.now()}`, name: data.name, severity: data.severity ?? 'mild', effects: data.effects ?? '', curedBy: data.curedBy ?? '', description: data.description ?? '', source: data.source ?? '', duration: data.duration ?? 0, turnsLeft: data.turnsLeft ?? 0 } as DiseaseData]
        })
      } else if (tag.type === 'disease_remove' && data?.name) {
        changedKeys.add('diseases')
        setDiseases(prev => prev.filter(d => d.name !== data.name))
      } else if (tag.type === 'tribe' && data?.tribe) {
        changedKeys.add('tribes')
        setTribeReputations(prev => {
          const idx = prev.findIndex(t => t.tribeName === data.tribe)
          if (idx >= 0) {
            const updated = [...prev]
            updated[idx] = { ...updated[idx], reputation: Math.max(-100, Math.min(100, (updated[idx].reputation ?? 0) + (data.change ?? 0))) }
            return updated
          }
          return prev
        })
      } else if (tag.type === 'achievement' && data?.name) {
        changedKeys.add('achievements')
        setAchievements(prev => {
          if (prev.some(a => a.name === data.name)) return prev
          // Achievement popup
          toast.success(
            `${data.icon ?? '🏆'} ${data.name}`,
            {
              description: data.description ?? 'Досягнення розблоковано!',
              duration: 5000,
              className: 'achievement-toast',
            }
          )
          return [...prev, { id: `temp-${Date.now()}`, name: data.name, description: data.description ?? '', icon: data.icon ?? '🏆', unlockedAt: new Date().toISOString() } as AchievementData]
        })
      } else if (tag.type === 'dice_roll' && data?.skill) {
        setDiceRoll(data)
      } else if (tag.type === 'sex_scene_start' && data?.type) {
        setSexScene(data)
        setPleasure({ lara: 0, partner: 0 })
        setSexChoices([])
        setSceneSummary(null)
        setPenisStats(null)
        setPhase({ phase: data.phase || 'foreplay', label: 'Прелюдія' })
        setStamina({ value: 100, tempo: 'medium' })
        setCombo(null)
        setDomination(0)
        setReactions([])
        setSceneMood(null)
        setLaraDialogue([])
        setMultiOrgasm(null)
        setActiveTempo('medium')
        if (data.context_bonuses) setContextBonuses(data.context_bonuses)
      } else if (tag.type === 'phase' && data?.phase) {
        setPhase(data)
      } else if (tag.type === 'pleasure') {
        setPleasure({ lara: Number(data?.lara ?? data?.value ?? 0), partner: Number(data?.partner ?? 0) })
      } else if (tag.type === 'stamina') {
        setStamina(data)
      } else if (tag.type === 'combo' && data?.count) {
        setCombo(data)
      } else if (tag.type === 'domination' && data?.value !== undefined) {
        setDomination(Number(data.value))
      } else if (tag.type === 'reaction' && data?.text) {
        setReactions(prev => [...prev, data])
      } else if (tag.type === 'erogenous' && data?.zone) {
        setErogenousZone(data)
      } else if (tag.type === 'sex_choices' && data?.options) {
        setSexChoices(data.options)
        setChoices([])
      } else if (tag.type === 'sex_scene_end' && data) {
        setSceneSummary(data)
      } else if (tag.type === 'scene_mood' && data?.mood) {
        setSceneMood(data)
      } else if (tag.type === 'lara_dialogue' && data?.options) {
        setLaraDialogue(data.options)
      } else if (tag.type === 'multi_orgasm' && data?.chain) {
        setMultiOrgasm(data)
      } else if (tag.type === 'penis_stats' && data?.name) {
        setPenisStats(data)
      }
    }

    // Trigger glow effect for changed fields
    if (changedKeys.size > 0) {
      setRecentlyChanged(prev => new Set([...prev, ...changedKeys]))
      setTimeout(() => {
        setRecentlyChanged(prev => {
          const next = new Set(prev)
          changedKeys.forEach(k => next.delete(k))
          return next
        })
      }, 1500)
    }

    return allCompleteTags.length
  }

  const stopGeneration = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
    setStreamingContent('')
    toast.message('Генерацію зупинено')
  }

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input)?.trim?.()
    if (!text || isLoading) return

    setChoices([])
    setSexChoices([])
    setLaraDialogue([])
    setMultiOrgasm(null)
    setLastFailedMessage(null)
    setLastPlayerMessage(text)
    // Prepend tempo context during sex scenes
    const finalText = sexScene && activeTempo ? `[Темп: ${activeTempo === 'slow' ? 'повільний' : activeTempo === 'fast' ? 'швидкий' : 'середній'}] ${text}` : text
    const userMsg: MessageData = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...(prev ?? []), userMsg])
    setInput('')
    setIsLoading(true)
    setStreamingContent('')
    processedTagsRef.current = 0

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: finalText }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err?.code === 'MISSING_API_KEY') {
          setApiKeyOk(false)
          setApiHint(err.error)
        }
        // Roll back optimistic user bubble on hard fail before stream
        setMessages((prev) => (prev ?? []).filter((m) => m.id !== userMsg.id))
        throw new Error(err?.error ?? 'Помилка з\'єднання')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let partialRead = ''
      let streamError: string | null = null

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            let parsed: any
            try {
              parsed = JSON.parse(dataStr)
            } catch {
              continue // skip incomplete/invalid JSON chunks
            }
            if (parsed?.type === 'chunk') {
              const chunk = parsed?.content ?? ''
              accumulated += chunk
              const display = stripAllTags(accumulated)
              setStreamingContent(display)
              processedTagsRef.current = parseStreamTagsAndApply(accumulated, processedTagsRef.current)
            } else if (parsed?.type === 'done') {
              setGameState(parsed.gameState ?? null)
              setRelationships(parsed.relationships ?? [])
              setInventory(parsed.inventory ?? [])
              setQuests(parsed.quests ?? [])
              setDiary(parsed.diary ?? [])
              setSkills(parsed.skills ?? [])
              setTribeReputations(parsed.tribeReputations ?? [])
              setLocations(parsed.locations ?? [])
              setAchievements(parsed.achievements ?? [])
              setDiseases(parsed.diseases ?? [])
              if (parsed?.worldFacts) setWorldFacts(parsed.worldFacts)
              if (parsed?.choices?.length > 0) setChoices(parsed.choices)
              if (parsed?.completedQuests?.length > 0) {
                for (const t of parsed.completedQuests) {
                  toast.success(`Квест виконано: ${t}`, { icon: '✅' })
                }
              }
              if (parsed?.timeTick?.newDay) {
                toast.message(`Новий день: ${(parsed.timeTick.dayNumber ?? '?')}`, { icon: '🌅' })
              } else if (parsed?.timeTick?.phaseAdvanced) {
                toast.message(`Час: ${parsed.timeTick.timeOfDay}`, { icon: '🕐' })
              }
              if (parsed?.tagLog) setLastTagLog(parsed.tagLog)
              if (parsed?.promptMode) setPromptModeLabel(parsed.promptMode)
              if (parsed?.diceRolls?.length > 0) setDiceRoll(parsed.diceRolls[parsed.diceRolls.length - 1])
              if (parsed?.sexScene) {
                setSexScene(parsed.sexScene); setSceneSummary(null)
                if (parsed.sexScene.context_bonuses) setContextBonuses(parsed.sexScene.context_bonuses)
                setPhase({ phase: parsed.sexScene.phase || 'foreplay', label: 'Прелюдія' })
                setStamina({ value: 100, tempo: 'medium' })
              }
              if (parsed?.phase) setPhase(parsed.phase)
              if (parsed?.pleasure) setPleasure({ lara: Number(parsed.pleasure.lara ?? 0), partner: Number(parsed.pleasure.partner ?? 0) })
              if (parsed?.stamina) setStamina(parsed.stamina)
              if (parsed?.combo) setCombo(parsed.combo)
              if (parsed?.domination !== null && parsed?.domination !== undefined) setDomination(Number(parsed.domination))
              if (parsed?.reactions?.length > 0) setReactions(prev => [...prev, ...parsed.reactions])
              if (parsed?.erogenousZones?.length > 0) setErogenousZone(parsed.erogenousZones[parsed.erogenousZones.length - 1])
              if (parsed?.sexChoices?.length > 0) { setSexChoices(parsed.sexChoices); setChoices([]) }
              if (parsed?.sceneSummary) { setSceneSummary(parsed.sceneSummary) }
              if (parsed?.sceneMood) setSceneMood(parsed.sceneMood)
              if (parsed?.laraDialogue?.length > 0) setLaraDialogue(parsed.laraDialogue)
              if (parsed?.multiOrgasm) setMultiOrgasm(parsed.multiOrgasm)
              if (parsed?.penisStats) setPenisStats(parsed.penisStats)
            } else if (parsed?.type === 'error') {
              streamError = parsed?.message ?? 'Помилка'
            }
          }
        }
      }

      if (streamError) throw new Error(streamError)

      const finalDisplay = stripAllTags(accumulated)
      if (finalDisplay) {
        const aiMsg: MessageData = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: finalDisplay,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...(prev ?? []), aiMsg])
      }
      setStreamingContent('')

    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // user stopped — keep partial stream as message if any
        return
      }
      console.error('Send error:', error)
      setLastFailedMessage(text)
      toast.error(error?.message ?? 'Помилка надсилання')
    } finally {
      abortRef.current = null
      setIsLoading(false)
    }
  }

  const resetGame = async () => {
    if (!confirm('Почати нову гру? Весь прогрес буде втрачено!')) return
    try {
      const res = await fetch('/api/reset-game', { method: 'POST' })
      if (!res.ok) throw new Error('Помилка скидання')
      setMessages([{ id: 'intro', role: 'assistant', content: INTRO_MESSAGE, createdAt: new Date().toISOString() }])
      setRelationships([])
      setInventory([])
      setQuests([])
      setDiary([])
      setSkills([])
      // Reload to get seeded skills
      loadGameState()
      setGameState(createDefaultGameState({ gameStarted: true }) as any)
      setLocations([])
      setTribeReputations([])
      setAchievements([])
      setDiseases([])
      setWorldFacts([])
      setChoices([])
      setSexScene(null)
      setPleasure({ lara: 0, partner: 0 })
      setDiceRoll(null)
      setSceneSummary(null)
      setSexChoices([])
      setPhase(null)
      setStamina(null)
      setCombo(null)
      setDomination(0)
      setReactions([])
      setErogenousZone(null)
      setContextBonuses([])
      setSceneMood(null)
      setLaraDialogue([])
      setMultiOrgasm(null)
      setPenisStats(null)
      setActiveTempo('medium')
      toast.success('Нову гру розпочато!')
    } catch (error: any) {
      console.error('Reset error:', error)
      toast.error('Помилка скидання гри')
    }
  }

  const openSaveModal = async (mode: 'save' | 'load') => {
    setSaveMode(mode)
    setShowSaveModal(true)
    try {
      const res = await fetch('/api/save-game')
      if (res.ok) {
        const data = await res.json()
        setSaveSlots(data?.slots ?? [])
      }
    } catch (e) {
      console.error('Load slots error:', e)
    }
  }

  const saveToSlot = async (slotNumber: number) => {
    try {
      const res = await fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Збережено: ${data?.name ?? 'Слот ' + slotNumber}`)
        setShowSaveModal(false)
      } else {
        toast.error('Помилка збереження')
      }
    } catch (e) {
      toast.error('Помилка збереження')
    }
  }

  const loadFromSlot = async (slotNumber: number) => {
    if (!confirm('Завантажити гру? Поточний прогрес буде втрачено!')) return
    try {
      const res = await fetch('/api/load-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber }),
      })
      if (res.ok) {
        toast.success('Гру завантажено!')
        setShowSaveModal(false)
        loadGameState()
      } else {
        toast.error('Помилка завантаження')
      }
    } catch (e) {
      toast.error('Помилка завантаження')
    }
  }

  const sendChoice = (choiceText: string) => {
    const text = choiceText || ''
    setInput(text)
    setTimeout(() => sendMessage(text), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessage = formatMessageHtml

  const survivalWarnings = useMemo(
    () =>
      buildSurvivalWarnings(
        gameState?.hunger ?? 0,
        gameState?.thirst ?? 0,
        diseases.map((d) => d.name)
      ),
    [gameState?.thirst, gameState?.hunger, diseases]
  )

  const activeQuest = useMemo(() => {
    const active = (quests ?? []).filter((q) => q.status === 'active')
    if (active.length === 0) return null
    // Prefer earliest story-ladder quest still open
    const ladderOrder = [
      'Вижити на березі',
      'Увійти в джунглі',
      'Знайти людей острова',
      'Зрозуміти амулет',
      'Шлях до храму',
      'Скарб Атлантів',
    ]
    for (const title of ladderOrder) {
      const hit = active.find((q) => q.title === title)
      if (hit) return hit
    }
    return active[0]
  }, [quests])

  const chapterPct = chapterProgressPercent(gameState?.chapter ?? 'arrival')

  const PRIMARY_TABS: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: 'stats', icon: <Shield className="w-3.5 h-3.5" />, label: 'Стати' },
    { id: 'map', icon: <MapPin className="w-3.5 h-3.5" />, label: 'Карта' },
    { id: 'quests', icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Квести' },
    { id: 'characters', icon: <Users className="w-3.5 h-3.5" />, label: 'NPC' },
  ]
  const MORE_TABS: { id: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { id: 'inventory', icon: <Package className="w-3.5 h-3.5" />, label: 'Інвентар' },
    { id: 'lore', icon: <Scroll className="w-3.5 h-3.5" />, label: 'Лор' },
    { id: 'skills', icon: <Flame className="w-3.5 h-3.5" />, label: 'Навички' },
    { id: 'tribes', icon: <Compass className="w-3.5 h-3.5" />, label: 'Племена' },
    { id: 'diary', icon: <Feather className="w-3.5 h-3.5" />, label: 'Щоденник' },
    { id: 'achievements', icon: <Gem className="w-3.5 h-3.5" />, label: 'Нагороди' },
  ]

  useEffect(() => {
    if (!showHeaderMenu) return
    const onDoc = (e: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMenu(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [showHeaderMenu])

  const runExport = async () => {
    try {
      const res = await fetch('/api/export-game')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kai-nui-day${gameState?.dayNumber ?? 1}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Експорт завантажено')
    } catch {
      toast.error('Не вдалося експортувати')
    }
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'зброя': return '\u2694\ufe0f'
      case 'їжа': return '\ud83c\udf56'
      case 'ресурс': return '\ud83e\udea8'
      case 'одяг': return '\ud83d\udc58'
      case 'артефакт': return '\ud83d\udd2e'
      case 'інструмент': return '\ud83d\udd27'
      default: return '\ud83d\udce6'
    }
  }

  const StatBar = ({ label, value, max, icon, color, glowing }: { label: string; value: number; max: number; icon: React.ReactNode; color: string; glowing?: boolean }) => (
    <div className={`flex items-center gap-2 rounded-lg px-1 py-0.5 transition-all duration-700 ${glowing ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}>
      <div className="text-muted-foreground w-5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-foreground/80">{label}</span>
          <motion.span
            className="font-mono text-foreground/60"
            key={value}
            initial={glowing ? { scale: 1.4, color: 'rgb(var(--primary))' } : false}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ duration: 0.5 }}
          >
            {value ?? 0}/{max}
          </motion.span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${((value ?? 0) / max) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )

  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')
  const failedQuests = quests.filter(q => q.status === 'failed')

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Atmosphere layers */}
      <div className="pointer-events-none absolute inset-0 island-atmosphere" aria-hidden />
      <div className="pointer-events-none absolute inset-0 island-vignetting" aria-hidden />

      {showOnboarding && (
        <OnboardingOverlay
          onClose={dismissOnboarding}
          onStart={(text) => {
            dismissOnboarding()
            setTimeout(() => sendMessage(text), 80)
          }}
        />
      )}

      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/80 bg-card/70 backdrop-blur-md relative z-10">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="font-display text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
                  Острів Кай-Нуї
                </h1>
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 flex-shrink-0">
                  {chapterPct}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                День {gameState?.dayNumber ?? 1}
                {' · '}{gameState?.chapterLabel ?? 'Прибуття'}
                {' · '}{getTimeOfDayEmoji(gameState?.timeOfDay ?? 'day')} {getTimeOfDayLabel(gameState?.timeOfDay ?? 'day')}
                {' · '}{gameState?.location ?? 'Невідомо'}
              </p>
              <div className="mt-1 h-1.5 w-full max-w-[14rem] sm:max-w-xs bg-muted/80 rounded-full overflow-hidden ring-1 ring-border/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-primary to-yellow-400 transition-all duration-700 shadow-[0_0_8px_rgba(245,158,11,0.45)]"
                  style={{ width: `${Math.max(4, chapterPct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (!file) return
                try {
                  const text = await file.text()
                  const data = JSON.parse(text)
                  if (!confirm('Імпортувати сейв? Поточний прогрес буде перезаписано.')) return
                  const res = await fetch('/api/import-game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                  const body = await res.json().catch(() => ({}))
                  if (!res.ok) throw new Error(body?.error ?? 'Import failed')
                  toast.success('Сейв імпортовано')
                  await loadGameState()
                } catch (err: any) {
                  toast.error(err?.message ?? 'Не вдалося імпортувати')
                }
              }}
            />

            <div className="relative" ref={headerMenuRef}>
              <button
                onClick={() => setShowHeaderMenu((v) => !v)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Меню"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showHeaderMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-border bg-card shadow-xl z-50 py-1 overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                      onClick={() => { setShowHeaderMenu(false); openSaveModal('save') }}
                    >
                      <Save className="w-4 h-4 text-primary" /> Зберегти слот
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                      onClick={() => { setShowHeaderMenu(false); openSaveModal('load') }}
                    >
                      <Download className="w-4 h-4 text-primary" /> Завантажити слот
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                      onClick={() => { setShowHeaderMenu(false); void runExport() }}
                    >
                      <Feather className="w-4 h-4 text-primary" /> Експорт JSON
                    </button>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                      onClick={() => { setShowHeaderMenu(false); importInputRef.current?.click() }}
                    >
                      <Upload className="w-4 h-4 text-primary" /> Імпорт JSON
                    </button>
                    <div className="h-px bg-border my-1" />
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left text-red-400"
                      onClick={() => { setShowHeaderMenu(false); void resetGame() }}
                    >
                      <RotateCcw className="w-4 h-4" /> Нова гра
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground lg:hidden"
              title="Панель"
            >
              {showSidebar ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Active quest strip */}
        {activeQuest && (
          <div className="px-3 sm:px-4 pb-2">
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 py-1.5 max-w-3xl">
              <Target className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-amber-100/90 truncate">
                <span className="text-amber-400/90 font-medium">Квест: </span>
                {activeQuest.title}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {apiKeyOk === false && (
            <div className="flex-shrink-0 border-b border-red-500/30 bg-red-950/35 px-3 sm:px-4 py-1.5">
              <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs text-red-100/95">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <p className="truncate">
                  <span className="font-medium">Немає DeepSeek ключа. </span>
                  <span className="text-red-200/75">
                    {apiHint || 'Додай DEEPSEEK_API_KEY у .env і перезапусти dev.'}
                  </span>
                </p>
              </div>
            </div>
          )}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4">
            <AnimatePresence initial={false}>
              {(messages ?? []).map((msg: MessageData, index: number) => (
                <motion.div
                  key={msg?.id ?? index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-2 ${msg?.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg?.role === 'assistant' && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-primary/35 flex-shrink-0 mt-0.5 shadow-md shadow-primary/10">
                      <Image src="/avatars/arahu.png" alt="Майстер Гри" fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] md:max-w-[72%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-sm ${
                      msg?.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-md'
                        : 'bg-card/90 border border-border/80 rounded-tl-md backdrop-blur-sm'
                    }`}
                  >
                    {msg?.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Scroll className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">Майстер Гри</span>
                      </div>
                    )}
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg?.content ?? '') }}
                    />
                  </div>
                  {msg?.role === 'user' && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-primary/35 flex-shrink-0 mt-0.5 shadow-md shadow-primary/10">
                      <Image src={getLaraAvatar()} alt="Лара" fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Streaming content */}
            {streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 justify-start"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-primary/35 flex-shrink-0 mt-0.5">
                  <Image src="/avatars/arahu.png" alt="Майстер Гри" fill className="object-cover" sizes="32px" />
                </div>
                <div className="max-w-[82%] md:max-w-[72%] rounded-2xl rounded-tl-md px-3.5 py-2.5 bg-card/90 border border-border/80 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Scroll className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Майстер Гри</span>
                  </div>
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap typing-cursor"
                    dangerouslySetInnerHTML={{ __html: formatMessage(streamingContent) }}
                  />
                </div>
              </motion.div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">Майстер обдумує...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Sex scene HUD */}
          <AnimatePresence>
            {sexScene && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="flex-shrink-0 border-t border-pink-500/20 bg-pink-950/10 backdrop-blur-sm px-4 py-2 space-y-1.5">
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
                  <PhaseIndicator phase={phase?.phase || 'foreplay'} label={phase?.label} />
                  {stamina && <StaminaBar value={stamina.value} tempo={stamina.tempo} />}
                  <DominationScale value={domination} />
                  {sceneMood && <SceneMoodIndicator mood={sceneMood.mood} label={sceneMood.label} intensity={sceneMood.intensity} />}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
                  <TempoControlButtons activeTempo={activeTempo} onChange={setActiveTempo} />
                </div>
                {contextBonuses.length > 0 && <ContextBonusBadges bonuses={contextBonuses} />}
                {/* Partner reactions */}
                {reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center max-w-3xl mx-auto">
                    <AnimatePresence>
                      {reactions.slice(-3).map((r, i) => (
                        <PartnerReaction key={`reaction-${i}`} text={r.text} emotion={r.emotion} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Survival warnings */}
          {survivalWarnings.length > 0 && (
            <div className="flex-shrink-0 border-t border-amber-500/30 bg-amber-950/20 px-4 py-2">
              <div className="flex flex-wrap items-center gap-2 max-w-3xl mx-auto text-amber-200/90 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {survivalWarnings.map((w) => (
                  <span key={w} className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">{w}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions — always available when not loading / not in sex choice mode */}
          {sexChoices.length === 0 && !isLoading && (
            <div className="flex-shrink-0 border-t border-border bg-card/30 px-4 py-2">
              <div className="flex gap-1.5 max-w-3xl mx-auto overflow-x-auto scrollbar-hide items-center">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.text)}
                    className="flex-shrink-0 px-3 py-1.5 text-[11px] rounded-full border border-border bg-muted/50 hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {action.label}
                  </button>
                ))}
                {lastPlayerMessage && (
                  <button
                    onClick={() => sendMessage(lastPlayerMessage)}
                    className="flex-shrink-0 px-3 py-1.5 text-[11px] rounded-full border border-border bg-muted/30 hover:bg-amber-500/10 hover:border-amber-500/30 text-muted-foreground hover:text-amber-200 transition-all inline-flex items-center gap-1"
                    title="Повторити останню дію (без відкату стану)"
                  >
                    <Undo2 className="w-3 h-3" /> Ще раз
                  </button>
                )}
                <button
                  onClick={redoLastTurn}
                  className="flex-shrink-0 px-3 py-1.5 text-[11px] rounded-full border border-border bg-muted/30 hover:bg-violet-500/10 hover:border-violet-500/30 text-muted-foreground hover:text-violet-200 transition-all inline-flex items-center gap-1"
                  title="Відкотити стан і переграти останній хід"
                >
                  <RotateCcw className="w-3 h-3" /> Переграти хід
                </button>
              </div>
            </div>
          )}

          {lastFailedMessage && !isLoading && (
            <div className="flex-shrink-0 border-t border-red-500/20 bg-red-950/20 px-4 py-2">
              <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto">
                <p className="text-xs text-red-300/90 truncate">Не вдалося: {lastFailedMessage}</p>
                <button
                  onClick={() => sendMessage(lastFailedMessage)}
                  className="flex-shrink-0 text-xs px-3 py-1 rounded-lg border border-red-400/40 text-red-200 hover:bg-red-500/20"
                >
                  Повторити
                </button>
              </div>
            </div>
          )}

          {/* Lara dialogue cards */}
          <AnimatePresence>
            {laraDialogue.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex-shrink-0 border-t border-purple-500/30 bg-purple-950/20 backdrop-blur-sm px-4 pt-3 pb-1"
              >
                <LaraDialogueCards options={laraDialogue} onSelect={(text) => { setLaraDialogue([]); sendChoice(text) }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sex choice cards */}
          <AnimatePresence>
            {sexChoices.length > 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex-shrink-0 border-t border-pink-500/30 bg-pink-950/20 backdrop-blur-sm px-4 pt-3 pb-1"
              >
                <SexChoiceCards options={sexChoices} onSelect={(text) => { setSexChoices([]); sendChoice(text) }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Choice buttons */}
          <AnimatePresence>
            {choices.length > 0 && sexChoices.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex-shrink-0 border-t border-border bg-card/30 backdrop-blur-sm px-4 pt-3 pb-1"
              >
                <p className="text-xs text-muted-foreground mb-2 text-center">Оберіть дію:</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
                  {choices.map((choice, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => sendChoice(choice)}
                      className="px-4 py-2 text-sm rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/25 text-primary hover:border-primary/70 transition-all active:scale-95"
                    >
                      {choice}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dev tag log */}
          {lastTagLog && (
            <div className="flex-shrink-0 border-t border-border/60 bg-muted/20 px-3 py-1">
              <button
                type="button"
                onClick={() => setShowTagLog((v) => !v)}
                className="w-full max-w-3xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground hover:text-foreground"
              >
                <span>
                  Техлог{promptModeLabel ? ` · ${promptModeLabel}` : ''}
                  {lastTagLog.counts && (
                    <> · {Object.entries(lastTagLog.counts).map(([k, v]) => `${k}:${v}`).join(' ')}</>
                  )}
                </span>
                <span>{showTagLog ? '▲' : '▼'}</span>
              </button>
              {showTagLog && (
                <pre className="max-w-3xl mx-auto mt-1 mb-1 p-2 rounded-lg bg-black/40 text-[10px] text-emerald-200/90 overflow-x-auto max-h-28">
                  {JSON.stringify(lastTagLog, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Input area */}
          <div className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2 items-end max-w-3xl mx-auto">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e?.target?.value ?? '')}
                onKeyDown={handleKeyDown}
                placeholder="Що робить Лара?..."
                className="flex-1 resize-none bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[44px] max-h-[120px] text-foreground placeholder:text-muted-foreground"
                rows={1}
                disabled={isLoading}
                onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                  const target = e?.currentTarget
                  if (target) {
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                  }
                }}
              />
              {isLoading ? (
                <button
                  onClick={stopGeneration}
                  className="flex-shrink-0 p-3 rounded-xl bg-red-600/90 text-white hover:bg-red-600 transition-all"
                  title="Зупинити"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!(input?.trim?.())}
                  className="flex-shrink-0 p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Mobile quick nav into sidebar tabs */}
            <div className="lg:hidden flex gap-1.5 mt-2 max-w-3xl mx-auto overflow-x-auto scrollbar-hide pb-0.5">
              {[...PRIMARY_TABS, { id: 'inventory' as SidebarTab, label: 'Інв.', icon: null }, { id: 'lore' as SidebarTab, label: 'Лор', icon: null }].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSidebarTab(t.id); setShowSidebar(true) }}
                  className={`flex-shrink-0 px-2.5 py-1 text-[11px] rounded-full border ${
                    sidebarTab === t.id && showSidebar
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-border/80 text-muted-foreground bg-card/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`${
            showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } absolute lg:relative right-0 top-0 h-full w-[min(100%,20rem)] sm:w-80 border-l border-border bg-card overflow-hidden transition-transform duration-300 z-30 flex flex-col shadow-2xl lg:shadow-none`}
        >
          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-shrink-0 border-b border-primary/20 bg-primary/5 px-3 py-1.5 flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="text-[11px] text-primary/80 font-medium">Оновлення світу...</span>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto flex gap-0.5"
                >
                  <div className="w-1 h-1 rounded-full bg-primary/60" />
                  <div className="w-1 h-1 rounded-full bg-primary/40" />
                  <div className="w-1 h-1 rounded-full bg-primary/20" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Tabs — primary always labeled */}
          <div className="flex-shrink-0 border-b border-border relative">
            <div className="flex items-stretch">
              {PRIMARY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setSidebarTab(tab.id); setShowMoreTabs(false) }}
                  className={`flex-1 min-w-0 px-1.5 sm:px-2 flex items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors border-b-2 ${
                    sidebarTab === tab.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={() => setShowMoreTabs((v) => !v)}
                className={`flex-shrink-0 px-2.5 flex items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors border-b-2 ${
                  MORE_TABS.some((t) => t.id === sidebarTab) || showMoreTabs
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                title="Більше"
              >
                <MoreVertical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ще</span>
              </button>
            </div>
            <AnimatePresence>
              {showMoreTabs && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-1 top-full mt-0.5 z-40 w-44 rounded-xl border border-border bg-card shadow-xl py-1"
                >
                  {MORE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setSidebarTab(tab.id); setShowMoreTabs(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted ${
                        sidebarTab === tab.id ? 'text-primary bg-primary/10' : 'text-foreground'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto chat-scroll p-4">
            {/* STATS TAB */}
            {sidebarTab === 'stats' && (
              <div className="space-y-5">
                {/* Lara Avatar */}
                <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border border-border/50">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/50 flex-shrink-0">
                    <Image src={getLaraAvatar()} alt="Лара Крофт" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold truncate">Лара Крофт</h3>
                    <p className="text-[10px] text-muted-foreground">📍 {gameState?.location || 'Невідомо'}</p>
                    <p className="text-[10px] text-muted-foreground">🌤️ День {gameState?.dayNumber || 1} • {gameState?.timeOfDay === 'morning' ? '🌅 Ранок' : gameState?.timeOfDay === 'evening' ? '🌇 Вечір' : gameState?.timeOfDay === 'night' ? '🌙 Ніч' : '☀️ День'}</p>
                  </div>
                </div>

                {/* Desire */}
                <div className={`space-y-2 rounded-lg p-1 transition-all duration-700 ${recentlyChanged.has('desire') ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium">Бажання</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {getDesireLabel(gameState?.desire ?? 0)}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${getDesireColor(gameState?.desire ?? 0)}`}
                      animate={{ width: `${gameState?.desire ?? 0}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="text-right text-xs font-mono text-muted-foreground">{gameState?.desire ?? 0}/100</div>
                </div>

                {/* Hunger & Thirst */}
                <div className={`space-y-2 rounded-lg p-1 transition-all duration-700 ${recentlyChanged.has('hunger') || recentlyChanged.has('thirst') || recentlyChanged.has('mood') ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Виживання</h3>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-foreground/80">🍖 Голод</span>
                      <span className="font-mono text-foreground/60">{gameState?.hunger ?? 20}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${getHungerColor(gameState?.hunger ?? 20)}`} animate={{ width: `${gameState?.hunger ?? 20}%` }} transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-foreground/80">💧 Спрага</span>
                      <span className="font-mono text-foreground/60">{gameState?.thirst ?? 20}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${getHungerColor(gameState?.thirst ?? 20)}`} animate={{ width: `${gameState?.thirst ?? 20}%` }} transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-2.5 py-2">
                    <span className="text-xs text-muted-foreground">Настрій</span>
                    <span className="text-sm">{getMoodEmoji(gameState?.mood ?? 'neutral')} {getMoodLabel(gameState?.mood ?? 'neutral')}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Характеристики</h3>
                  <StatBar label="Сила" value={gameState?.strength ?? 6} max={10} icon={<Swords className="w-4 h-4" />} color="bg-red-500" glowing={recentlyChanged.has('strength')} />
                  <StatBar label="Спритність" value={gameState?.agility ?? 8} max={10} icon={<Zap className="w-4 h-4" />} color="bg-emerald-500" glowing={recentlyChanged.has('agility')} />
                  <StatBar label="Витривалість" value={gameState?.endurance ?? 7} max={10} icon={<Shield className="w-4 h-4" />} color="bg-amber-500" glowing={recentlyChanged.has('endurance')} />
                  <StatBar label="Харизма" value={gameState?.charisma ?? 7} max={10} icon={<Heart className="w-4 h-4" />} color="bg-pink-500" glowing={recentlyChanged.has('charisma')} />
                  <StatBar label="Воля" value={gameState?.willpower ?? 8} max={10} icon={<Brain className="w-4 h-4" />} color="bg-violet-500" glowing={recentlyChanged.has('willpower')} />
                </div>

                {/* Extra stats */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Стан</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Сором</span>
                      </div>
                      <span className="text-sm font-mono font-bold">{gameState?.shame ?? 0}</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Впевненість</span>
                      </div>
                      <span className="text-sm font-mono font-bold">{gameState?.confidence ?? 50}</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Gem className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] text-muted-foreground">Амулет</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-primary">{gameState?.amuletEnergy ?? 0}</span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">День</span>
                      </div>
                      <span className="text-sm font-mono font-bold">{gameState?.dayNumber ?? 1}</span>
                    </div>
                  </div>
                </div>

                {/* Location + Weather + Season */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Локація</span>
                  </div>
                  <p className="text-sm font-medium">{gameState?.location ?? 'Невідомо'}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{{'clear':'☀️ Ясно','rain':'🌧️ Дощ','storm':'⛈️ Шторм','fog':'🌫️ Туман','heat':'🔥 Спека'}[gameState?.weather ?? 'clear'] ?? '☀️ Ясно'}</span>
                    <span>{gameState?.season === 'dry' ? '🏜️ Сухий сезон' : '🌿 Сезон дощів'}</span>
                  </div>
                </div>

                {/* Companion */}
                {gameState?.companionName && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-blue-400">Компаньйон</span>
                    </div>
                    <p className="text-sm font-medium">{gameState.companionName}</p>
                    {gameState.companionBonus && (
                      <p className="text-xs text-muted-foreground mt-0.5">✨ {gameState.companionBonus}</p>
                    )}
                  </div>
                )}

                {/* Appearance */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">👗 Зовнішність</h3>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Одяг:</span> <span className="font-medium">{gameState?.clothing ?? 'клапті одягу'}</span></div>
                    {gameState?.bodyPaint && <div className="flex justify-between"><span className="text-muted-foreground">Розпис:</span> <span className="font-medium">{gameState.bodyPaint}</span></div>}
                    {gameState?.accessories && <div className="flex justify-between"><span className="text-muted-foreground">Аксесуари:</span> <span className="font-medium">{gameState.accessories}</span></div>}
                  </div>
                </div>

                {/* Diseases */}
                {diseases.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400">🦠 Хвороби</h3>
                    {diseases.map((d) => (
                      <div key={d.id} className={`rounded-lg p-2.5 border ${
                        d.severity === 'severe' ? 'bg-red-500/10 border-red-500/30' :
                        d.severity === 'moderate' ? 'bg-orange-500/10 border-orange-500/30' :
                        'bg-yellow-500/10 border-yellow-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${
                            d.severity === 'severe' ? 'text-red-400' :
                            d.severity === 'moderate' ? 'text-orange-400' :
                            'text-yellow-400'
                          }`}>{d.name}</span>
                          <span className="text-[10px] uppercase font-mono opacity-60">{d.severity}</span>
                        </div>
                        {d.effects && <p className="text-xs text-muted-foreground">⚠️ {d.effects}</p>}
                        {d.curedBy && <p className="text-xs text-green-400/70 mt-1">💊 {d.curedBy}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pregnancy */}
                {gameState?.isPregnant && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Baby className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-semibold text-pink-400">Вагітність</span>
                    </div>
                    <p className="text-sm">Тиждень {gameState?.pregnancyWeek ?? 0}/6</p>
                    {gameState?.pregnancyFather && (
                      <p className="text-xs text-muted-foreground">Батько: {gameState.pregnancyFather}</p>
                    )}
                  </motion.div>
                )}

                {/* Relationships */}
                {(relationships?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Стосунки</h3>
                    {(relationships ?? []).map((rel: RelationshipData) => (
                      <div key={rel?.id ?? rel?.name} className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{rel?.name ?? '???'}</span>
                          <span className="text-xs font-mono text-muted-foreground">
                            {rel?.bond ?? 0}/10
                          </span>
                        </div>
                        {rel?.tribe && (
                          <span className="text-[10px] text-muted-foreground">{rel.tribe}</span>
                        )}
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${((rel?.bond ?? 0) / 10) * 100}%` }} />
                        </div>
                        {/* Trust/Fear/Respect mini-bars */}
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          <div title={`Довіра: ${rel?.trust ?? 50}`}>
                            <div className="text-[9px] text-green-400/70 mb-0.5">🤝 {rel?.trust ?? 50}</div>
                            <div className="h-0.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${rel?.trust ?? 50}%` }} /></div>
                          </div>
                          <div title={`Страх: ${rel?.fear ?? 0}`}>
                            <div className="text-[9px] text-red-400/70 mb-0.5">😨 {rel?.fear ?? 0}</div>
                            <div className="h-0.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-red-500 rounded-full" style={{ width: `${rel?.fear ?? 0}%` }} /></div>
                          </div>
                          <div title={`Повага: ${rel?.respect ?? 50}`}>
                            <div className="text-[9px] text-blue-400/70 mb-0.5">👑 {rel?.respect ?? 50}</div>
                            <div className="h-0.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${rel?.respect ?? 50}%` }} /></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY TAB */}
            {sidebarTab === 'inventory' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Інвентар</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">{inventory.length} предм.</span>
                </div>
                {inventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Інвентар порожній</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Знайдіть предмети на острові</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inventory.map((item: InventoryItemData) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-muted/30 rounded-lg p-3 border border-border/50"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg flex-shrink-0">{getCategoryIcon(item.category)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{item.name}</span>
                              {item.quantity > 1 && (
                                <span className="text-xs font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded-full ml-2 flex-shrink-0">
                                  x{item.quantity}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                            )}
                            <span className="text-[10px] text-muted-foreground/60 capitalize">{item.category}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUESTS TAB */}
            {sidebarTab === 'quests' && (
              <div className="space-y-4">
                {/* Active quests */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Активні</h3>
                    {activeQuests.length > 0 && (
                      <span className="text-[10px] font-mono bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{activeQuests.length}</span>
                    )}
                  </div>
                  {activeQuests.length === 0 ? (
                    <div className="text-center py-6">
                      <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Немає активних квестів</p>
                    </div>
                  ) : (
                    activeQuests.map((q: QuestData) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0 mt-0.5">\u23f3</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{q.title}</p>
                            {q.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{q.description}</p>
                            )}
                            {q.givenBy && (
                              <p className="text-[10px] text-muted-foreground/60 mt-1">Від: {q.givenBy}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Completed quests */}
                {completedQuests.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Завершені</h3>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">{completedQuests.length}</span>
                    </div>
                    {completedQuests.map((q: QuestData) => (
                      <div key={q.id} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2.5 opacity-80">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">\u2705</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium line-through text-muted-foreground">{q.title}</p>
                            {q.givenBy && <p className="text-[10px] text-muted-foreground/50">Від: {q.givenBy}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Failed quests */}
                {failedQuests.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Провалені</h3>
                    </div>
                    {failedQuests.map((q: QuestData) => (
                      <div key={q.id} className="bg-red-500/5 border border-red-500/20 rounded-lg p-2.5 opacity-60">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">\u274c</span>
                          <p className="text-xs font-medium line-through text-muted-foreground">{q.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DIARY TAB */}
            {sidebarTab === 'diary' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Щоденник Лари</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">{diary.length} зап.</span>
                </div>
                {diary.length === 0 ? (
                  <div className="text-center py-8">
                    <Feather className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Щоденник порожній</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Записи з'являться після важливих подій</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {diary.map((entry: DiaryEntryData) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-muted/30 rounded-lg p-3 border border-border/50"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          {entry.title ? (
                            <span className="text-xs font-semibold text-primary">{entry.title}</span>
                          ) : (
                            <span className="text-xs font-semibold text-primary">Запис</span>
                          )}
                          <span className="text-[10px] font-mono text-muted-foreground/60">День {entry.dayNumber}</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SKILLS TAB */}
            {sidebarTab === 'skills' && (
              <div className="space-y-4">
                {Object.entries(SKILL_CATEGORY_NAMES).map(([cat, catName]) => {
                  const catSkills = skills.filter((s: SkillData) => s.category === cat)
                  if (catSkills.length === 0) return null
                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{catName}</h4>
                      {catSkills.map((skill: SkillData) => (
                        <div key={skill.id} className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-foreground">{skill.name}</span>
                            <span className="text-[10px] font-mono text-primary">Рів. {skill.level}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-1.5">{skill.description}</p>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                              style={{ width: `${skill.maxXp > 0 ? (skill.xp / skill.maxXp) * 100 : 0}%` }}
                            />
                          </div>
                          <div className="flex justify-end mt-0.5">
                            <span className="text-[9px] font-mono text-muted-foreground/60">{skill.xp}/{skill.maxXp} XP</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
                {skills.length === 0 && (
                  <div className="text-center py-8">
                    <Flame className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Навичок поки немає</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Вони з'являться під час інтимних сцен</p>
                  </div>
                )}
              </div>
            )}

            {/* MAP TAB */}
            {sidebarTab === 'map' && (() => {
              const chapterId = gameState?.chapter ?? 'arrival'
              const goal = CHAPTER_MAP_GOALS[chapterId] || CHAPTER_MAP_GOALS.arrival
              const isGoalLoc = (name: string) =>
                goal.locationHints.some((h) => name.toLowerCase().includes(h.toLowerCase()))
              return (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">🗺️ Карта острова</h3>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2">
                  <p className="text-[10px] text-amber-200/90 font-medium">Ціль глави «{gameState?.chapterLabel ?? 'Прибуття'}»</p>
                  <p className="text-xs text-foreground mt-0.5">{goal.label}</p>
                </div>
                <div className="relative w-full aspect-square bg-gradient-to-br from-blue-900/30 via-emerald-900/20 to-amber-900/20 rounded-xl border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/10" />
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <path d="M 30 15 C 40 8, 65 5, 75 12 C 85 18, 90 30, 88 45 C 92 55, 85 70, 78 78 C 70 85, 55 92, 42 88 C 30 85, 18 75, 15 60 C 10 48, 12 35, 18 25 C 22 18, 25 15, 30 15" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5" />
                  </svg>
                  {locations.map((loc) => {
                    const goalHit = isGoalLoc(loc.name)
                    return (
                    <div
                      key={loc.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        loc.discovered || goalHit ? 'opacity-100' : 'opacity-20'
                      }`}
                      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                      title={loc.discovered ? loc.name : goalHit ? `Ціль: ${loc.name}` : '???'}
                    >
                      <div className={`rounded-full border ${
                        loc.isCurrent
                          ? 'bg-primary border-primary shadow-lg shadow-primary/50 animate-pulse w-4 h-4'
                          : goalHit
                            ? 'bg-amber-400 border-amber-200 shadow-md shadow-amber-500/40 animate-pulse w-3.5 h-3.5'
                          : loc.discovered
                            ? 'bg-emerald-500/80 border-emerald-400/50 w-3 h-3'
                            : 'bg-gray-600/50 border-gray-500/30 w-3 h-3'
                      }`} />
                      {(loc.discovered || goalHit) && (
                        <span className={`absolute top-4 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap ${
                          loc.isCurrent ? 'text-primary font-bold' : goalHit ? 'text-amber-300 font-semibold' : 'text-muted-foreground'
                        }`}>
                          {loc.discovered ? loc.name : '★ ціль'}
                        </span>
                      )}
                    </div>
                    )
                  })}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" /> Поточна
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" /> Ціль глави
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" /> Відкрито
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-2">Відкрито: {locations.filter(l => l.discovered).length}/{locations.length}</p>
                </div>
              </div>
              )
            })()}

            {/* TRIBES TAB */}
            {sidebarTab === 'tribes' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">🏠 Племена острова</h3>
                {tribeReputations.length === 0 ? (
                  <div className="text-center py-8">
                    <Compass className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Племена не відкриті</p>
                  </div>
                ) : (
                  tribeReputations.map((tribe) => (
                    <div key={tribe.id} className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-border flex-shrink-0">
                            <Image src={getTribeAvatar(tribe.tribeName)} alt={tribe.tribeName} fill className="object-cover" sizes="32px" />
                          </div>
                          <span className="text-sm font-medium">{tribe.tribeName}</span>
                        </div>
                        <span className={`text-xs font-semibold ${getTribeStatusColor(tribe.status)}`}>
                          {getTribeStatusLabel(tribe.status)}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                        {/* Center marker */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-foreground/20" />
                        <div
                          className={`absolute top-0 h-full rounded-full transition-all duration-500 ${
                            tribe.reputation >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{
                            left: tribe.reputation >= 0 ? '50%' : `${50 + (tribe.reputation / 200) * 100}%`,
                            width: `${Math.abs(tribe.reputation) / 2}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-1">
                        <span>-100</span>
                        <span className="font-bold text-foreground">{tribe.reputation}</span>
                        <span>+100</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CHARACTERS TAB */}
            {sidebarTab === 'characters' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">👥 Персонажі</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">{relationships.length}</span>
                </div>
                {relationships.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Ще нікого не зустрічено</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Досліджуй острів, щоб зустріти NPC</p>
                  </div>
                ) : (
                  relationships.map((rel) => {
                    const att = ATTITUDE_LABELS[rel.attitude] || ATTITUDE_LABELS.neutral
                    const bondPct = ((rel.bond ?? 0) / 10) * 100
                    return (
                      <motion.div
                        key={rel.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-muted/30 rounded-xl p-3 border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2.5">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-border/50 flex-shrink-0 mt-0.5">
                              <Image src={getAvatar(rel.name, { tribe: rel.tribe })} alt={rel.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{rel.name}</span>
                              <span className={`text-sm ${att.color}`}>{att.emoji}</span>
                              {!rel.met && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">ще не зустріли</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {rel.tribe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{rel.tribe}</span>}
                              {rel.archetype && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{rel.archetype}</span>}
                            </div>
                          </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono text-pink-400">❤️ {rel.bond}/10</span>
                            <p className={`text-[10px] ${att.color}`}>{att.label}</p>
                          </div>
                        </div>

                        {/* Bond bar */}
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${bondPct}%`,
                              background: bondPct > 70 ? '#ec4899' : bondPct > 40 ? '#f59e0b' : '#6b7280',
                            }}
                          />
                        </div>

                        {/* Personality traits */}
                        {rel.personality && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {rel.personality.split(',').map((trait, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
                                {trait.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {rel.notes && (
                          <p className="text-[10px] text-muted-foreground italic">{rel.notes}</p>
                        )}

                        {/* Met on day */}
                        {rel.metOnDay > 0 && (
                          <p className="text-[9px] text-muted-foreground/50 mt-1">📅 Зустрічено: день {rel.metOnDay}</p>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}

            {/* LORE / WORLD FACTS TAB */}
            {sidebarTab === 'lore' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">📜 Канон світу</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">{worldFacts.length}</span>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                  <p className="text-[11px] text-primary font-medium">
                    {gameState?.chapterLabel ?? 'Прибуття'}
                    {gameState?.endingPath ? ` → ${ENDING_PATHS[gameState.endingPath] || gameState.endingPath}` : ''}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Прогрес сюжету: {chapterProgressPercent(gameState?.chapter ?? 'arrival')}%
                  </p>
                </div>
                {worldFacts.length === 0 ? (
                  <div className="text-center py-8">
                    <Scroll className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Поки немає канонічних фактів</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Вони з&apos;являться з важливими подіями</p>
                  </div>
                ) : (
                  worldFacts.map((f) => (
                    <div key={f.id} className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">{f.category}</span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">{f.key}</span>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">{f.content}</p>
                      {f.dayNumber > 0 && (
                        <p className="text-[9px] text-muted-foreground/50 mt-1">день {f.dayNumber}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ACHIEVEMENTS TAB */}
            {sidebarTab === 'achievements' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">🏆 Досягнення</h3>
                  <span className="text-[10px] text-muted-foreground font-mono">{achievements.length}</span>
                </div>
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Gem className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Ще немає досягнень</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Вони з'являться при важливих подіях</p>
                  </div>
                ) : (
                  achievements.map((ach) => (
                    <motion.div
                      key={ach.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl flex-shrink-0">{ach.icon}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{ach.name}</p>
                          {ach.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{ach.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* Save/Load Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSaveModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground mb-4">
              {saveMode === 'save' ? '💾 Зберегти гру' : '📥 Завантажити гру'}
            </h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(slotNum => {
                const slot = saveSlots.find(s => s.slotNumber === slotNum)
                return (
                  <button
                    key={slotNum}
                    onClick={() => saveMode === 'save' ? saveToSlot(slotNum) : slot ? loadFromSlot(slotNum) : null}
                    disabled={saveMode === 'load' && !slot}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      saveMode === 'load' && !slot
                        ? 'border-border/30 opacity-40 cursor-not-allowed'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-foreground">Слот {slotNum}</span>
                        {slot ? (
                          <p className="text-xs text-muted-foreground mt-0.5">{slot.name}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground/50 mt-0.5">Порожній</p>
                        )}
                      </div>
                      {slot && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(slot.updatedAt).toLocaleDateString('uk-UA')}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Скасувати
            </button>
          </motion.div>
        </div>
      )}
      {/* Sex scene overlays */}
      <AnimatePresence>
        {sexScene && <SceneAtmosphere atmosphere={sexScene?.atmosphere ?? null} />}
      </AnimatePresence>
      <AnimatePresence>
        {sexScene && (pleasure.lara > 0 || pleasure.partner > 0) && (
          <DualPleasureMeter lara={pleasure.lara} partner={pleasure.partner} partnerName={sexScene?.partner} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {diceRoll && <DiceRollPopup roll={diceRoll} onDone={() => setDiceRoll(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {combo && combo.count > 1 && <ComboCounter count={combo.count} label={combo.label} />}
      </AnimatePresence>
      <AnimatePresence>
        {erogenousZone && <ErogenousDiscovery zone={erogenousZone.zone} race={erogenousZone.race} bonus={erogenousZone.bonus} onDone={() => setErogenousZone(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {multiOrgasm && (
          <MultiOrgasmPopup
            chain={multiOrgasm.chain}
            multiplier={multiOrgasm.multiplier ?? 1.5}
            staminaCost={multiOrgasm.stamina_cost ?? 30}
            canContinue={multiOrgasm.can_continue !== false}
            onContinue={() => { setMultiOrgasm(null); sendChoice('Продовжити мульти-оргазм ланцюг') }}
            onStop={() => { setMultiOrgasm(null); sendChoice('Зупинитись після оргазму') }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {penisStats && <PenisStatsCard stats={penisStats} onDismiss={() => setPenisStats(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {sceneSummary && <SceneSummaryCard summary={sceneSummary} onDismiss={() => {
          setSceneSummary(null); setSexScene(null); setPleasure({ lara: 0, partner: 0 })
          setPhase(null); setStamina(null); setCombo(null); setDomination(0); setReactions([]); setContextBonuses([])
          setSceneMood(null); setLaraDialogue([]); setMultiOrgasm(null); setPenisStats(null); setActiveTempo('medium')
        }} />}
      </AnimatePresence>
    </div>
  )
}