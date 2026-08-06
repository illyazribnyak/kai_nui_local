'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, MessageSquare, Swords, Scroll, X } from 'lucide-react'
import { STARTING_BUILDS, type StartingBuildId } from '@/lib/game/starting-builds'

const TIPS = [
  {
    icon: <MessageSquare className="w-5 h-5 text-primary" />,
    title: 'Пиши дію від імені Лари',
    text: 'Наприклад: «Оглянутись», «Піти в джунглі», «Поговорити з Тане».',
  },
  {
    icon: <Swords className="w-5 h-5 text-primary" />,
    title: 'Кнопки швидких дій',
    text: 'Під чатом — готові ходи. «Ще раз» повторює останню дію.',
  },
  {
    icon: <Scroll className="w-5 h-5 text-primary" />,
    title: 'Квести й лор',
    text: 'У сайдбарі: квести (драбина до храму), NPC, факти світу, карта.',
  },
  {
    icon: <Compass className="w-5 h-5 text-primary" />,
    title: 'Сейви',
    text: 'Слоти, export/import JSON. «Переграти хід» відкочує останню дію.',
  },
]

const STARTERS = [
  'Окликнути Джека — чи він поруч на березі?',
  'Піти вздовж берега до уламків човна',
  'Пошукати воду і їжу',
  'Перевірити амулет',
  'Оглянутися навколо',
]

export function OnboardingOverlay({
  onClose,
  onStart,
  onPickBuild,
}: {
  onClose: () => void
  onStart: (text: string) => void
  /** Optional: persist build before first action (parent may no-op) */
  onPickBuild?: (buildId: StartingBuildId) => void
}) {
  const [buildId, setBuildId] = useState<StartingBuildId>('balanced')

  const pick = (id: StartingBuildId) => {
    setBuildId(id)
    onPickBuild?.(id)
  }

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto panel-scroll">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-5 sm:p-6 max-h-[min(90dvh,44rem)] flex flex-col min-h-0 my-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 rounded-lg text-muted-foreground hover:bg-muted z-10"
          aria-label="Закрити"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1 flex-shrink-0 pr-8">
          <Compass className="w-6 h-6 text-primary flex-shrink-0" />
          <h2 className="font-display text-lg font-bold truncate">Острів Кай-Нуї</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3 flex-shrink-0">
          Ти — Лара Крафт. Мета — вижити і знайти Скарб Атлантів.
        </p>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex-shrink-0">
          Стартовий білд
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 flex-shrink-0">
          {STARTING_BUILDS.map((b) => {
            const active = buildId === b.id
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => pick(b.id)}
                className={`text-left rounded-xl border p-2.5 transition-colors ${
                  active
                    ? 'border-primary bg-primary/15 ring-1 ring-primary/40'
                    : 'border-border/60 bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="text-sm font-medium">
                  {b.icon} {b.name}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{b.blurb}</p>
              </button>
            )
          })}
        </div>

        <div className="space-y-3 mb-4 overflow-y-auto panel-scroll min-h-0 flex-1 pr-0.5">
          {TIPS.map((t) => (
            <div
              key={t.title}
              className="flex gap-3 rounded-xl bg-muted/40 border border-border/50 p-3 min-w-0"
            >
              <div className="flex-shrink-0 mt-0.5">{t.icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed break-words">
                  {t.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-2 text-center flex-shrink-0">Почати з дії:</p>
        <div className="flex flex-wrap gap-2 justify-center mb-2 flex-shrink-0">
          {STARTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStart(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-primary/20 hover:border-primary/40"
            >
              {s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          Закрити і грати вільно
        </button>
      </motion.div>
    </div>
  )
}
