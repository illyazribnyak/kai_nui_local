'use client'

/**
 * Standalone Lara photo gallery module.
 * Loads ONLY when mounted (open the «Галерея» tab) — never auto-injects into chat portrait.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameState } from '@/lib/types'
import type { LaraGalleryItem } from '@/lib/game/lara-gallery'

type ActiveInfo = {
  file: string
  src: string
  label: string
  tags: string[]
  score: number
  reasons: string[]
}

type Props = {
  gameState?: GameState | null
  inSexScene?: boolean
}

function buildQuery(gs?: GameState | null, inSexScene?: boolean): string {
  if (!gs) return inSexScene ? '?inSexScene=1' : ''
  const p = new URLSearchParams()
  if (gs.location) p.set('location', gs.location)
  if (gs.timeOfDay) p.set('timeOfDay', gs.timeOfDay)
  if (gs.mood) p.set('mood', gs.mood)
  if (gs.weather) p.set('weather', gs.weather)
  if (gs.clothing) p.set('clothing', gs.clothing)
  if (gs.chapter) p.set('chapter', gs.chapter)
  p.set('desire', String(gs.desire ?? 0))
  p.set('shame', String(gs.shame ?? 0))
  p.set('confidence', String(gs.confidence ?? 50))
  p.set('dayNumber', String(gs.dayNumber ?? 1))
  if (gs.isDarkLara) p.set('isDarkLara', '1')
  if (gs.isPregnant) p.set('isPregnant', '1')
  if (inSexScene) p.set('inSexScene', '1')
  const q = p.toString()
  return q ? `?${q}` : ''
}

/** Stable key so we don't refetch on every object identity change */
function contextKey(gs?: GameState | null, inSexScene?: boolean): string {
  if (!gs) return `empty|${inSexScene ? 1 : 0}`
  return [
    gs.location,
    gs.timeOfDay,
    gs.mood,
    gs.weather,
    gs.clothing,
    gs.chapter,
    gs.desire,
    gs.shame,
    gs.confidence,
    gs.dayNumber,
    gs.isDarkLara ? 1 : 0,
    gs.isPregnant ? 1 : 0,
    inSexScene ? 1 : 0,
  ].join('|')
}

export function LaraGalleryPanel({ gameState, inSexScene }: Props) {
  const [items, setItems] = useState<LaraGalleryItem[]>([])
  const [active, setActive] = useState<ActiveInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)
  const [lightbox, setLightbox] = useState<LaraGalleryItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [autoPickHint, setAutoPickHint] = useState(true)

  const key = useMemo(() => contextKey(gameState, inSexScene), [gameState, inSexScene])
  const lastKey = useRef<string>('')
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(
    async (force = false) => {
      if (!force && lastKey.current === key && loadedOnce) return
      abortRef.current?.abort()
      const ac = new AbortController()
      abortRef.current = ac
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/lara-gallery${buildQuery(gameState, inSexScene)}`, {
          cache: 'no-store',
          signal: ac.signal,
        })
        const data = await res.json()
        if (ac.signal.aborted) return
        setItems(Array.isArray(data?.items) ? data.items : [])
        setActive(data?.active ?? null)
        lastKey.current = key
        setLoadedOnce(true)
        if (!data?.ok && data?.error) setError(String(data.error))
      } catch (e: any) {
        if (e?.name === 'AbortError') return
        setError(e?.message || 'Не вдалося завантажити галерею')
        setItems([])
        setActive(null)
      } finally {
        if (!ac.signal.aborted) setLoading(false)
      }
    },
    [gameState, inSexScene, key, loadedOnce]
  )

  // Single fetch on mount + when game context key actually changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      void load(false)
    }, 200)
    return () => {
      clearTimeout(t)
      abortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run on key
  }, [key])

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🖼️ Галерея Лари
          </h3>
          <button
            type="button"
            onClick={() => void load(true)}
            disabled={loading}
            className="text-[9px] px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground disabled:opacity-50"
          >
            {loading ? '…' : 'Оновити'}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Окремий модуль — не підміняє портрет у «Статах». Файли:{' '}
          <code className="text-[8px] bg-black/30 px-1 rounded">public/avatars/lara-gallery/</code>
        </p>
      </div>

      <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer select-none">
        <input
          type="checkbox"
          className="rounded border-border"
          checked={autoPickHint}
          onChange={(e) => setAutoPickHint(e.target.checked)}
        />
        Показувати підказку «найкращий збіг» за станом гри
      </label>

      {autoPickHint && active && (
        <div className="text-[9px] rounded-lg bg-rose-950/40 border border-rose-500/25 px-2 py-1.5 text-rose-100/90">
          <span className="font-semibold text-rose-300">Найкращий збіг: </span>
          {active.label}
          {active.reasons?.length > 0 && (
            <span className="text-rose-200/70"> — {active.reasons.slice(0, 3).join(' · ')}</span>
          )}
          <span className="text-white/40"> (score {active.score})</span>
        </div>
      )}

      <p className="text-[9px] text-muted-foreground/80 leading-snug">
        Імена файлів з тегами: sexy, beach, night, dark, pregnant, boudoir, wet, tribal…
        Приклад: <code className="text-[8px] bg-black/30 px-1 rounded">lara_sexy_beach_night.jpg</code>
      </p>

      {loading && !loadedOnce && (
        <p className="text-[10px] text-muted-foreground animate-pulse">Завантаження…</p>
      )}
      {error && <p className="text-[10px] text-amber-400/90">{error}</p>}
      {!loading && loadedOnce && items.length === 0 && (
        <p className="text-[10px] text-muted-foreground">Поки порожньо — додай файли в папку галереї.</p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map((it) => {
            const isBest = autoPickHint && active?.file === it.file
            return (
              <button
                key={it.file}
                type="button"
                onClick={() => setLightbox(it)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border transition-colors group ${
                  isBest
                    ? 'border-rose-400 ring-1 ring-rose-400/50'
                    : 'border-border/40 hover:border-primary/50'
                }`}
                title={it.label}
              >
                <Image
                  src={it.src}
                  alt={it.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="140px"
                  unoptimized
                />
                {isBest && (
                  <span className="absolute top-0 left-0 text-[7px] bg-rose-600/95 text-white px-1 py-0.5 rounded-br">
                    збіг
                  </span>
                )}
                <span className="absolute bottom-0 inset-x-0 text-[8px] bg-black/75 text-white/90 truncate px-1 py-0.5 text-center">
                  {it.label}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[85dvh] rounded-xl overflow-hidden border border-white/10 bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-[3/4] max-h-[70dvh]">
                <Image
                  src={lightbox.src}
                  alt={lightbox.label}
                  fill
                  className="object-contain"
                  sizes="512px"
                  unoptimized
                />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{lightbox.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{lightbox.file}</p>
                </div>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20"
                  onClick={() => setLightbox(null)}
                >
                  Закрити
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
