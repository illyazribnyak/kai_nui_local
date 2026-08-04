/**
 * Pure ladder data (safe for client + server).
 * DB logic lives in quest-ladder.ts
 *
 * Main story path — sequential. Auto-complete via isLadderStepComplete (OR of conditions).
 * Side quests: see canon-events.ts SIDE_QUESTS (GM opens via QUEST_UPDATE).
 */
export const QUEST_LADDER = [
  {
    title: 'Вижити на березі',
    description:
      'Знайти прісну воду й щось їстівне. Не померти в перший день після аварії.',
    chapter: 'arrival',
    givenBy: 'Система',
    completeWhen: {
      locations: ['водоспад', 'лагуна'],
      factKeys: ['found_fresh_water', 'found_food', 'first_night_survived'],
      inventoryCategories: ['їжа'],
      inventoryNameHints: ['вод', 'фрукт', 'ягід', 'кокос', 'риб', "м'яс", 'мяс'],
    },
  },
  {
    title: 'Увійти в джунглі',
    description: 'Залишити берег і просунутись углиб острова крізь густі зарості.',
    chapter: 'jungle',
    givenBy: 'Система',
    completeWhen: {
      locations: ['джунгл', 'мангров'],
      factKeys: ['entered_jungle'],
    },
  },
  {
    title: 'Знайти людей острова',
    description:
      'Знайти сліди племені Кай-Тору або інших мешканців. Перший живий контакт.',
    chapter: 'tribe',
    givenBy: 'Система',
    completeWhen: {
      locations: ['кай-тору', 'селищ'],
      factKeys: [
        'met_kai_toru',
        'entered_village',
        'met_tane',
        'met_leya',
        'met_jack',
      ],
      metNpc: ['Тане', 'Лея', 'Макаї', 'Найя', 'Джек Вейн'],
    },
  },
  {
    title: 'Гостя Кай-Тору',
    description:
      'Дістатися селища, зустріти вождя Макаї або шаманку Найю — стати відомою племені.',
    chapter: 'tribe',
    givenBy: 'Система',
    completeWhen: {
      locations: ['кай-тору', 'селищ'],
      factKeys: [
        'entered_village',
        'met_makai',
        'met_naya',
        'guest_of_tribe',
        'tribe_accepted',
      ],
      metNpc: ['Макаї', 'Найя'],
    },
  },
  {
    title: 'Зрозуміти амулет',
    description:
      'Дізнатися, чому амулет теплішає і як він пов\'язаний зі Скарбом Атлантів.',
    chapter: 'depths',
    givenBy: 'Система',
    completeWhen: {
      // Only facts — visiting caves alone is not “understanding” the amulet
      factKeys: [
        'amulet_awakened',
        'learned_amulet_secret',
        'spoke_with_naya',
      ],
    },
  },
  {
    title: 'Глибини острова',
    description:
      'Дослідити печери, руїни чи священну гору — місця сили перед храмом.',
    chapter: 'depths',
    givenBy: 'Система',
    completeWhen: {
      locations: ['печер', 'руїн', 'свяще', 'гора', 'лабіринт'],
      factKeys: [
        'found_ruins',
        'entered_caves',
        'climbed_mountain',
        'met_arahu',
        'other_tribe_contact',
      ],
    },
  },
  {
    title: 'Шлях до храму',
    description: 'Дістатися храму насолоди — центрального святилища острова.',
    chapter: 'temple',
    givenBy: 'Система',
    completeWhen: {
      locations: ['храм'],
      factKeys: ['found_temple', 'temple_opened'],
    },
  },
  {
    title: 'Скарб Атлантів',
    description:
      'Знайти артефакт і зробити вибір — свобода, жриця, богиня, руйнування чи темрява.',
    chapter: 'climax',
    givenBy: 'Система',
    completeWhen: {
      factKeys: [
        'treasure_found',
        'ritual_started',
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
