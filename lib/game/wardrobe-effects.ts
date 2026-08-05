/**
 * Gameplay stat modifiers and bonuses derived from active clothing, body paint, and accessories.
 */

import type { GameState } from '@/lib/types'

export interface WardrobeEffects {
  strengthBonus: number
  agilityBonus: number
  enduranceBonus: number
  charismaBonus: number
  willpowerBonus: number
  desireBonus: number
  stealthBonus: number
  tribeReputationBonus: number
  defenseBonus: number
  summary: string[]
}

export function computeWardrobeEffects(state: Partial<GameState> | null | undefined): WardrobeEffects {
  const effects: WardrobeEffects = {
    strengthBonus: 0,
    agilityBonus: 0,
    enduranceBonus: 0,
    charismaBonus: 0,
    willpowerBonus: 0,
    desireBonus: 0,
    stealthBonus: 0,
    tribeReputationBonus: 0,
    defenseBonus: 0,
    summary: [],
  }

  if (!state) return effects

  const cloth = (state.clothing || '').toLowerCase()
  const paint = (state.bodyPaint || '').toLowerCase()
  const acc = (state.accessories || '').toLowerCase()

  // --- Clothing Effects ---
  if (cloth.includes('мережив') || cloth.includes('panties') || cloth.includes('трусик')) {
    effects.desireBonus += 20
    effects.charismaBonus += 3
    effects.summary.push('Мереживні трусики: +20 Бажання, +3 Харизма у звабленні')
  } else if (cloth.includes('шовк') || cloth.includes('стрінг') || cloth.includes('бікіні')) {
    effects.desireBonus += 25
    effects.charismaBonus += 4
    effects.summary.push('Шовковий бікіні-сет зі стрінгами: +25 Бажання, +4 Спокуса')
  } else if (cloth.includes('прозор') || cloth.includes('плетін')) {
    effects.desireBonus += 30
    effects.summary.push('Прозоре плетіння: +30 Бажання, повне зняття сорому')
  } else if (cloth.includes('корсет')) {
    effects.strengthBonus += 2
    effects.charismaBonus += 2
    effects.summary.push('Шкіряний корсет: +2 Сила, +2 Домінування')
  } else if (cloth.includes('спорт') || cloth.includes('шортик')) {
    effects.agilityBonus += 2
    effects.enduranceBonus += 1
    effects.summary.push('Спортивний сет: +2 Спритність, +1 Витривалість')
  } else if (cloth.includes('плем') || cloth.includes('tribal') || cloth.includes('тотем')) {
    effects.charismaBonus += 2
    effects.tribeReputationBonus += 15
    effects.summary.push('Племінне вбрання: +2 Харизма з тубільцями, +15 Репутація Кай-Тору')
  } else if (cloth.includes('ритуал') || cloth.includes('мантія') || cloth.includes('жриц')) {
    effects.willpowerBonus += 2
    effects.summary.push('Ритуальна мантія: +2 Воля, магічний резонанс з амулетом')
  } else if (cloth.includes('шкір') || cloth.includes('мислив')) {
    effects.agilityBonus += 1
    effects.defenseBonus += 1
    effects.summary.push('Шкіряний одяг: +1 Спритність, +1 Захист у бою')
  } else if (cloth.includes('інтим') || cloth.includes('накид')) {
    effects.desireBonus += 15
    effects.summary.push('Легка накидка: +15 Бажання / Збудження')
  } else if (cloth.includes('гола') || cloth.includes('без одягу') || cloth.includes('nude')) {
    effects.desireBonus += 25
    effects.summary.push('Оголена: +25 Бажання, романтичний/еротичний вплив')
  }

  // --- Body Paint Effects ---
  if (paint.includes('сонц') || paint.includes('кай-тору')) {
    effects.charismaBonus += 1
    effects.tribeReputationBonus += 10
    effects.summary.push('Сонце Кай-Тору: +1 Харизма, +10 Повага племені')
  } else if (paint.includes('війн') || paint.includes('смуг')) {
    effects.strengthBonus += 1
    effects.summary.push('Бойові смуги: +1 Сила у залякуванні/бою')
  } else if (paint.includes('руни') || paint.includes('світні')) {
    effects.willpowerBonus += 1
    effects.summary.push('Світні руни: +1 Воля, м\'яке біомагічне сяйво')
  } else if (paint.includes('бруд') || paint.includes('маскув')) {
    effects.stealthBonus += 20
    effects.summary.push('Маскувальний бруд: +20 Стелс у джунглях')
  }

  // --- Accessories Effects ---
  if (acc.includes('амулет')) {
    effects.willpowerBonus += 1
    effects.summary.push('Прадавній амулет: +1 Воля, накопичення енергії')
  } else if (acc.includes('ікл') || acc.includes('намист')) {
    effects.strengthBonus += 1
    effects.summary.push('Намисто з іклів: +1 Сила')
  } else if (acc.includes('вінок') || acc.includes('квіт')) {
    effects.charismaBonus += 1
    effects.summary.push('Вінок з орхідей: +1 Харизма')
  }

  return effects
}
