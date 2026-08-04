'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { LaraGalleryItem } from '@/lib/game/lara-gallery'

export function LaraGalleryPanel() {
  const [items, setItems] = useState<LaraGalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<LaraGalleryItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/lara-gallery', { cache: 'no-store' })
      const data = await res.json()
      setItems(Array.isArray(data?.items) ? data.items : [])
      if (!data?.ok && data?.error) setError(String(data.error))
    } catch (e: any) {
      setError(e?.message || 'Не вдалося завантажити галерею')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="space-y-2 bg-muted/20 rounded-xl p-2.5 border border-border/40">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Галерея Лари
        </h4>
        <button
          type="button"
          onClick={() => void load()}
          className="text-[9px] px-2 py-0.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground"
        >
          Оновити
        </button>
      </div>
      <p className="text-[9px] text-muted-foreground/80 leading-snug">
        Кидай згенеровані портрети в{' '}
        <code className="text-[8px] bg-black/30 px-1 rounded">public/avatars/lara-gallery/</code>
        — підхопляться самі (jpg/png/webp). Без порн/Reddit у git.
      </p>

      {loading && (
        <p className="text-[10px] text-muted-foreground animate-pulse">Завантаження…</p>
      )}
      {error && <p className="text-[10px] text-amber-400/90">{error}</p>}
      {!loading && items.length === 0 && (
        <p className="text-[10px] text-muted-foreground">Поки порожньо — додай файли в папку.</p>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((it) => (
            <button
              key={it.file}
              type="button"
              onClick={() => setLightbox(it)}
              className="relative aspect-square rounded-lg overflow-hidden border border-border/40 hover:border-primary/50 transition-colors group"
              title={it.label}
            >
              <Image
                src={it.src}
                alt={it.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="100px"
                unoptimized
              />
              <span className="absolute bottom-0 inset-x-0 text-[7px] bg-black/75 text-white/90 truncate px-0.5 py-0.5 text-center">
                {it.label}
              </span>
            </button>
          ))}
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
