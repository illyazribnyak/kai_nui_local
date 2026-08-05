'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Shield, Zap, Sparkles, Heart, Trophy, AlertCircle, RefreshCw } from 'lucide-react'
import type { GameState, InventoryItemData, MessageData } from '@/lib/types'
import {
  detectEnemyFromContext,
  getPlayerCombatArsenal,
  resolveCombatTurn,
  type EnemyProfile,
  type CombatActionType,
  type TacticalAction,
} from '@/lib/game/combat'
import { computeWardrobeEffects } from '@/lib/game/wardrobe-effects'

interface CombatOverlayProps {
  enemy?: EnemyProfile | null
  messages?: MessageData[]
  inventory?: InventoryItemData[]
  gameState?: GameState | null
  laraHp?: number
  laraMaxHp?: number
  onCombatAction: (actionText: string) => void
  onClose?: () => void
}

export function CombatOverlay({
  enemy,
  messages = [],
  inventory = [],
  gameState = null,
  laraHp: initialLaraHp = 80,
  laraMaxHp = 100,
  onCombatAction,
}: CombatOverlayProps) {
  const activeEnemy = useMemo(() => {
    if (enemy) return enemy
    return detectEnemyFromContext(messages, gameState)
  }, [enemy, messages, gameState])

  const arsenal = useMemo(
    () => getPlayerCombatArsenal(inventory, gameState),
    [inventory, gameState]
  )

  const wardrobeFx = useMemo(() => computeWardrobeEffects(gameState), [gameState])

  // Combat Arena State
  const [currentEnemyHp, setCurrentEnemyHp] = useState(activeEnemy.hp)
  const [currentLaraHp, setCurrentLaraHp] = useState(initialLaraHp)
  const [combatLogs, setCombatLogs] = useState<string[]>([])
  const [lastRoll, setLastRoll] = useState<{ roll: number; isCrit: boolean } | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isVictory, setIsVictory] = useState(false)
  const [earnedLoot, setEarnedLoot] = useState<Array<{ name: string; quantity: number }> | null>(null)

  const handleTurn = (actionType: CombatActionType, labelText: string) => {
    if (isFinished) return

    const result = resolveCombatTurn(
      actionType,
      activeEnemy,
      currentEnemyHp,
      currentLaraHp,
      inventory,
      gameState
    )

    setCurrentEnemyHp(result.enemyHpRemaining)
    setCurrentLaraHp(result.laraHpRemaining)
    setLastRoll({ roll: result.roll, isCrit: result.isCrit })
    setCombatLogs((prev) => [result.logText, ...prev.slice(0, 4)])

    if (result.isFinished) {
      setIsFinished(true)
      setIsVictory(result.isVictory)
      if (result.isVictory && result.lootEarned) {
        setEarnedLoot(result.lootEarned)
      }
    }

    // Pass turn text to AI narrative stream
    onCombatAction(`${result.logText}`)
  }

  const hpPercent = Math.max(0, Math.min(100, (currentLaraHp / laraMaxHp) * 100))
  const enemyHpPercent = Math.max(0, Math.min(100, (currentEnemyHp / activeEnemy.maxHp) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border-2 border-red-500/50 bg-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md max-w-3xl mx-auto my-3 overflow-hidden relative text-slate-100"
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-900/50 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="font-extrabold text-red-200 text-sm tracking-wide">
            ⚔️ ТАКТИЧНА БОЙОВА АРЕНА 3.0
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {lastRoll && (
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                lastRoll.isCrit
                  ? 'bg-amber-500 text-slate-950 border-amber-300 animate-bounce'
                  : 'bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              🎲 d20: {lastRoll.roll} {lastRoll.isCrit ? 'CRIT!' : ''}
            </span>
          )}
          {wardrobeFx.defenseBonus > 0 && (
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/40">
              🛡️ Захист одягу +{wardrobeFx.defenseBonus}
            </span>
          )}
        </div>
      </div>

      {/* Health Bars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Lara Status */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-900/40 shadow-inner">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              👩 Лара Крафт
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {currentLaraHp}/{laraMaxHp} HP
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-emerald-950 p-0.5">
            <motion.div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full"
              style={{ width: `${hpPercent}%` }}
              animate={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 font-medium">
            <span>Витривалість: {gameState?.endurance ?? 7}/10</span>
            <span className="text-amber-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Амулет: {gameState?.amuletEnergy ?? 0}
            </span>
          </div>
        </div>

        {/* Enemy Status */}
        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-red-900/40 shadow-inner">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-red-300 flex items-center gap-1.5 truncate">
              <span className="text-base">{activeEnemy.icon}</span> {activeEnemy.name}
            </span>
            <span className="text-red-400 font-mono font-bold">
              {currentEnemyHp}/{activeEnemy.maxHp} HP
            </span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-red-950 p-0.5">
            <motion.div
              className="bg-gradient-to-r from-red-600 to-rose-400 h-full rounded-full"
              style={{ width: `${enemyHpPercent}%` }}
              animate={{ width: `${enemyHpPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 flex items-center justify-between">
            <span className="truncate">Зброя: {activeEnemy.weapon}</span>
            {activeEnemy.weakness && (
              <span className="text-amber-300/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0 ml-1">
                ⚡ Слабкість: {activeEnemy.weakness}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Victory / Defeat Overlay Banner */}
      {isFinished ? (
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 text-center space-y-3 my-2">
          {isVictory ? (
            <div>
              <span className="text-2xl">🏆</span>
              <h4 className="text-base font-bold text-amber-300 mt-1">
                ПЕРЕМОГА У БОЮ!
              </h4>
              <p className="text-xs text-muted-foreground">
                Ворога здолано! Отримано ігровий досвід та трофеї з поля бою.
              </p>
              {earnedLoot && (
                <div className="flex justify-center gap-2 mt-2">
                  {earnedLoot.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-amber-950/60 text-amber-200 border border-amber-500/30 px-2 py-1 rounded-lg"
                    >
                      🎁 {item.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="text-2xl">💀</span>
              <h4 className="text-base font-bold text-rose-400 mt-1">ЛАРА ВИСНАЖЕНА</h4>
              <p className="text-xs text-muted-foreground">
                Витривалість підійшла до межі, але магія острова зберігає життя...
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Action Buttons Grid */
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 block">
            Виберіть тактичний хід арсеналу:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {arsenal.availableActions.map((action: TacticalAction) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleTurn(action.id as CombatActionType, action.label)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-slate-100 text-xs font-semibold shadow-md transition-all transform hover:scale-[1.01] active:scale-95 group text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{action.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-white group-hover:text-emerald-300 truncate">
                      {action.label}
                    </div>
                    <div className="text-[9px] font-medium text-emerald-400/90 truncate">
                      {action.bonusText}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Special Seduce Button */}
            <button
              type="button"
              onClick={() => handleTurn('seduce', 'Чари Зваби')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 hover:from-rose-900 hover:to-purple-900 border border-rose-500/40 text-rose-100 text-xs font-semibold shadow-md transition-all transform hover:scale-[1.01] active:scale-95 group text-left col-span-1 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">💋</span>
                <div className="min-w-0">
                  <div className="font-bold text-rose-200 group-hover:text-rose-100 truncate">
                    Чари Зваби / Підкорення
                  </div>
                  <div className="text-[9px] font-medium text-rose-300/90 truncate">
                    Перевести бій у чуттєве підкорення
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Combat Feed Logs */}
      {combatLogs.length > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono space-y-1">
          <span className="text-[9px] uppercase font-bold text-muted-foreground block">
            Лог бойових ходів:
          </span>
          {combatLogs.map((log, i) => (
            <div key={i} className="text-slate-300/90 leading-tight">
              • {log}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
