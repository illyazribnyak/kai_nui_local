'use client'

import { useMemo, useState } from 'react'
import type { KinkData } from '@/lib/types'
import { KINK_CATALOG, findKinkDef } from '@/lib/game/kink-catalog'

interface KinksPanelProps {
  kinks: KinkData[]
}

export function KinksPanel({ kinks }: KinksPanelProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'locked'>('all')

  const rows = useMemo(() => {
    return KINK_CATALOG.map((def) => {
      const row = kinks.find((k) => k.key === def.key)
      return {
        def,
        level: row?.discovered ? row.level : 0,
        xp: row?.xp ?? 0,
        maxXp: row?.maxXp ?? 100,
        discovered: Boolean(row?.discovered),
      }
    }).filter((r) => {
      if (filter === 'open') return r.discovered
      if (filter === 'locked') return !r.discovered
      return true
    })
  }, [kinks, filter])

  const openCount = kinks.filter((k) => k.discovered).length

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/20 p-3">
        <p className="text-xs font-bold text-fuchsia-200">🎭 Кінки Лари</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Кінк ≠ навичка. Навичка — <em>як</em> вона робить; кінк — <em>що</em> її заводить.
          Рівні 1–5 ростуть від сцен, risk-ходів і тегу KINK_TRIGGER.
        </p>
        <p className="text-[10px] text-fuchsia-300/80 mt-1.5">
          Відкрито: {openCount}/{KINK_CATALOG.length}
        </p>
      </div>

      <div className="flex gap-1">
        {([
          ['all', 'Усі'],
          ['open', 'Відкриті'],
          ['locked', 'Приховані'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`px-2 py-1 text-[10px] rounded-lg border ${
              filter === id
                ? 'border-fuchsia-500/50 bg-fuchsia-500/20 text-fuchsia-100'
                : 'border-border text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {rows.map(({ def, level, xp, maxXp, discovered }) => {
          const meaning = discovered && level >= 1 ? def.levelMeanings[Math.min(5, level) - 1] : null
          const xpPct = discovered ? Math.min(100, Math.round((xp / Math.max(1, maxXp)) * 100)) : 0
          return (
            <div
              key={def.key}
              className={`p-2.5 rounded-xl border ${
                discovered
                  ? 'border-fuchsia-500/35 bg-fuchsia-950/25'
                  : 'border-border/40 bg-muted/15 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{discovered ? def.icon : '❓'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold">
                      {discovered ? def.name : '???'}
                    </span>
                    {discovered ? (
                      <span className="text-[10px] font-mono bg-fuchsia-500/20 text-fuchsia-200 px-1.5 py-0.5 rounded">
                        Lv{level}/5
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">не відкрито</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {discovered ? def.description : 'Зʼявиться після відповідної сцени…'}
                  </p>
                  {meaning && (
                    <p className="text-[10px] text-fuchsia-200/90 mt-1">
                      📏 Зараз: <span className="font-medium">{meaning}</span>
                    </p>
                  )}
                  {discovered && level < 5 && (
                    <div className="mt-1.5 h-1 w-full max-w-[10rem] bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-fuchsia-500 rounded-full"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                  )}
                  {discovered && (
                    <p className="text-[9px] text-muted-foreground/80 mt-1 leading-snug">
                      ⚙️ {def.effectByLevel}
                    </p>
                  )}
                  {discovered && level >= 1 && (
                    <div className="mt-1.5 space-y-0.5">
                      {def.levelMeanings.map((m, i) => (
                        <p
                          key={i}
                          className={`text-[9px] ${
                            level >= i + 1 ? 'text-fuchsia-100/90' : 'text-muted-foreground/50'
                          }`}
                        >
                          {level >= i + 1 ? '✓' : '○'} Lv{i + 1}: {m}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function formatKinkToast(p: {
  name: string
  icon: string
  newlyDiscovered?: boolean
  fromLevel: number
  toLevel: number
  xp: number
}) {
  if (p.newlyDiscovered) return `${p.icon} Новий кінк: ${p.name}`
  if (p.toLevel > p.fromLevel) return `${p.icon} ${p.name}: Lv${p.fromLevel} → Lv${p.toLevel}`
  return `${p.icon} ${p.name} +${p.xp} XP`
}

// silence unused if tree-shaken
void findKinkDef
