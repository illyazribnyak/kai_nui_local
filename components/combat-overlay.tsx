'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Shield, Zap, Heart, Flame, Sparkles, HeartHandshake, Eye } from 'lucide-react'

export interface EnemyStats {
  name: string
  hp: number
  maxHp: number
  type: string
  weapon?: string
}

interface CombatOverlayProps {
  enemy?: EnemyStats | null
  laraHp: number
  laraMaxHp: number
  laraEndurance: number
  amuletEnergy: number
  onCombatAction: (actionText: string) => void
  onClose?: () => void
}

export function CombatOverlay({
  enemy,
  laraHp,
  laraMaxHp,
  laraEndurance,
  amuletEnergy,
  onCombatAction,
  onClose,
}: CombatOverlayProps) {
  const defaultEnemy: EnemyStats = enemy || {
    name: 'Дикий Гієноїд-Мисливець',
    hp: 45,
    maxHp: 45,
    type: 'beast',
    weapon: 'Ікла та пазурі',
  }

  const [activeEnemyHp, setActiveEnemyHp] = useState(defaultEnemy.hp)

  const hpPercent = Math.max(0, Math.min(100, (laraHp / laraMaxHp) * 100))
  const enemyHpPercent = Math.max(0, Math.min(100, (activeEnemyHp / defaultEnemy.maxHp) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-red-500/40 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md max-w-3xl mx-auto my-3 overflow-hidden relative"
    >
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/40 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="font-bold text-red-200 text-sm tracking-wide">⚔️ БОЙОВИЙ РЕЖИМ</h3>
        </div>
        <span className="text-[10px] text-red-400/80 font-mono bg-red-950/60 px-2 py-0.5 rounded border border-red-900/50">
          Тактичний бій
        </span>
      </div>

      {/* Health Bars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Lara Status */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-900/40">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-emerald-300">👩 Лара Крафт</span>
            <span className="text-emerald-400 font-mono">{laraHp}/{laraMaxHp} HP</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-emerald-950">
            <motion.div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full"
              style={{ width: `${hpPercent}%` }}
              animate={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
            <span>Витривалість: {laraEndurance}/10</span>
            <span className="text-amber-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Амулет: {amuletEnergy}
            </span>
          </div>
        </div>

        {/* Enemy Status */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-red-900/40">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-red-300">👺 {defaultEnemy.name}</span>
            <span className="text-red-400 font-mono">{activeEnemyHp}/{defaultEnemy.maxHp} HP</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-red-950">
            <motion.div
              className="bg-gradient-to-r from-red-600 to-rose-400 h-full rounded-full"
              style={{ width: `${enemyHpPercent}%` }}
              animate={{ width: `${enemyHpPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 flex justify-between">
            <span>Зброя: {defaultEnemy.weapon || 'Ручний бій'}</span>
            <span className="text-red-400/80 font-medium">Ворог активний</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => onCombatAction('⚔️ Атакувати супротивника зі зброєю у руках')}
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-red-900/80 to-rose-900/80 hover:from-red-800 hover:to-rose-800 border border-red-700/50 text-red-100 text-xs font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Swords className="w-3.5 h-3.5 text-red-300" /> Атакувати
        </button>

        <button
          type="button"
          onClick={() => onCombatAction('🛡️ Блокувати атаку та приготувати контрудар')}
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-slate-200 text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-blue-400" /> Блок
        </button>

        <button
          type="button"
          onClick={() => onCombatAction('🏃 Ухилитися від удару та змінити позицію')}
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 text-slate-200 text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Ухилення
        </button>

        <button
          type="button"
          onClick={() => onCombatAction('✨ Використати сексуальні магічні чари Амулета')}
          className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-900/80 to-purple-900/80 hover:from-amber-800 hover:to-purple-800 border border-amber-600/50 text-amber-100 text-xs font-semibold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" /> Магія Амулета
        </button>
      </div>
    </motion.div>
  )
}
