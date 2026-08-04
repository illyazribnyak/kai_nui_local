/**
 * Web Audio API synthesizer for zero-dependency sound effects (dice rolls, achievements, ambient).
 */

const STORAGE_MUTE = 'kai_nui_muted'
const STORAGE_VOLUME = 'kai_nui_volume'

class SoundEngine {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  /** 0..1 master gain */
  private volume: number = 0.7

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
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
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
  }

  public getVolume(): number {
    return this.volume
  }

  public playDiceRoll() {
    if (this.isMuted || this.volume <= 0) return
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

  public playAchievement() {
    if (this.isMuted || this.volume <= 0) return
    const ctx = this.initCtx()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]

    notes.forEach((freq, index) => {
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

  public playClick() {
    if (this.isMuted || this.volume <= 0) return
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

  public playCraft() {
    if (this.isMuted || this.volume <= 0) return
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

  public playNewDay() {
    if (this.isMuted || this.volume <= 0) return
    const ctx = this.initCtx()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [440, 554.37, 659.25]

    notes.forEach((freq, i) => {
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
}

export const soundEngine = new SoundEngine()
