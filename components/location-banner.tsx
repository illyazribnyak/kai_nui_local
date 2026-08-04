'use client'

import { motion } from 'framer-motion'
import { MapPin, Sun, CloudRain, Flame, Trees, Compass, Mountain, Droplets, Landmark } from 'lucide-react'

interface LocationBannerProps {
  locationName: string
  timeOfDay?: string
  weather?: string
}

interface LocationTheme {
  gradient: string
  borderColor: string
  textColor: string
  emoji: string
  tagline: string
  bgAccent: string
}

const LOCATION_THEMES: Record<string, LocationTheme> = {
  'Берег острова': {
    gradient: 'from-amber-900/60 via-amber-950/80 to-slate-950',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-300',
    emoji: '🏖️',
    tagline: 'Піщаний берег, де Лара вибралася з солоних хвиль океану',
    bgAccent: 'bg-amber-500/10',
  },
  'Джунглі': {
    gradient: 'from-emerald-900/70 via-emerald-950/85 to-slate-950',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
    emoji: '🌴',
    tagline: 'Густі дикі тропічні хащі, повні таємниць та звуків природи',
    bgAccent: 'bg-emerald-500/10',
  },
  'Водоспад у джунглях': {
    gradient: 'from-cyan-900/70 via-slate-950 to-emerald-950',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-300',
    emoji: '🌊',
    tagline: 'Кришталево чиста водопадна купіль із прохолодною водою',
    bgAccent: 'bg-cyan-500/10',
  },
  'Селище Кай-Тору': {
    gradient: 'from-orange-900/70 via-amber-950 to-slate-950',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-300',
    emoji: '🛖',
    tagline: 'Головне поселення туземного племені Кай-Тору',
    bgAccent: 'bg-orange-500/10',
  },
  'Печери': {
    gradient: 'from-stone-900/80 via-slate-950 to-stone-950',
    borderColor: 'border-stone-500/40',
    textColor: 'text-stone-300',
    emoji: '🕳️',
    tagline: 'Прохолодні темні лабіринти печер у глибинах скель',
    bgAccent: 'bg-stone-500/10',
  },
  'Священна гора': {
    gradient: 'from-red-950 via-rose-950 to-slate-950',
    borderColor: 'border-red-500/40',
    textColor: 'text-red-300',
    emoji: '🌋',
    tagline: 'Містична вулканічна вершина в центрі острова',
    bgAccent: 'bg-red-500/10',
  },
  'Землі кентаврів': {
    gradient: 'from-yellow-900/60 via-amber-950 to-slate-950',
    borderColor: 'border-yellow-500/40',
    textColor: 'text-yellow-300',
    emoji: '🏹',
    tagline: 'Вовнисті рівнини та мисливські угіддя гордих кентаврів',
    bgAccent: 'bg-yellow-500/10',
  },
  'Болота свинолюдів': {
    gradient: 'from-lime-950 via-green-950 to-slate-950',
    borderColor: 'border-lime-500/40',
    textColor: 'text-lime-300',
    emoji: '🐗',
    tagline: 'Смердючі туманні болота племені свинолюдів',
    bgAccent: 'bg-lime-500/10',
  },
  'Лабіринт мінотаврів': {
    gradient: 'from-purple-950 via-slate-950 to-zinc-950',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-300',
    emoji: '🐂',
    tagline: 'Древній кам\'яний лабіринт під захистом вартарів-мінотаврів',
    bgAccent: 'bg-purple-500/10',
  },
  'Територія гієноїдів': {
    gradient: 'from-rose-950 via-red-950 to-slate-950',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-300',
    emoji: '🐺',
    tagline: 'Небезпечні скелясті пустоші здичавілих мисливців-гієноїдів',
    bgAccent: 'bg-rose-500/10',
  },
  'Храм насолоди': {
    gradient: 'from-pink-950 via-purple-950 to-slate-950',
    borderColor: 'border-pink-500/40',
    textColor: 'text-pink-300',
    emoji: '🏛️',
    tagline: 'Древнє священне святилище з чувськими рельєфами та амулетом',
    bgAccent: 'bg-pink-500/10',
  },
  'Північний берег': {
    gradient: 'from-blue-950 via-slate-950 to-slate-900',
    borderColor: 'border-blue-500/40',
    textColor: 'text-blue-300',
    emoji: '🪨',
    tagline: 'Дикий кам\'янистий берег з високими скелями та шаленими хвилями',
    bgAccent: 'bg-blue-500/10',
  },
  'Лагуна': {
    gradient: 'from-teal-900/70 via-cyan-950 to-slate-950',
    borderColor: 'border-teal-500/40',
    textColor: 'text-teal-300',
    emoji: '⛵',
    tagline: 'Тиха бірюзова затока з теплою водою та тропічними рифами',
    bgAccent: 'bg-teal-500/10',
  },
  'Руїни стародавнього міста': {
    gradient: 'from-indigo-950 via-slate-950 to-purple-950',
    borderColor: 'border-indigo-500/40',
    textColor: 'text-indigo-300',
    emoji: '📜',
    tagline: 'Залишки затонулої древньої цивілізації та артефактів',
    bgAccent: 'bg-indigo-500/10',
  },
  'Мангровий ліс': {
    gradient: 'from-emerald-950 via-teal-950 to-slate-950',
    borderColor: 'border-emerald-600/40',
    textColor: 'text-emerald-400',
    emoji: '🌿',
    tagline: 'Затоплений ліс із мангровими коріннями у прибережній смузі',
    bgAccent: 'bg-emerald-600/10',
  },
}

export function LocationBanner({ locationName, timeOfDay = 'day', weather = 'clear' }: LocationBannerProps) {
  const theme = LOCATION_THEMES[locationName] || {
    gradient: 'from-slate-900 via-slate-950 to-black',
    borderColor: 'border-border',
    textColor: 'text-primary',
    emoji: '📍',
    tagline: 'Невідома дика зона острова',
    bgAccent: 'bg-primary/10',
  }

  return (
    <motion.div
      key={locationName}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl border ${theme.borderColor} bg-gradient-to-r ${theme.gradient} p-4 shadow-xl mb-4`}
    >
      {/* Decorative background circle */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl ${theme.bgAccent} border ${theme.borderColor} flex-shrink-0 text-2xl`}>
            {theme.emoji}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Поточна Локація
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-muted-foreground font-mono">
                {timeOfDay === 'night' ? '🌙 Ніч' : timeOfDay === 'evening' ? '🌆 Вечір' : '☀️ День'}
              </span>
            </div>
            <h2 className={`text-base sm:text-lg font-extrabold ${theme.textColor} tracking-tight truncate`}>
              {locationName}
            </h2>
            <p className="text-xs text-muted-foreground/90 mt-0.5 leading-normal">
              {theme.tagline}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
