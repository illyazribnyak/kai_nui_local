'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { GameState } from '@/lib/types'
import type { SkillData } from '@/lib/types'
import {
  buildLaraAppearance,
  LARA_LOOKS,
  type LaraLookKey,
} from '@/lib/game/lara-appearance'
import { computeWardrobeEffects } from '@/lib/game/wardrobe-effects'
import { getDesireLabel, getMoodEmoji, getMoodLabel } from '@/lib/game/ui-labels'

type Props = {
  gameState: GameState | null | undefined
  skills?: SkillData[] | null
  compact?: boolean
  onOpenWardrobe?: () => void
}

export function LaraCard({ gameState, skills, compact, onOpenWardrobe }: Props) {
  const appearance = useMemo(
    () => buildLaraAppearance(gameState, skills),
    [gameState, skills]
  )
  const wardrobeEffects = useMemo(
    () => computeWardrobeEffects(gameState),
    [gameState]
  )
  const [previewKey, setPreviewKey] = useState<LaraLookKey | null>(null)
  const activeLook = previewKey ? LARA_LOOKS[previewKey] : appearance.look

  // Built-in look only — erotic gallery lives in its own sidebar tab
  const heroSrc = activeLook.avatar
  const heroTitle = activeLook.label
  const heroSub = activeLook.description

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border border-border/50">
        <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-2 ${appearance.look.accent} flex-shrink-0`}>
          <Image
            src={appearance.look.avatar}
            alt="Лара Крафт"
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold truncate">Лара Крафт</h3>
          <p className="text-[10px] text-muted-foreground truncate">{appearance.look.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">📍 {gameState?.location || 'Невідомо'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Hero portrait — game looks only (gallery is a separate module/tab) */}
      <div className="relative rounded-xl overflow-hidden border border-border/60 bg-gradient-to-b from-slate-900/80 to-emerald-950/40">
        <div className="relative w-full aspect-square max-h-48 mx-auto">
          <Image
            src={heroSrc}
            alt={heroTitle}
            fill
            className="object-cover"
            sizes="(max-width: 400px) 100vw, 280px"
            key={heroSrc}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-base font-bold text-white drop-shadow">Лара Крафт</h3>
            <p className="text-[11px] text-white/80">
              {heroTitle}
              {heroSub ? ` — ${heroSub}` : ''}
            </p>
          </div>
          {gameState?.isDarkLara && (
            <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-900/90 text-purple-200 border border-purple-500/40">
              Темна
            </span>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Портрети</p>
        <div className="flex gap-1.5 overflow-x-auto panel-scroll pb-1">
          {appearance.unlockedLooks.map((look) => {
            const selected = activeLook.key === look.key
            const isLive = appearance.look.key === look.key
            return (
              <button
                key={look.key}
                type="button"
                onClick={() => setPreviewKey(look.key === appearance.look.key ? null : look.key)}
                className={`relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all ${
                  selected ? look.accent + ' ring-offset-1 ring-offset-background' : 'ring-transparent opacity-70 hover:opacity-100'
                }`}
                title={look.label}
              >
                <Image src={look.avatar} alt={look.label} fill className="object-cover" sizes="44px" />
                {isLive && (
                  <span className="absolute bottom-0 inset-x-0 text-[7px] bg-black/70 text-center text-emerald-300">
                    зараз
                  </span>
                )}
                {look.erotic && !isLive && (
                  <span className="absolute top-0 right-0 text-[8px] leading-none p-0.5 bg-rose-600/90 rounded-bl">
                    ♥
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="bg-muted/40 rounded-lg px-2 py-1.5 col-span-2">
          <span className="text-muted-foreground">Одяг · </span>
          <span className="text-foreground/90">{appearance.clothingLabel}</span>
        </div>
        {appearance.bodyPaintLabel && (
          <div className="bg-muted/40 rounded-lg px-2 py-1.5 col-span-2">
            <span className="text-muted-foreground">Розпис · </span>
            {appearance.bodyPaintLabel}
          </div>
        )}
        {appearance.accessoriesLabel && (
          <div className="bg-muted/40 rounded-lg px-2 py-1.5 col-span-2">
            <span className="text-muted-foreground">Прикраси · </span>
            {appearance.accessoriesLabel}
          </div>
        )}
        <div className="bg-muted/40 rounded-lg px-2 py-1.5">
          <span className="text-muted-foreground">Настрій</span>
          <div>
            {getMoodEmoji(gameState?.mood ?? 'neutral')} {getMoodLabel(gameState?.mood ?? 'neutral')}
          </div>
        </div>
        <div className="bg-muted/40 rounded-lg px-2 py-1.5">
          <span className="text-muted-foreground">Бажання</span>
          <div className="font-mono">
            {gameState?.desire ?? 0} · {getDesireLabel(gameState?.desire ?? 0)}
          </div>
        </div>
      </div>

      {onOpenWardrobe && (
        <button
          type="button"
          onClick={onOpenWardrobe}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition transform hover:scale-[1.01] active:scale-[0.99]"
        >
          <span>🪞</span>
          <span>Гардероб та Дзеркало</span>
        </button>
      )}

      {wardrobeEffects.summary.length > 0 && (
        <div className="bg-emerald-950/40 rounded-xl border border-emerald-500/30 p-2.5 text-[10px] space-y-1">
          <span className="font-bold text-emerald-400 flex items-center gap-1">
            ✨ Бонуси активного стилю:
          </span>
          {wardrobeEffects.summary.map((eff, i) => (
            <div key={i} className="text-emerald-200/90 leading-tight">
              • {eff}
            </div>
          ))}
        </div>
      )}

      {appearance.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {appearance.tags.map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <p className="text-[9px] text-muted-foreground/80 text-center rounded-lg border border-border/40 bg-muted/15 px-2 py-1.5">
        📐 Місткість / розтяг і додаткові статы тіла — у меню{' '}
        <span className="text-primary font-medium">⋯ → Місткість</span>
      </p>

      {/* Quick combat/ stat strip */}
      <div className="grid grid-cols-3 gap-1 text-center sm:grid-cols-5">
        {[
          { l: 'СИЛ', v: gameState?.strength ?? 4 },
          { l: 'СПР', v: gameState?.agility ?? 6 },
          { l: 'ВИТ', v: gameState?.endurance ?? 5 },
          { l: 'ХАР', v: gameState?.charisma ?? 7 },
          { l: 'ПРИВ', v: gameState?.attractiveness ?? 7 },
          { l: 'РОЗ', v: gameState?.intellect ?? 5 },
          { l: 'ВОЛ', v: gameState?.willpower ?? 5 },
          { l: 'ЛІБ', v: gameState?.libido ?? 6 },
          { l: 'ЧУТ', v: gameState?.bodySensitivity ?? 7 },
        ].map((s) => (
          <div key={s.l} className="bg-muted/40 rounded-lg py-1">
            <div className="text-[8px] text-muted-foreground">{s.l}</div>
            <div className="text-xs font-mono font-bold">{s.v}</div>
          </div>
        ))}
      </div>

      {gameState?.isPregnant && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] bg-rose-950/40 border border-rose-500/30 rounded-lg px-2.5 py-2 text-rose-100/90"
        >
          🤰 Вагітність · тиждень {gameState.pregnancyWeek ?? '?'}
          {gameState.pregnancyFather ? ` · ${gameState.pregnancyFather}` : ''}
        </motion.div>
      )}
    </div>
  )
}
