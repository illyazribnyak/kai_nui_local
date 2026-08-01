/**
 * Pure ladder data (safe for client + server).
 * DB logic lives in quest-ladder.ts
 */
export const QUEST_LADDER = [
  {
    title: 'Вижити на березі',
    description: 'Знайти прісну воду й щось їстівне. Не померти в перший день.',
    chapter: 'arrival',
    givenBy: 'Система',
    completeWhen: {
      locations: ['водоспад', 'лагуна'],
      factKeys: ['found_fresh_water', 'found_food'],
      inventoryCategories: ['їжа'],
      inventoryNameHints: ['вод', 'фрукт', 'ягід', 'кокос', 'риб', 'м\'яс', 'мяс'],
    },
  },
  {
    title: 'Увійти в джунглі',
    description: 'Залишити берег і просунутись углиб острова.',
    chapter: 'jungle',
    givenBy: 'Система',
    completeWhen: {
      locations: ['джунгл', 'мангров'],
      factKeys: ['entered_jungle'],
    },
  },
  {
    title: 'Знайти людей острова',
    description: 'Знайти сліди племені Кай-Тору або інших мешканців.',
    chapter: 'tribe',
    givenBy: 'Система',
    completeWhen: {
      locations: ['кай-тору', 'селищ'],
      factKeys: ['met_kai_toru', 'entered_village', 'met_tane', 'met_leya'],
      metNpc: ['Тане', 'Лея', 'Макаї', 'Найя'],
    },
  },
  {
    title: 'Зрозуміти амулет',
    description: 'Дізнатися, чому амулет теплішає і як він пов\'язаний зі Скарбом Атлантів.',
    chapter: 'depths',
    givenBy: 'Система',
    completeWhen: {
      factKeys: ['amulet_awakened', 'learned_amulet_secret', 'spoke_with_naya'],
      locations: ['печер', 'руїн', 'свяще'],
    },
  },
  {
    title: 'Шлях до храму',
    description: 'Дістатися храму насолоди / центрального святилища острова.',
    chapter: 'temple',
    givenBy: 'Система',
    completeWhen: {
      locations: ['храм'],
      factKeys: ['found_temple', 'temple_opened'],
    },
  },
  {
    title: 'Скарб Атлантів',
    description: 'Знайти артефакт і зробити вибір — свобода, влада чи руйнування.',
    chapter: 'climax',
    givenBy: 'Система',
    completeWhen: {
      factKeys: [
        'treasure_found',
        'ending_freedom',
        'ending_priestess',
        'ending_goddess',
        'ending_destroyer',
        'ending_dark_queen',
      ],
    },
  },
] as const

export const QUEST_LADDER_TITLES = QUEST_LADDER.map((q) => q.title)
