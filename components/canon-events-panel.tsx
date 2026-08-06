'use client'

import { useState } from 'react'
import { CANON_EVENTS, type CanonEvent } from '@/lib/game/canon-events'

interface CanonEventsPanelProps {
  worldFacts: Array<{ key: string; content?: string; category?: string }>
  currentChapter?: string
}

const CHAPTER_NAMES: Record<string, { label: string; icon: string }> = {
  arrival: { label: 'Прибуття на берег', icon: '🌊' },
  jungle: { label: 'Джунглі та виживання', icon: '🌿' },
  tribe: { label: 'Племя Кай-Тору', icon: '🏛️' },
  depths: { label: 'Глибини та Таємниці', icon: '🔮' },
  temple: { label: 'Храм Насолоди', icon: '🔱' },
  climax: { label: 'Кульмінація та Скарб', icon: '⚡' },
  ending: { label: 'Фінальні Кінцівки', icon: '🏆' },
}

const CATEGORY_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  plot: { label: 'Сюжет', bg: 'bg-amber-500/20', color: 'text-amber-300 border-amber-500/30' },
  npc: { label: 'Персонаж', bg: 'bg-emerald-500/20', color: 'text-emerald-300 border-emerald-500/30' },
  tribe: { label: 'Племя', bg: 'bg-orange-500/20', color: 'text-orange-300 border-orange-500/30' },
  ritual: { label: 'Ритуал', bg: 'bg-violet-500/20', color: 'text-violet-300 border-violet-500/30' },
  secret: { label: 'Таємниця', bg: 'bg-purple-500/20', color: 'text-purple-300 border-purple-500/30' },
  item: { label: 'Предмет', bg: 'bg-blue-500/20', color: 'text-blue-300 border-blue-500/30' },
  world: { label: 'Світ', bg: 'bg-cyan-500/20', color: 'text-cyan-300 border-cyan-500/30' },
  ending: { label: 'Кінцівка', bg: 'bg-rose-500/20', color: 'text-rose-300 border-rose-500/30' },
}

export function CanonEventsPanel({ worldFacts = [], currentChapter = 'arrival' }: CanonEventsPanelProps) {
  const [selectedChapter, setSelectedChapter] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const unlockedFactKeys = new Set(worldFacts.map((f) => f.key))
  const totalEvents = CANON_EVENTS.length
  const unlockedCount = CANON_EVENTS.filter((e) => unlockedFactKeys.has(e.key)).length
  const progressPercent = Math.round((unlockedCount / totalEvents) * 100)

  const filteredEvents = CANON_EVENTS.filter((event) => {
    if (selectedChapter !== 'all' && event.chapter !== selectedChapter) return false
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false
    return true
  })

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Header Banner & Progress Bar */}
      <div className="rounded-xl bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-slate-900/80 p-3.5 border border-amber-500/30 shadow-lg shadow-amber-950/20">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-amber-200 text-sm tracking-wide flex items-center gap-1.5">
              <span>📜</span> Канонічні Події Сюжету
            </h3>
            <p className="text-[11px] text-amber-300/70">
              Основні сюжетні повороти, довіра племен та таємниці Амулета
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-amber-400">
              {unlockedCount} / {totalEvents}
            </span>
            <span className="text-[10px] text-amber-400/60 block">{progressPercent}% Канону</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/80 rounded-full h-2 overflow-hidden border border-amber-500/20">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-400 to-purple-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            style={{ width: `${Math.max(progressPercent, 4)}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-2">
        {/* Chapter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedChapter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium whitespace-nowrap ${
              selectedChapter === 'all'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
            }`}
          >
            Усі глави ({CANON_EVENTS.length})
          </button>
          {Object.entries(CHAPTER_NAMES).map(([id, info]) => {
            const count = CANON_EVENTS.filter((e) => e.chapter === id).length
            return (
              <button
                key={id}
                onClick={() => setSelectedChapter(id)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-medium whitespace-nowrap flex items-center gap-1 ${
                  selectedChapter === id
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span>{info.icon}</span>
                <span>{info.label}</span>
                <span className="opacity-60 text-[9px]">({count})</span>
              </button>
            )
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded-full text-[10px] transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                : 'bg-slate-900/40 text-slate-400 hover:text-slate-300'
            }`}
          >
            Всі категорії
          </button>
          {Object.entries(CATEGORY_BADGES).map(([catId, badge]) => (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`px-2 py-0.5 rounded-full text-[10px] transition-all border whitespace-nowrap ${
                selectedCategory === catId
                  ? `${badge.bg} ${badge.color} font-semibold`
                  : 'bg-slate-900/40 text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              {badge.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/50">
            Немає подій у цій категорії
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isUnlocked = unlockedFactKeys.has(event.key)
            const factData = worldFacts.find((f) => f.key === event.key)
            const badge = CATEGORY_BADGES[event.category] || CATEGORY_BADGES.plot
            const chapterInfo = CHAPTER_NAMES[event.chapter] || { label: event.chapter, icon: '📜' }

            return (
              <div
                key={event.key}
                className={`p-3 rounded-xl transition-all border ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-purple-950/20 border-amber-500/40 shadow-sm shadow-amber-950/30'
                    : 'bg-slate-950/50 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{isUnlocked ? '✅' : '⏳'}</span>
                    <h4
                      className={`font-semibold ${
                        isUnlocked ? 'text-amber-200' : 'text-slate-300'
                      }`}
                    >
                      {event.content}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded border ${badge.bg} ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                      {chapterInfo.icon} {chapterInfo.label}
                    </span>
                  </div>
                </div>

                <div className="mt-1 pl-6 space-y-1">
                  {isUnlocked ? (
                    <div className="text-[11px] text-amber-300/80 bg-amber-950/30 p-1.5 rounded border border-amber-500/20 flex items-center gap-1.5">
                      <span className="text-amber-400">✨</span>
                      <span>
                        Зафіксовано канонічний факт: {factData?.content || event.content}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-1.5 rounded border border-slate-800 flex items-center gap-1.5">
                      <span className="text-slate-500">🎯 Умова спрацювання:</span>
                      <span className="text-slate-300 italic">{event.trigger}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
