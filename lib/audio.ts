/**
 * Real sample-based audio for Kai-Nui:
 * - ambient loops from public/sounds/ambient-*.mp3
 * - one-shot SFX from public/sounds/sfx-*.mp3
 * Falls back to Web Audio oscillators if a sample fails to load.
 */

const STORAGE_MUTE = 'kai_nui_muted'
const STORAGE_VOLUME = 'kai_nui_volume'
const STORAGE_AMBIENT = 'kai_nui_ambient'

export type AmbientType = 'ocean' | 'jungle' | 'tribal' | 'amulet' | 'none'

const AMBIENT_SRC: Record<Exclude<AmbientType, 'none'>, string> = {
  ocean: '/sounds/ambient-ocean.mp3',
  jungle: '/sounds/ambient-jungle.mp3',
  tribal: '/sounds/ambient-tribal.mp3',
  amulet: '/sounds/ambient-amulet.mp3',
}

const SFX_SRC = {
  dice: '/sounds/sfx-dice.mp3',
  achievement: '/sounds/sfx-success.mp3',
  click: '/sounds/sfx-click.mp3',
  craft: '/sounds/sfx-craft.mp3',
  newDay: '/sounds/sfx-newday.mp3',
} as const

/** Ambient gain relative to master (loops can be loud). */
const AMBIENT_GAIN: Record<Exclude<AmbientType, 'none'>, number> = {
  ocean: 0.55,
  jungle: 0.45,
  tribal: 0.4,
  amulet: 0.5,
}

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted = false
  /** 0..1 master gain */
  private volume = 0.7
  private ambientAudio: HTMLAudioElement | null = null
  private activeAmbientType: AmbientType | null = null
  private sfxPool = new Map<string, HTMLAudioElement>()

  constructor() {
    if (typeof window === 'undefined') return
    try {
      const m = localStorage.getItem(STORAGE_MUTE)
      if (m === '1') this.isMuted = true
      const v = localStorage.getItem(STORAGE_VOLUME)
      if (v != null) {
        const n = Number(v)
        if (!Number.isNaN(n)) this.volume = Math.min(1, Math.max(0, n))
      }
    } catch {
      /* ignore */
    }
  }

  private initCtx() {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) this.ctx = new AudioCtx()
    }
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  private master(gain: number): number {
    return Math.max(0.0001, gain * this.volume)
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    try {
      localStorage.setItem(STORAGE_MUTE, muted ? '1' : '0')
    } catch {
      /* ignore */
    }
    if (muted) {
      if (this.ambientAudio) {
        this.ambientAudio.pause()
      }
    } else if (this.activeAmbientType && this.activeAmbientType !== 'none') {
      this.playAmbient(this.activeAmbientType)
    }
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v))
    try {
      localStorage.setItem(STORAGE_VOLUME, String(this.volume))
    } catch {
      /* ignore */
    }
    this.applyAmbientVolume()
  }

  public getVolume(): number {
    return this.volume
  }

  private applyAmbientVolume() {
    if (!this.ambientAudio || !this.activeAmbientType || this.activeAmbientType === 'none') return
    const rel = AMBIENT_GAIN[this.activeAmbientType]
    this.ambientAudio.volume = Math.min(1, Math.max(0, this.volume * rel))
  }

  /** Play a one-shot sample; synth fallback on error. */
  private playSample(src: string, fallback: () => void, gain = 0.85) {
    if (this.isMuted || this.volume <= 0) return
    if (typeof window === 'undefined') return

    try {
      let el = this.sfxPool.get(src)
      if (!el) {
        el = new Audio(src)
        el.preload = 'auto'
        this.sfxPool.set(src, el)
      }
      // Clone for overlapping plays
      const node = el.cloneNode(true) as HTMLAudioElement
      node.volume = Math.min(1, Math.max(0, this.volume * gain))
      const p = node.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => fallback())
      }
      node.addEventListener('error', () => fallback(), { once: true })
    } catch {
      fallback()
    }
  }

  public playDiceRoll() {
    this.playSample(SFX_SRC.dice, () => this.synthDice(), 0.9)
  }

  public playAchievement() {
    this.playSample(SFX_SRC.achievement, () => this.synthAchievement(), 0.85)
  }

  public playClick() {
    this.playSample(SFX_SRC.click, () => this.synthClick(), 0.55)
  }

  public playCraft() {
    this.playSample(SFX_SRC.craft, () => this.synthCraft(), 0.8)
  }

  public playNewDay() {
    this.playSample(SFX_SRC.newDay, () => this.synthNewDay(), 0.85)
  }

  // --- Real ambient loops ---

  public playAmbient(type: AmbientType) {
    if (type === 'none') {
      this.stopAmbient()
      return
    }

    // Same track already playing — just ensure volume/mute
    if (this.activeAmbientType === type && this.ambientAudio && !this.ambientAudio.paused && !this.isMuted) {
      this.applyAmbientVolume()
      return
    }

    this.stopAmbient(false)
    this.activeAmbientType = type
    try {
      localStorage.setItem(STORAGE_AMBIENT, type)
    } catch {
      /* ignore */
    }

    if (this.isMuted || this.volume <= 0) return

    const src = AMBIENT_SRC[type]
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    const rel = AMBIENT_GAIN[type]
    audio.volume = Math.min(1, Math.max(0, this.volume * rel))

    audio.addEventListener(
      'error',
      () => {
        // Sample missing → soft synth drone so UI still "works"
        if (this.activeAmbientType === type) this.synthAmbientFallback(type)
      },
      { once: true }
    )

    const play = () => {
      const p = audio.play()
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          /* autoplay blocked until user gesture — panel click will retry */
        })
      }
    }

    if (audio.readyState >= 2) play()
    else audio.addEventListener('canplay', play, { once: true })

    this.ambientAudio = audio
  }

  public stopAmbient(clearPreference = true) {
    if (this.ambientAudio) {
      try {
        this.ambientAudio.pause()
        this.ambientAudio.src = ''
        this.ambientAudio.load()
      } catch {
        /* ignore */
      }
      this.ambientAudio = null
    }
    this.stopSynthAmbient()
    this.activeAmbientType = null
    if (clearPreference) {
      try {
        localStorage.removeItem(STORAGE_AMBIENT)
      } catch {
        /* ignore */
      }
    }
  }

  public getActiveAmbientType(): string | null {
    return this.activeAmbientType
  }

  /** Restore last ambient after a user gesture (call from panel mount / first click). */
  public resumePreferredAmbient() {
    if (this.isMuted) return
    try {
      const saved = localStorage.getItem(STORAGE_AMBIENT) as AmbientType | null
      if (saved && saved !== 'none' && AMBIENT_SRC[saved as Exclude<AmbientType, 'none'>]) {
        this.playAmbient(saved)
      }
    } catch {
      /* ignore */
    }
  }

  // --- Synth fallbacks (short, only if samples fail) ---

  private synthDice() {
    const ctx = this.initCtx()
    if (!ctx) return
    const now = ctx.currentTime
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(200 + Math.random() * 300, now + i * 0.06)
      osc.frequency.exponentialRampToValueAtTime(80, now + i * 0.06 + 0.04)
      gain.gain.setValueAtTime(this.master(0.15), now + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.06)
      osc.stop(now + i * 0.06 + 0.05)
    }
  }

  private synthAchievement() {
    const ctx = this.initCtx()
    if (!ctx) return
    const now = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + index * 0.1)
      gain.gain.setValueAtTime(this.master(0.2), now + index * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.4)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + index * 0.1)
      osc.stop(now + index * 0.1 + 0.45)
    })
  }

  private synthClick() {
    const ctx = this.initCtx()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03)
    gain.gain.setValueAtTime(this.master(0.08), now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.035)
  }

  private synthCraft() {
    const ctx = this.initCtx()
    if (!ctx) return
    const now = ctx.currentTime
    ;[320, 480, 640].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.07)
      gain.gain.setValueAtTime(this.master(0.12), now + i * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.2)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.07)
      osc.stop(now + i * 0.07 + 0.22)
    })
  }

  private synthNewDay() {
    const ctx = this.initCtx()
    if (!ctx) return
    const now = ctx.currentTime
    ;[440, 554.37, 659.25].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.15)
      gain.gain.setValueAtTime(this.master(0.12), now + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.85)
    })
  }

  private activeAmbientOsc: OscillatorNode | null = null

  private synthAmbientFallback(type: Exclude<AmbientType, 'none'>) {
    this.stopSynthAmbient()
    const ctx = this.initCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    if (type === 'ocean') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(80, ctx.currentTime)
      gain.gain.setValueAtTime(this.master(0.08), ctx.currentTime)
    } else if (type === 'jungle') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      gain.gain.setValueAtTime(this.master(0.05), ctx.currentTime)
    } else if (type === 'tribal') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(90, ctx.currentTime)
      gain.gain.setValueAtTime(this.master(0.06), ctx.currentTime)
    } else {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(432, ctx.currentTime)
      gain.gain.setValueAtTime(this.master(0.06), ctx.currentTime)
    }
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    this.activeAmbientOsc = osc
  }

  private stopSynthAmbient() {
    if (this.activeAmbientOsc) {
      try {
        this.activeAmbientOsc.stop()
        this.activeAmbientOsc.disconnect()
      } catch {
        /* ignore */
      }
      this.activeAmbientOsc = null
    }
  }
}

export const soundEngine = new SoundEngine()
