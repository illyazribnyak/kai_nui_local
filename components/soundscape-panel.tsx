'use client'

import { useState } from 'react'
import { soundEngine } from '@/lib/audio'
import { Volume2, VolumeX, Radio, Sparkles, Waves, Trees, Flame } from 'lucide-react'

export function SoundscapePanel() {
  const [activeType, setActiveType] = useState<string | null>(
    soundEngine.getActiveAmbientType()
  )
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted())
  const [volume, setVolume] = useState(soundEngine.getVolume())

  const handleToggleAmbient = (type: 'ocean' | 'jungle' | 'tribal' | 'amulet') => {
    if (activeType === type) {
      soundEngine.stopAmbient()
      setActiveType(null)
    } else {
      soundEngine.playAmbient(type)
      setActiveType(type)
    }
  }

  const handleVolumeChange = (v: number) => {
    setVolume(v)
    soundEngine.setVolume(v)
  }

  const handleMuteToggle = () => {
    const next = !isMuted
    setIsMuted(next)
    soundEngine.setMuted(next)
  }

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Radio className="w-4 h-4 text-primary animate-pulse" /> Аудіо-Атмосфера Острова
        </h3>
        <button
          type="button"
          onClick={handleMuteToggle}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition border border-slate-700"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Volume Slider */}
      <div className="bg-slate-900/60 p-3 rounded-xl border border-border/40 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Гучність фону:</span>
          <span className="font-mono font-bold text-white">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      {/* Presets Grid */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
          Виберіть ембієнт-потік:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              id: 'ocean',
              label: 'Шум Тихого Океану',
              desc: 'Глибокий прибій та морська піна на березі',
              icon: Waves,
              color: 'emerald',
            },
            {
              id: 'jungle',
              label: 'Дикі Джунглі',
              desc: 'Шорох вологих ліан та співи тропічних птахів',
              icon: Trees,
              color: 'green',
            },
            {
              id: 'tribal',
              label: 'Барабани Кай-Тору',
              desc: 'Ритмічний племінний пульс дикунів',
              icon: Flame,
              color: 'amber',
            },
            {
              id: 'amulet',
              label: 'Сяйво Амулета',
              desc: 'Містичний високий резонанс магії 432 Hz',
              icon: Sparkles,
              color: 'purple',
            },
          ].map((preset) => {
            const Icon = preset.icon
            const active = activeType === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleToggleAmbient(preset.id as any)}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  active
                    ? 'bg-primary/20 border-primary text-primary shadow-lg ring-1 ring-primary/40'
                    : 'bg-slate-900/60 border-border/40 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-800 shrink-0 text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate flex items-center justify-between">
                    <span>{preset.label}</span>
                    {active && <span className="text-[9px] bg-primary text-slate-950 px-1.5 py-0.5 rounded font-bold">АКТИВНИЙ</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {preset.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
