'use client'

/**
 * Auto body composition module — no manual tile picking.
 * Parts switch from game events (desire, sex, location, dark, pregnant…).
 * Lives only on its own sidebar tab.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import type { GameState } from '@/lib/types'
import {
  BODY_SLOT_LABELS,
  bodyKitChanged,
  getPart,
  resolvePartImage,
  saveBodyKitToStorage,
  suggestBodyKitWithReasons,
  type BodyKitSelection,
  type BodySlot,
} from '@/lib/game/lara-body-kit'
import { resolveLaraLookKey } from '@/lib/game/lara-appearance'

const SLOTS: BodySlot[] = ['bust', 'waist', 'hips', 'legs']

type Props = {
  gameState?: GameState | null
  inSexScene?: boolean
  sexAtmosphere?: string | null
  sexSceneType?: string | null
}

export function LaraBodyKit({
  gameState,
  inSexScene,
  sexAtmosphere,
  sexSceneType,
}: Props) {
  const [kit, setKit] = useState<BodyKitSelection | null>(null)
  const [reasons, setReasons] = useState<string[]>([])
  const [flash, setFlash] = useState(false)
  const prevKey = useRef('')

  const contextKey = useMemo(() => {
    const look = resolveLaraLookKey(gameState as any)
    return [
      look,
      gameState?.desire,
      gameState?.confidence,
      gameState?.shame,
      gameState?.location,
      gameState?.clothing,
      gameState?.mood,
      gameState?.timeOfDay,
      gameState?.isDarkLara ? 1 : 0,
      gameState?.isPregnant ? 1 : 0,
      inSexScene ? 1 : 0,
      sexAtmosphere || '',
      sexSceneType || '',
    ].join('|')
  }, [gameState, inSexScene, sexAtmosphere, sexSceneType])

  useEffect(() => {
    if (contextKey === prevKey.current) return
    const lookKey = resolveLaraLookKey(gameState as any)
    const { kit: next, reasons: r } = suggestBodyKitWithReasons({
      lookKey,
      desire: gameState?.desire,
      confidence: gameState?.confidence,
      shame: gameState?.shame,
      location: gameState?.location,
      clothing: gameState?.clothing,
      mood: gameState?.mood,
      timeOfDay: gameState?.timeOfDay,
      weather: gameState?.weather,
      isDarkLara: gameState?.isDarkLara,
      isPregnant: gameState?.isPregnant,
      inSexScene,
      sexAtmosphere,
      sexSceneType,
    })
    setKit((prev) => {
      const changed = !prev || bodyKitChanged(prev, next)
      if (changed) {
        setFlash(true)
        setTimeout(() => setFlash(false), 1200)
      }
      return next
    })
    setReasons(r)
    saveBodyKitToStorage(next)
    prevKey.current = contextKey
  }, [contextKey, gameState, inSexScene, sexAtmosphere, sexSceneType])

  if (!kit) {
    return (
      <div className="text-[10px] text-muted-foreground animate-pulse py-2">
        Збираємо образ тіла…
      </div>
    )
  }

  return (
    <div
      className={`space-y-3 transition-shadow duration-500 ${
        flash ? 'ring-2 ring-rose-400/50 rounded-xl' : ''
      }`}
    >
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          🧍 Тіло Лари
        </h3>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Автоматично за подіями — <strong className="text-foreground/80">ти не обираєш</strong> частини.
          Змінюється від бажання, локації, сексу, одягу, «темної» Лари тощо.
        </p>
      </div>

      {reasons.length > 0 && (
        <div
          className={`text-[9px] rounded-lg px-2 py-1.5 border ${
            flash
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-100'
              : 'bg-muted/30 border-border/40 text-muted-foreground'
          }`}
        >
          <span className="font-semibold text-foreground/80">Чому так: </span>
          {reasons.join(' · ')}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {SLOTS.map((s) => {
          const part = getPart(kit[s])
          return (
            <div
              key={s}
              className="relative aspect-square rounded-xl overflow-hidden border border-border/50 bg-black/20"
            >
              <Image
                src={resolvePartImage(kit, s)}
                alt={BODY_SLOT_LABELS[s]}
                fill
                className="object-cover"
                sizes="160px"
                unoptimized={resolvePartImage(kit, s).includes('/stock/')}
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pt-4 pb-1.5">
                <p className="text-[9px] font-semibold text-white">{BODY_SLOT_LABELS[s]}</p>
                <p className="text-[8px] text-white/75 truncate">{part?.label || kit[s]}</p>
              </div>
              {part?.source && part.source !== 'ai' && (
                <span className="absolute top-1 left-1 text-[7px] px-1 py-0.5 rounded bg-black/70 text-white/90">
                  {part.source === 'cc0' ? 'CC0' : part.source}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-[8px] text-muted-foreground/70 leading-snug">
        Приклад: desire≥60 або секс → nude/сідниці CC0; берег → пляжні stock; tribal → curvy AI.
        Файли: <code className="bg-black/30 px-0.5 rounded">public/avatars/body/</code>
      </p>
    </div>
  )
}
