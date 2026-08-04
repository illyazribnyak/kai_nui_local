'use client'

import type {
  BodyStateChip,
  FitStripView,
  FreeAction,
  ImpulseChoice,
  OrgasmForkOption,
  PartnerReactionChoice,
  SexControlMode,
  SexPositionDef,
  FitMicroAction,
} from '@/lib/game/sex-scene-live'
import { pressureLabel } from '@/lib/game/sex-scene-live'

type Props = {
  partnerName?: string | null
  /** B */
  pressure: number
  /** C */
  fit: FitStripView | null
  fitActions: FitMicroAction[]
  onFitAction: (id: string) => void
  /** F */
  positions: SexPositionDef[]
  positionId: string
  onPosition: (id: string) => void
  positionLocked?: boolean
  /** G */
  controlMode: SexControlMode
  onControlMode: (m: SexControlMode) => void
  freeActions: FreeAction[]
  onFreeAction: (a: FreeAction) => void
  /** A */
  reactionChoices: PartnerReactionChoice[]
  onReaction: (c: PartnerReactionChoice) => void
  /** I */
  bodyStates: BodyStateChip[]
  /** D */
  partnerMemories: string[]
  /** J */
  orgasmFork: OrgasmForkOption[] | null
  onOrgasmFork: (o: OrgasmForkOption) => void
  /** K */
  impulses: ImpulseChoice[]
  onImpulse: (i: ImpulseChoice) => void
  busy?: boolean
}

const TONE: Record<string, string> = {
  good: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
  bad: 'bg-red-500/20 border-red-500/40 text-red-200',
  neutral: 'bg-slate-500/20 border-slate-500/40 text-slate-200',
  hot: 'bg-rose-500/25 border-rose-500/50 text-rose-100',
}

export function SexLiveHud({
  partnerName,
  pressure,
  fit,
  fitActions,
  onFitAction,
  positions,
  positionId,
  onPosition,
  positionLocked,
  controlMode,
  onControlMode,
  freeActions,
  onFreeAction,
  reactionChoices,
  onReaction,
  bodyStates,
  partnerMemories,
  orgasmFork,
  onOrgasmFork,
  impulses,
  onImpulse,
  busy,
}: Props) {
  const pColor =
    pressure >= 75
      ? 'bg-red-500'
      : pressure >= 50
        ? 'bg-orange-500'
        : pressure >= 25
          ? 'bg-amber-500'
          : 'bg-emerald-500'

  return (
    <div className="space-y-2 max-w-3xl mx-auto text-[11px]">
      {/* G: mode toggle */}
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[9px] text-muted-foreground mr-1">Режим:</span>
        <button
          type="button"
          disabled={busy}
          onClick={() => onControlMode('moves')}
          className={`px-2.5 py-1 rounded-full border text-[10px] ${
            controlMode === 'moves'
              ? 'bg-pink-600/40 border-pink-400/50 text-pink-100'
              : 'border-border text-muted-foreground'
          }`}
        >
          🌳 Ходи skills
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onControlMode('free')}
          className={`px-2.5 py-1 rounded-full border text-[10px] ${
            controlMode === 'free'
              ? 'bg-violet-600/40 border-violet-400/50 text-violet-100'
              : 'border-border text-muted-foreground'
          }`}
        >
          ✋ Вільно
        </button>
      </div>

      {/* B: pressure */}
      <div className="px-1">
        <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
          <span>⚡ Тиск моменту</span>
          <span>
            {pressureLabel(pressure)} · {pressure}
          </span>
        </div>
        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full ${pColor} transition-all duration-300`}
            style={{ width: `${clampPct(pressure)}%` }}
          />
        </div>
      </div>

      {/* I: body chips */}
      {bodyStates.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {bodyStates.map((s) => (
            <span
              key={s.id}
              className={`text-[9px] px-1.5 py-0.5 rounded-full border ${TONE[s.tone]}`}
              title={s.turnsLeft < 0 ? 'до кінця сцени' : `${s.turnsLeft} ходів`}
            >
              {s.icon} {s.label}
              {s.turnsLeft > 0 ? ` ·${s.turnsLeft}` : ''}
            </span>
          ))}
        </div>
      )}

      {/* C: fit strip */}
      {fit && (
        <div className="rounded-lg border border-pink-500/25 bg-pink-950/30 px-2.5 py-1.5 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <span className="text-pink-200/90 font-medium">
              📐 Fit · {fit.orifice === 'vaginal' ? 'вагіна' : fit.orifice === 'anal' ? 'анал' : 'рот'} ·{' '}
              <span className="text-white">{fit.overallLabel}</span>
            </span>
            <span className="text-[9px] text-pink-200/60 font-mono">
              {fit.insertedDepthCm}/{fit.partnerLengthCm} см · ⌀{fit.partnerDiameterCm} · DC
              {fit.injuryDc} · біль~{fit.painRiskPct}%
            </span>
          </div>
          {fit.locked && (
            <p className="text-[9px] text-amber-200">🔒 У замку — позу змінити не можна, поки вузол не спаде.</p>
          )}
          <div className="flex flex-wrap gap-1">
            {fitActions.map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={busy}
                onClick={() => onFitAction(a.id)}
                className={`px-2 py-0.5 rounded-full border text-[9px] ${
                  a.risk
                    ? 'border-orange-500/40 bg-orange-950/40 text-orange-100'
                    : 'border-pink-500/30 bg-pink-950/40 text-pink-100'
                } disabled:opacity-40`}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* F: positions */}
      <div className="flex flex-wrap gap-1 justify-center">
        {positions.map((p) => {
          const active = p.id === positionId
          return (
            <button
              key={p.id}
              type="button"
              disabled={busy || positionLocked}
              onClick={() => onPosition(p.id)}
              className={`px-2 py-1 rounded-lg border text-[10px] transition-all ${
                active
                  ? 'bg-fuchsia-600/40 border-fuchsia-400/50 text-fuchsia-50'
                  : 'border-border/60 text-muted-foreground hover:border-fuchsia-500/30'
              } disabled:opacity-40`}
              title={p.prompt}
            >
              {p.icon} {p.label}
            </button>
          )
        })}
      </div>

      {/* K: desire impulses */}
      {impulses.length > 0 && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/40 px-2 py-1.5 space-y-1">
          <p className="text-[9px] text-red-200 font-semibold text-center">
            🔴 Бажання ламає контроль — імпульс
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {impulses.map((i) => (
              <button
                key={i.id}
                type="button"
                disabled={busy}
                onClick={() => onImpulse(i)}
                className="px-2 py-1 rounded-full border border-red-400/50 bg-red-900/50 text-red-50 text-[10px] font-medium shadow-lg shadow-red-900/30 animate-pulse"
              >
                {i.icon} {i.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* A: partner reaction responses */}
      {reactionChoices.length > 0 && (
        <div className="space-y-1">
          <p className="text-[9px] text-center text-muted-foreground">
            Відповідь на {partnerName || 'партнера'}:
          </p>
          <div className="flex flex-wrap gap-1 justify-center">
            {reactionChoices.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={busy}
                onClick={() => onReaction(c)}
                className="px-2 py-1 rounded-full border border-violet-500/35 bg-violet-950/35 text-violet-100 text-[10px]"
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* G free actions */}
      {controlMode === 'free' && (
        <div className="flex flex-wrap gap-1 justify-center">
          {freeActions.map((a) => (
            <button
              key={a.id}
              type="button"
              disabled={busy}
              onClick={() => onFreeAction(a)}
              className="px-2.5 py-1 rounded-full border border-violet-400/40 bg-violet-900/30 text-violet-50 text-[10px]"
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      )}

      {/* D: partner memory */}
      {partnerMemories.length > 0 && (
        <div className="text-[9px] text-center text-amber-200/80 px-2">
          🧠 Памʼять: {partnerMemories.slice(0, 2).join(' · ')}
        </div>
      )}

      {/* J: orgasm fork */}
      {orgasmFork && orgasmFork.length > 0 && (
        <div className="rounded-xl border border-purple-400/40 bg-purple-950/50 p-2.5 space-y-1.5 shadow-xl">
          <p className="text-center text-[11px] font-bold text-purple-100">💜 Оргазм — що далі?</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {orgasmFork.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={busy}
                onClick={() => onOrgasmFork(o)}
                className="px-3 py-1.5 rounded-lg border border-purple-400/40 bg-purple-800/40 text-purple-50 text-[11px] font-medium"
              >
                {o.icon} {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n))
}
