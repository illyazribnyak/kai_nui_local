'use client'

import { motion } from 'framer-motion'

export function StatBar({
  label,
  value,
  max,
  icon,
  color,
  glowing,
}: {
  label: string
  value: number
  max: number
  icon: React.ReactNode
  color: string
  glowing?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-1 py-0.5 transition-all duration-700 ${
        glowing ? 'bg-primary/10 ring-1 ring-primary/30' : ''
      }`}
    >
      <div className="text-muted-foreground w-5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="text-foreground/80">{label}</span>
          <motion.span
            className="font-mono text-foreground/60"
            key={value}
            initial={glowing ? { scale: 1.4, color: 'rgb(var(--primary))' } : false}
            animate={{ scale: 1, color: 'inherit' }}
            transition={{ duration: 0.5 }}
          >
            {value ?? 0}/{max}
          </motion.span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${((value ?? 0) / max) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}
