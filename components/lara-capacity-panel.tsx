'use client'

/**
 * Separate sidebar module: orifice capacity/stretch + extended body stats.
 */

import { useMemo } from 'react'
import type { GameState, SkillData } from '@/lib/types'
import { computeLaraBodyStats, type BodyMeter } from '@/lib/game/lara-body-stats'
import type { OrificeCapacity } from '@/lib/game/body-capacity'
import { computeLaraBodyProfile, type BodyFieldRow } from '@/lib/game/lara-body-profile'

type Props = {
  gameState?: GameState | null
  skills?: SkillData[] | null
}

const TONE: Record<BodyMeter['tone'], string> = {
  pink: 'bg-pink-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  violet: 'bg-violet-500',
  cyan: 'bg-cyan-500',
  emerald: 'bg-emerald-500',
  slate: 'bg-slate-400',
}

function CapBar({
  label,
  comfort,
  max,
  unit,
  color,
  sub,
}: {
  label: string
  comfort: number
  max: number
  unit: string
  color: string
  sub?: string
}) {
  // scale bars against ~20 cm for depth, ~8 for diameter
  const scale = unit.includes('⌀') || label.includes('⌀') ? 8 : 20
  const maxPct = Math.min(100, (max / scale) * 100)
  const comfortPct = Math.min(100, (comfort / scale) * 100)
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] gap-2">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground/80 flex-shrink-0">
          {comfort}–{max}
          {unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden relative">
        <div
          className={`absolute inset-y-0 left-0 ${color} opacity-35 rounded-full`}
          style={{ width: `${maxPct}%` }}
        />
        <div
          className={`absolute inset-y-0 left-0 ${color} rounded-full`}
          style={{ width: `${comfortPct}%` }}
        />
      </div>
      {sub && <p className="text-[8px] text-muted-foreground/70">{sub}</p>}
    </div>
  )
}

function OrificeBlock({
  title,
  icon,
  cap,
  colors,
}: {
  title: string
  icon: string
  cap: OrificeCapacity
  colors: { d: string; depth: string }
}) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/15 p-2">
      <div className="flex items-center justify-between">
        <h5 className="text-[11px] font-semibold text-foreground/90">
          {icon} {title}
        </h5>
        <span className="text-[9px] font-mono text-muted-foreground">
          розтяг {cap.stretchLv}/5 · містк. {cap.capacityLv}/5 · глиб. {cap.depthLv}/5
        </span>
      </div>
      <CapBar
        label="Діаметр ⌀"
        comfort={cap.comfortDiameterCm}
        max={cap.maxDiameterCm}
        unit=" см"
        color={colors.d}
        sub={`підготовка Lv${cap.prepLv}`}
      />
      <CapBar
        label="Глибина"
        comfort={cap.comfortDepthCm}
        max={cap.maxDepthCm}
        unit=" см"
        color={colors.depth}
      />
    </div>
  )
}

function MeterRow({ m }: { m: BodyMeter }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] gap-1">
        <span className="text-muted-foreground truncate">
          {m.icon} {m.label}
        </span>
        <span className="font-mono text-foreground/85 flex-shrink-0">
          {Math.round(m.value)}
          {m.unit}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${TONE[m.tone]} transition-all duration-500`}
          style={{ width: `${Math.max(2, Math.min(100, m.value))}%` }}
        />
      </div>
      <p className="text-[8px] text-muted-foreground/65 truncate">{m.detail}</p>
    </div>
  )
}

const GROUP_LABEL: Record<BodyFieldRow['group'], string> = {
  breasts: 'Груди',
  vagina: 'Вагіна',
  anus: 'Задній прохід',
  mouth: 'Рот і горло',
  general: 'Загальне',
}

function ProfileGroup({
  group,
  rows,
}: {
  group: BodyFieldRow['group']
  rows: BodyFieldRow[]
}) {
  const items = rows.filter((r) => r.group === group)
  if (!items.length) return null
  return (
    <div className="space-y-1 rounded-lg border border-border/40 bg-muted/10 p-2">
      <h5 className="text-[10px] font-semibold text-foreground/85">{GROUP_LABEL[group]}</h5>
      <div className="space-y-0.5">
        {items.map((r) => (
          <div key={r.key} className="flex justify-between gap-2 text-[10px]">
            <span className="text-muted-foreground shrink-0">{r.label}</span>
            <span className="text-right text-foreground/90 font-medium leading-snug">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LaraCapacityPanel({ gameState, skills }: Props) {
  const stats = useMemo(
    () => computeLaraBodyStats(skills, gameState),
    [skills, gameState]
  )
  const profile = useMemo(
    () => computeLaraBodyProfile(skills, gameState),
    [skills, gameState]
  )

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          📐 Місткість, тіло і показники
        </h3>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Повний тілесний профіль (груди, вагіна, анус, рот) + числова місткість зі скілів.
          {profile.summaryLine ? ` ${profile.summaryLine}.` : ''}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Фізичні показники
        </h4>
        {(
          ['breasts', 'vagina', 'anus', 'mouth', 'general'] as BodyFieldRow['group'][]
        ).map((g) => (
          <ProfileGroup key={g} group={g} rows={profile.rows} />
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Місткість / розтяг (см)
        </h4>
        <OrificeBlock
          title="Вагіна"
          icon="💗"
          cap={stats.capacity.vaginal}
          colors={{ d: 'bg-pink-500', depth: 'bg-rose-500' }}
        />
        <OrificeBlock
          title="Анал"
          icon="🔶"
          cap={stats.capacity.anal}
          colors={{ d: 'bg-orange-500', depth: 'bg-amber-600' }}
        />
        <OrificeBlock
          title="Горло / рот"
          icon="💋"
          cap={stats.capacity.oral}
          colors={{ d: 'bg-violet-400', depth: 'bg-violet-600' }}
        />
      </div>

      <div className="space-y-2 rounded-xl border border-border/50 bg-muted/10 p-2.5">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Додаткові статы тіла
        </h4>
        <div className="space-y-2">
          {stats.meters.map((m) => (
            <MeterRow key={m.key} m={m} />
          ))}
        </div>
      </div>

      {stats.notes.length > 0 && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-950/20 px-2 py-1.5 space-y-0.5">
          <p className="text-[9px] font-semibold text-amber-200/90">Нотатки</p>
          {stats.notes.map((n, i) => (
            <p key={i} className="text-[9px] text-amber-100/75 leading-snug">
              · {n}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
