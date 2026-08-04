'use client'

import { motion } from 'framer-motion'
import { Trophy, Award, Lock, Sparkles, Star, ShieldCheck } from 'lucide-react'
import type { AchievementData } from '@/lib/types'

interface CanonAchievement {
  id: string
  name: string
  description: string
  icon: string
  tier: 'gold' | 'silver' | 'bronze' | 'secret'
}

const CANON_ACHIEVEMENTS: CanonAchievement[] = [
  { id: 'first_steps', name: 'Перші кроки', description: 'Вибратися на піщаний берег острова після катастрофи', icon: '🏖️', tier: 'bronze' },
  { id: 'waterfall_cure', name: 'Чиста Вода', description: 'Знайти водоспад та втамувати спрагу', icon: '💧', tier: 'bronze' },
  { id: 'tane_meet', name: 'Зустріч з Остров’янином', description: 'Познайомитися з Тане, воїном племені Кай-Тору', icon: '🛖', tier: 'silver' },
  { id: 'first_pleasure', name: 'Ніжний Дотик', description: 'Відчути перше еротичне піднесення від Амулета', icon: '💋', tier: 'gold' },
  { id: 'combat_victory', name: 'Захисниця Джунглів', description: 'Перемогти дикого звіра у тактичному бою', icon: '⚔️', tier: 'silver' },
  { id: 'temple_secret', name: 'Таємниця Храму', description: 'Проникнути до древнього Храму Насолоди', icon: '🏛️', tier: 'gold' },
  { id: 'tribe_ally', name: 'Союзник Кай-Тору', description: 'Заслужити високу повагу вождя Макаї', icon: '👑', tier: 'gold' },
  { id: 'crafting_master', name: 'Майстриня Крафту', description: 'Змайструвати першу зброю на верстаку', icon: '🔨', tier: 'bronze' },
]

interface AchievementsGalleryProps {
  unlockedAchievements: AchievementData[]
}

export function AchievementsGallery({ unlockedAchievements }: AchievementsGalleryProps) {
  const isUnlocked = (name: string) => {
    return unlockedAchievements.some((a) => a.name.toLowerCase().includes(name.toLowerCase()))
  }

  const unlockedCount = unlockedAchievements.length
  const totalCount = Math.max(CANON_ACHIEVEMENTS.length, unlockedCount)
  const percent = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-amber-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" /> Прогрес Нагород
          </span>
          <span className="font-mono text-amber-400 font-bold">{unlockedCount}/{totalCount} ({percent}%)</span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-amber-900/40">
          <motion.div
            className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full rounded-full"
            style={{ width: `${percent}%` }}
            animate={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-2.5">
        {CANON_ACHIEVEMENTS.map((ach) => {
          const unlocked = isUnlocked(ach.name)
          const tierBorder = ach.tier === 'gold'
            ? 'border-amber-500/50 bg-amber-950/20'
            : ach.tier === 'silver'
            ? 'border-slate-400/40 bg-slate-900/30'
            : 'border-amber-900/40 bg-amber-950/10'

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className={`p-3 rounded-xl border transition-all ${
                unlocked
                  ? `${tierBorder} shadow-lg shadow-amber-500/5`
                  : 'border-border/40 bg-muted/10 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${
                    unlocked
                      ? 'bg-amber-500/20 border-amber-400/40 shadow-inner'
                      : 'bg-muted/40 border-border/40 text-muted-foreground'
                  }`}
                >
                  {unlocked ? ach.icon : <Lock className="w-4 h-4 text-muted-foreground/60" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${unlocked ? 'text-amber-200' : 'text-muted-foreground'}`}>
                      {unlocked ? ach.name : '🔒 Заблокировано'}
                    </span>
                    {unlocked && (
                      <span className="text-[9px] font-semibold font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                        {ach.tier.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {unlocked ? ach.description : 'Розблокується при здійсненні відповідної події на острові'}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
