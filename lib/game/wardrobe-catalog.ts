/**
 * Wardrobe & Appearance presets catalog for Lara Croft on Kai Nui island.
 * Integrates visual presets, icons, tags, and status descriptions.
 */

export type WardrobeCategory = 'clothing' | 'hairstyle' | 'bodyPaint' | 'accessories'

export type OutfitPreset = {
  id: string
  label: string
  description: string
  icon: string
  category: WardrobeCategory
  lookKey?: string
  avatarImage: string
  badgeText?: string
  statBonusText?: string
}

export const CLOTHING_PRESETS: OutfitPreset[] = [
  {
    id: 'default',
    label: 'Клапті одягу',
    description: 'Базовий порваний топ та шорти після авіакатастрофи.',
    icon: '👕',
    category: 'clothing',
    lookKey: 'default',
    avatarImage: '/avatars/lara_default.png',
    badgeText: 'Виживання',
    statBonusText: 'Нейтральний стан',
  },
  {
    id: 'tribal',
    label: 'Племінний тотем Кай-Тору',
    description: 'Традиційне вбрання з обробленої шкіри, ліан та кісток.',
    icon: '🌿',
    category: 'clothing',
    lookKey: 'tribal',
    avatarImage: '/avatars/lara_tribal.png',
    badgeText: 'Племінне',
    statBonusText: '+2 Харизма з тубільцями',
  },
  {
    id: 'ritual',
    label: 'Ритуальна мантія жриці',
    description: 'Шовкові сонячні шати з давньою ритуальною вишивкою.',
    icon: '✨',
    category: 'clothing',
    lookKey: 'ritual',
    avatarImage: '/avatars/lara_ritual.png',
    badgeText: 'Магічне',
    statBonusText: '+2 Воля · Сприйнятливість до амулета',
  },
  {
    id: 'leather',
    label: 'Шкіряний комплект мисливиці',
    description: 'Зручний підтягнутий топ та загартовані шкіряні ремені.',
    icon: '🏹',
    category: 'clothing',
    lookKey: 'confident',
    avatarImage: '/avatars/lara_confident.png',
    badgeText: 'Бойове',
    statBonusText: '+1 Спритність · +10 Впевненість',
  },
  {
    id: 'intimate',
    label: 'Легка нічна накидка',
    description: 'Тонке інтимне вбрання для відпочинку біля багаття.',
    icon: '💋',
    category: 'clothing',
    lookKey: 'intimate',
    avatarImage: '/avatars/lara_intimate.png',
    badgeText: 'Інтимне',
    statBonusText: '+15 Бажання / Збудження',
  },
  {
    id: 'nude',
    label: 'Без одягу (Оголена)',
    description: 'Повна острівна свобода без жодних обмежень.',
    icon: '🔥',
    category: 'clothing',
    lookKey: 'aroused',
    avatarImage: '/avatars/lara_aroused.png',
    badgeText: 'Природне',
    statBonusText: '+25 Бажання · Підвищений сором/чуттєвість',
  },
]

export const HAIRSTYLE_PRESETS: OutfitPreset[] = [
  {
    id: 'classic_braid',
    label: 'Класична коса Лари',
    description: 'Традиційна міцна коса, що не заважає у русі.',
    icon: '👱‍♀️',
    category: 'hairstyle',
    avatarImage: '/avatars/lara.png',
    badgeText: 'Класика',
  },
  {
    id: 'wild_loose',
    label: 'Розпатлане дике волосся',
    description: 'Вільні пасма, розвіяні вітром джунглів.',
    icon: '🦁',
    category: 'hairstyle',
    avatarImage: '/avatars/lara_default.png',
    badgeText: 'Дике',
  },
  {
    id: 'tribal_feathers',
    label: 'Зачіска з пір\'ям',
    description: 'Вплетене кольорове пір\'я тропічних птахів.',
    icon: '🪶',
    category: 'hairstyle',
    avatarImage: '/avatars/lara_tribal.png',
    badgeText: 'Племінне',
  },
  {
    id: 'wet_afterglow',
    label: 'Вологе волосся з рум\'янцем',
    description: 'Чуттєві вологі пасма після купання або пристрасті.',
    icon: '💦',
    category: 'hairstyle',
    avatarImage: '/avatars/lara_afterglow.png',
    badgeText: 'Чуттєве',
  },
  {
    id: 'ritual_knot',
    label: 'Церемоніальний вузол',
    description: 'Висока ритуальна зачіска з кістяними шпильками.',
    icon: '👑',
    category: 'hairstyle',
    avatarImage: '/avatars/lara_ritual.png',
    badgeText: 'Ритуал',
  },
]

export const BODY_PAINT_PRESETS: OutfitPreset[] = [
  {
    id: 'none',
    label: 'Чиста шкіра',
    description: 'Без візерунків та розпису.',
    icon: '🧼',
    category: 'bodyPaint',
    avatarImage: '/avatars/lara.png',
    badgeText: 'Природне',
  },
  {
    id: 'sun_tribal',
    label: 'Сонце Кай-Тору',
    description: 'Оранжево-вогняний магічний символ племені на плечах.',
    icon: '☀️',
    category: 'bodyPaint',
    avatarImage: '/avatars/lara_tribal.png',
    badgeText: 'Священне',
    statBonusText: '+15 Повага племені',
  },
  {
    id: 'warrior_stripes',
    label: 'Бойові смуги',
    description: 'Чорно-червоні тактичні смуги воїна на щоках та стегнах.',
    icon: '⚔️',
    category: 'bodyPaint',
    avatarImage: '/avatars/lara_confident.png',
    badgeText: 'Воїн',
    statBonusText: '+1 Залякування у бою',
  },
  {
    id: 'glowing_runes',
    label: 'Світні руни Духа',
    description: 'Біомагічна фарба, що м\'яко сяє блакитним у темряві.',
    icon: '🌌',
    category: 'bodyPaint',
    avatarImage: '/avatars/lara_dark_seductive.png',
    badgeText: 'Магія',
    statBonusText: '+10 Заряд амулета',
  },
  {
    id: 'mud_survival',
    label: 'Маскувальний бруд',
    description: 'Бруд та попіл джунглів для прихованості.',
    icon: '🍃',
    category: 'bodyPaint',
    avatarImage: '/avatars/lara_exhausted.png',
    badgeText: 'Тактичне',
    statBonusText: '+20 Стелс у джунглях',
  },
]

export const ACCESSORIES_PRESETS: OutfitPreset[] = [
  {
    id: 'none',
    label: 'Без прикрас',
    description: 'Жодних додаткових аксесуарів.',
    icon: '🚫',
    category: 'accessories',
    avatarImage: '/avatars/lara.png',
    badgeText: 'Мінімалізм',
  },
  {
    id: 'amulet',
    label: 'Прадавній амулет',
    description: 'Містичний артефакт, що резонує з енергією острова.',
    icon: '🔮',
    category: 'accessories',
    avatarImage: '/avatars/lara_ritual.png',
    badgeText: 'Артефакт',
    statBonusText: 'Накопичує магічну енергію',
  },
  {
    id: 'fang_necklace',
    label: 'Намисто з іклів саблезуба',
    description: 'Трофей мисливиці з іклів диких звірів.',
    icon: '🦷',
    category: 'accessories',
    avatarImage: '/avatars/lara_tribal.png',
    badgeText: 'Трофей',
    statBonusText: '+1 Сила',
  },
  {
    id: 'flower_wreath',
    label: 'Вінок з орхідей',
    description: 'Пахучий вінок зі свіжих квітів острова.',
    icon: '🌺',
    category: 'accessories',
    avatarImage: '/avatars/lara_intimate.png',
    badgeText: 'Прикраса',
    statBonusText: '+1 Настрій',
  },
]
