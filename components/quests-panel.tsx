'use client'

/**
 * Quest sidebar: main ladder tree + side chains (active / locked / done).
 * Week-2 extraction from game-client.
 */

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, ChevronDown, ChevronRight, Clock, XCircle } from 'lucide-react'
import type { QuestData } from '@/lib/types'
import { QUEST_LADDER } from '@/lib/game/quest-ladder-data'
import { SIDE_QUESTS } from '@/lib/game/canon-events'

type Props = {
  quests: QuestData[]
}

const CHAIN_LABEL: Record<string, string> = {
  jack: 'Джек',
  zek: 'Зек',
  tane_family: 'Рід Тане',
  centaur: 'Кентаври',
  tribe_entry: 'Вхід у племена',
  romance: 'Романтика',
  temple: 'Храм',
  other: 'Інше',
}

function statusIcon(status: string) {
  if (status === 'completed') return '✅'
  if (status === 'failed') return '❌'
  if (status === 'active') return '⏳'
  return '🔒'
}

export function QuestsPanel({ quests }: Props) {
  const [showCompleted, setShowCompleted] = useState(true)
  const [showSide, setShowSide] = useState(true)

  const byTitle = useMemo(() => {
    const m = new Map<string, QuestData>()
    for (const q of quests) m.set(q.title, q)
    return m
  }, [quests])

  const activeQuests = quests.filter((q) => q.status === 'active')
  const lockedQuests = quests.filter((q) => q.status === 'locked' || q.status === 'pending')
  const completedQuests = quests.filter((q) => q.status === 'completed')
  const failedQuests = quests.filter((q) => q.status === 'failed')

  const ladderRows = useMemo(() => {
    return QUEST_LADDER.map((step, i) => {
      const q = byTitle.get(step.title)
      const status = q?.status ?? (i === 0 ? 'active' : 'locked')
      return { step, status, quest: q, index: i }
    })
  }, [byTitle])

  const sideByChain = useMemo(() => {
    const groups = new Map<string, { def: (typeof SIDE_QUESTS)[0]; quest?: QuestData }[]>()
    for (const def of SIDE_QUESTS) {
      const chain = def.chain || 'other'
      if (!groups.has(chain)) groups.set(chain, [])
      groups.get(chain)!.push({ def, quest: byTitle.get(def.title) })
    }
    // Only show chains that have at least one quest in DB or always show ladder-related
    return [...groups.entries()]
      .map(([chain, items]) => ({
        chain,
        items: items.filter((x) => x.quest || chain === 'tribe_entry'),
        label: CHAIN_LABEL[chain] || chain,
      }))
      .filter((g) => g.items.some((i) => i.quest))
  }, [byTitle])

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
          ⏳ {activeQuests.length}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">
          🔒 {lockedQuests.length}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
          ✅ {completedQuests.length}
        </span>
        {failedQuests.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/25">
            ❌ {failedQuests.length}
          </span>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground leading-snug">
        Сервер закриває квести за FACT (completeFactKeys). Драбина — головний сюжет до храму.
      </p>

      {/* Main ladder tree */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Драбина сюжету
          </h3>
        </div>
        <div className="relative space-y-0 pl-2">
          {ladderRows.map(({ step, status, quest, index }, i) => {
            const done = status === 'completed'
            const active = status === 'active'
            const locked = !done && !active
            return (
              <div key={step.title} className="relative flex gap-2 pb-3 last:pb-0">
                {/* connector */}
                {i < ladderRows.length - 1 && (
                  <div
                    className={`absolute left-[9px] top-5 bottom-0 w-0.5 ${
                      done ? 'bg-emerald-500/40' : 'bg-border/50'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] ${
                    done
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : active
                        ? 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-muted text-muted-foreground/60'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </div>
                <div
                  className={`min-w-0 flex-1 rounded-lg border p-2 ${
                    active
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : done
                        ? 'border-emerald-500/20 bg-emerald-500/5 opacity-90'
                        : 'border-border/40 bg-muted/15 opacity-55'
                  }`}
                >
                  <p
                    className={`text-xs font-medium ${
                      done ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {statusIcon(status)} {step.title}
                  </p>
                  {(active || done) && step.description && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
                      {step.description}
                    </p>
                  )}
                  {locked && (
                    <p className="mt-0.5 text-[9px] text-muted-foreground/70">
                      Заблоковано — заверши попередній крок
                    </p>
                  )}
                  {quest?.givenBy && (
                    <p className="mt-0.5 text-[9px] text-muted-foreground/50">Від: {quest.givenBy}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Active non-ladder */}
      {activeQuests.filter((q) => !QUEST_LADDER.some((s) => s.title === q.title)).length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Активні побічні
            </h3>
          </div>
          {activeQuests
            .filter((q) => !QUEST_LADDER.some((s) => s.title === q.title))
            .map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5"
              >
                <p className="text-sm font-medium">⏳ {q.title}</p>
                {q.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{q.description}</p>
                )}
                {q.givenBy && (
                  <p className="mt-1 text-[10px] text-muted-foreground/60">Від: {q.givenBy}</p>
                )}
              </motion.div>
            ))}
        </div>
      )}

      {/* Side chains */}
      {sideByChain.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowSide((v) => !v)}
            className="flex w-full items-center gap-1.5 text-left"
          >
            {showSide ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ланцюги арок
            </h3>
          </button>
          {showSide &&
            sideByChain.map((g) => (
              <div key={g.chain} className="rounded-lg border border-border/50 bg-muted/10 p-2 space-y-1">
                <p className="text-[10px] font-semibold text-foreground/80">{g.label}</p>
                {g.items.map(({ def, quest }) => {
                  const st = quest?.status ?? '—'
                  return (
                    <div
                      key={def.title}
                      className={`flex items-start gap-1.5 text-[10px] ${
                        st === 'completed' ? 'opacity-60' : st === 'active' ? '' : 'opacity-50'
                      }`}
                    >
                      <span className="shrink-0">{statusIcon(st === '—' ? 'locked' : st)}</span>
                      <span className={st === 'completed' ? 'line-through' : ''}>{def.title}</span>
                    </div>
                  )
                })}
              </div>
            ))}
        </div>
      )}

      {/* Completed collapse */}
      {completedQuests.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex w-full items-center gap-1.5 text-left"
          >
            {showCompleted ? (
              <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Завершені ({completedQuests.length})
            </h3>
          </button>
          {showCompleted &&
            completedQuests.map((q) => (
              <div
                key={q.id}
                className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2 opacity-80"
              >
                <p className="text-xs font-medium line-through text-muted-foreground">
                  ✅ {q.title}
                </p>
              </div>
            ))}
        </div>
      )}

      {failedQuests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Провалені
            </h3>
          </div>
          {failedQuests.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 opacity-60"
            >
              <p className="text-xs font-medium line-through text-muted-foreground">❌ {q.title}</p>
            </div>
          ))}
        </div>
      )}

      {quests.length === 0 && (
        <div className="py-8 text-center">
          <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">Квестів ще немає</p>
        </div>
      )}
    </div>
  )
}
