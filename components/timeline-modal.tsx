'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { History, RotateCcw, X, Clock, MapPin, Calendar, CheckCircle2 } from 'lucide-react'
import type { MessageData } from '@/lib/types'

interface TimelineModalProps {
  isOpen: boolean
  messages: MessageData[]
  onClose: () => void
  onRedoTurn: () => void
  onRepeatMessage: (msg: string) => void
}

export function TimelineModal({
  isOpen,
  messages,
  onClose,
  onRedoTurn,
  onRepeatMessage,
}: TimelineModalProps) {
  if (!isOpen) return null

  // Filter player messages for the timeline
  const playerTurns = messages.filter((m) => m.role === 'user')

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-violet-400" />
              <div>
                <h2 className="font-bold text-base">⏪ Хронологія та Хід Історії</h2>
                <p className="text-xs text-muted-foreground">Перегляд виконаних дій Лари ({playerTurns.length} ходів)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Redo & Export Action Banner */}
          <div className="p-3 bg-violet-950/30 border-b border-violet-900/40 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-violet-200">
              Хронологія та експорт вашої історії
            </p>
            <div className="flex items-center gap-2">
              <a
                href="/api/export-story"
                download
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow active:scale-95 transition-all flex-shrink-0"
              >
                📖 Завантажити роман
              </a>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onRedoTurn()
                }}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow active:scale-95 transition-all flex-shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Відкотити хід
              </button>
            </div>
          </div>

          {/* Turns List */}
          <div className="p-4 overflow-y-auto panel-scroll flex-1 space-y-3">
            {playerTurns.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Хронологія порожня</p>
            ) : (
              playerTurns.map((turn, index) => (
                <div
                  key={turn.id || index}
                  className="p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-violet-950 border border-violet-800 text-violet-300 font-mono text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{turn.content}</p>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground/60" />
                        {turn.createdAt ? new Date(turn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Зараз'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onRepeatMessage(turn.content)
                    }}
                    className="px-2.5 py-1 text-[11px] bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg border border-border flex items-center gap-1 flex-shrink-0 transition-all"
                  >
                    Повторити
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
