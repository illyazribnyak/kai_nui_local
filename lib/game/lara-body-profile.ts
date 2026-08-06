/**
 * Lara body profile — qualitative + quantitative body metrics from the
 * erotic RPG design pack (breasts, vagina, anus, mouth, general physique).
 * Depth/width numbers come from body-capacity skills; labels & aesthetics
 * from defaults + optional bodyProfileJson overrides.
 */

import { clamp } from '@/lib/game/json'
import {
  computeAllOrificeCapacities,
  type OrificeCapacity,
  type SkillLike,
} from '@/lib/game/body-capacity'

export type BreastSize = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G+'
export type Milkiness = 'none' | 'weak' | 'medium' | 'strong'
export type Tightness = 'very_tight' | 'tight' | 'medium' | 'soft'
export type WidthBand = 'narrow' | 'medium' | 'wide' | 'very_wide'
export type DepthBand = 'short' | 'medium' | 'deep' | 'very_deep'
export type GagReflex = 'strong' | 'medium' | 'weak' | 'none'
export type Experience = 'virgin' | 'little' | 'medium' | 'experienced'
export type Wetness = 'weak' | 'normal' | 'strong' | 'very_strong'
export type Scent = 'neutral' | 'sweet' | 'musky' | 'sharp' | 'natural'

export type LaraBodyProfileStored = {
  breasts?: {
    size?: BreastSize
    shape?: string
    nippleSensitivity?: number
    milkiness?: Milkiness
  }
  vagina?: {
    tightness?: Tightness
    appearance?: string
    sensitivity?: number
    wetness?: Wetness
    scent?: Scent
  }
  anus?: {
    tightness?: Tightness
    sensitivity?: number
    experience?: Experience
  }
  mouth?: {
    gagReflex?: GagReflex
    tongueSensitivity?: number
    mouthWidth?: WidthBand
  }
  general?: {
    heightCm?: number
    build?: string
    hips?: string
    buttocks?: string
    skin?: string
    hair?: string
    bodyHair?: string
    bodyScent?: Scent
  }
}

export type BodyFieldRow = {
  key: string
  label: string
  value: string
  group: 'breasts' | 'vagina' | 'anus' | 'mouth' | 'general'
}

export type LaraBodyProfileView = {
  breasts: {
    size: BreastSize
    shape: string
    nippleSensitivity: number
    milkiness: Milkiness
    milkinessLabel: string
  }
  vagina: {
    depthCmComfort: number
    depthCmMax: number
    depthBand: DepthBand
    depthLabel: string
    diameterComfortCm: number
    diameterMaxCm: number
    widthBand: WidthBand
    widthLabel: string
    tightness: Tightness
    tightnessLabel: string
    appearance: string
    sensitivity: number
    wetness: Wetness
    wetnessLabel: string
    scent: Scent
    scentLabel: string
  }
  anus: {
    depthCmComfort: number
    depthCmMax: number
    depthBand: DepthBand
    depthLabel: string
    diameterComfortCm: number
    diameterMaxCm: number
    widthBand: WidthBand
    widthLabel: string
    tightness: Tightness
    tightnessLabel: string
    sensitivity: number
    experience: Experience
    experienceLabel: string
  }
  mouth: {
    depthCmComfort: number
    depthCmMax: number
    depthBand: DepthBand
    depthLabel: string
    diameterComfortCm: number
    mouthWidth: WidthBand
    mouthWidthLabel: string
    gagReflex: GagReflex
    gagLabel: string
    tongueSensitivity: number
  }
  general: {
    heightCm: number
    build: string
    hips: string
    buttocks: string
    skin: string
    hair: string
    bodyHair: string
    bodyScent: Scent
    bodyScentLabel: string
  }
  /** Flat rows for UI */
  rows: BodyFieldRow[]
  /** One-line summary for cards */
  summaryLine: string
}

const MILK: Record<Milkiness, string> = {
  none: 'Немає',
  weak: 'Слабка',
  medium: 'Середня',
  strong: 'Сильна',
}
const TIGHT: Record<Tightness, string> = {
  very_tight: 'Дуже туга',
  tight: 'Туга',
  medium: 'Середня',
  soft: 'Мʼяка',
}
const WIDTH: Record<WidthBand, string> = {
  narrow: 'Вузька',
  medium: 'Середня',
  wide: 'Широка',
  very_wide: 'Дуже широка',
}
const DEPTH: Record<DepthBand, string> = {
  short: 'Коротка',
  medium: 'Середня',
  deep: 'Глибока',
  very_deep: 'Дуже глибока',
}
const GAG: Record<GagReflex, string> = {
  strong: 'Сильний',
  medium: 'Середній',
  weak: 'Слабкий',
  none: 'Відсутній',
}
const EXP: Record<Experience, string> = {
  virgin: 'Незайманий',
  little: 'Малий досвід',
  medium: 'Середній',
  experienced: 'Досвідчений',
}
const WET: Record<Wetness, string> = {
  weak: 'Слабка',
  normal: 'Нормальна',
  strong: 'Сильна',
  very_strong: 'Дуже сильна',
}
const SCENT: Record<Scent, string> = {
  neutral: 'Нейтральний',
  sweet: 'Солодкуватий',
  musky: 'Мускусний',
  sharp: 'Різкий',
  natural: 'Природний',
}

function skillLevel(skills: SkillLike[] | null | undefined, name: string): number {
  if (!skills?.length) return 0
  const found = skills.find((s) => s.name === name)
  return clamp(Number(found?.level) || 0, 0, 5)
}

export function parseBodyProfileJson(raw: string | null | undefined): LaraBodyProfileStored {
  if (!raw || !String(raw).trim()) return {}
  try {
    const o = JSON.parse(String(raw))
    return o && typeof o === 'object' ? (o as LaraBodyProfileStored) : {}
  } catch {
    return {}
  }
}

export function serializeBodyProfile(p: LaraBodyProfileStored): string {
  return JSON.stringify(p)
}

function depthBandFromCm(maxDepth: number, kind: 'vaginal' | 'anal' | 'oral'): DepthBand {
  if (kind === 'oral') {
    if (maxDepth < 7) return 'short'
    if (maxDepth < 9) return 'medium'
    if (maxDepth < 12) return 'deep'
    return 'very_deep'
  }
  if (kind === 'anal') {
    if (maxDepth < 9) return 'short'
    if (maxDepth < 12) return 'medium'
    if (maxDepth < 15) return 'deep'
    return 'very_deep'
  }
  // vaginal — design pack: short 12–14, med 15–17, deep 18–20, very 21+
  if (maxDepth < 15) return 'short'
  if (maxDepth < 18) return 'medium'
  if (maxDepth < 21) return 'deep'
  return 'very_deep'
}

function widthBandFromDiameter(comfortD: number, kind: 'vaginal' | 'anal' | 'oral'): WidthBand {
  if (kind === 'anal') {
    if (comfortD < 2.9) return 'narrow'
    if (comfortD < 3.6) return 'medium'
    if (comfortD < 4.4) return 'wide'
    return 'very_wide'
  }
  if (kind === 'oral') {
    if (comfortD < 3.4) return 'narrow'
    if (comfortD < 4.0) return 'medium'
    return 'wide'
  }
  if (comfortD < 3.6) return 'narrow'
  if (comfortD < 4.4) return 'medium'
  if (comfortD < 5.2) return 'wide'
  return 'very_wide'
}

function tightnessFromCapacity(capacityLv: number, prepLv: number): Tightness {
  const score = capacityLv + prepLv * 0.5
  if (score < 1.5) return 'very_tight'
  if (score < 3) return 'tight'
  if (score < 5) return 'medium'
  return 'soft'
}

function wetnessFromDesire(desire: number, senseLv: number): Wetness {
  const s = desire * 0.5 + senseLv * 12
  if (s < 20) return 'weak'
  if (s < 45) return 'normal'
  if (s < 70) return 'strong'
  return 'very_strong'
}

function gagFromSkills(gagLv: number, deepLv: number): GagReflex {
  const s = gagLv * 2 + deepLv
  if (s >= 8) return 'none'
  if (s >= 5) return 'weak'
  if (s >= 2) return 'medium'
  return 'strong'
}

function experienceFromAnal(analLv: number, prepLv: number): Experience {
  const s = analLv + prepLv
  if (s <= 0) return 'virgin'
  if (s <= 2) return 'little'
  if (s <= 5) return 'medium'
  return 'experienced'
}

function depthLabel(band: DepthBand, comfort: number, max: number): string {
  return `${DEPTH[band]} (${comfort}–${max} см)`
}

/**
 * Default Lara canon body profile (game_context + design pack example).
 */
export function defaultBodyProfileStored(): Required<{
  breasts: NonNullable<LaraBodyProfileStored['breasts']>
  vagina: NonNullable<LaraBodyProfileStored['vagina']>
  anus: NonNullable<LaraBodyProfileStored['anus']>
  mouth: NonNullable<LaraBodyProfileStored['mouth']>
  general: NonNullable<LaraBodyProfileStored['general']>
}> {
  return {
    breasts: {
      size: 'C',
      shape: 'круглі',
      nippleSensitivity: 8,
      milkiness: 'none',
    },
    vagina: {
      tightness: 'tight',
      appearance: 'акуратні мʼясисті губи',
      sensitivity: 8,
      wetness: 'normal',
      scent: 'sweet',
    },
    anus: {
      tightness: 'very_tight',
      sensitivity: 6,
      experience: 'little',
    },
    mouth: {
      gagReflex: 'medium',
      tongueSensitivity: 7,
      mouthWidth: 'medium',
    },
    general: {
      heightCm: 168,
      build: 'струнка з пишними стегнами',
      hips: 'широкі',
      buttocks: 'круглі, пружні',
      skin: 'світла, засмагла на плечах',
      hair: 'темне, до плечей',
      bodyHair: 'лобок акуратно підстрижений',
      bodyScent: 'natural',
    },
  }
}

export function computeLaraBodyProfile(
  skills: SkillLike[] | null | undefined,
  gameState?: {
    desire?: number | null
    bodyProfileJson?: string | null
    bodySensitivity?: number | null
    isPregnant?: boolean | null
  } | null
): LaraBodyProfileView {
  const cap = computeAllOrificeCapacities(skills)
  const stored = parseBodyProfileJson(gameState?.bodyProfileJson)
  const base = defaultBodyProfileStored()
  const desire = Number(gameState?.desire ?? 0)
  const senseSkill = skillLevel(skills, 'Чутливість')
  const bodySens = clamp(Number(gameState?.bodySensitivity ?? 7), 1, 10)
  const gagLv = skillLevel(skills, 'Подолання рефлекса')
  const deepLv = skillLevel(skills, 'Глибоке горло')
  const analLv = skillLevel(skills, 'Анал')
  const analPrep = skillLevel(skills, 'Анальна підготовка')
  const milkSkill = skillLevel(skills, 'Доїння')

  const br = { ...base.breasts, ...stored.breasts }
  if (milkSkill >= 3 && (!stored.breasts?.milkiness || stored.breasts.milkiness === 'none')) {
    br.milkiness = milkSkill >= 5 ? 'strong' : milkSkill >= 4 ? 'medium' : 'weak'
  }
  br.nippleSensitivity = clamp(Number(br.nippleSensitivity ?? 8), 1, 10)

  const vTight =
    stored.vagina?.tightness ??
    tightnessFromCapacity(cap.vaginal.capacityLv, cap.vaginal.prepLv)
  const vDepthBand = depthBandFromCm(cap.vaginal.maxDepthCm, 'vaginal')
  const vWidthBand = widthBandFromDiameter(cap.vaginal.comfortDiameterCm, 'vaginal')
  const vWet =
    stored.vagina?.wetness ?? wetnessFromDesire(desire, Math.max(senseSkill, Math.floor(bodySens / 2)))

  const aTight =
    stored.anus?.tightness ??
    tightnessFromCapacity(cap.anal.capacityLv, cap.anal.prepLv)
  const aDepthBand = depthBandFromCm(cap.anal.maxDepthCm, 'anal')
  const aWidthBand = widthBandFromDiameter(cap.anal.comfortDiameterCm, 'anal')
  const aExp = stored.anus?.experience ?? experienceFromAnal(analLv, analPrep)

  const mGag = stored.mouth?.gagReflex ?? gagFromSkills(gagLv, deepLv)
  const mDepthBand = depthBandFromCm(cap.oral.maxDepthCm, 'oral')
  const mWidth = stored.mouth?.mouthWidth ?? widthBandFromDiameter(cap.oral.comfortDiameterCm, 'oral')

  const gen = { ...base.general, ...stored.general }
  const vaginaSens = clamp(
    Number(stored.vagina?.sensitivity ?? Math.round((bodySens + senseSkill) / 1.2)),
    1,
    10
  )
  const anusSens = clamp(
    Number(stored.anus?.sensitivity ?? Math.max(4, bodySens - 1)),
    1,
    10
  )
  const tongueSens = clamp(
    Number(stored.mouth?.tongueSensitivity ?? Math.round((bodySens + senseSkill) / 1.5)),
    1,
    10
  )

  const breasts = {
    size: (br.size ?? 'C') as BreastSize,
    shape: br.shape ?? 'круглі',
    nippleSensitivity: br.nippleSensitivity ?? 8,
    milkiness: (br.milkiness ?? 'none') as Milkiness,
    milkinessLabel: MILK[(br.milkiness ?? 'none') as Milkiness],
  }

  const vagina = {
    depthCmComfort: cap.vaginal.comfortDepthCm,
    depthCmMax: cap.vaginal.maxDepthCm,
    depthBand: vDepthBand,
    depthLabel: depthLabel(vDepthBand, cap.vaginal.comfortDepthCm, cap.vaginal.maxDepthCm),
    diameterComfortCm: cap.vaginal.comfortDiameterCm,
    diameterMaxCm: cap.vaginal.maxDiameterCm,
    widthBand: vWidthBand,
    widthLabel: WIDTH[vWidthBand],
    tightness: vTight,
    tightnessLabel: TIGHT[vTight],
    appearance: stored.vagina?.appearance ?? base.vagina.appearance!,
    sensitivity: vaginaSens,
    wetness: vWet,
    wetnessLabel: WET[vWet],
    scent: (stored.vagina?.scent ?? base.vagina.scent!) as Scent,
    scentLabel: SCENT[(stored.vagina?.scent ?? base.vagina.scent!) as Scent],
  }

  const anus = {
    depthCmComfort: cap.anal.comfortDepthCm,
    depthCmMax: cap.anal.maxDepthCm,
    depthBand: aDepthBand,
    depthLabel: depthLabel(aDepthBand, cap.anal.comfortDepthCm, cap.anal.maxDepthCm),
    diameterComfortCm: cap.anal.comfortDiameterCm,
    diameterMaxCm: cap.anal.maxDiameterCm,
    widthBand: aWidthBand,
    widthLabel: WIDTH[aWidthBand],
    tightness: aTight,
    tightnessLabel: TIGHT[aTight],
    sensitivity: anusSens,
    experience: aExp,
    experienceLabel: EXP[aExp],
  }

  const mouth = {
    depthCmComfort: cap.oral.comfortDepthCm,
    depthCmMax: cap.oral.maxDepthCm,
    depthBand: mDepthBand,
    depthLabel: depthLabel(mDepthBand, cap.oral.comfortDepthCm, cap.oral.maxDepthCm),
    diameterComfortCm: cap.oral.comfortDiameterCm,
    mouthWidth: mWidth,
    mouthWidthLabel: WIDTH[mWidth],
    gagReflex: mGag,
    gagLabel: GAG[mGag],
    tongueSensitivity: tongueSens,
  }

  const general = {
    heightCm: Number(gen.heightCm ?? 168),
    build: gen.build ?? base.general.build!,
    hips: gen.hips ?? base.general.hips!,
    buttocks: gen.buttocks ?? base.general.buttocks!,
    skin: gen.skin ?? base.general.skin!,
    hair: gen.hair ?? base.general.hair!,
    bodyHair: gen.bodyHair ?? base.general.bodyHair!,
    bodyScent: (gen.bodyScent ?? 'natural') as Scent,
    bodyScentLabel: SCENT[(gen.bodyScent ?? 'natural') as Scent],
  }

  const rows: BodyFieldRow[] = [
    { group: 'breasts', key: 'br_size', label: 'Розмір грудей', value: breasts.size },
    { group: 'breasts', key: 'br_shape', label: 'Форма', value: breasts.shape },
    {
      group: 'breasts',
      key: 'br_nip',
      label: 'Чутливість сосків',
      value: `${breasts.nippleSensitivity}/10`,
    },
    { group: 'breasts', key: 'br_milk', label: 'Молочність', value: breasts.milkinessLabel },
    { group: 'vagina', key: 'v_depth', label: 'Глибина вагіни', value: vagina.depthLabel },
    {
      group: 'vagina',
      key: 'v_width',
      label: 'Ширина (⌀)',
      value: `${vagina.widthLabel} ${vagina.diameterComfortCm}–${vagina.diameterMaxCm} см`,
    },
    { group: 'vagina', key: 'v_tight', label: 'Тугість', value: vagina.tightnessLabel },
    { group: 'vagina', key: 'v_look', label: 'Зовнішній вигляд', value: vagina.appearance },
    {
      group: 'vagina',
      key: 'v_sens',
      label: 'Чутливість',
      value: `${vagina.sensitivity}/10`,
    },
    { group: 'vagina', key: 'v_wet', label: 'Змочуваність', value: vagina.wetnessLabel },
    { group: 'vagina', key: 'v_scent', label: 'Запах / смак', value: vagina.scentLabel },
    { group: 'anus', key: 'a_depth', label: 'Глибина ануса', value: anus.depthLabel },
    {
      group: 'anus',
      key: 'a_width',
      label: 'Ширина (⌀)',
      value: `${anus.widthLabel} ${anus.diameterComfortCm}–${anus.diameterMaxCm} см`,
    },
    { group: 'anus', key: 'a_tight', label: 'Тугість', value: anus.tightnessLabel },
    { group: 'anus', key: 'a_sens', label: 'Чутливість', value: `${anus.sensitivity}/10` },
    { group: 'anus', key: 'a_exp', label: 'Досвідченість', value: anus.experienceLabel },
    { group: 'mouth', key: 'm_depth', label: 'Глибина горла', value: mouth.depthLabel },
    { group: 'mouth', key: 'm_width', label: 'Ширина рота', value: mouth.mouthWidthLabel },
    { group: 'mouth', key: 'm_gag', label: 'Рвотний рефлекс', value: mouth.gagLabel },
    {
      group: 'mouth',
      key: 'm_tongue',
      label: 'Чутливість язика',
      value: `${mouth.tongueSensitivity}/10`,
    },
    { group: 'general', key: 'g_h', label: 'Зріст', value: `${general.heightCm} см` },
    { group: 'general', key: 'g_b', label: 'Статура', value: general.build },
    { group: 'general', key: 'g_hips', label: 'Стегна', value: general.hips },
    { group: 'general', key: 'g_butt', label: 'Сідниці', value: general.buttocks },
    { group: 'general', key: 'g_skin', label: 'Шкіра', value: general.skin },
    { group: 'general', key: 'g_hair', label: 'Волосся', value: general.hair },
    { group: 'general', key: 'g_bh', label: 'Волосся на тілі', value: general.bodyHair },
    { group: 'general', key: 'g_sc', label: 'Запах тіла', value: general.bodyScentLabel },
  ]

  const summaryLine = `Груди ${breasts.size} · вагіна ${vagina.depthBand}/${vagina.widthBand} · анус ${anus.experienceLabel} · горло ${mouth.gagLabel}`

  return { breasts, vagina, anus, mouth, general, rows, summaryLine }
}

/** GM prompt block — full body metrics for sex with large races. */
export function formatLaraBodyProfileForPrompt(
  skills: SkillLike[] | null | undefined,
  gameState?: {
    desire?: number | null
    bodyProfileJson?: string | null
    bodySensitivity?: number | null
    attractiveness?: number | null
    intellect?: number | null
    libido?: number | null
    strength?: number | null
    agility?: number | null
    endurance?: number | null
    charisma?: number | null
    willpower?: number | null
  } | null
): string {
  const p = computeLaraBodyProfile(skills, gameState)
  const st = gameState
  const attr = Number(st?.attractiveness ?? 7)
  const intel = Number(st?.intellect ?? 5)
  const lib = Number(st?.libido ?? 6)
  const sens = Number(st?.bodySensitivity ?? 7)

  return (
    `\n--- ТІЛО ЛАРИ (фізичні показники — канон) ---\n` +
    `Стати 1–10: Сила ${st?.strength ?? 4} · Спритність ${st?.agility ?? 6} · Витривалість ${st?.endurance ?? 5} · ` +
    `Харизма ${st?.charisma ?? 7} · Привабливість ${attr} · Розум ${intel} · Воля ${st?.willpower ?? 5} · ` +
    `Лібідо ${lib} · Чутливість тіла ${sens}.\n` +
    `Груди: ${p.breasts.size}, ${p.breasts.shape}, соски ${p.breasts.nippleSensitivity}/10, молочність ${p.breasts.milkinessLabel}.\n` +
    `Вагіна: глибина ${p.vagina.depthLabel}; ширина ${p.vagina.widthLabel} (⌀ ${p.vagina.diameterComfortCm}–${p.vagina.diameterMaxCm} см); ` +
    `тугість ${p.vagina.tightnessLabel}; вигляд: ${p.vagina.appearance}; чутл. ${p.vagina.sensitivity}/10; ` +
    `змазка ${p.vagina.wetnessLabel}; запах ${p.vagina.scentLabel}.\n` +
    `Анус: ${p.anus.depthLabel}; ⌀ ${p.anus.diameterComfortCm}–${p.anus.diameterMaxCm} (${p.anus.widthLabel}); ` +
    `${p.anus.tightnessLabel}; чутл. ${p.anus.sensitivity}/10; досвід ${p.anus.experienceLabel}.\n` +
    `Рот/горло: ${p.mouth.depthLabel}; рот ${p.mouth.mouthWidthLabel}; рефлекс ${p.mouth.gagLabel}; язик ${p.mouth.tongueSensitivity}/10.\n` +
    `Загальне: ${p.general.heightCm} см, ${p.general.build}; стегна ${p.general.hips}; сідниці ${p.general.buttocks}; ` +
    `шкіра ${p.general.skin}; ${p.general.hair}; ${p.general.bodyHair}; запах ${p.general.bodyScentLabel}.\n` +
    `Використовуй ці цифри при сексі з великими расами (мінотавр/кентавр/гієноїд/свинолюд). ` +
    `Місткість росте зі скілами (Вагінальна місткість, Глибина вагіни, Анал, Глибоке горло…). ` +
    `BODY_PROFILE_UPDATE / STAT_UPDATE bodyProfileJson — лише для якісних змін (груди, запах, вигляд губ).\n---\n`
  )
}

/** Race interaction hints from design pack. */
export function formatRaceBodyModsForPrompt(): string {
  return (
    `\n--- РАСОВІ МОДИФІКАТОРИ ТІЛА ---\n` +
    `• Мінотавр/кентавр: критична глибина+⌀ вагіни/ануса; скіл «Гра з розміром» знижує біль.\n` +
    `• Гієноїд: нюх — запах вагіни/тіла; вузол потребує місткості; «Доїння» / груди.\n` +
    `• Свинолюд: запах, товщина, «Доїння»; витривалість.\n` +
    `• Кай-Тору: нормальний людський діапазон; ритуал/татуювання.\n` +
    `Привабливість + Зваблення → перший контакт; Воля vs феромони; Лібідо → desire gain.\n---\n`
  )
}
