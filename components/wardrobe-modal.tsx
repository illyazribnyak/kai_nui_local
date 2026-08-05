'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Shirt, Palette, Gem, Check, Info } from 'lucide-react'
import type { GameState } from '@/lib/types'
import {
  CLOTHING_PRESETS,
  HAIRSTYLE_PRESETS,
  BODY_PAINT_PRESETS,
  ACCESSORIES_PRESETS,
  type OutfitPreset,
  type WardrobeCategory,
} from '@/lib/game/wardrobe-catalog'
import { buildLaraAppearance } from '@/lib/game/lara-appearance'
import { toast } from 'sonner'

type Props = {
  isOpen: boolean
  onClose: () => void
  gameState: GameState | null
  onStateUpdate?: (newState: GameState) => void
}

export function WardrobeModal({ isOpen, onClose, gameState, onStateUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<WardrobeCategory>('clothing')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [previewPreset, setPreviewPreset] = useState<OutfitPreset | null>(null)

  const appearance = useMemo(() => buildLaraAppearance(gameState), [gameState])

  if (!isOpen) return null

  const getPresetsForTab = (): OutfitPreset[] => {
    switch (activeTab) {
      case 'clothing':
        return CLOTHING_PRESETS
      case 'hairstyle':
        return HAIRSTYLE_PRESETS
      case 'bodyPaint':
        return BODY_PAINT_PRESETS
      case 'accessories':
        return ACCESSORIES_PRESETS
    }
  }

  const isCurrentActive = (preset: OutfitPreset): boolean => {
    if (!gameState) return false
    if (preset.category === 'clothing') {
      const cur = (gameState.clothing || '').toLowerCase()
      return cur.includes(preset.label.toLowerCase()) || cur.includes(preset.id)
    }
    if (preset.category === 'bodyPaint') {
      const cur = (gameState.bodyPaint || '').toLowerCase()
      if (preset.id === 'none') return !gameState.bodyPaint || cur === ''
      return cur.includes(preset.label.toLowerCase()) || cur.includes(preset.id)
    }
    if (preset.category === 'accessories') {
      const cur = (gameState.accessories || '').toLowerCase()
      if (preset.id === 'none') return !gameState.accessories || cur === ''
      return cur.includes(preset.label.toLowerCase()) || cur.includes(preset.id)
    }
    return false
  }

  const handleEquip = async (preset: OutfitPreset) => {
    setSavingId(preset.id)
    try {
      const patchData: Record<string, string | null> = {}
      if (preset.category === 'clothing') {
        patchData.clothing = preset.label
      } else if (preset.category === 'bodyPaint') {
        patchData.bodyPaint = preset.id === 'none' ? null : preset.label
      } else if (preset.category === 'accessories') {
        patchData.accessories = preset.id === 'none' ? null : preset.label
      }

      const res = await fetch('/api/game-state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      })

      const data = await res.json()
      if (data.ok && data.gameState) {
        onStateUpdate?.(data.gameState)
        toast.success(`Змінено: ${preset.label}`, {
          icon: preset.icon,
        })
      } else {
        toast.error('Не вдалося зберегти зміни')
      }
    } catch {
      toast.error('Помилка з\'єднання із сервером')
    } finally {
      setSavingId(null)
    }
  }

  const displayAvatar = previewPreset?.avatarImage || appearance.look.avatar
  const displayTitle = previewPreset?.label || appearance.look.label

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-emerald-500/30 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-slate-900/60">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xl">
                🪞
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Гардероб та Дзеркало Лари
                </h2>
                <p className="text-xs text-muted-foreground">
                  Кастомізація вбрання, зачісок, магічного розпису та артефактів
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content (Grid: Left Mirror Preview / Right Controls) */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Panel: Live Mirror Preview */}
            <div className="md:col-span-5 p-6 border-r border-border/40 bg-gradient-to-b from-slate-900/40 via-slate-950 to-emerald-950/20 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-900">
                  <Image
                    src={displayAvatar}
                    alt={displayTitle}
                    fill
                    className="object-cover transition-all duration-300"
                    sizes="280px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      Візуальний прев'ю
                    </span>
                    <h3 className="text-base font-bold text-white drop-shadow">
                      {displayTitle}
                    </h3>
                  </div>
                </div>

                {/* State summary tags */}
                <div className="space-y-2 bg-slate-900/60 rounded-xl p-3.5 border border-border/50 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Одяг:</span>
                    <span className="font-semibold text-emerald-300">
                      {gameState?.clothing || 'Клапті одягу'}
                    </span>
                  </div>
                  {gameState?.bodyPaint && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Розпис:</span>
                      <span className="font-semibold text-amber-300">
                        {gameState.bodyPaint}
                      </span>
                    </div>
                  )}
                  {gameState?.accessories && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Прикраси:</span>
                      <span className="font-semibold text-purple-300">
                        {gameState.accessories}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/80 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Зміни одягу та магічного розпису одразу відображаються у промптах для AI-наратора!
                </span>
              </div>
            </div>

            {/* Right Panel: Category Tabs & Grid of Presets */}
            <div className="md:col-span-7 p-6 flex flex-col overflow-hidden bg-slate-950">
              {/* Tabs */}
              <div className="flex gap-2 border-b border-border/40 pb-3 overflow-x-auto">
                {[
                  { id: 'clothing', label: 'Вбрання', icon: Shirt },
                  { id: 'hairstyle', label: 'Зачіска', icon: Sparkles },
                  { id: 'bodyPaint', label: 'Боді-арт', icon: Palette },
                  { id: 'accessories', label: 'Прикраси', icon: Gem },
                ].map((tab) => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as WardrobeCategory)
                        setPreviewPreset(null)
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                        active
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Items List Grid */}
              <div className="flex-1 overflow-y-auto pt-4 pr-1 space-y-3 panel-scroll">
                {getPresetsForTab().map((preset) => {
                  const active = isCurrentActive(preset)
                  const isHovered = previewPreset?.id === preset.id

                  return (
                    <div
                      key={preset.id}
                      onMouseEnter={() => setPreviewPreset(preset)}
                      onMouseLeave={() => setPreviewPreset(null)}
                      className={`relative flex items-center gap-4 p-3.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : isHovered
                          ? 'bg-slate-900/90 border-slate-700'
                          : 'bg-slate-900/50 border-border/40 hover:bg-slate-900/70'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-800 flex items-center justify-center text-2xl">
                        {preset.avatarImage ? (
                          <Image
                            src={preset.avatarImage}
                            alt={preset.label}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <span>{preset.icon}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{preset.icon}</span>
                          <h4 className="text-sm font-bold text-white truncate">
                            {preset.label}
                          </h4>
                          {preset.badgeText && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {preset.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {preset.description}
                        </p>
                        {preset.statBonusText && (
                          <p className="text-[10px] font-medium text-emerald-400 mt-1">
                            ✨ {preset.statBonusText}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div>
                        {active ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/40">
                            <Check className="w-4 h-4" /> Надягнуто
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleEquip(preset)}
                            disabled={savingId === preset.id}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                          >
                            {savingId === preset.id ? '…' : 'Вдягнути'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
