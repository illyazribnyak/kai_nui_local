'use client'

import { motion } from 'framer-motion'
import { Lock, Loader2, Trees } from 'lucide-react'
import type { MoveAvailability } from '@/lib/game/sex-moves'

export interface HudMove {
  id: string
  label: string
  icon: string
  unlocked: boolean
  reason?: string
  skillName: string
  description: string
}

interface SexSkillMovesBarProps {
  moves: HudMove[]
  busy?: boolean
  onSelect: (moveId: string) => void
}

export function SexSkillMovesBar({ moves, busy, onSelect }: SexSkillMovesBarProps) {
  if (!moves.length) {
    return (
      <div className="max-w-3xl mx-auto px-1 py-1.5 text-[10px] text-muted-foreground text-center">
        <Trees className="w-3 h-3 inline mr-1 text-pink-400" />
        Прокачай навички в дереві — зʼявляться ходи близькості
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-1">
      <p className="text-[10px] text-pink-300/80 text-center flex items-center justify-center gap-1">
        <Trees className="w-3 h-3" />
        Ходи навичок
      </p>
      <div className="panel-scroll-x flex gap-1.5 pb-1 items-stretch">
        {moves.map((m) => {
          const locked = !m.unlocked
          return (
            <motion.button
              key={m.id}
              type="button"
              whileTap={locked || busy ? undefined : { scale: 0.96 }}
              disabled={locked || busy}
              title={locked ? m.reason || 'Заблоковано' : m.description}
              onClick={() => onSelect(m.id)}
              className={`flex-shrink-0 min-w-[5.5rem] max-w-[7.5rem] px-2 py-1.5 rounded-xl border text-left transition-all ${
                locked
                  ? 'border-border/40 bg-muted/20 opacity-55 cursor-not-allowed'
                  : 'border-pink-500/40 bg-pink-950/40 hover:bg-pink-900/50 hover:border-pink-400/60 text-pink-50'
              }`}
            >
              <div className="flex items-center gap-1 text-sm">
                {busy ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : locked ? (
                  <Lock className="w-3 h-3 text-slate-500" />
                ) : (
                  <span>{m.icon}</span>
                )}
                <span className="text-[10px] font-semibold truncate leading-tight">{m.label}</span>
              </div>
              {!locked && (
                <p className="text-[9px] text-pink-200/60 mt-0.5 truncate">{m.skillName}</p>
              )}
              {locked && m.reason && (
                <p className="text-[8px] text-slate-500 mt-0.5 truncate">{m.reason}</p>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/** Map MoveAvailability → HUD */
export function toHudMoves(list: MoveAvailability[]): HudMove[] {
  return list.map((a) => ({
    id: a.move.id,
    label: a.move.label,
    icon: a.move.icon,
    unlocked: a.unlocked,
    reason: a.reason,
    skillName: a.move.skillName,
    description: a.move.description,
  }))
}
