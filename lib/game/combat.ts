/**
 * Combat System 3.0: Full deterministic turn calculation, status effects, damage formulas, and loot rewards.
 */

import type { GameState, InventoryItemData } from '@/lib/types'
import { computeWardrobeEffects } from './wardrobe-effects'

export interface EnemyProfile {
  id: string
  name: string
  icon: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  weapon: string
  weakness: string
  type: 'beast' | 'warrior' | 'boss' | 'monster'
  loot: Array<{ name: string; quantity: number }>
}

export const CANON_ENEMIES: Record<string, EnemyProfile> = {
  xeron: {
    id: 'xeron',
    name: 'Ксерон — Вождь Кентаврів',
    icon: '🐎',
    hp: 120,
    maxHp: 120,
    attack: 16,
    defense: 4,
    weapon: 'Важка дворучна сокира',
    weakness: 'Магія Амулета & Спритність',
    type: 'boss',
    loot: [
      { name: 'Шкіра', quantity: 3 },
      { name: 'Ікла хижака', quantity: 2 },
      { name: 'Обсидіан', quantity: 1 },
    ],
  },
  gorak: {
    id: 'gorak',
    name: 'Гор-Ак — Берсерк Мінотавр',
    icon: '🐂',
    hp: 140,
    maxHp: 140,
    attack: 18,
    defense: 5,
    weapon: 'Велетенський кістяний молот',
    weakness: 'Ухилення & Дистанційний бій',
    type: 'boss',
    loot: [
      { name: 'Шкіра', quantity: 4 },
      { name: 'Кістка', quantity: 3 },
    ],
  },
  hyenoid: {
    id: 'hyenoid',
    name: 'Дикий Гієноїд-Мисливець',
    icon: '🐺',
    hp: 55,
    maxHp: 55,
    attack: 10,
    defense: 2,
    weapon: 'Отруйні ікла та пазурі',
    weakness: 'Вогонь & Спис',
    type: 'beast',
    loot: [
      { name: 'Ікла хижака', quantity: 2 },
      { name: 'Шкіра', quantity: 1 },
    ],
  },
  pigman: {
    id: 'pigman',
    name: 'Воїн Свинолюдей',
    icon: '🐗',
    hp: 65,
    maxHp: 65,
    attack: 11,
    defense: 3,
    weapon: 'Кістяна булава',
    weakness: 'Спритність',
    type: 'warrior',
    loot: [
      { name: 'Кістка', quantity: 2 },
      { name: 'Шкіра', quantity: 1 },
    ],
  },
  lizard: {
    id: 'lizard',
    name: 'Гігантський Варан Дзюнглів',
    icon: '🐊',
    hp: 45,
    maxHp: 45,
    attack: 9,
    defense: 2,
    weapon: 'Паща та хвіст-хлист',
    weakness: 'Обсидіанове лезо',
    type: 'beast',
    loot: [
      { name: 'Шкіра', quantity: 2 },
      { name: 'Цілюще листя', quantity: 1 },
    ],
  },
  generic_beast: {
    id: 'generic_beast',
    name: 'Ворожий Хижак Джунглів',
    icon: '🐾',
    hp: 40,
    maxHp: 40,
    attack: 8,
    defense: 1,
    weapon: 'Ікла та пазурі',
    weakness: 'Точні прицільні удари',
    type: 'beast',
    loot: [
      { name: 'Ікла хижака', quantity: 1 },
    ],
  },
}

export function detectEnemyFromContext(
  messages: Array<{ role: string; content: string }>,
  gameState?: GameState | null
): EnemyProfile {
  const lastText = messages
    .slice(-4)
    .map((m) => m.content)
    .join('\n')
    .toLowerCase()

  if (lastText.includes('ксерон') || lastText.includes('кентавр')) return CANON_ENEMIES.xeron
  if (lastText.includes('гор-ак') || lastText.includes('мінотавр')) return CANON_ENEMIES.gorak
  if (lastText.includes('гієноїд') || lastText.includes('зерок') || lastText.includes('гієна')) return CANON_ENEMIES.hyenoid
  if (lastText.includes('свинолюд') || lastText.includes('грух')) return CANON_ENEMIES.pigman
  if (lastText.includes('варан') || lastText.includes('ящір') || lastText.includes('змія')) return CANON_ENEMIES.lizard

  return CANON_ENEMIES.generic_beast
}

export type CombatActionType = 'obsidian_attack' | 'spear_attack' | 'bow_shot' | 'unarmed' | 'block' | 'dodge' | 'amulet_blast' | 'seduce'

export interface TacticalAction {
  id: CombatActionType
  label: string
  actionText: string
  icon: string
  bonusText: string
  category: 'attack' | 'defense' | 'magic' | 'ranged'
}

export interface PlayerCombatArsenal {
  hasSpear: boolean
  hasBow: boolean
  hasObsidianSpear: boolean
  availableActions: TacticalAction[]
}

export function getPlayerCombatArsenal(
  inventory: InventoryItemData[],
  gameState: GameState | null
): PlayerCombatArsenal {
  const invNames = (inventory || []).map((i) => i.name.toLowerCase())
  const hasObsidianSpear = invNames.some((n) => n.includes('обсидіановий'))
  const hasSpear = hasObsidianSpear || invNames.some((n) => n.includes('спис'))
  const hasBow = invNames.some((n) => n.includes('лук'))

  const fx = computeWardrobeEffects(gameState)

  const availableActions: TacticalAction[] = []

  if (hasObsidianSpear) {
    availableActions.push({
      id: 'obsidian_attack',
      label: 'Атака Обсидіановим списом',
      actionText: '⚔️ Використати Обсидіановий спис для потужного пробиваючого удару у вразливе місце ворога!',
      icon: '🗡️',
      bonusText: `+${(gameState?.strength ?? 6) + fx.strengthBonus} Сила · Бронебійне`,
      category: 'attack',
    })
  } else if (hasSpear) {
    availableActions.push({
      id: 'spear_attack',
      label: 'Удар списом з дистанції',
      actionText: '⚔️ Нанести випад колючим списом із безпечної відстані!',
      icon: '🔱',
      bonusText: `+${(gameState?.strength ?? 6) + fx.strengthBonus} Сила`,
      category: 'attack',
    })
  }

  if (hasBow) {
    availableActions.push({
      id: 'bow_shot',
      label: 'Прицільний постріл з лука',
      actionText: '🏹 Натягнути лук та зробити точний прицільний постріл у вразливу точку супротивника!',
      icon: '🏹',
      bonusText: `+${(gameState?.agility ?? 8) + fx.agilityBonus} Спритність`,
      category: 'ranged',
    })
  }

  // Unarmed
  availableActions.push({
    id: 'unarmed',
    label: 'Ручний бій & Серія ударів',
    actionText: '🥊 Нанести блискавичну серію ударів кулаками та ногами в уразливі точки!',
    icon: '🥊',
    bonusText: `+${gameState?.agility ?? 8} Спритність`,
    category: 'attack',
  })

  // Tactical block
  availableActions.push({
    id: 'block',
    label: 'Блок & Захист',
    actionText: '🛡️ Прийняти захисну стійку та заблокувати наступну атаку супротивника!',
    icon: '🛡️',
    bonusText: `+${fx.defenseBonus} Захист вбрання`,
    category: 'defense',
  })

  // Dodge
  availableActions.push({
    id: 'dodge',
    label: 'Рвучке ухилення',
    actionText: '🏃 Застосувати акробатичне ухилення вбік для контратаки з флангу!',
    icon: '🤸‍♀️',
    bonusText: `+${(gameState?.agility ?? 8) + fx.agilityBonus} Спритність`,
    category: 'defense',
  })

  // Amulet magic
  if ((gameState?.amuletEnergy ?? 0) >= 10) {
    availableActions.push({
      id: 'amulet_blast',
      label: 'Магічний імпульс Амулета',
      actionText: '✨ Випустити сліпучий біомагічний імпульс Амулета для оглушення й підкорення ворога!',
      icon: '🔮',
      bonusText: 'Оглушення · 10 Енергії',
      category: 'magic',
    })
  }

  return {
    hasSpear,
    hasBow,
    hasObsidianSpear,
    availableActions,
  }
}

export interface CombatActionResult {
  roll: number
  isCrit: boolean
  playerDamageDealt: number
  enemyDamageDealt: number
  statusApplied?: string
  logText: string
  enemyHpRemaining: number
  laraHpRemaining: number
  isFinished: boolean
  isVictory: boolean
  lootEarned?: Array<{ name: string; quantity: number }>
}

export function resolveCombatTurn(
  actionType: CombatActionType,
  enemy: EnemyProfile,
  currentEnemyHp: number,
  currentLaraHp: number,
  inventory: InventoryItemData[],
  gameState: GameState | null
): CombatActionResult {
  const fx = computeWardrobeEffects(gameState)
  const roll = Math.floor(Math.random() * 20) + 1
  const isCrit = roll === 20
  const isFail = roll === 1

  const str = (gameState?.strength ?? 6) + fx.strengthBonus
  const agi = (gameState?.agility ?? 8) + fx.agilityBonus
  const end = (gameState?.endurance ?? 7) + fx.enduranceBonus
  const def = fx.defenseBonus

  let playerDamage = 0
  let enemyDamage = 0
  let status: string | undefined = undefined
  let log = ''

  // 1. Calculate Player Action
  if (actionType === 'obsidian_attack') {
    const base = str * 2.2 + 8
    playerDamage = Math.round(isCrit ? base * 1.8 : isFail ? 0 : base - enemy.defense)
    log = `⚔️ Лара наносить нищівний пробиваючий удар Обсидіановим списом! (Кидок: d20=${roll}, Шкода: ${playerDamage})`
  } else if (actionType === 'spear_attack') {
    const base = str * 1.8 + 5
    playerDamage = Math.round(isCrit ? base * 1.6 : isFail ? 0 : base - enemy.defense)
    log = `🔱 Колючий випад списом із дистанції! (Кидок: d20=${roll}, Шкода: ${playerDamage})`
  } else if (actionType === 'bow_shot') {
    const base = agi * 2.0 + 6
    playerDamage = Math.round(isCrit ? base * 2.0 : isFail ? 0 : base - enemy.defense)
    if (isCrit) status = 'bleeding'
    log = `🏹 Прицільний постріл із лука прямо в уразливу точку! (Кидок: d20=${roll}, Шкода: ${playerDamage})`
  } else if (actionType === 'unarmed') {
    const base = agi * 1.4 + 3
    playerDamage = Math.round(isCrit ? base * 1.5 : isFail ? 0 : base - enemy.defense)
    log = `🥊 Серія швидких ударів у ближньому бою! (Кидок: d20=${roll}, Шкода: ${playerDamage})`
  } else if (actionType === 'block') {
    playerDamage = Math.round(str * 0.8)
    log = `🛡️ Лара виставила блок, готовий згасити удар супротивника! (Захист вбрання: +${def})`
  } else if (actionType === 'dodge') {
    playerDamage = Math.round(agi * 1.2)
    if (roll >= 10) status = 'dodged'
    log = `🏃 Акробатичне ухилення вбік для контратаки з флангу! (Кидок d20=${roll})`
  } else if (actionType === 'amulet_blast') {
    const cha = (gameState?.charisma ?? 7) + fx.charismaBonus
    playerDamage = Math.round(cha * 2.5 + 10)
    status = 'stunned'
    log = `🔮 Сліпучий містичний спалах Амулета охоплює супротивника! (Шкода: ${playerDamage}, Ворог оглушений!)`
  } else if (actionType === 'seduce') {
    const cha = (gameState?.charisma ?? 7) + fx.charismaBonus + (gameState?.desire ?? 0) * 0.2
    if (roll + cha >= 18) {
      status = 'charmed'
      playerDamage = currentEnemyHp // Ends combat in seduction!
      log = `💋 Лара використовує свою чуттєвість та чари, підкорюючи супротивника без кровопролиття!`
    } else {
      log = `💋 Спроба спокуси не вдалася — супротивник лютує!`
    }
  }

  playerDamage = Math.max(0, playerDamage)
  const enemyHpRemaining = Math.max(0, currentEnemyHp - playerDamage)

  // 2. Enemy Counterattack if alive
  if (enemyHpRemaining > 0 && status !== 'stunned' && status !== 'dodged' && status !== 'charmed') {
    const baseEnemyDmg = enemy.attack - def
    enemyDamage = Math.round(actionType === 'block' ? Math.max(1, baseEnemyDmg * 0.3) : Math.max(2, baseEnemyDmg))
    log += ` | 👹 ${enemy.name} контратакує та завдає ${enemyDamage} HP шкоди!`
  } else if (status === 'dodged') {
    log += ` | ✨ Лара повністю ухилилася від атаки ворога!`
  } else if (status === 'stunned') {
    log += ` | 💫 Ворог оглушений і пропускає свій хід!`
  }

  const laraHpRemaining = Math.max(0, currentLaraHp - enemyDamage)
  const isFinished = enemyHpRemaining === 0 || laraHpRemaining === 0
  const isVictory = enemyHpRemaining === 0

  return {
    roll,
    isCrit,
    playerDamageDealt: playerDamage,
    enemyDamageDealt: enemyDamage,
    statusApplied: status,
    logText: log,
    enemyHpRemaining,
    laraHpRemaining,
    isFinished,
    isVictory,
    lootEarned: isVictory ? enemy.loot : undefined,
  }
}
