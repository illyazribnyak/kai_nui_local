'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Zap, Shield, HeartHandshake, Compass, Lock, CheckCircle2, ChevronRight } from 'lucide-react'
import type { SkillData } from '@/lib/types'

interface SkillNode {
  id: string
  name: string
  category: 'erotic' | 'survival' | 'combat'
  description: string
  requiredLevel?: number
  parentId?: string
  icon: string
}

const SKILL_TREE_NODES: SkillNode[] = [
  // Erotic Branch
  { id: 'erotic_1', name: 'Ніжний дотик', category: 'erotic', description: 'Базова майстерність ласк та зваблення партнера', icon: '🌹' },
  { id: 'erotic_2', name: 'Чувський масаж', category: 'erotic', description: 'Зданість розслабляти партнера та піднімати Бажання', parentId: 'erotic_1', icon: '💋' },
  { id: 'erotic_3', name: 'Мистецтво оральних ласк', category: 'erotic', description: 'Спеціальна техніка для прискореного нарощування Задоволення', parentId: 'erotic_2', icon: '🔥' },
  { id: 'erotic_4', name: 'Магія Амулета Насолоди', category: 'erotic', description: 'Використання амулета для виклику мульти-оргазмів', parentId: 'erotic_3', icon: '✨' },

  // Survival Branch
  { id: 'surv_1', name: 'Пошук ресурсів', category: 'survival', description: 'Уміння знаходити фрукти, чисту воду та гілки', icon: '🌿' },
  { id: 'surv_2', name: 'Травництво', category: 'survival', description: 'Збір цілющого листя для лікування ран та хвороб', parentId: 'surv_1', icon: '🍃' },
  { id: 'surv_3', name: 'Річкове полювання', category: 'survival', description: 'Ловля риби та полювання на дрібну здобич', parentId: 'surv_2', icon: '🐟' },
  { id: 'surv_4', name: 'Дух Джунглів', category: 'survival', description: 'Повна адаптація до дикого клімату острова', parentId: 'surv_3', icon: '🐾' },

  // Combat Branch
  { id: 'comb_1', name: 'Швидке ухилення', category: 'combat', description: 'Рефлекси для уникнення атак диких звірів', icon: '🏃' },
  { id: 'comb_2', name: 'Володіння списом', category: 'combat', description: 'Точний та сильний удар зброєю ближнього бою', parentId: 'comb_1', icon: '⚔️' },
  { id: 'comb_3', name: 'Тактичний блок', category: 'combat', description: 'Здатність відбивати важкі удари супротивників', parentId: 'comb_2', icon: '🛡️' },
  { id: 'comb_4', name: 'Воїн Острова', category: 'combat', description: 'Майстерне ведення бою проти диких племен', parentId: 'comb_3', icon: '🏆' },
]

interface SkillTreeProps {
  skills: SkillData[]
}

export function SkillTree({ skills }: SkillTreeProps) {
  const [activeBranch, setActiveBranch] = useState<'erotic' | 'survival' | 'combat'>('erotic')
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)

  const getSkillData = (name: string) => {
    return skills.find((s) => s.name.toLowerCase().includes(name.toLowerCase()))
  }

  const branchNodes = SKILL_TREE_NODES.filter((n) => n.category === activeBranch)

  return (
    <div className="space-y-4">
      {/* Branch Selectors */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
        <button
          type="button"
          onClick={() => setActiveBranch('erotic')}
          className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeBranch === 'erotic'
              ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🌹 Зваблення
        </button>
        <button
          type="button"
          onClick={() => setActiveBranch('survival')}
          className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeBranch === 'survival'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🌿 Виживання
        </button>
        <button
          type="button"
          onClick={() => setActiveBranch('combat')}
          className={`py-1.5 px-2 text-xs rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
            activeBranch === 'combat'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ⚔️ Бій
        </button>
      </div>

      {/* Visual Skill Path */}
      <div className="relative p-4 rounded-2xl border border-border/60 bg-slate-950/60 backdrop-blur-sm space-y-4">
        {branchNodes.map((node, index) => {
          const data = getSkillData(node.name)
          const level = data?.level ?? 0
          const xp = data?.xp ?? 0
          const maxXp = data?.maxXp ?? 100
          const isUnlocked = level > 0 || index === 0
          const xpPct = Math.min(100, Math.round((xp / maxXp) * 100))

          return (
            <div key={node.id} className="relative">
              {/* Connector line to next node */}
              {index < branchNodes.length - 1 && (
                <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/60 to-border -mb-4 z-0" />
              )}

              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedNode(node)}
                className={`relative z-10 p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  level > 0
                    ? 'border-primary/50 bg-primary/10 shadow-md shadow-primary/5'
                    : isUnlocked
                    ? 'border-border bg-card/80 hover:border-primary/40'
                    : 'border-border/40 bg-muted/20 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border ${
                      level > 0
                        ? 'bg-primary/20 border-primary shadow-inner'
                        : isUnlocked
                        ? 'bg-muted border-border'
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                  >
                    {isUnlocked ? node.icon : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${level > 0 ? 'text-primary' : 'text-foreground'}`}>
                        {node.name}
                      </span>
                      {level > 0 && (
                        <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                          Рів. {level}/5
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      {node.description}
                    </p>

                    {/* XP Progress bar */}
                    {level > 0 && (
                      <div className="w-36 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-border/40 mt-1.5">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${xpPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Selected Node Details Modal / Drawer */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3.5 rounded-xl border border-primary/40 bg-card/95 shadow-xl text-xs space-y-2 relative"
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground font-bold"
            >
              ✕
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedNode.icon}</span>
              <h4 className="font-bold text-sm text-primary">{selectedNode.name}</h4>
            </div>
            <p className="text-muted-foreground">{selectedNode.description}</p>
            <div className="p-2 rounded bg-muted/30 text-[11px] font-mono text-emerald-300">
              💡 Навичка прокачується автоматично при здійсненні відповідних дій у грі (наприклад, проведення секс-сцен, полювання, збір трав).
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
