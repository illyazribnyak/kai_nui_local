'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ChevronRight, Sparkles, Zap } from 'lucide-react'
import type { SkillData } from '@/lib/types'
import {
  SEX_SKILL_CATEGORIES,
  SEX_SKILL_TREE,
  type SexSkillCategory,
  type SexSkillNode,
} from '@/lib/game/sex-skill-tree'
import {
  computeSkillModifiers,
  isSkillUnlockedInTree,
  levelToDiceBonus,
  skillLevel,
} from '@/lib/game/skill-effects'
import { SEX_MOVES } from '@/lib/game/sex-moves'
import { SEX_SYNERGIES, computeActiveSynergies } from '@/lib/game/sex-synergies'

interface SkillTreeProps {
  skills: SkillData[]
}

export function SkillTree({ skills }: SkillTreeProps) {
  const [activeBranch, setActiveBranch] = useState<SexSkillCategory>('seduction')
  const [selectedNode, setSelectedNode] = useState<SexSkillNode | null>(null)

  const modifiers = useMemo(() => computeSkillModifiers(skills), [skills])
  const activeSynergies = useMemo(() => computeActiveSynergies(skills), [skills])
  const branchNodes = useMemo(
    () => SEX_SKILL_TREE.filter((n) => n.category === activeBranch),
    [activeBranch]
  )

  const getData = (name: string) => skills.find((s) => s.name === name)

  const activeCount = skills.filter((s) => s.level > 0).length

  return (
    <div className="space-y-4">
      {/* Live modifiers summary */}
      <div className="rounded-xl border border-pink-500/30 bg-pink-950/20 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-pink-200">
          <Zap className="w-3.5 h-3.5 text-pink-400" />
          Активні ефекти ({activeCount}/24)
        </div>
        {modifiers.lines.length === 0 ? (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Усі навички на 0. Під час сексу, флірту й ритуалів AI нараховує XP — рівні дають реальні
            бонуси до d20, pleasure, stamina, multi-orgasm і амулета.
          </p>
        ) : (
          <ul className="text-[10px] text-pink-100/85 space-y-0.5 max-h-28 overflow-y-auto panel-scroll">
            {modifiers.multiOrgasmUnlocked && (
              <li className="text-emerald-300">✓ Multi-orgasm розблоковано</li>
            )}
            {modifiers.partnerPleasureBonusPct > 0 && (
              <li>Partner pleasure +{modifiers.partnerPleasureBonusPct}%</li>
            )}
            {modifiers.laraPleasureBonusPct > 0 && (
              <li>Lara pleasure +{modifiers.laraPleasureBonusPct}%</li>
            )}
            {modifiers.staminaFloor > 0 && <li>Stamina floor {modifiers.staminaFloor}</li>}
            {modifiers.dominationBias !== 0 && (
              <li>
                Domination bias {modifiers.dominationBias > 0 ? '+' : ''}
                {modifiers.dominationBias}
              </li>
            )}
            {modifiers.amuletGainMultiplier > 1 && (
              <li>Amulet ×{modifiers.amuletGainMultiplier.toFixed(2)}</li>
            )}
            {modifiers.seductionCritOn19 && <li className="text-amber-300">✓ Крит зваблення 19–20</li>}
            {activeSynergies.map((s) => (
              <li key={s.id} className="text-amber-200">
                {s.icon} {s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* All synergies reference */}
      <div className="rounded-xl border border-border/50 bg-muted/20 p-2.5 space-y-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Синергії гілок</p>
        <div className="space-y-1 max-h-28 overflow-y-auto panel-scroll">
          {SEX_SYNERGIES.map((s) => {
            const on = activeSynergies.some((a) => a.id === s.id)
            return (
              <div
                key={s.id}
                className={`text-[10px] px-2 py-1 rounded-lg border ${
                  on
                    ? 'border-amber-500/40 bg-amber-950/30 text-amber-100'
                    : 'border-border/40 text-muted-foreground opacity-70'
                }`}
              >
                <span className="font-semibold">
                  {on ? '✓' : '○'} {s.icon} {s.name}
                </span>
                <span className="block text-[9px] opacity-80">{s.condition}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Branch Selectors */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
        {SEX_SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveBranch(cat.id)
              setSelectedNode(null)
            }}
            className={`py-1.5 px-1 text-[10px] sm:text-[11px] rounded-lg font-bold transition-all flex items-center justify-center gap-0.5 ${
              activeBranch === cat.id
                ? `${cat.activeClass} shadow-md`
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="truncate">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Visual Skill Path */}
      <div className="relative p-3 sm:p-4 rounded-2xl border border-border/60 bg-slate-950/60 backdrop-blur-sm space-y-3">
        {branchNodes.map((node, index) => {
          const data = getData(node.name)
          const level = data?.level ?? 0
          const xp = data?.xp ?? 0
          const maxXp = data?.maxXp ?? 100
          const unlocked = isSkillUnlockedInTree(node, skills)
          const xpPct = Math.min(100, Math.round((xp / Math.max(1, maxXp)) * 100))
          const diceBonus = levelToDiceBonus(level)

          return (
            <div key={node.id} className="relative">
              {index < branchNodes.length - 1 && (
                <div
                  className={`absolute left-6 top-12 bottom-0 w-0.5 -mb-3 z-0 ${
                    level > 0 ? 'bg-gradient-to-b from-primary/70 to-primary/20' : 'bg-border/60'
                  }`}
                />
              )}

              <motion.button
                type="button"
                whileHover={{ scale: unlocked ? 1.01 : 1 }}
                onClick={() => setSelectedNode(node)}
                className={`relative z-10 w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  level > 0
                    ? 'border-primary/50 bg-primary/10 shadow-md shadow-primary/5'
                    : unlocked
                    ? 'border-border bg-card/80 hover:border-primary/40'
                    : 'border-border/40 bg-muted/20 opacity-55'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 border ${
                      level > 0
                        ? 'bg-primary/20 border-primary shadow-inner'
                        : unlocked
                        ? 'bg-muted border-border'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {unlocked ? node.icon : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-bold ${level > 0 ? 'text-primary' : 'text-foreground'}`}
                      >
                        {node.name}
                      </span>
                      {level > 0 ? (
                        <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          Рів. {level}/5 · d20 +{diceBonus}
                        </span>
                      ) : unlocked ? (
                        <span className="text-[10px] text-muted-foreground">Відкрито · 0/5</span>
                      ) : (
                        <span className="text-[10px] text-slate-500">🔒 потрібен попередній ≥1</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {node.effectByLevel}
                    </p>

                    {level > 0 && level < 5 && (
                      <div className="w-36 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-border/40 mt-1.5">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${xpPct}%` }}
                        />
                      </div>
                    )}
                    {level >= 5 && (
                      <p className="text-[10px] text-amber-300/90 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Майстерність
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            </div>
          )
        })}
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3.5 rounded-xl border border-primary/40 bg-card/95 shadow-xl text-xs space-y-2 relative"
          >
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground font-bold"
              aria-label="Закрити"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 pr-6">
              <span className="text-xl">{selectedNode.icon}</span>
              <div>
                <h4 className="font-bold text-sm text-primary">{selectedNode.name}</h4>
                <p className="text-[10px] text-muted-foreground">
                  Рівень {skillLevel(skills, selectedNode.name)}/5
                  {skillLevel(skills, selectedNode.name) > 0 &&
                    ` · d20 +${levelToDiceBonus(skillLevel(skills, selectedNode.name))}`}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">{selectedNode.description}</p>
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-200 leading-relaxed">
              <span className="font-bold text-emerald-300">⚙️ Механіка: </span>
              {selectedNode.effectByLevel}
            </div>
            {(() => {
              const moves = SEX_MOVES.filter((m) => m.skillName === selectedNode.name)
              if (!moves.length) return null
              return (
                <div className="p-2 rounded bg-pink-950/40 border border-pink-800/40 text-[11px] text-pink-100/90 space-y-1">
                  <p className="font-bold text-pink-300">🎮 Ходи в секс-сцені:</p>
                  {moves.map((m) => (
                    <p key={m.id}>
                      {m.icon} <span className="font-semibold">{m.label}</span>
                      {m.minLevel > 0 ? ` (Lv≥${m.minLevel})` : ' (з Lv0)'} — {m.description}
                    </p>
                  ))}
                </div>
              )
            })()}
            {selectedNode.parentName && (
              <p className="text-[10px] text-muted-foreground">
                Вимога: «{selectedNode.parentName}» рівень ≥ 1
                {skillLevel(skills, selectedNode.parentName) >= 1 ? ' ✓' : ' ✗'}
              </p>
            )}
            <div className="p-2 rounded bg-muted/30 text-[11px] text-muted-foreground leading-relaxed">
              💡 XP нараховує AI тегом <code className="text-primary">SKILL_UPDATE</code> під час
              відповідних сцен. Сервер сам додає бонуси до кидків і секс-метрів — не лише «для
              вигляду».
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
