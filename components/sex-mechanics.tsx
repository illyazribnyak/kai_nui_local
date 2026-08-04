'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

// ====== 1. DICE ROLL POPUP ======
export function DiceRollPopup({ roll, onDone }: { roll: any; onDone: () => void }) {
  const [displayNum, setDisplayNum] = useState(1)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => setDisplayNum(Math.floor(Math.random() * 20) + 1), 80)
    const timer = setTimeout(() => { clearInterval(interval); setDisplayNum(roll?.total ?? roll?.roll ?? 1); setSettled(true) }, 1200)
    const dismiss = setTimeout(onDone, 4000)
    return () => { clearInterval(interval); clearTimeout(timer); clearTimeout(dismiss) }
  }, [roll, onDone])

  const rKey = (roll?.result ?? 'success') as 'success' | 'failure' | 'critical_success' | 'critical_failure'
  const resultColor = { success: 'text-green-400', failure: 'text-red-400', critical_success: 'text-yellow-300', critical_failure: 'text-red-600' }[rKey]
  const resultLabel = { success: 'Успіх!', failure: 'Провал!', critical_success: '🎯 Крит!', critical_failure: '💀 Критичний провал!' }[rKey]
  const resultBg = { success: 'from-green-900/80 to-green-950/80 border-green-500/50', failure: 'from-red-900/80 to-red-950/80 border-red-500/50', critical_success: 'from-yellow-900/80 to-amber-950/80 border-yellow-400/60', critical_failure: 'from-red-950/80 to-black/80 border-red-700/50' }[rKey]

  return (
    <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: -20 }}
      className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-gradient-to-b ${resultBg} border rounded-2xl p-6 shadow-2xl min-w-[260px] text-center backdrop-blur-md`}>
      <p className="text-xs text-white/60 mb-1">{roll?.description}</p>
      <p className="text-sm text-white/80 mb-3">🎯 {roll?.skill} (DC {roll?.dc})</p>
      <motion.div animate={settled ? {} : { rotateY: [0, 360], rotateX: [0, 360] }} transition={{ duration: 0.4, repeat: settled ? 0 : Infinity }}
        className={`text-5xl font-black mx-auto w-20 h-20 flex items-center justify-center rounded-xl ${settled ? resultColor : 'text-white'} ${settled ? (rKey.includes('success') ? 'dice-glow-gold' : 'dice-glow-red') : ''}`}>
        {displayNum}
      </motion.div>
      {settled && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <p className={`text-xl font-bold ${resultColor}`}>{resultLabel}</p>
          <p className="text-xs text-white/50 mt-1">🎲 {roll?.roll} + {roll?.bonus} = {roll?.total}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

// ====== 2. DUAL PLEASURE METER ======
export function DualPleasureMeter({ lara, partner, partnerName }: { lara: number; partner: number; partnerName?: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
      className="fixed right-3 top-1/2 -translate-y-1/2 z-[60] flex gap-2 items-end">
      {/* Lara bar */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-purple-300 font-bold">{lara}%</span>
        <div className="w-5 h-48 bg-black/60 rounded-full border border-purple-500/30 overflow-hidden relative">
          <motion.div animate={{ height: `${lara}%` }} transition={{ type: 'spring', stiffness: 100 }}
            className={`absolute bottom-0 w-full rounded-full bg-gradient-to-t from-purple-600 via-pink-500 to-rose-400 ${lara > 70 ? 'animate-pulse' : ''}`} />
        </div>
        <span className="text-[9px] text-purple-400">💜</span>
      </div>
      {/* Partner bar */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-orange-300 font-bold">{partner}%</span>
        <div className="w-5 h-48 bg-black/60 rounded-full border border-orange-500/30 overflow-hidden relative">
          <motion.div animate={{ height: `${partner}%` }} transition={{ type: 'spring', stiffness: 100 }}
            className={`absolute bottom-0 w-full rounded-full bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 ${partner > 70 ? 'animate-pulse' : ''}`} />
        </div>
        <span className="text-[9px] text-orange-400">🧡</span>
      </div>
      {partnerName && <p className="text-[8px] text-white/40 writing-mode-vertical absolute -bottom-5 w-full text-center">{partnerName}</p>}
    </motion.div>
  )
}

// ====== 3. PHASE INDICATOR ======
export function PhaseIndicator({ phase, label }: { phase: string; label?: string }) {
  const phases = ['foreplay', 'main', 'climax'] as const
  const idx = phases.indexOf(phase as any)
  const labels = ['Прелюдія', 'Основна дія', 'Кульмінація']
  const icons = ['💋', '🔥', '💥']
  const colors = ['from-pink-500 to-rose-400', 'from-red-500 to-orange-400', 'from-yellow-400 to-red-500']

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-pink-500/30">
      {phases.map((p, i) => (
        <div key={p} className="flex items-center gap-1">
          <div className={`w-7 h-1.5 rounded-full transition-all duration-500 ${i <= idx ? `bg-gradient-to-r ${colors[idx >= 0 ? idx : 0]}` : 'bg-white/20'}`} />
          {i === idx && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs">
              {icons[i]} <span className="text-[10px] text-white/80">{label || labels[i]}</span>
            </motion.span>
          )}
          {i < phases.length - 1 && <span className="text-white/20 text-[8px]">›</span>}
        </div>
      ))}
    </motion.div>
  )
}

// ====== 4. STAMINA BAR ======
export function StaminaBar({ value, tempo }: { value: number; tempo: string }) {
  const tempoData = {
    slow: { label: '🐢 Повільний', color: 'from-green-500 to-emerald-400' },
    medium: { label: '🏃 Середній', color: 'from-yellow-500 to-amber-400' },
    fast: { label: '⚡ Швидкий', color: 'from-red-500 to-orange-400' },
  }[tempo] ?? { label: tempo, color: 'from-blue-500 to-cyan-400' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-500/20">
      <span className="text-[10px] text-emerald-300">⚡</span>
      <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${value}%` }} transition={{ type: 'spring', stiffness: 100 }}
          className={`h-full rounded-full bg-gradient-to-r ${tempoData.color} ${value < 20 ? 'animate-pulse' : ''}`} />
      </div>
      <span className="text-[9px] text-white/60">{value}%</span>
      <span className="text-[9px] text-white/40">{tempoData.label}</span>
    </motion.div>
  )
}

// ====== 5. COMBO COUNTER ======
export function ComboCounter({ count, label }: { count: number; label: string }) {
  return (
    <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
      className="fixed top-24 right-4 z-[65]">
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, repeat: 2 }}
        className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl px-4 py-2 shadow-lg shadow-orange-500/40 border border-orange-400/50">
        <p className="text-xl font-black">{label || `🔥 x${count}`}</p>
        <p className="text-[10px] text-white/70 text-center">множник до XP</p>
      </motion.div>
    </motion.div>
  )
}

// ====== 6. DOMINATION SCALE ======
export function DominationScale({ value }: { value: number }) {
  const pct = (value + 100) / 2 // -100..+100 → 0..100
  const isSubmission = value < -30
  const isDomination = value > 30
  const isExtreme = Math.abs(value) > 70

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-500/20">
      <span className={`text-[10px] ${isSubmission ? 'text-blue-400' : 'text-white/40'}`}>🦋 Покора</span>
      <div className="w-24 h-2.5 bg-white/10 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-red-500/20" />
        <motion.div animate={{ left: `${pct}%` }} transition={{ type: 'spring', stiffness: 120 }}
          className={`absolute top-0 w-2.5 h-2.5 rounded-full -translate-x-1/2 ${isExtreme ? 'animate-pulse shadow-lg' : ''} ${isDomination ? 'bg-red-500 shadow-red-500/50' : isSubmission ? 'bg-blue-500 shadow-blue-500/50' : 'bg-purple-400'}`} />
      </div>
      <span className={`text-[10px] ${isDomination ? 'text-red-400' : 'text-white/40'}`}>Влада 👑</span>
    </motion.div>
  )
}

// ====== 7. PARTNER REACTION BUBBLE ======
export function PartnerReaction({ text, emotion }: { text: string; emotion: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="bg-gradient-to-r from-pink-900/80 to-rose-900/80 backdrop-blur-sm border border-pink-500/30 rounded-2xl rounded-bl-sm px-3 py-2 max-w-[280px] shadow-lg">
      <div className="flex items-start gap-2">
        <span className="text-lg">{emotion}</span>
        <p className="text-xs text-pink-100 italic leading-relaxed">«{text}»</p>
      </div>
    </motion.div>
  )
}

// ====== 8. SEX CHOICE CARDS (with risk + optional skill move) ======
export function SexChoiceCards({
  options,
  onSelect,
  onSkillMove,
}: {
  options: { text: string; bonus: string; risk?: boolean; skillMoveId?: string }[]
  onSelect: (text: string) => void
  onSkillMove?: (moveId: string) => void
}) {
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-xs text-pink-300/80 text-center mb-1">🎭 Оберіть дію:</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
        {options.map((opt, i) => (
          <motion.button key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            onClick={() => {
              if (opt.skillMoveId && onSkillMove) onSkillMove(opt.skillMoveId)
              else onSelect(opt.text)
            }}
            className={`text-left p-3 rounded-xl border transition-all active:scale-95 min-w-0 ${
              opt.skillMoveId
                ? 'border-violet-500/45 bg-violet-950/40 hover:bg-violet-900/50 hover:border-violet-400/60'
                : opt.risk
                ? 'border-red-500/50 bg-red-950/40 hover:bg-red-900/50 hover:border-red-400/70 hover:shadow-lg hover:shadow-red-500/20'
                : 'border-pink-500/30 bg-pink-950/30 hover:bg-pink-900/40 hover:border-pink-400/50'
            }`}>
            <p className="text-sm font-medium text-white break-words">{opt.text}</p>
            <p className={`text-[10px] mt-1 break-words ${
              opt.skillMoveId ? 'text-violet-300' : opt.risk ? 'text-red-300' : 'text-pink-300/70'
            }`}>{opt.bonus}</p>
            {opt.skillMoveId && <span className="text-[9px] text-violet-300 font-bold">🌳 НАВИЧКА</span>}
            {opt.risk && !opt.skillMoveId && <span className="text-[9px] text-red-400 font-bold">⚠️ РИЗИК</span>}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ====== 9. EROGENOUS ZONE DISCOVERY ======
export function ErogenousDiscovery({ zone, race, bonus, onDone }: { zone: string; race: string; bonus: number; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t) }, [onDone])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
      className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[65] bg-gradient-to-b from-pink-900/90 to-purple-950/90 border border-pink-400/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-center min-w-[220px]">
      <motion.p animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: 1 }} className="text-3xl mb-2">🗺️</motion.p>
      <p className="text-sm font-bold text-pink-200">Нова ерогенна зона!</p>
      <p className="text-lg font-black text-white mt-1">{zone}</p>
      <p className="text-xs text-purple-300 mt-1">{race}</p>
      <p className="text-sm text-green-400 font-bold mt-2">+{bonus}% задоволення партнера</p>
    </motion.div>
  )
}

// ====== 10. CONTEXT BONUS BADGES ======
export function ContextBonusBadges({ bonuses }: { bonuses: { source: string; value: string }[] }) {
  if (!bonuses || bonuses.length === 0) return null
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="flex flex-wrap gap-1.5 justify-center">
      {bonuses.map((b, i) => (
        <span key={i} className="text-[10px] bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 text-white/70">
          {b.source} <span className="text-emerald-400 font-bold">{b.value}</span>
        </span>
      ))}
    </motion.div>
  )
}

// ====== 10b. SKILL SYNERGY BADGES ======
export function SkillSynergyBadges({
  synergies,
}: {
  synergies: Array<{ id: string; name: string; icon: string; description?: string }>
}) {
  if (!synergies?.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-1.5 justify-center max-w-3xl mx-auto"
    >
      {synergies.map((s) => (
        <span
          key={s.id}
          title={s.description || s.name}
          className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-950/50 text-amber-100"
        >
          {s.icon} {s.name}
        </span>
      ))}
    </motion.div>
  )
}

// ====== 11. SCENE SUMMARY CARD ======
export function SceneSummaryCard({ summary, onDismiss }: { summary: any; onDismiss: () => void }) {
  const rows = [
    summary?.orgasm_type && { label: 'Оргазм', value: summary.orgasm_type, icon: '💥' },
    summary?.partner && { label: 'Партнер', value: summary.partner, icon: '💕' },
    summary?.lara_orgasm !== undefined && { label: 'Оргазм Лари', value: summary.lara_orgasm ? '✅ Так' : '❌ Ні', icon: '💜' },
    summary?.partner_orgasm !== undefined && { label: 'Оргазм партнера', value: summary.partner_orgasm ? '✅ Так' : '❌ Ні', icon: '🧡' },
    summary?.combo_max && { label: 'Макс. комбо', value: `x${summary.combo_max}`, icon: '🔥' },
    summary?.amulet_gain && { label: 'Енергія амулету', value: `+${summary.amulet_gain}`, icon: '🔮' },
    summary?.skill_name && { label: summary.skill_name, value: `+${summary.skill_xp} XP`, icon: '⭐' },
    summary?.pregnancy_risk > 0 && { label: 'Ризик вагітності', value: `${summary.pregnancy_risk}%`, icon: '🤰' },
    summary?.new_fetish && { label: 'Новий фетиш', value: summary.new_fetish, icon: '🎭' },
    summary?.marks && { label: 'Мітка', value: summary.marks, icon: '💋' },
  ].filter(Boolean) as { label: string; value: string; icon: string }[]

  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={onDismiss}>
      <motion.div onClick={e => e.stopPropagation()}
        className="bg-gradient-to-b from-pink-950/95 to-purple-950/95 border border-pink-500/40 rounded-2xl p-6 shadow-2xl max-w-sm w-full max-h-[min(90dvh,32rem)] flex flex-col min-h-0 my-auto">
        <h3 className="text-lg font-bold text-center text-pink-200 mb-4 flex-shrink-0">📊 Підсумок сцени</h3>
        <div className="grid grid-cols-2 gap-2 overflow-y-auto panel-scroll min-h-0 pr-0.5">
          {rows.map((r, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-2.5 border border-white/10 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-sm flex-shrink-0">{r.icon}</span>
                <span className="text-[10px] text-white/50 truncate">{r.label}</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5 break-words">{r.value}</p>
            </div>
          ))}
        </div>
        <button onClick={onDismiss} className="mt-4 w-full py-2 text-sm text-pink-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all flex-shrink-0">Закрити</button>
      </motion.div>
    </motion.div>
  )
}

// ====== 12. SCENE ATMOSPHERE OVERLAY ======
export function SceneAtmosphere({ atmosphere }: { atmosphere: string | null }) {
  if (!atmosphere) return null
  const cssClass = `scene-${atmosphere}`
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className={`fixed inset-0 z-[45] pointer-events-none ${cssClass}`} />
  )
}

// ====== 13. SCENE MOOD INDICATOR ======
export function SceneMoodIndicator({ mood, label, intensity }: { mood: string; label?: string; intensity?: number }) {
  const moodData: Record<string, { icon: string; color: string; bg: string }> = {
    tender: { icon: '🌸', color: 'text-pink-300', bg: 'border-pink-400/40 bg-pink-950/40' },
    passionate: { icon: '🔥', color: 'text-red-300', bg: 'border-red-400/40 bg-red-950/40' },
    aggressive: { icon: '⛓️', color: 'text-orange-300', bg: 'border-orange-400/40 bg-orange-950/40' },
    playful: { icon: '😏', color: 'text-yellow-300', bg: 'border-yellow-400/40 bg-yellow-950/40' },
    romantic: { icon: '💕', color: 'text-rose-300', bg: 'border-rose-400/40 bg-rose-950/40' },
    primal: { icon: '🐾', color: 'text-amber-300', bg: 'border-amber-400/40 bg-amber-950/40' },
  }
  const d = moodData[mood] || { icon: '💫', color: 'text-white/80', bg: 'border-white/20 bg-white/5' }
  const pct = Math.min(100, Math.max(0, intensity ?? 50))

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className={`flex items-center gap-2 rounded-full px-3 py-1 border backdrop-blur-sm ${d.bg}`}>
      <span className="text-sm">{d.icon}</span>
      <span className={`text-[11px] font-bold ${d.color}`}>{label || mood}</span>
      <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 100 }}
          className={`h-full rounded-full bg-gradient-to-r ${d.color === 'text-pink-300' ? 'from-pink-500 to-rose-400' : d.color === 'text-red-300' ? 'from-red-500 to-orange-400' : d.color === 'text-orange-300' ? 'from-orange-500 to-amber-400' : d.color === 'text-yellow-300' ? 'from-yellow-500 to-lime-400' : d.color === 'text-rose-300' ? 'from-rose-500 to-pink-400' : 'from-amber-500 to-orange-400'}`} />
      </div>
    </motion.div>
  )
}

// ====== 14. LARA DIALOGUE CARDS ======
export function LaraDialogueCards({ options, onSelect }: { options: { text: string; effect: string; mood: string }[]; onSelect: (text: string) => void }) {
  const moodIcon: Record<string, string> = { tender: '🌸', passionate: '🔥', dominant: '👑', submissive: '🦋', playful: '😏', provocative: '😈', romantic: '💕' }
  return (
    <div className="space-y-2 min-w-0">
      <p className="text-xs text-purple-300/80 text-center mb-1">💬 Що скаже Лара:</p>
      <div className="space-y-1.5 max-w-lg mx-auto">
        {options.map((opt, i) => (
          <motion.button key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            onClick={() => onSelect(opt.text)}
            className="w-full text-left p-2.5 rounded-xl border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 hover:border-purple-400/50 transition-all active:scale-[0.98] flex items-start gap-2 min-w-0">
            <span className="text-lg mt-0.5 flex-shrink-0">{moodIcon[opt.mood] || '💬'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-100 italic break-words">«{opt.text}»</p>
              <p className="text-[10px] text-purple-300/60 mt-0.5 break-words">{opt.effect}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ====== 15. MULTI ORGASM POPUP ======
export function MultiOrgasmPopup({ chain, multiplier, staminaCost, canContinue, onContinue, onStop }: {
  chain: number; multiplier: number; staminaCost: number; canContinue: boolean; onContinue: () => void; onStop: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-b from-amber-950/95 to-red-950/95 border border-amber-400/50 rounded-2xl p-6 shadow-2xl max-w-xs w-full mx-4 text-center">
        <motion.p animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: 2 }} className="text-4xl mb-2">🔥</motion.p>
        <h3 className="text-lg font-black text-amber-200">Мульти-оргазм!</h3>
        <p className="text-sm text-amber-300/80 mt-1">Ланцюг: <span className="font-black text-white">{chain}</span></p>
        <div className="mt-3 bg-black/30 rounded-xl p-3 space-y-1">
          <p className="text-xs text-green-400">🎯 Множник XP: <span className="font-bold">x{multiplier.toFixed(1)}</span></p>
          <p className="text-xs text-red-400">⚡ Витрати стаміни: <span className="font-bold">{staminaCost}%</span></p>
        </div>
        <div className="flex gap-2 mt-4">
          {canContinue ? (
            <motion.button whileTap={{ scale: 0.95 }} onClick={onContinue}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-amber-500/30">
              🔥 Продовжити
            </motion.button>
          ) : (
            <div className="flex-1 py-2.5 bg-gray-800 text-gray-500 font-bold rounded-xl text-sm text-center">Стаміни замало</div>
          )}
          <motion.button whileTap={{ scale: 0.95 }} onClick={onStop}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white/80 font-medium rounded-xl transition-all text-sm">
            Зупинитись
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ====== 16. PENIS STATS CARD ======
export function PenisStatsCard({ stats, onDismiss }: { stats: any; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 12000); return () => clearTimeout(t) }, [onDismiss])

  const riskColor: Record<string, string> = {
    'Низький': 'text-green-400',
    'Середній': 'text-yellow-400',
    'Високий': 'text-orange-400',
    'Дуже високий': 'text-red-500',
  }

  const rows = [
    { icon: '📏', label: 'Довжина', value: `${stats.length_cm} см` },
    { icon: '⭕', label: 'Обхват', value: `⌀ ${stats.girth_cm} см` },
    { icon: '🌀', label: 'Форма', value: stats.shape },
    { icon: '🔴', label: 'Головка', value: stats.head },
    stats.foreskin !== undefined && { icon: '🧤', label: 'Крайня плоть', value: stats.foreskin ? 'Є' : 'Немає' },
    stats.veins && { icon: '🪶', label: 'Вени', value: stats.veins },
    stats.balls && { icon: '⚪', label: 'Яєчка', value: stats.balls },
    stats.cum_ml && { icon: '💦', label: 'Сперма', value: `${stats.cum_ml} мл` },
    stats.cum_desc && { icon: '🧪', label: 'Опис', value: stats.cum_desc },
    stats.stamina_rounds && { icon: '⚡', label: 'Витривалість', value: `${stats.stamina_rounds} раундів` },
    stats.refractory_min && { icon: '⏱️', label: 'Відновлення', value: `${stats.refractory_min} хв` },
    stats.special && { icon: '✨', label: 'Особливість', value: stats.special },
  ].filter(Boolean) as { icon: string; label: string; value: string }[]

  return (
    <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={onDismiss}>
      <motion.div onClick={e => e.stopPropagation()}
        className="bg-gradient-to-b from-slate-900/95 to-indigo-950/95 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl max-w-sm w-full max-h-[min(90dvh,32rem)] flex flex-col min-h-0 my-auto">
        <div className="flex items-center justify-between gap-2 mb-3 flex-shrink-0 min-w-0">
          <h3 className="text-base font-bold text-indigo-200 truncate min-w-0">🍆 {stats.name}</h3>
          <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/60 flex-shrink-0 whitespace-nowrap">{stats.race} • {stats.type}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 overflow-y-auto panel-scroll min-h-0 pr-0.5">
          {rows.map((r, i) => (
            <div key={i} className="bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/10 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs flex-shrink-0">{r.icon}</span>
                <span className="text-[9px] text-white/50 truncate">{r.label}</span>
              </div>
              <p className="text-xs font-medium text-white mt-0.5 break-words">{r.value}</p>
            </div>
          ))}
        </div>
        {stats.risk_for_lara && (
          <div className="mt-2.5 flex items-center justify-between gap-2 bg-black/30 rounded-lg px-3 py-2 flex-shrink-0 min-w-0">
            <span className="text-[10px] text-white/50 flex-shrink-0">⚠️ Ризик для Лари:</span>
            <span className={`text-xs font-bold truncate ${riskColor[stats.risk_for_lara] || 'text-white/70'}`}>{stats.risk_for_lara}</span>
          </div>
        )}
        <button onClick={onDismiss} className="mt-3 w-full py-1.5 text-xs text-indigo-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all flex-shrink-0">Закрити</button>
      </motion.div>
    </motion.div>
  )
}

// ====== 17. TEMPO CONTROL BUTTONS ======
export function TempoControlButtons({ activeTempo, onChange }: { activeTempo: string; onChange: (tempo: string) => void }) {
  const tempos = [
    { key: 'slow', icon: '🐢', label: 'Повільно', color: 'border-green-500/50 bg-green-950/50 text-green-300', active: 'border-green-400 bg-green-900/80 text-green-200 shadow-lg shadow-green-500/30' },
    { key: 'medium', icon: '🏃', label: 'Середній', color: 'border-yellow-500/50 bg-yellow-950/50 text-yellow-300', active: 'border-yellow-400 bg-yellow-900/80 text-yellow-200 shadow-lg shadow-yellow-500/30' },
    { key: 'fast', icon: '⚡', label: 'Швидко', color: 'border-red-500/50 bg-red-950/50 text-red-300', active: 'border-red-400 bg-red-900/80 text-red-200 shadow-lg shadow-red-500/30' },
  ]
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-white/40 mr-0.5">Темп:</span>
      {tempos.map(t => (
        <motion.button key={t.key} whileTap={{ scale: 0.9 }}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all ${activeTempo === t.key ? t.active : t.color} hover:brightness-110`}>
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </motion.button>
      ))}
    </div>
  )
}
