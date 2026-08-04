'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  BODY_SLOT_LABELS,
  DEFAULT_BODY_KIT,
  loadBodyKitFromStorage,
  partsForSlot,
  resolvePartImage,
  saveBodyKitToStorage,
  suggestBodyKit,
  type BodyKitSelection,
  type BodySlot,
} from '@/lib/game/lara-body-kit'

const SLOTS: BodySlot[] = ['bust', 'waist', 'hips', 'legs']

type Props = {
  lookKey?: string
  desire?: number
  confidence?: number
}

export function LaraBodyKit({ lookKey, desire, confidence }: Props) {
  const [kit, setKit] = useState<BodyKitSelection>(DEFAULT_BODY_KIT)
  const [slot, setSlot] = useState<BodySlot>('bust')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setKit(loadBodyKitFromStorage())
    setHydrated(true)
  }, [])

  const update = useCallback((next: BodyKitSelection) => {
    setKit(next)
    saveBodyKitToStorage(next)
  }, [])

  const pick = (partId: string) => {
    update({ ...kit, [slot]: partId })
  }

  const auto = () => {
    update(suggestBodyKit({ lookKey, desire, confidence }))
  }

  if (!hydrated) {
    return (
      <div className="text-[10px] text-muted-foreground animate-pulse py-2">
        Завантаження конструктора тіла…
      </div>
    )
  }

  const options = partsForSlot(slot)

  return (
    <div className="space-y-2 bg-muted/20 rounded-xl p-2.5 border border-border/40">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Конструктор тіла
        </h4>
        <button
          type="button"
          onClick={auto}
          className="text-[9px] px-2 py-0.5 rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
        >
          Авто за станом
        </button>
      </div>
      <p className="text-[9px] text-muted-foreground/80 leading-snug">
        Слоти: груди / талія / стегна / ноги. У репо лише <strong className="text-foreground/70">AI-тайли</strong>{' '}
        (стиль гри). Зовнішні stock/nude файли в git не лежать.
      </p>

      {/* Composite preview */}
      <div className="grid grid-cols-2 gap-1.5">
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              slot === s ? 'border-primary ring-1 ring-primary/40' : 'border-border/40 opacity-90 hover:opacity-100'
            }`}
          >
            <Image
              src={resolvePartImage(kit, s)}
              alt={BODY_SLOT_LABELS[s]}
              fill
              className="object-cover"
              sizes="120px"
            />
            <span className="absolute bottom-0 inset-x-0 text-[8px] bg-black/75 text-center text-white/90 py-0.5">
              {BODY_SLOT_LABELS[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Slot tabs */}
      <div className="flex flex-wrap gap-1">
        {SLOTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlot(s)}
            className={`text-[9px] px-2 py-1 rounded-full border transition-colors ${
              slot === s
                ? 'bg-primary/25 border-primary/50 text-primary'
                : 'border-border/50 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {BODY_SLOT_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Options for active slot */}
      <div className="flex gap-1.5 overflow-x-auto panel-scroll pb-0.5">
        {options.map((p) => {
          const selected = kit[slot] === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => pick(p.id)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ring-2 transition-all ${
                selected ? 'ring-pink-500 ring-offset-1 ring-offset-background' : 'ring-transparent opacity-75 hover:opacity-100'
              }`}
              title={p.description}
            >
              <Image src={p.image} alt={p.label} fill className="object-cover" sizes="64px" />
              <span className="absolute bottom-0 inset-x-0 text-[7px] bg-black/70 text-center text-white truncate px-0.5">
                {p.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
