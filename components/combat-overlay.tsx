'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { GameState, InventoryItemData, MessageData } from '@/lib/types'
import {
  detectEnemyFromContext,
  getPlayerCombatArsenal,
  type CombatActionType,
  type EnemyProfile,
  type TacticalAction,
} from '@/lib/game/combat'
import { computeWardrobeEffects } from '@/lib/game/wardrobe-effects'
import { toast } from 'sonner'

interface CombatOverlayProps {
  enemy?: EnemyProfile | null
  messages?: MessageData[]
  inventory?: InventoryItemData[]
  gameState?: GameState | null
  laraHp?: number
  laraMaxHp?: number
  onCombatAction: (actionText: string) => void
  onClose?: () => void
  /** Refresh inventory/skills after server loot */
  onServerUpdate?: () => void
}

export function CombatOverlay({
  enemy,
  messages = [],
  inventory = [],
  gameState = null,
  onCombatAction,
  onServerUpdate,
}: CombatOverlayProps) {
  const previewEnemy = useMemo(() => {
    if (enemy) return enemy
    return detectEnemyFromContext(messages, gameState)
  }, [enemy, messages, gameState])

  const localArsenal = useMemo(
    () => getPlayerCombatArsenal(inventory, gameState),
    [inventory, gameState]
  )

  const wardrobeFx = useMemo(() => computeWardrobeEffects(gameState), [gameState])

  const [enemyProfile, setEnemyProfile] = useState<EnemyProfile>(previewEnemy)
  const [currentEnemyHp, setCurrentEnemyHp] = useState(previewEnemy.hp)
  const [currentLaraHp, setCurrentLaraHp] = useState(80)
  const [laraMaxHp, setLaraMaxHp] = useState(100)
  const [combatLogs, setCombatLogs] = useState<string[]>([])
  const [lastRoll, setLastRoll] = useState<{ roll: number; isCrit: boolean } | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [isVictory, setIsVictory] = useState(false)
  const [earnedLoot, setEarnedLoot] = useState<Array<{ name: string; quantity: number }> | null>(
    null
  )
  const [arsenal, setArsenal] = useState(localArsenal)
  const [busy, setBusy] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // Start server combat session on mount
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const contextText = messages
          .slice(-4)
          .map((m) => m.content)
          .join('\n')
        const res = await fetch('/api/combat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start',
            enemyId: enemy?.id || previewEnemy.id,
            contextText,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          toast.error(data.error || 'Не вдалося почати бій на сервері')
          return
        }
        if (cancelled) return
        const c = data.combat
        setEnemyProfile(c.enemy)
        setCurrentEnemyHp(c.enemyHp)
        setCurrentLaraHp(c.laraHp)
        setLaraMaxHp(c.laraMaxHp)
        setArsenal(data.arsenal || localArsenal)
        setSessionReady(true)
      } catch (e) {
        console.error(e)
        toast.error('Помилка старту бою')
      }
    })()
    return () => {
      cancelled = true
      void fetch('/api/combat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      }).catch(() => {})
    }
    // only once per open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTurn = async (actionType: CombatActionType) => {
    if (isFinished || busy || !sessionReady) return
    setBusy(true)
    try {
      const res = await fetch('/api/combat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'turn', actionType }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Хід не прийнято')
        return
      }
      const result = data.result
      setCurrentEnemyHp(result.enemyHpRemaining)
      setCurrentLaraHp(result.laraHpRemaining)
      setLastRoll({ roll: result.roll, isCrit: result.isCrit })
      setCombatLogs((prev) => [result.logText, ...prev.slice(0, 4)])
      if (data.arsenal) setArsenal(data.arsenal)

      if (result.isFinished) {
        setIsFinished(true)
        setIsVictory(result.isVictory)
        if (result.isVictory && result.lootEarned) {
          setEarnedLoot(result.lootEarned)
          toast.success('Перемога! Лут на сервері.')
        }
        onServerUpdate?.()
      }

      onCombatAction(result.logText)
    } catch (e) {
      console.error(e)
      toast.error('Помилка бойового ходу')
    } finally {
      setBusy(false)
    }
  }

  const hpPercent = Math.max(0, Math.min(100, (currentLaraHp / laraMaxHp) * 100))
  const enemyHpPercent = Math.max(
    0,
    Math.min(100, (currentEnemyHp / enemyProfile.maxHp) * 100)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border-2 border-red-500/50 bg-slate-950/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md max-w-3xl mx-auto my-3 overflow-hidden relative text-slate-100"
    >
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-red-300/90 font-bold">
            Тактичний бій · сервер
          </div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>{enemyProfile.icon}</span> {enemyProfile.name}
          </h3>
          <p className="text-[11px] text-slate-400">
            {enemyProfile.weapon} · слабкість: {enemyProfile.weakness}
            {wardrobeFx.defenseBonus > 0 ? ` · захист одягу +${wardrobeFx.defenseBonus}` : ''}
          </p>
        </div>
        {lastRoll && (
          <div
            className={`text-center rounded-lg px-2 py-1 border ${
              lastRoll.isCrit
                ? 'border-amber-400 bg-amber-950/50'
                : 'border-slate-600 bg-slate-900/80'
            }`}
          >
            <div className="text-[9px] text-muted-foreground">d20</div>
            <div className="text-xl font-mono font-bold">{lastRoll.roll}</div>
          </div>
        )}
      </div>

      {/* HP bars */}
      <div className="space-y-2 mb-3 relative z-10">
        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span>Лара</span>
            <span className="font-mono">
              {currentLaraHp}/{laraMaxHp}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${hpPercent}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-0.5">
            <span>Ворог</span>
            <span className="font-mono">
              {currentEnemyHp}/{enemyProfile.maxHp}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${enemyHpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {!sessionReady && (
        <p className="text-xs text-muted-foreground mb-2">Ініціалізація серверного бою…</p>
      )}

      {isFinished ? (
        <div className="rounded-xl border border-border/50 bg-slate-900/70 p-3 text-center relative z-10">
          {isVictory ? (
            <div>
              <span className="text-2xl">🏆</span>
              <h4 className="text-base font-bold text-emerald-400 mt-1">ПЕРЕМОГА</h4>
              <p className="text-xs text-muted-foreground">Лут і XP нараховані на сервері.</p>
              {earnedLoot && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {earnedLoot.map((item) => (
                    <span
                      key={item.name}
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
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 block">
            Тактичний хід (серверний roll):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(arsenal.availableActions || []).map((action: TacticalAction) => (
              <button
                key={action.id}
                type="button"
                disabled={busy || !sessionReady}
                onClick={() => void handleTurn(action.id as CombatActionType)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-slate-100 text-xs font-semibold shadow-md transition-all disabled:opacity-50 text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{action.icon}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{action.label}</div>
                    <div className="text-[9px] font-medium text-emerald-400/90 truncate">
                      {action.bonusText}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button
              type="button"
              disabled={busy || !sessionReady}
              onClick={() => void handleTurn('seduce')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 border border-rose-500/40 text-rose-100 text-xs font-semibold disabled:opacity-50 text-left col-span-1 sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">💋</span>
                <div className="min-w-0">
                  <div className="font-bold text-rose-200 truncate">Чари Зваби / Підкорення</div>
                  <div className="text-[9px] font-medium text-rose-300/90 truncate">
                    Перевести бій у чуттєве підкорення
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {combatLogs.length > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono space-y-1 relative z-10">
          <span className="text-[9px] uppercase font-bold text-muted-foreground block">
            Лог (сервер):
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
