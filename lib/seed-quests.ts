import { prisma } from '@/lib/db'
import { seedQuestLadder } from '@/lib/game/quest-ladder'

export async function seedStarterQuests() {
  await seedQuestLadder()
}

/** Permanent world truths at game start (not plot progress). */
const STARTER_FACTS = [
  {
    key: 'treasure_lead',
    category: 'plot',
    content:
      'Лара Крафт (29, археолог/дослідниця) знайшла наводку на Скарб Атлантів у храмі острова, оточеного вічним штормом, не позначеного на мапах.',
    dayNumber: 1,
  },
  {
    key: 'expedition_hired_jack',
    category: 'plot',
    content:
      'Перед аварією Лара найняла приватне судно й провідника Джека Вейна (42, колишній військовий, контрабандист, шрам на обличчі). Він знає частину таємниць острова, але ніколи не входив у центральний храм. На острові в нього «подруга» Лея (Кай-Тору).',
    dayNumber: 1,
  },
  {
    key: 'shipwrecked',
    category: 'plot',
    content:
      'Судно розбилось у бар\'єрному штормі. Лару винесло на берег: без спорядження, зброї й припасів — лише амулет Атлантиди на шиї. Гра починається з її пробудження на піску.',
    dayNumber: 1,
  },
  {
    key: 'jack_fate_unknown',
    category: 'plot',
    content:
      'Доля Джека Вейна після аварії ще не з\'ясована: він міг зійти на берег поруч із Ларою або лишитися біля уламків човна далі по узбережжю. Визначити на початку (FACT jack_ashore_with_lara | jack_near_wreck | jack_found_alive).',
    dayNumber: 1,
  },
  {
    key: 'goal_atlantis_treasure',
    category: 'plot',
    content:
      'Мета експедиції (і гри): знайти легендарний Скарб Атлантів у центральному храмі острова.',
    dayNumber: 1,
  },
  {
    key: 'canon_cast',
    category: 'world',
    content:
      'Канон: Тане і Лея — рідний брат і сестра, діти вождя Макаї, з уже активним таємним інцестуальним інтимом («звичай крові»); також Лея–Джек; Макаї, Найя, Араху; кентаври Ксерон/Іпполіта; мінотаври Гор-Ак/Міра; гієноїди Кіра/Зек; свинолюди Грух/Свиноматка.',
    dayNumber: 1,
  },
  {
    key: 'tane_family_hook',
    category: 'world',
    content:
      'Арка роду Кай-Тору: Тане веде Лару → близькість → перед батьком Макаї (право чужинки) → таємниця брата й сестри (інцест) → спадок крові → син проти батька → благословення/вигнання → вогнище роду / soul-bound.',
    dayNumber: 1,
  },
  {
    key: 'centaur_arc_hook',
    category: 'world',
    content:
      'Арка кентаврів: землі лук → Ксерон вимагає trial → повага → близькість / Іпполіта → місячний біг → союз табуна або вигнання. Без перемоги — «легка здобич».',
    dayNumber: 1,
  },
  {
    key: 'jack_mission_hook',
    category: 'plot',
    content:
      'Джек — найнятий провідник експедиції (не випадковий NPC). Після аварії: з\'ясувати, де він (поруч / біля човна / сліди) → угода → карта/руїни → Лея → підказка до храму → союзник або конкурент.',
    dayNumber: 1,
  },
  {
    key: 'tribes_react_differently',
    category: 'world',
    content:
      'Кожне плем\'я реагує на вхід інакше: Кай-Тору — звичаї/право чужинки; кентаври — змагання; мінотаври — домінування; гієноїди — матріархат; свинолюди — трофей.',
    dayNumber: 1,
  },
  {
    key: 'zek_renegade_hook',
    category: 'world',
    content:
      'Чутки: зі стаї Кіри втік самець-відступник Зек (не «заблукав»). Death-scent — мітка смерті. Арка: сліди → зустріч → притулок → таємниця втечі → мисливці → зняти мітку → провідник → ультиматум/суд Кіри → доля (exile/companion/returned/dead).',
    dayNumber: 1,
  },
  {
    key: 'amulet_dormant',
    category: 'item',
    content:
      'Амулет на шиї Лари — теплий диск Атлантиди. Поки «спить», але реагує на магію й сексуальну енергію.',
    dayNumber: 1,
  },
  {
    key: 'storm_barrier',
    category: 'world',
    content:
      'Острів оточує вічний шторм — втекти на човні майже неможливо без сили Скарбу.',
    dayNumber: 1,
  },
  {
    key: 'sex_is_power',
    category: 'world',
    content:
      'Сексуальна енергія заряджає амулет і відкриває шляхи до скарбу; секс — інструмент виживання.',
    dayNumber: 1,
  },
  {
    key: 'tribe_consent_custom',
    category: 'world',
    content:
      'Кай-Тору не знають «згоди» західного світу: присутність у чоловічій зоні селища = згода за їхніми звичаями.',
    dayNumber: 1,
  },
  {
    key: 'main_quest_path',
    category: 'plot',
    content:
      'Основний шлях: берег → джунглі → Кай-Тору → амулет/глибини → храм → Скарб і вибір кінцівки.',
    dayNumber: 1,
  },
]

export async function seedStarterFacts() {
  for (const f of STARTER_FACTS) {
    await prisma.worldFact.upsert({
      where: { key: f.key },
      update: {
        // Refresh lore text if we expand the catalog; never wipe player-progress facts
        content: f.content,
        category: f.category,
      },
      create: f,
    })
  }
}
