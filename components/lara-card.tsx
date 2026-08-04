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
import { LaraBodyKit } from './lara-body-kit'
import { LaraGalleryPanel } from './lara-gallery-panel'
import { getDesireLabel, getMoodEmoji, getMoodLabel } from '@/lib/game/ui-labels'

type Props = {
  gameState: GameState | null | undefined
  skills?: SkillData[] | null
  compact?: boolean
}

function CapBar({
  label,
  comfort,
  max,
  unit,
  color,
}: {
  label: string
  comfort: number
  max: number
  unit: string
  color: string
}) {
  const pct = Math.min(100, (max / 20) * 100)
  const comfortPct = Math.min(100, (comfort / 20) * 100)
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground/70">
          {comfort}–{max}
          {unit}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
        <div className={`absolute inset-y-0 left-0 ${color} opacity-40 rounded-full`} style={{ width: `${pct}%` }} />
        <div className={`absolute inset-y-0 left-0 ${color} rounded-full`} style={{ width: `${comfortPct}%` }} />
      </div>
    </div>
  )
}

export function LaraCard({ gameState, skills, compact }: Props) {
  const appearance = useMemo(
    () => buildLaraAppearance(gameState, skills),
    [gameState, skills]
  )
  const [previewKey, setPreviewKey] = useState<LaraLookKey | null>(null)
  const [galleryHero, setGalleryHero] = useState<{ src: string; label: string; reasons: string[] } | null>(null)
  const activeLook = previewKey ? LARA_LOOKS[previewKey] : appearance.look

  // Prefer auto-picked gallery photo unless user previews a built-in look
  const heroSrc = previewKey ? activeLook.avatar : (galleryHero?.src || activeLook.avatar)
  const heroTitle = previewKey
    ? activeLook.label
    : galleryHero
      ? galleryHero.label
      : activeLook.label
  const heroSub = previewKey
    ? activeLook.description
    : galleryHero
      ? galleryHero.reasons.slice(0, 2).join(' · ') || 'Авто з галереї'
      : activeLook.description

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border border-border/50">
        <div className={`relative w-14 h-14 rounded-full overflow-hidden ring-2 ${appearance.look.accent} flex-shrink-0`}>
          <Image
            src={galleryHero?.src || appearance.look.avatar}
            alt="Лара Крафт"
            fill
            className="object-cover"
            sizes="56px"
            key={galleryHero?.src || appearance.look.avatar}
            unoptimized={Boolean(galleryHero?.src)}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold truncate">Лара Крафт</h3>
          <p className="text-[10px] text-muted-foreground truncate">
            {galleryHero?.label || appearance.look.label}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">📍 {gameState?.location || 'Невідомо'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Hero portrait — gallery auto-pick or built-in look */}
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
            unoptimized={heroSrc.includes('lara-gallery')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-base font-bold text-white drop-shadow">Лара Крафт</h3>
            <p className="text-[11px] text-white/80">
              {heroTitle}
              {heroSub ? ` — ${heroSub}` : ''}
            </p>
          </div>
          {galleryHero && !previewKey && (
            <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-rose-900/90 text-rose-100 border border-rose-500/40">
              Галерея
            </span>
          )}
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

      {/* Drop-in gallery — auto-picks portrait from game state + filename tags */}
      <LaraGalleryPanel
        gameState={gameState}
        onActiveChange={(src, meta) => {
          if (src && meta) {
            setGalleryHero({
              src,
              label: meta.label,
              reasons: meta.reasons || [],
            })
          } else {
            setGalleryHero(null)
          }
        }}
      />

      {/* Body kit constructor */}
      <LaraBodyKit
        lookKey={appearance.look.key}
        desire={gameState?.desire}
        confidence={gameState?.confidence}
      />

      {/* Body capacity */}
      <div className="space-y-2 bg-muted/20 rounded-xl p-2.5 border border-border/40">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Тіло · місткість / розтяг
        </h4>
        <p className="text-[9px] text-muted-foreground/80">
          Світла смуга = комфорт, тьмяна = максимум. Росте зі скілами вагіни / аналу / горла.
        </p>
        <CapBar
          label="Вагіна ⌀ см"
          comfort={appearance.capacity.vaginal.comfortDiameterCm}
          max={appearance.capacity.vaginal.maxDiameterCm}
          unit=""
          color="bg-pink-500"
        />
        <CapBar
          label="Вагіна глибина см"
          comfort={appearance.capacity.vaginal.comfortDepthCm}
          max={appearance.capacity.vaginal.maxDepthCm}
          unit=""
          color="bg-rose-500"
        />
        <CapBar
          label="Анал ⌀ см"
          comfort={appearance.capacity.anal.comfortDiameterCm}
          max={appearance.capacity.anal.maxDiameterCm}
          unit=""
          color="bg-orange-500"
        />
        <CapBar
          label="Анал глибина см"
          comfort={appearance.capacity.anal.comfortDepthCm}
          max={appearance.capacity.anal.maxDepthCm}
          unit=""
          color="bg-amber-600"
        />
        <CapBar
          label="Горло глибина см"
          comfort={appearance.capacity.oral.comfortDepthCm}
          max={appearance.capacity.oral.maxDepthCm}
          unit=""
          color="bg-violet-500"
        />
      </div>

      {/* Quick combat/ stat strip */}
      <div className="grid grid-cols-5 gap-1 text-center">
        {[
          { l: 'СИЛ', v: gameState?.strength ?? 6 },
          { l: 'СПР', v: gameState?.agility ?? 8 },
          { l: 'ВИТ', v: gameState?.endurance ?? 7 },
          { l: 'ХАР', v: gameState?.charisma ?? 7 },
          { l: 'ВОЛ', v: gameState?.willpower ?? 8 },
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
