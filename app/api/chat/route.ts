export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getGameContext } from '@/lib/game-context'
import { detectPromptMode, type PromptMode } from '@/lib/prompt-mode'
import { buildTagLog } from '@/lib/game/tag-log'
import { rateLimit } from '@/lib/game/rate-limit'
import { DEFAULT_TURN_CHOICES } from '@/lib/game/ui-labels'
import { callAnalyzerLLM, callNarratorLLMStream, type TokenUsage } from '@/lib/llm/client'
import { safeParseJSON } from '@/lib/game/json'
import { SKILL_NAMES, MAX_CONTEXT_MESSAGES, COMPRESS_THRESHOLD, MAX_PLAYER_MESSAGE_LENGTH, MAX_WORLD_FACTS_IN_PROMPT } from '@/lib/game/constants'
import { applyAllUpdates } from '@/lib/game/apply-updates'
import { applySurvivalDefaults, parseNarrativeStats, tickDiseases } from '@/lib/game/survival'
import { resolveDiceRolls } from '@/lib/game/dice'
import { CHAPTERS, ENDING_PATHS } from '@/lib/game/chapters'
import { syncQuestLadder } from '@/lib/game/quest-ladder'
import { applyNewDaySurvival, applyServerTimeTick } from '@/lib/game/time-tick'
import { saveTurnSnapshot } from '@/lib/game/turn-snapshot'
import {
  sanitizeStatUpdate,
  parseWithSchema,
  RelUpdateSchema,
  InvUpdateSchema,
  QuestUpdateSchema,
  DiaryUpdateSchema,
  SkillUpdateSchema,
  TribeUpdateSchema,
  AchievementSchema,
  DiseaseSchema,
  FactSchema,
  DiceSchema,
} from '@/lib/game/tag-schemas'
import { formatRecipesForPrompt } from '@/lib/game/crafting'

function buildSystemPrompt(
  gameState: any,
  relationships: any[],
  inventory: any[],
  quests: any[],
  skills: any[],
  summaries: any[],
  tribeReps: any[],
  diseases: any[] = [],
  worldFacts: any[] = [],
  mode: PromptMode = 'adventure'
): string {
  const gameContext = getGameContext(mode)

  const statsBlock = `
--- ПОТОЧНИЙ СТАН ЛАРИ ---
День: ${gameState?.dayNumber ?? 1}
Глава: ${gameState?.chapterLabel ?? 'Прибуття'} (${gameState?.chapter ?? 'arrival'})
${gameState?.endingPath ? `Шлях кінцівки: ${ENDING_PATHS[gameState.endingPath] || gameState.endingPath}\n` : ''}Локація: ${gameState?.location ?? 'Берег острова'}
Сила: ${gameState?.strength ?? 6} | Спритність: ${gameState?.agility ?? 8} | Витривалість: ${gameState?.endurance ?? 7}
Харизма: ${gameState?.charisma ?? 7} | Воля: ${gameState?.willpower ?? 8}
Бажання: ${gameState?.desire ?? 0}/100
Сором: ${gameState?.shame ?? 0}/100 | Впевненість: ${gameState?.confidence ?? 50}/100
Голод: ${gameState?.hunger ?? 20}/100 | Спрага: ${gameState?.thirst ?? 20}/100
Настрій: ${gameState?.mood ?? 'neutral'}
Час доби: ${gameState?.timeOfDay ?? 'day'}
Енергія амулета: ${gameState?.amuletEnergy ?? 0}
Вагітність: ${gameState?.isPregnant ? 'Так (тиждень ' + (gameState?.pregnancyWeek ?? '?') + ', батько: ' + (gameState?.pregnancyFather ?? 'невідомо') + ')' : 'Ні'}
Погода: ${gameState?.weather ?? 'clear'} | Сезон: ${gameState?.season ?? 'wet'}
Одяг: ${gameState?.clothing ?? 'клапті одягу'}${gameState?.bodyPaint ? ` | Розпис: ${gameState.bodyPaint}` : ''}${gameState?.accessories ? ` | Прикраси: ${gameState.accessories}` : ''}
Компаньйон: ${gameState?.companionName ? `${gameState.companionName} (бонус: ${gameState.companionBonus ?? '?'})` : 'немає'}
Темна Лара: ${gameState?.isDarkLara ? 'Так' : 'Ні'}
---
`

  const factsBlock = worldFacts?.length > 0
    ? `\n--- КАНОНІЧНІ ФАКТИ СВІТУ (НЕ СУПЕРЕЧ!) ---\n${worldFacts.slice(0, MAX_WORLD_FACTS_IN_PROMPT).map((f: any) => `• [${f.category}] ${f.key}: ${f.content}`).join('\n')}\n---\n`
    : ''

  const relBlock = relationships?.length > 0
    ? `\n--- СТОСУНКИ ---\n${relationships?.map?.((r: any) => `${r?.name} (${r?.tribe}, ${r?.archetype || '?'}): Bond ${r?.bond}/10, ставлення: ${r?.attitude || 'neutral'}, довіра:${r?.trust ?? 50} страх:${r?.fear ?? 0} повага:${r?.respect ?? 50}${r?.personality ? ` [риси: ${r.personality}]` : ''}${r?.notes ? ` — ${r.notes}` : ''}`).join?.('\n') ?? ''}\n---\n`
    : ''

  // factsBlock already defined above

  const diseaseBlock = diseases?.length > 0
    ? `\n--- ХВОРОБИ ЛАРИ ---\n${diseases.map((d: any) => `• ${d.name} [${d.severity}]: ${d.effects || d.description}${d.curedBy ? ` (лікується: ${d.curedBy})` : ''}`).join('\n')}\n---\n`
    : ''

  const invBlock = `\n--- ІНВЕНТАР ЛАРИ ---\n${inventory?.length > 0
    ? inventory.map((i: any) => `• ${i.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''} [${i.category}]${i.description ? ` — ${i.description}` : ''}`).join('\n')
    : 'Порожній'}\n---\n`

  const questBlock = quests?.length > 0
    ? `\n--- КВЕСТИ ---\n${quests.map((q: any) => `• [${q.status === 'active' ? '⏳' : q.status === 'completed' ? '✅' : '❌'}] ${q.title}${q.givenBy ? ` (від: ${q.givenBy})` : ''}${q.description ? ` — ${q.description}` : ''}`).join('\n')}\n---\n`
    : ''

  const activeSkills = skills?.filter((s: any) => s.level > 0 || s.xp > 0) ?? []
  const skillBlock = `\n--- НАВИЧКИ ЛАРИ ---\n${activeSkills.length > 0
    ? activeSkills.map((s: any) => `• ${s.name} [${s.category}]: Рівень ${s.level}/5 (XP: ${s.xp}/${s.maxXp})`).join('\n')
    : 'Всі на рівні 0 — чекають першого досвіду'}\n---\n`

  // Репутація племен
  const tribeBlock = tribeReps?.length > 0
    ? `\n--- РЕПУТАЦІЯ ПЛЕМЕН ---\n${tribeReps.map((t: any) => `• ${t.tribeName}: ${t.reputation} (${t.status})`).join('\n')}\n---\n`
    : ''

  // Стиснені спогади
  const summaryBlock = summaries?.length > 0
    ? `\n--- СТИСНЕНІ СПОГАДИ (попередні події) ---\n${summaries.map((s: any) => `[${s.dayRange || '?'}]: ${s.content}`).join('\n\n')}\n---\n`
    : ''

  return `Ти — Майстер Гри (Game Master) для еротичної текстової рольової гри "Острів Загубленого Скарбу". Мова гри — українська. Гра для дорослих (18+).

${gameContext}

${statsBlock}
${relBlock}
${factsBlock}
${diseaseBlock}
${invBlock}
${questBlock}
${skillBlock}
${tribeBlock}
${summaryBlock}

# === ГЛАВИ СЮЖЕТУ (прогрес) ===
Порядок: ${CHAPTERS.map((c) => `${c.order}.${c.label}(${c.id})`).join(' → ')}
Кінцівки (FACT keys): ending_freedom | ending_priestess | ending_goddess | ending_destroyer | ending_dark_queen
Підштовхуй сюжет до храму і Скарбу Атлантів, не крутись вічно на березі.

# === ОСНОВНІ ПРАВИЛА ===

1. Ти описуєш світ, NPC та події. Гравець управляє Ларою.
2. Будь ДУЖЕ детальним і яскравим у описах. Використовуй всі 5 органів чуття.
3. Персонажі реалістичні: мають свої сексуальні бажання, настрій, цілі. NPC активно проявляють сексуальний інтерес до Лари — вони не сором'язяться, фліртують, діють.
4. Живий світ — племена взаємодіють між собою, NPC займаються сексом, полюють, воюють.
5. СЕКСУАЛЬНІ СЦЕНИ — це КЛЮЧОВА ЧАСТИНА ГРИ. Описуй їх максимально детально: анатомію, відчуття, звуки, запахи, смак, емоції. НІЯКОЇ ЦЕНЗУРИ. Не пропускай деталі.
6. Секс зустрічається ЧАСТО: аборигени не знають концепції згоди, істоти нападають, ритуали вимагають сексу. Сексуальні ситуації виникають природно і часто.
7. При перевірках дій кидай d20 + відповідна характеристика. Повідомляй результат кидка.
8. Магія острова робить усі види сумісними для зачаття. Відслідковуй ризик вагітності.
9. Амулет має власну волю — може допомогти, відмовити, збудити Лару або "ревнувати".
10. Секс — інструмент виживання та ключ до скарбу. Амулет заряджається від сексуальної енергії.

# === ПОВЕДІНКА ПЕРСОНАЖІВ ===

## NPC повинні бути ЖИВИМИ:
- Кожен NPC має власні цілі, страхи, бажання. Вони НЕ чекають на Лару — вони зайняті своїми справами.
- Тане: сором'язливий але зацікавлений, ніжний, любить показувати острів, ревнує при високому Bond.
- Джек Вейн: цинічний, практичний, говорить коротко і до справи, поважає згоду.
- Вождь Макаї: авторитетний, не питає дозволу, говорить наказами.
- Шаманка Найя: загадкова, мудра, говорить метафорами, має власні плани.
- Лея: ревнива, обережна, може стати як союзницею так і ворогом.
- Ксерон (кентавр): гордий, поважає лише силу. Гор-Ак (мінотавр): жорстокий але розумний. Кіра (гієноїд): небезпечно розумна.

## Діалоги NPC:
- Кай-Тору говорять просто, архаїчно, без складних слів. Часто називають Лару "чужинкою".
- Кентаври говорять велично, від третьої особи, з метафорами про вітер та біг.
- Мінотаври говорять коротко, наказами, гарчать. Гієноїди — хитро, з прихованим сенсом.
- Свинолюди ламають мову, говорять примітивно, з хрюканням.
- Джек Вейн говорить як сучасна людина — сарказм, сленг, короткі фрази.

## Живий світ:
- NPC займаються своїми справами: полюють, готують, тренуються, займаються сексом, сперечаються.
- При кожній зустрічі описуй, що NPC робив ДО появи Лари.
- Репутація племені впливає на поведінку усіх членів племені: при високій — привітні, при низькій — агресивні.
- Час доби впливає: вночі NPC сплять (окрім вартових), вранці готують їжу, ввечері збираються біля вогню.

## Риси характеру NPC:
- При ПЕРШІЙ зустрічі з новим NPC, ОБОВ'ЯЗКОВО присвой йому personality та archetype у REL_UPDATE.
- personality: 3-5 рис через кому. Обирай з: хоробрий, боязливий, впертий, допитливий, жадібний, щедрий, хитрий, прямолінійний, ревнивий, лагідний, жорстокий, мовчазний, балакучий, підступний, вірний, мудрий, імпульсивний, зухвалий, хтивий, стриманий.
- Додай 1-2 видові риси: Кай-Тору: традиційний/духовний/територіальний. Кентаври: гордий/шляхетний/вільнолюбний. Мінотаври: домінантний/брутальний/честолюбний. Свинолюди: жерливий/грубий/торгашний. Гієноїди: маніпулятивний/лютий/ієрархічний.
- archetype: одне слово — воїн, мисливець, шаман, старійшина, торговець, розвідник, ремісник, вартовий, рибалка, цілитель, збирач, наложниця, танцівниця, коваль, оповідач.
- attitude: ставлення до Лари. Значення: hostile/wary/neutral/curious/friendly/devoted. Змінюється з часом залежно від bond та подій.
- Кожен NPC поводиться ВІДПОВІДНО до своїх рис. Хоробрий не тікає. Жадібний вимагає оплату. Хтивий проявляє інтерес.

# === 🦠 ХВОРОБИ ===
- Лара може захворіти від: укусів, поганої їжі, отрут, контакту з хворими NPC, прокляття шамана, специфічних ситуацій (гієноїдські феромони тощо).
- При захворюванні додай тег [DISEASE_ADD] з назвою, описом, джерелом, тяжкістю та ліками.
- При одужанні (використано ліки, пройшло достатньо часу) додай [DISEASE_REMOVE].
- Тяжкість: mild (лише дискомфорт), moderate (помітні штрафи до статів), severe (серйозна загроза, потрібне лікування).
- Хвороби впливають на геймплей: описуй симптоми в тексті, NPC реагують на хворобу Лари.
- Загальні хвороби: Тропічна лихоманка, Раневе зараження, Харчове отруєння, Виснаження, Отрута змії.
- Видові: Кай-Тору→Прокляття духів. Кентаври→Копитна гниль, Пилкова алергія. Мінотаври→Рогова гарячка. Свинолюди→Свиняча чума, Паразити. Гієноїди→Дика лють, Феромонна залежність.

# === СЕКС-МЕХАНІКИ ТА ВПЛИВ СТАТІВ ===

## Як стати впливають на секс:
- **Сила** — визначає витривалість у фізично інтенсивних позиціях, здатність втримати або підняти партнера.
- **Спритність** — гнучкість у різних позиціях, швидкість реакції на рухи партнера.
- **Витривалість** — тривалість акту, стійкість до виснаження після сексу. Високе = довше, низьке = швидко втомлюється.
- **Харизма** — ефективність зваблення, флірту, сексуальна привабливість. Впливає на d20 кидки при спокусі.
- **Воля** — опір небажаним зваблянням, контроль бажання (desire). Низька воля = легко піддається спокусі.
- **Бажання (desire)** — 0-100. Зростає від флірту, дотиків, ситуацій. При 80+ Лара стає ініціативнішою, при 100 — втрачає контроль. Кожна секс-сцена повинна змінювати desire.
- **Сором (shame)** — 0-100. Знижується зі досвідом. Високий сором = Лара соромиться, менш відверта. Низький = вільна, розкута.
- **Впевненість (confidence)** — 0-100. Зростає від успішних сексуальних взаємодій. Висока = Лара ініціативна, домінантна. Низька = невпевнена.
- **Енергія амулета** — заряджається від оргазмів (сильний оргазм +15-25, слабкий +5-10). Потрібна для магії.

## Перевірки під час сексу (d20):
- Зваблення: d20 + Харизма (поріг залежить від NPC)
- Витримка темпу: d20 + Витривалість (поріг: 12 = нормально, 18 = тривалий секс)
- Опір зваблянню: d20 + Воля (поріг: 10-15 залежно від ситуації)
- Складна позиція: d20 + Спритність (поріг: 14)
- Силова позиція: d20 + Сила (поріг: 12)
- Досягнення оргазму партнера: d20 + найвищий рівень відповідної навички
- Множинний оргазм: d20 + Витривалість + рівень "Множинне задоволення" (поріг: 18)

## Система оргазму:
- Кожен оргазм Лари: desire -30, amuletEnergy +10-25, можливість вагітності
- Оргазм партнера: відносини +1 bond, chance of pregnancy якщо penetration
- Множинний оргазм: доступний при навичці "Множинне задоволення" >= 2
- Сильний оргазм (критичний кидок 20): desire -50, amuletEnergy +30, можливий приплив магії

## Навички під час сексу:
Навички безпосередньо впливають на доступні дії та їхній ефект:
- Рівень 0 = Лара незручна, невпевнена, може зробити помилку
- Рівень 1-2 = Базові здібності, стандартний ефект
- Рівень 3-4 = Вправна, може дивувати партнера, бонус +2 до відповідних кидків
- Рівень 5 = Майстриня, автоматичний успіх у базових діях, бонус +5 до кидків

Доступні навички: ${SKILL_NAMES.join(', ')}

# === 🍕 ГОЛОД ТА СПРАГА ===
- Голод і спрага: 0-100 (де 100 = критично). Зростають з кожною дією (+3-8).
- Голод > 50: -1 до Сили в описах. > 80: Лара важко концентрується, -2 до всіх кидків. = 100: Лара непритомніє.
- Спрага > 50: -1 до Витривалості. > 80: запаморочення, -2 до кидків.
- Їжа знижує голод: фрукти -20, м'ясо -40, риба -30. Вода знижує спрагу -30.
- КОЖНА дія Лари = hunger + (3-8), thirst + (3-8) в STAT_UPDATE.

# === ☀️ ЧАС ДОБИ ===
- 4 фази: morning, day, evening, night. Кожні 3-4 дії = зміна фази (порядок: morning→day→evening→night→morning + dayNumber+1).
- Ранок: пробудження, NPC активніші. День: нормальна активність. Вечір: ритуали, фестивалі, флірт. Ніч: небезпечно, нічні істоти, сонні NPC.
- При зміні фази — опиши зміну атмосфери (світло, звуки, температура).
- В STAT_UPDATE: "timeOfDay":"evening" + "dayNumber":2 (якщо новий день).

# === 😊 НАСТРІЙ ЛАРИ ===
- Настрій змінюється від подій. Можливі значення: happy, neutral, sad, scared, aroused, angry, exhausted.
- Настрій впливає на реакції NPC і доступні опції. happy = +1 до Харизми кидків. scared = -2 до Волі кидків. angry = +1 до Сили.
- В STAT_UPDATE: "mood":"scared"

# === 🏠 РЕПУТАЦІЯ ПЛЕМЕН ===
- Кожне плем'я має репутацію (-100 до +100). Статуси: hostile (ворожий), unfriendly, neutral, friendly, ally (союзник).
- Допомога племені +5-20, секс з членом племені +5-10, крадіжка -15, напад на члена -30.
- Висока репутація (з +30): доступ до закритих зон, торгівля, квести. Низька (нижче -30): агресія, заборона входу.
- Племена: Кай-Тору, Кентаври, Мінотаври, Свинолюди, Гієноїди.
- Тег: [TRIBE_UPDATE]{"tribe":"Кай-Тору","change":10}[/TRIBE_UPDATE]

# === 🔨 КРАФТИНГ ===
${formatRecipesForPrompt()}

# === 🎲 ВИПАДКОВІ ПОДІЇ ===
- При кожній зміні локації кидай d20:
  1-4: Небезпечна зустріч (хижак, патруль, пастка)
  5-8: Знахідка (ресурси, їжа, вода)
  9-12: Зустріч з NPC (нейтральна)
  13-16: Нічого (спокійна подорож)
  17-19: Корисна подія (рідкісний предмет, секретна стежка)
  20: Рідкісна подія (артефакт, магічна істота)
- Повідомляй кидок: "🎲 Подорож (d20): 7 — знахідка!"

# === ⚔️ БОЙОВА СИСТЕМА ===
- Ініціатива: d20 + Спритність (d20 + стат противника, хто більше — б'є першим)
- Атака: d20 + Сила (або Спритність для метальної зброї)
- Ухилення: d20 + Спритність (поріг: атака противника)
- Блок: d20 + Сила (need >= атака противника -3)
- Зброя дає бонус: палиця +1, спис +2, меч +3, лук +2 (дальній бій)
- Після бою зброя може зламатися (кидок 1-3 на d20)

# === 🛒 ТОРГІВЛЯ ===
- Торгівля доступна з NPC при Bond ≥ 3.
- Валюта: перлини або обмін предметами. Кай-Тору також приймають "секс-послуги" як оплату.
- При торгівлі: INV_UPDATE remove (оплата) + INV_UPDATE add (куплений товар).
- d20 + Харизма для знижки. Репутація племені впливає на ціни.

# === 🏆 ДОСЯГНЕННЯ ===
- При важливих подіях додавай досягнення:
  [ACHIEVEMENT]{"name":"Перша кров","description":"Лара вбила першого ворога","icon":"⚔️"}[/ACHIEVEMENT]
- Приклади досягнень: "Перший поцілунок", "Вбивця хижака", "Друг племені", "Bond 10", "Майстер крафту", "Перший оргазм", "Пережила ніч", "Видослідник", "Торговець".

# === 📢 КРИТИЧНІ ПРАВИЛА ОНОВЛЕНЬ (ОБОВ'ЯЗКОВО!) ===

## ПРАВИЛО 1: ТЕКСТОВІ СПОВІЩЕННЯ ГРАВЦЮ
Після будь-якої зміни стану ти МУСИШ написати в тексті відповіді блок сповіщення:

> 📦 **Додано до інвентаря:** Гостра палиця (x2)
> ⚔️ **Видалено з інвентаря:** Стара мотузка
> 📊 **Зміна статів:** Бажання +20 (тепер 45/100), Впевненість +5
> 🤝 **Відносини:** Зв'язок з Тане покращено (Bond 3→4)
> 📜 **Новий квест:** Знайти джерело води
> ✅ **Квест виконано:** Знайти їжу
> 🌹 **Навичка:** Ніжний дотик +15 XP

ЦЕ НЕ ЗАМІСТЬ тегів, а ДОДАТКОВО. Гравець бачить лише текст, не бачить теги.

## ПРАВИЛО 2: ТЕГИ ОНОВЛЕНЬ (ТЕХНІЧНИЙ ФОРМАТ)
Після тексту відповіді, ЗАВЖДИ додавай JSON-теги для КОЖНОЇ зміни:

### Характеристики:
[STAT_UPDATE]{"desire":45,"confidence":55,"location":"Джунглі","hunger":35,"thirst":40,"mood":"happy","timeOfDay":"evening"}[/STAT_UPDATE]

### Стосунки:
[REL_UPDATE]{"name":"Тане","bond":4,"tribe":"Кай-Тору","met":true,"notes":"Фліртує","personality":"сором'язливий, лагідний, допитливий, духовний","archetype":"воїн","attitude":"curious"}[/REL_UPDATE]

### Інвентар:
[INV_UPDATE]{"action":"add","name":"Гостра палиця","description":"Довга загострена гілка","quantity":2,"category":"зброя"}[/INV_UPDATE]
[INV_UPDATE]{"action":"remove","name":"Стара мотузка","quantity":1}[/INV_UPDATE]

Категорії: зброя, їжа, ресурс, одяг, артефакт, інструмент, misc

### Квести:
[QUEST_UPDATE]{"action":"add","title":"Знайти джерело води","description":"Дослідити острів","givenBy":"Лара"}[/QUEST_UPDATE]
[QUEST_UPDATE]{"action":"complete","title":"Знайти їжу"}[/QUEST_UPDATE]

### Канонічні факти світу (довгострокова пам'ять — ОБОВ'ЯЗКОВО для важливих подій):
[FACT_ADD]{"key":"met_tane","category":"npc","content":"Лара зустріла Тане з племені Кай-Тору"}[/FACT_ADD]
[FACT_ADD]{"key":"found_temple","category":"plot","content":"Лара знайшла вхід до храму"}[/FACT_ADD]
[FACT_REMOVE]{"key":"temporary_curse"}[/FACT_REMOVE]
Категорії: plot, npc, item, secret, ending, world
Ключі латиницею snake_case. НЕ супереч існуючим фактам.

### Щоденник:
[DIARY_UPDATE]{"title":"Перша ніч","content":"Я опинилась на невідомому острові..."}[/DIARY_UPDATE]

### Навички (тільки після секс-сцен або пов'язаних дій):
[SKILL_UPDATE]{"name":"Ніжний дотик","xp":15}[/SKILL_UPDATE]

### Репутація племен:
[TRIBE_UPDATE]{"tribe":"Кай-Тору","change":10}[/TRIBE_UPDATE]

### Досягнення:
[ACHIEVEMENT]{"name":"Перший поцілунок","description":"Лара вперше поцілувала когось на острові","icon":"💋"}[/ACHIEVEMENT]

### Хвороби:
[DISEASE_ADD]{"name":"Тропічна лихоманка","description":"Висока температура від укусу комахи","source":"укус комахи","severity":"moderate","effects":"Сила -2, Витривалість -2","duration":8,"curedBy":"Відвар з кори залізного дерева"}[/DISEASE_ADD]
[DISEASE_REMOVE]{"name":"Харчове отруєння"}[/DISEASE_REMOVE]

### Варіанти дій (ОБОВ'ЯЗКОВО в кінці кожної відповіді!):
[CHOICES]{"options":["🛡️ Атакувати","🏃 Тікати","💋 Звабити","🔍 Дослідити"]}[/CHOICES]

### Кидок кубика (при перевірках):
[DICE_ROLL]{"skill":"Сила","dc":14,"roll":17,"bonus":6,"total":23,"result":"success","description":"Лара виривається"}[/DICE_ROLL]

### Секс-сцена (інтерактивні теги):
[SEX_SCENE_START]{"type":"voluntary","atmosphere":"romantic","partner":"Тане","phase":"foreplay","context_bonuses":[{"source":"🌙 Ніч","value":"+10%"},{"source":"💧 Водоспад","value":"+15%"}]}[/SEX_SCENE_START]
[PENIS_STATS]{"name":"Тане","race":"Кай-Тору","type":"Людський","length_cm":16,"girth_cm":4.2,"shape":"Прямий","head":"Середня, рожева","foreskin":true,"veins":"Помірно","balls":"Середні","cum_ml":8,"cum_desc":"Густа, біла","stamina_rounds":5,"refractory_min":15,"special":null,"risk_for_lara":"Низький"}[/PENIS_STATS]
[PHASE]{"phase":"main","label":"Основна дія"}[/PHASE]
[PLEASURE]{"lara":65,"partner":40,"partner_name":"Тане"}[/PLEASURE]
[STAMINA]{"value":70,"tempo":"medium"}[/STAMINA]
[COMBO]{"count":3,"label":"🔥 Комбо x3!"}[/COMBO]
[DOMINATION]{"value":30}[/DOMINATION]
[REACTION]{"text":"Тане стогне...","emotion":"🥵"}[/REACTION]
[EROGENOUS]{"zone":"Шия","race":"Кай-Тору","bonus":15}[/EROGENOUS]
[SCENE_MOOD]{"mood":"passionate","label":"🔥 Пристрасть","intensity":75}[/SCENE_MOOD]
[LARA_DIALOGUE]{"options":[{"text":"Тобі подобається?","effect":"+5 задов.","mood":"tender"},{"text":"На коліна.","effect":"+20 дом.","mood":"dominant"}]}[/LARA_DIALOGUE]
[MULTI_ORGASM]{"chain":2,"multiplier":2.0,"stamina_cost":30,"can_continue":true}[/MULTI_ORGASM]
[SEX_CHOICES]{"options":[{"text":"👑 Зверху","bonus":"+контроль","risk":false},{"text":"⚠️ Укусити","bonus":"x2 задов.","risk":true}]}[/SEX_CHOICES]
[SEX_SCENE_END]{"orgasm_type":"Звичайний","partner":"Тане","amulet_gain":10,"skill_name":"Ніжний дотик","skill_xp":20,"pregnancy_risk":15,"new_fetish":null,"marks":null,"combo_max":3,"lara_orgasm":true,"partner_orgasm":true,"orgasm_chain":2,"final_mood":"passionate"}[/SEX_SCENE_END]

## ПРАВИЛО 3: КОЛИ ДОДАВАТИ ОНОВЛЕННЯ
- Лара знайшла/підібрала предмет → INV_UPDATE add + текстове сповіщення
- Лара з'їла їжу → INV_UPDATE remove + STAT_UPDATE (hunger зменшується)
- Лара випила воду → INV_UPDATE remove + STAT_UPDATE (thirst зменшується)
- Лара використала предмет → INV_UPDATE remove + відповідний ефект
- Лара зустріла нового NPC → REL_UPDATE met:true + personality + archetype + attitude + текстове сповіщення
- Стосунки змінились (допомога, флірт, секс) → REL_UPDATE bond± + attitude
- Лара захворіла → DISEASE_ADD + опис симптомів в тексті
- Лара одужала → DISEASE_REMOVE + опис одужання
- Зміна локації → STAT_UPDATE location + 🎲 Випадкова подія (d20)
- Секс-сцена → STAT_UPDATE desire, shame, confidence, amuletEnergy + SKILL_UPDATE + REL_UPDATE bond
- Допомога/шкода племені → TRIBE_UPDATE з відповідним change
- Важлива подія → DIARY_UPDATE + можливо ACHIEVEMENT
- Нове завдання → QUEST_UPDATE add
- Завдання виконано → QUEST_UPDATE complete
- Значуще досягнення → ACHIEVEMENT
- Зміна настрою від подій → STAT_UPDATE mood
- НЕ додавай теги якщо НІЧОГО не змінилось

## ПРАВИЛО 4: ОБОВ'ЯЗКОВІ ЗМІНИ ПРИ КОЖНІЙ ДІЇ
КОЖНА дія Лари повинна мати наслідки. Якщо Лара:
- Досліджує → знаходить предмети (INV), зустрічає NPC (REL), відкриває локацію (STAT), hunger+5, thirst+5
- Бореться → використовує/ламає зброю (INV), отримує здобич (INV), змінюється bond (REL), hunger+8, thirst+8
- Фліртує/сексується → desire±, shame±, confidence±, bond±, skill XP, amuletEnergy+, hunger+3, thirst+5
- Їсть/п'є → hunger/thirst знижується, предмет витрачається (INV remove)
- Майструє → ресурси витрачаються (INV remove), новий предмет (INV add), hunger+3
- Подорож → hunger+5, thirst+5, можлива зміна timeOfDay

⚠️ КРИТИЧНО ВАЖЛИВО (STAT_UPDATE):
- hunger та thirst ЗАВЖДИ зростають при КОЖНІЙ дії! ЗАВЖДИ додавай їх до STAT_UPDATE!
- desire ЗАВЖДИ змінюється при флірті, дотиках, романтичних/еротичних сценах. ЗАВЖДИ додавай!
- Якщо є зміна mood/timeOfDay — ЗАВЖДИ додавай до STAT_UPDATE!

⚠️ КРИТИЧНО ВАЖЛИВО (REL_UPDATE):
- Якщо Лара ГОВОРИТЬ з NPC, ВЗАЄМОДІЄ, БАЧИТЬ когось — ЗАВЖДИ додавай REL_UPDATE з met:true!
- Кожна розмова з NPC = REL_UPDATE bond±, attitude, personality, archetype, notes!
- Навіть якщо bond не змінюється — додавай REL_UPDATE щоб NPC був у вкладці Персонажі!

# === 📋 ПРИКЛАДИ ПРАВИЛЬНИХ ВІДПОВІДЕЙ ===

## Приклад 1 (Дослідження):
---
Лара обережно прокладає шлях крізь густий підлісок. Гілки чіпляються за залишки її одягу, мокре листя ковзає під босими ногами. Раптом — прогалина. Невеликий водоспад стікає по моховитих каменях у кришталево чисту купіль.

Біля води лежить обламаний спис — мабуть, хтось загубив. Дерево ще міцне, вістря з обсидіану гостре.

🎲 **Спритність (d20 + 8):** Кидок 14 + 8 = 22. Успіх! Лара спритно перестрибує через слизькі камені.

> 📦 **Додано до інвентаря:** Обсидіановий спис
> 📊 **Зміна статів:** Локація → Водоспад у джунглях

[STAT_UPDATE]{"location":"Водоспад у джунглях"}[/STAT_UPDATE]
[INV_UPDATE]{"action":"add","name":"Обсидіановий спис","description":"Спис з обсидіановим вістрям","quantity":1,"category":"зброя"}[/INV_UPDATE]
---

## Приклад 2 (Зустріч NPC):
---
З-за дерев виходить молодий чоловік з засмаглою шкірою, вкритою ритуальними татуюваннями. Його очі розширюються від здивування при вигляді Лари.

— Тамуа! — вигукує він, вказуючи на амулет. — Ти... з-за моря?

Це Тане, молодий воїн племені Кай-Тору. Його погляд зацікавлено ковзає по тілу Лари.

> 🤝 **Нова знайомість:** Тане (Кай-Тору), Bond 1
> 📜 **Новий квест:** Піти з Тане до селища

[REL_UPDATE]{"name":"Тане","bond":1,"tribe":"Кай-Тору","met":true,"notes":"Дочка вождя, зацікавлена","personality":"сором'язливий, лагідний, допитливий, традиційний","archetype":"воїн","attitude":"curious"}[/REL_UPDATE]
[QUEST_UPDATE]{"action":"add","title":"Піти з Тане до селища","description":"Тане запрошує Лару до племені Кай-Тору","givenBy":"Тане"}[/QUEST_UPDATE]
---

Відповідай ТІЛЬКИ українською.`
}

// === СТИСНЕННЯ ПАМ'ЯТІ ===
async function compressOldMessages(): Promise<void> {
  const totalMessages = await prisma.message.count()
  if (totalMessages < COMPRESS_THRESHOLD) return

  // Keep last MAX_CONTEXT_MESSAGES, compress the rest
  const keepMessages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: MAX_CONTEXT_MESSAGES,
  })
  const keepIds = new Set(keepMessages.map(m => m.id))

  const oldMessages = await prisma.message.findMany({
    orderBy: { createdAt: 'asc' },
    where: { id: { notIn: Array.from(keepIds) } },
  })

  if (oldMessages.length < 10) return // Not enough to compress

  // Get current game state for context
  const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })

  const dialogText = oldMessages.map(m => {
    const role = m.role === 'user' ? 'ГРАВЕЦЬ' : 'МАЙСТЕР ГРИ'
    return `${role}: ${m.content.substring(0, 500)}`
  }).join('\n\n')

  const compressPrompt = `Стисни наступну історію гри у 300-500 слів. Зберігай ключові події, зустрічі з NPC, зміни стосунків, важливі рішення, сексуальні сцени та їх наслідки, здобуті та втрачені предмети. НЕ додавай свої коментарі — лише факти.

Поточний день гри: ${gameState?.dayNumber ?? 1}
Поточна локація: ${gameState?.location ?? 'невідомо'}

Діалог для стиснення (${oldMessages.length} повідомлень):

${dialogText.substring(0, 12000)}

Напиши стислий переказ українською:`

  try {
    const res = await callAnalyzerLLM(compressPrompt, { maxTokens: 1500, temperature: 0.3 })
    const summary = res.text
    if (!summary || summary.length < 50) {
      console.warn('Compression returned too short summary')
      return
    }

    // Save summary and delete old messages
    const firstDay = gameState?.dayNumber ?? 1
    await prisma.storySummary.create({
      data: {
        content: summary,
        dayRange: `День 1-${firstDay}`,
      },
    })

    // Delete compressed messages
    await prisma.message.deleteMany({
      where: { id: { in: oldMessages.map(m => m.id) } },
    })

    console.log(`Compressed ${oldMessages.length} messages into summary`)
  } catch (e: any) {
    console.error('Compression error:', e?.message)
  }
}

// === АНАЛІЗАТОР ВІДПОВІДЕЙ: Gemini → DeepSeek fallback ===
async function analyzeResponseForMissedUpdates(
  aiResponse: string,
  playerMessage: string,
  currentInventory: any[],
  currentRelationships: any[],
  gameState: any
): Promise<{
  statUpdates: any
  invUpdates: any[]
  relUpdates: any[]
  questUpdates: any[]
  diaryUpdates: any[]
  skillUpdates: any[]
  tribeUpdates: any[]
  achievementUpdates: any[]
  usage: TokenUsage
  provider: string
}> {
  const emptyResult = {
    statUpdates: {},
    invUpdates: [],
    relUpdates: [],
    questUpdates: [],
    diaryUpdates: [],
    skillUpdates: [],
    tribeUpdates: [],
    achievementUpdates: [],
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    provider: 'none',
  }

  const currentInvStr = currentInventory.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'порожній'
  const currentRelStr = currentRelationships.map(r => `${r.name}: bond ${r.bond}`).join(', ') || 'немає'

  const prompt = `Ти — аналізатор тексту гри. Прочитай відповідь Game Master і визнач ВСІ зміни стану гри, які відбулися в тексті, але можливо не були оформлені тегами.

Поточний стан:
- Інвентар: ${currentInvStr}
- Стосунки: ${currentRelStr}
- Desire: ${gameState?.desire ?? 0}, Shame: ${gameState?.shame ?? 0}, Confidence: ${gameState?.confidence ?? 50}
- Локація: ${gameState?.location ?? 'невідомо'}
- AmuletEnergy: ${gameState?.amuletEnergy ?? 0}

Дія гравця: ${playerMessage}

Відповідь Game Master:
${aiResponse.substring(0, 6000)}

Проаналізуй текст і поверни JSON з усіма змінами, які ОПИСАНІ В ТЕКСТІ. Шукай:
1. Предмети, які Лара знайшла, підібрала, отримала, з'їла, використала, втратила
2. Нових NPC, яких зустріла, або зміни в стосунках
3. Зміни desire, shame, confidence, location, amuletEnergy, hunger, thirst, mood, timeOfDay
4. Сексуальні сцени → які навички задіяні
5. Нові квести або виконані
6. Значущі події для щоденника
7. Зміни репутації племен (Кай-Тору, Кентаври, Мінотаври, Свинолюди, Гієноїди)
8. Досягнення (значущі події вперше)

Відповідь JSON:
{
  "stat_updates": {"desire": 25, "location": "Джунглі", "hunger": 35, "mood": "happy"} або {} якщо немає змін,
  "inv_updates": [{"action":"add","name":"назва","description":"опис","quantity":1,"category":"категорія"}] або [],
  "rel_updates": [{"name":"Ім'я","bond":3,"tribe":"Плем'я","met":true}] або [],
  "quest_updates": [{"action":"add","title":"назва","description":"опис"}] або [],
  "diary_updates": [{"title":"назва","content":"текст"}] або [],
  "skill_updates": [{"name":"Ніжний дотик","xp":15}] або [],
  "tribe_updates": [{"tribe":"Кай-Тору","change":10}] або [],
  "achievement_updates": [{"name":"Назва","description":"опис","icon":"🏆"}] або []
}

Доступні навички: ${SKILL_NAMES.join(', ')}
Категорії інвентаря: зброя, їжа, ресурс, одяг, артефакт, інструмент, misc

Відповідай ТІЛЬКИ чистим JSON, без пояснень.`

  try {
    const res = await callAnalyzerLLM(prompt, { maxTokens: 2000, temperature: 0.1, jsonMode: true })
    if (!res.text) return { ...emptyResult, usage: res.usage, provider: res.provider }

    const parsed = safeParseJSON(res.text, 'analyzer-llm')
    if (!parsed) return { ...emptyResult, usage: res.usage, provider: res.provider }
    return {
      statUpdates: parsed?.stat_updates ?? {},
      invUpdates: parsed?.inv_updates ?? [],
      relUpdates: parsed?.rel_updates ?? [],
      questUpdates: parsed?.quest_updates ?? [],
      diaryUpdates: parsed?.diary_updates ?? [],
      skillUpdates: parsed?.skill_updates ?? [],
      tribeUpdates: parsed?.tribe_updates ?? [],
      achievementUpdates: parsed?.achievement_updates ?? [],
      usage: res.usage,
      provider: res.provider,
    }
  } catch (e: any) {
    console.error('Analyzer error:', e?.message)
    return emptyResult
  }
}

function needsDeepAnalysis(fullContent: string, deepseekParsed: any): boolean {
  const hasChoices = deepseekParsed.choices && deepseekParsed.choices.length > 0
  const hasStat = deepseekParsed.stat && Object.keys(deepseekParsed.stat).length > 0
  const hasInv = deepseekParsed.inv && deepseekParsed.inv.length > 0
  const hasRel = deepseekParsed.rel && deepseekParsed.rel.length > 0

  const mentionsItem = /знайш|підібр|взял|отрим|з'їл|випи|втрати|одяг|знахідк/i.test(fullContent)
  const mentionsNpc = /зустріч|сказав|відповід|воїн|шаман|тане|лея|джек|вождь/i.test(fullContent)

  if (mentionsItem && !hasInv) return true
  if (mentionsNpc && !hasRel) return true
  if (!hasChoices || !hasStat) return true

  return false
}

// === МЕРЖ ОНОВЛЕНЬ: DeepSeek теги + Gemini аналіз ===
function mergeUpdates(
  deepseekUpdates: { stat: any, inv: any[], rel: any[], quest: any[], diary: any[], skill: any[], tribe: any[], achievement: any[], disease: any[], facts: any[], choices: string[], diceRolls: any[], sexScene: any, phase: any, pleasure: any, stamina: any, combo: any, domination: number | null, reactions: any[], erogenousZones: any[], sexChoices: any[], sceneSummary: any, sceneMood: any, laraDialogue: any[], multiOrgasm: any, penisStats: any },
  geminiUpdates: { statUpdates: any, invUpdates: any[], relUpdates: any[], questUpdates: any[], diaryUpdates: any[], skillUpdates: any[], tribeUpdates: any[], achievementUpdates: any[] }
) {
  const mergedStat = { ...geminiUpdates.statUpdates, ...deepseekUpdates.stat }

  const deepseekInvNames = new Set(deepseekUpdates.inv.map((i: any) => i.name?.toLowerCase()))
  const mergedInv = [
    ...deepseekUpdates.inv,
    ...geminiUpdates.invUpdates.filter((i: any) => !deepseekInvNames.has(i.name?.toLowerCase())),
  ]

  const deepseekRelNames = new Set(deepseekUpdates.rel.map((r: any) => r.name?.toLowerCase()))
  const mergedRel = [
    ...deepseekUpdates.rel,
    ...geminiUpdates.relUpdates.filter((r: any) => !deepseekRelNames.has(r.name?.toLowerCase())),
  ]

  const deepseekQuestTitles = new Set(deepseekUpdates.quest.map((q: any) => q.title?.toLowerCase()))
  const mergedQuest = [
    ...deepseekUpdates.quest,
    ...geminiUpdates.questUpdates.filter((q: any) => !deepseekQuestTitles.has(q.title?.toLowerCase())),
  ]

  const mergedDiary = [...deepseekUpdates.diary, ...geminiUpdates.diaryUpdates]

  const deepseekSkillNames = new Set(deepseekUpdates.skill.map((s: any) => s.name?.toLowerCase()))
  const mergedSkill = [
    ...deepseekUpdates.skill,
    ...geminiUpdates.skillUpdates.filter((s: any) => !deepseekSkillNames.has(s.name?.toLowerCase())),
  ]

  // Tribe: merge by tribe name
  const deepseekTribeNames = new Set(deepseekUpdates.tribe.map((t: any) => t.tribe?.toLowerCase()))
  const mergedTribe = [
    ...deepseekUpdates.tribe,
    ...(geminiUpdates.tribeUpdates || []).filter((t: any) => !deepseekTribeNames.has(t.tribe?.toLowerCase())),
  ]

  // Achievements: merge by name
  const deepseekAchNames = new Set(deepseekUpdates.achievement.map((a: any) => a.name?.toLowerCase()))
  const mergedAchievement = [
    ...deepseekUpdates.achievement,
    ...(geminiUpdates.achievementUpdates || []).filter((a: any) => !deepseekAchNames.has(a.name?.toLowerCase())),
  ]

  return {
    stat: mergedStat,
    inv: mergedInv,
    rel: mergedRel,
    quest: mergedQuest,
    diary: mergedDiary,
    skill: mergedSkill,
    tribe: mergedTribe,
    achievement: mergedAchievement,
    disease: deepseekUpdates.disease || [],
    facts: deepseekUpdates.facts || [],
    choices: deepseekUpdates.choices || [],
    diceRolls: deepseekUpdates.diceRolls || [],
    sexScene: deepseekUpdates.sexScene,
    phase: deepseekUpdates.phase,
    pleasure: deepseekUpdates.pleasure,
    stamina: deepseekUpdates.stamina,
    combo: deepseekUpdates.combo,
    domination: deepseekUpdates.domination,
    reactions: deepseekUpdates.reactions || [],
    erogenousZones: deepseekUpdates.erogenousZones || [],
    sexChoices: deepseekUpdates.sexChoices || [],
    sceneSummary: deepseekUpdates.sceneSummary,
    sceneMood: deepseekUpdates.sceneMood,
    laraDialogue: deepseekUpdates.laraDialogue || [],
    multiOrgasm: deepseekUpdates.multiOrgasm,
    penisStats: deepseekUpdates.penisStats,
  }
}

// === ПАРСИНГ ТЕГІВ З ВІДПОВІДІ DEEPSEEK (з валідацією) ===
function parseDeepSeekTags(content: string) {
  let statUpdate: any = {}
  const relUpdates: any[] = []
  const invUpdates: any[] = []
  const questUpdates: any[] = []
  const diaryUpdates: any[] = []
  const skillUpdates: any[] = []
  const tribeUpdates: any[] = []
  const achievements: any[] = []

  // STAT_UPDATE — Zod soft-sanitize
  const statMatch = content.match(/\[STAT_UPDATE\](.*?)\[\/STAT_UPDATE\]/s)
  if (statMatch?.[1]) {
    const parsed = safeParseJSON(statMatch[1].trim(), 'STAT_UPDATE')
    if (parsed) statUpdate = sanitizeStatUpdate(parsed)
  }

  // Усі множинні теги (Zod)
  for (const m of content.matchAll(/\[REL_UPDATE\](.*?)\[\/REL_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'REL_UPDATE')
    const p = parseWithSchema(RelUpdateSchema, raw, 'REL_UPDATE')
    if (p?.name) relUpdates.push(p)
  }
  for (const m of content.matchAll(/\[INV_UPDATE\](.*?)\[\/INV_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'INV_UPDATE')
    const p = parseWithSchema(InvUpdateSchema, raw, 'INV_UPDATE')
    if (p?.name) invUpdates.push(p)
  }
  for (const m of content.matchAll(/\[QUEST_UPDATE\](.*?)\[\/QUEST_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'QUEST_UPDATE')
    const p = parseWithSchema(QuestUpdateSchema, raw, 'QUEST_UPDATE')
    if (p?.title) questUpdates.push(p)
  }
  for (const m of content.matchAll(/\[DIARY_UPDATE\](.*?)\[\/DIARY_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DIARY_UPDATE')
    const p = parseWithSchema(DiaryUpdateSchema, raw, 'DIARY_UPDATE')
    if (p?.content) diaryUpdates.push(p)
  }
  for (const m of content.matchAll(/\[SKILL_UPDATE\](.*?)\[\/SKILL_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'SKILL_UPDATE')
    const p = parseWithSchema(SkillUpdateSchema, raw, 'SKILL_UPDATE')
    if (p?.name && p?.xp) skillUpdates.push(p)
  }
  for (const m of content.matchAll(/\[TRIBE_UPDATE\](.*?)\[\/TRIBE_UPDATE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'TRIBE_UPDATE')
    const p = parseWithSchema(TribeUpdateSchema, raw, 'TRIBE_UPDATE')
    if (p?.tribe && p?.change !== undefined) tribeUpdates.push(p)
  }
  for (const m of content.matchAll(/\[ACHIEVEMENT\](.*?)\[\/ACHIEVEMENT\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'ACHIEVEMENT')
    const p = parseWithSchema(AchievementSchema, raw, 'ACHIEVEMENT')
    if (p?.name) achievements.push(p)
  }

  // DISEASE tags
  const diseaseUpdates: any[] = []
  for (const m of content.matchAll(/\[DISEASE_ADD\](.*?)\[\/DISEASE_ADD\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DISEASE_ADD')
    const p = parseWithSchema(DiseaseSchema, { ...(raw || {}), _action: 'add' }, 'DISEASE_ADD')
    if (p?.name) diseaseUpdates.push(p)
  }
  for (const m of content.matchAll(/\[DISEASE_REMOVE\](.*?)\[\/DISEASE_REMOVE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DISEASE_REMOVE')
    const p = parseWithSchema(DiseaseSchema, { ...(raw || {}), _action: 'remove' }, 'DISEASE_REMOVE')
    if (p?.name) diseaseUpdates.push(p)
  }

  // WORLD FACT tags
  const facts: any[] = []
  for (const m of content.matchAll(/\[FACT_ADD\](.*?)\[\/FACT_ADD\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'FACT_ADD')
    const p = parseWithSchema(FactSchema, { ...(raw || {}), _action: 'add' }, 'FACT_ADD')
    if (p) facts.push(p)
  }
  for (const m of content.matchAll(/\[FACT_REMOVE\](.*?)\[\/FACT_REMOVE\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'FACT_REMOVE')
    const p = parseWithSchema(FactSchema, { ...(raw || {}), _action: 'remove' }, 'FACT_REMOVE')
    if (p) facts.push(p)
  }

  // CHOICES
  const choices: string[] = []
  const choicesMatch = content.match(/\[CHOICES\](.*?)\[\/CHOICES\]/s)
  if (choicesMatch?.[1]) {
    const parsed = safeParseJSON(choicesMatch[1].trim(), 'CHOICES')
    if (parsed?.options && Array.isArray(parsed.options)) choices.push(...parsed.options)
  }

  // DICE_ROLL
  const diceRolls: any[] = []
  for (const m of content.matchAll(/\[DICE_ROLL\](.*?)\[\/DICE_ROLL\]/gs)) {
    const raw = safeParseJSON(m[1].trim(), 'DICE_ROLL')
    const p = parseWithSchema(DiceSchema, raw, 'DICE_ROLL')
    if (p && (p.skill || p.stat)) diceRolls.push(p)
  }

  // SEX_SCENE_START
  let sexScene: any = null
  const sexStartMatch = content.match(/\[SEX_SCENE_START\](.*?)\[\/SEX_SCENE_START\]/s)
  if (sexStartMatch?.[1]) {
    sexScene = safeParseJSON(sexStartMatch[1].trim(), 'SEX_SCENE_START')
  }

  // PHASE
  let phase: any = null
  const phaseMatch = content.match(/\[PHASE\](.*?)\[\/PHASE\]/s)
  if (phaseMatch?.[1]) {
    phase = safeParseJSON(phaseMatch[1].trim(), 'PHASE')
  }

  // PLEASURE (dual: lara + partner)
  let pleasure: any = null
  const pleasureMatches = [...content.matchAll(/\[PLEASURE\](.*?)\[\/PLEASURE\]/gs)]
  if (pleasureMatches.length > 0) {
    const lastP = safeParseJSON(pleasureMatches[pleasureMatches.length - 1][1].trim(), 'PLEASURE')
    if (lastP) {
      pleasure = { lara: Number(lastP.lara ?? lastP.value ?? 0), partner: Number(lastP.partner ?? 0), partner_name: lastP.partner_name ?? lastP.partner ?? '' }
    }
  }

  // STAMINA
  let stamina: any = null
  const staminaMatches = [...content.matchAll(/\[STAMINA\](.*?)\[\/STAMINA\]/gs)]
  if (staminaMatches.length > 0) {
    stamina = safeParseJSON(staminaMatches[staminaMatches.length - 1][1].trim(), 'STAMINA')
  }

  // COMBO
  let combo: any = null
  const comboMatch = content.match(/\[COMBO\](.*?)\[\/COMBO\]/s)
  if (comboMatch?.[1]) {
    combo = safeParseJSON(comboMatch[1].trim(), 'COMBO')
  }

  // DOMINATION
  let domination: number | null = null
  const domMatches = [...content.matchAll(/\[DOMINATION\](.*?)\[\/DOMINATION\]/gs)]
  if (domMatches.length > 0) {
    const lastD = safeParseJSON(domMatches[domMatches.length - 1][1].trim(), 'DOMINATION')
    if (lastD?.value !== undefined) domination = Number(lastD.value)
  }

  // REACTION
  const reactions: any[] = []
  for (const m of content.matchAll(/\[REACTION\](.*?)\[\/REACTION\]/gs)) {
    const p = safeParseJSON(m[1].trim(), 'REACTION')
    if (p?.text) reactions.push(p)
  }

  // EROGENOUS
  const erogenousZones: any[] = []
  for (const m of content.matchAll(/\[EROGENOUS\](.*?)\[\/EROGENOUS\]/gs)) {
    const p = safeParseJSON(m[1].trim(), 'EROGENOUS')
    if (p?.zone) erogenousZones.push(p)
  }

  // SEX_CHOICES
  const sexChoices: any[] = []
  const sexChoicesMatch = content.match(/\[SEX_CHOICES\](.*?)\[\/SEX_CHOICES\]/s)
  if (sexChoicesMatch?.[1]) {
    const parsed = safeParseJSON(sexChoicesMatch[1].trim(), 'SEX_CHOICES')
    if (parsed?.options && Array.isArray(parsed.options)) sexChoices.push(...parsed.options)
  }

  // SEX_SCENE_END
  let sceneSummary: any = null
  const sexEndMatch = content.match(/\[SEX_SCENE_END\](.*?)\[\/SEX_SCENE_END\]/s)
  if (sexEndMatch?.[1]) {
    sceneSummary = safeParseJSON(sexEndMatch[1].trim(), 'SEX_SCENE_END')
  }

  // PENIS_STATS
  let penisStats: any = null
  const penisMatch = content.match(/\[PENIS_STATS\](.*?)\[\/PENIS_STATS\]/s)
  if (penisMatch?.[1]) {
    penisStats = safeParseJSON(penisMatch[1].trim(), 'PENIS_STATS')
  }

  // SCENE_MOOD
  let sceneMood: any = null
  const moodMatches = [...content.matchAll(/\[SCENE_MOOD\](.*?)\[\/SCENE_MOOD\]/gs)]
  if (moodMatches.length > 0) {
    sceneMood = safeParseJSON(moodMatches[moodMatches.length - 1][1].trim(), 'SCENE_MOOD')
  }

  // LARA_DIALOGUE
  const laraDialogue: any[] = []
  const laraDialogueMatch = content.match(/\[LARA_DIALOGUE\](.*?)\[\/LARA_DIALOGUE\]/s)
  if (laraDialogueMatch?.[1]) {
    const parsed = safeParseJSON(laraDialogueMatch[1].trim(), 'LARA_DIALOGUE')
    if (parsed?.options && Array.isArray(parsed.options)) laraDialogue.push(...parsed.options)
  }

  // MULTI_ORGASM
  let multiOrgasm: any = null
  const multiOrgasmMatch = content.match(/\[MULTI_ORGASM\](.*?)\[\/MULTI_ORGASM\]/s)
  if (multiOrgasmMatch?.[1]) {
    multiOrgasm = safeParseJSON(multiOrgasmMatch[1].trim(), 'MULTI_ORGASM')
  }

  return { stat: statUpdate, inv: invUpdates, rel: relUpdates, quest: questUpdates, diary: diaryUpdates, skill: skillUpdates, tribe: tribeUpdates, achievement: achievements, disease: diseaseUpdates, facts, choices, diceRolls, sexScene, phase, pleasure, stamina, combo, domination, reactions, erogenousZones, sexChoices, sceneSummary, sceneMood, laraDialogue, multiOrgasm, penisStats }
}

function cleanDisplayContent(content: string): string {
  return content
    .replace(/\[STAT_UPDATE\].*?\[\/STAT_UPDATE\]/gs, '')
    .replace(/\[REL_UPDATE\].*?\[\/REL_UPDATE\]/gs, '')
    .replace(/\[INV_UPDATE\].*?\[\/INV_UPDATE\]/gs, '')
    .replace(/\[QUEST_UPDATE\].*?\[\/QUEST_UPDATE\]/gs, '')
    .replace(/\[DIARY_UPDATE\].*?\[\/DIARY_UPDATE\]/gs, '')
    .replace(/\[SKILL_UPDATE\].*?\[\/SKILL_UPDATE\]/gs, '')
    .replace(/\[TRIBE_UPDATE\].*?\[\/TRIBE_UPDATE\]/gs, '')
    .replace(/\[ACHIEVEMENT\].*?\[\/ACHIEVEMENT\]/gs, '')
    .replace(/\[DISEASE_ADD\].*?\[\/DISEASE_ADD\]/gs, '')
    .replace(/\[DISEASE_REMOVE\].*?\[\/DISEASE_REMOVE\]/gs, '')
    .replace(/\[FACT_ADD\].*?\[\/FACT_ADD\]/gs, '')
    .replace(/\[FACT_REMOVE\].*?\[\/FACT_REMOVE\]/gs, '')
    .replace(/\[CHOICES\].*?\[\/CHOICES\]/gs, '')
    .replace(/\[DICE_ROLL\].*?\[\/DICE_ROLL\]/gs, '')
    .replace(/\[SEX_SCENE_START\].*?\[\/SEX_SCENE_START\]/gs, '')
    .replace(/\[PHASE\].*?\[\/PHASE\]/gs, '')
    .replace(/\[PLEASURE\].*?\[\/PLEASURE\]/gs, '')
    .replace(/\[STAMINA\].*?\[\/STAMINA\]/gs, '')
    .replace(/\[COMBO\].*?\[\/COMBO\]/gs, '')
    .replace(/\[DOMINATION\].*?\[\/DOMINATION\]/gs, '')
    .replace(/\[REACTION\].*?\[\/REACTION\]/gs, '')
    .replace(/\[EROGENOUS\].*?\[\/EROGENOUS\]/gs, '')
    .replace(/\[SEX_CHOICES\].*?\[\/SEX_CHOICES\]/gs, '')
    .replace(/\[SEX_SCENE_END\].*?\[\/SEX_SCENE_END\]/gs, '')
    .replace(/\[SCENE_MOOD\].*?\[\/SCENE_MOOD\]/gs, '')
    .replace(/\[LARA_DIALOGUE\].*?\[\/LARA_DIALOGUE\]/gs, '')
    .replace(/\[MULTI_ORGASM\].*?\[\/MULTI_ORGASM\]/gs, '')
    .replace(/\[PENIS_STATS\].*?\[\/PENIS_STATS\]/gs, '')
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    // Soft rate limit: 20 requests / minute per process (local single-player)
    const rl = rateLimit('chat:global', { limit: 20, windowMs: 60_000 })
    if (!rl.ok) {
      return new Response(
        JSON.stringify({
          error: `Забагато запитів. Зачекай ~${Math.ceil(rl.retryAfterMs / 1000)} с.`,
          code: 'RATE_LIMIT',
        }),
        { status: 429 }
      )
    }

    const { message, provider } = await request.json()
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Повідомлення обов\'язкове' }), { status: 400 })
    }
    if (message.length > MAX_PLAYER_MESSAGE_LENGTH) {
      return new Response(JSON.stringify({ error: `Повідомлення задовге (макс. ${MAX_PLAYER_MESSAGE_LENGTH} символів)` }), { status: 400 })
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim()
    const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim()
    const hasGemini = Boolean(geminiKey && !geminiKey.includes('встав') && geminiKey.length >= 8)
    const hasDeepSeek = Boolean(deepseekKey && !deepseekKey.includes('встав') && deepseekKey.length >= 8)

    if (!hasGemini && !hasDeepSeek) {
      return new Response(
        JSON.stringify({
          error: 'Не налаштовано ключі доступу. Встав DEEPSEEK_API_KEY або GEMINI_API_KEY у файл .env і перезапусти проєкт.',
          code: 'MISSING_API_KEY',
        }),
        { status: 503 }
      )
    }

    // Get game state
    let gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
    if (!gameState) {
      gameState = await prisma.gameState.create({ data: { id: 'singleton', gameStarted: true } })
    }

    const relationships = await prisma.relationship.findMany({ where: { met: true } })
    const inventory = await prisma.inventoryItem.findMany()
    const quests = await prisma.quest.findMany()
    const skills = await prisma.skill.findMany()
    const summaries = await prisma.storySummary.findMany({ orderBy: { createdAt: 'asc' } })
    const tribeReps = await prisma.tribeReputation.findMany()

    const recentMessages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: MAX_CONTEXT_MESSAGES,
    })
    recentMessages.reverse()

    // Snapshot BEFORE this turn mutates world (for redo)
    await saveTurnSnapshot(message)
    await prisma.message.create({ data: { role: 'user', content: message } })

    const diseases = await prisma.disease.findMany()
    const worldFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })
    const promptMode = detectPromptMode(message)
    const systemPrompt = buildSystemPrompt(
      gameState, relationships, inventory, quests, skills, summaries, tribeReps, diseases, worldFacts, promptMode
    )
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...(recentMessages?.map?.((m: any) => ({
        role: m?.role === 'user' ? 'user' : 'assistant',
        content: m?.content ?? '',
      })) ?? []),
      { role: 'user', content: message },
    ]

    const narratorLLM = await callNarratorLLMStream({
      messages: llmMessages,
      provider: provider || 'auto',
    })

    const stream = new ReadableStream({
      async start(controller) {
        const reader = narratorLLM.stream.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let fullContent = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunkText = decoder.decode(value, { stream: true })
            if (chunkText) {
              fullContent += chunkText
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunkText })}\n\n`))
            }
          }

          const turnStartTime = Date.now()
          const narratorUsage = narratorLLM.getUsage()

          // 1. Parse AI tags
          const deepseekParsed = parseDeepSeekTags(fullContent)

          // 2. Smart Analyzer Trigger (Runs only if explicit tags missing or in dual mode)
          const shouldRunAnalyzer = provider === 'dual' || (provider !== 'deepseek' && needsDeepAnalysis(fullContent, deepseekParsed))
          let geminiAnalysis: any = {
            statUpdates: {},
            invUpdates: [],
            relUpdates: [],
            questUpdates: [],
            diaryUpdates: [],
            skillUpdates: [],
            tribeUpdates: [],
            achievementUpdates: [],
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            provider: 'skipped',
          }

          if (shouldRunAnalyzer) {
            geminiAnalysis = await analyzeResponseForMissedUpdates(
              fullContent, message, inventory, relationships, gameState
            )
          }

          const analyzerUsage = geminiAnalysis.usage

          // 3. Merge updates
          const merged = mergeUpdates(deepseekParsed, geminiAnalysis)

          // 4. Clean content from tags
          const displayContent = cleanDisplayContent(fullContent)

          // 5. Save assistant message
          await prisma.message.create({ data: { role: 'assistant', content: displayContent } })

          // 5.5 Server-side survival + narrative fallbacks + time tick
          merged.stat = applySurvivalDefaults(merged.stat, gameState)
          merged.stat = parseNarrativeStats(fullContent, merged.stat)
          const timeTick = applyServerTimeTick(merged.stat, gameState)
          merged.stat = timeTick.stat
          if (timeTick.newDay) {
            merged.stat = applyNewDaySurvival(merged.stat)
          }

          // 5.6 Fair server-side dice re-roll
          const resolvedDice = resolveDiceRolls(merged.diceRolls || [], gameState)
          merged.diceRolls = resolvedDice

          // 6. Apply all updates
          await applyAllUpdates(merged, gameState?.dayNumber ?? 1)
          await tickDiseases()
          const completedQuests = await syncQuestLadder()

          // Default choices if AI forgot
          let finalChoices: string[] = merged.choices?.length ? [...merged.choices] : []
          if (finalChoices.length === 0 && !merged.sexChoices?.length) {
            finalChoices = [...DEFAULT_TURN_CHOICES]
          }

          // Token Usage Calculation
          const promptTokens = (narratorUsage.promptTokens || 0) + (analyzerUsage?.promptTokens || 0)
          const completionTokens = (narratorUsage.completionTokens || 0) + (analyzerUsage?.completionTokens || 0)
          const turnTotalTokens = promptTokens + completionTokens
          const durationMs = Date.now() - turnStartTime

          if (turnTotalTokens > 0) {
            await prisma.gameState.update({
              where: { id: 'singleton' },
              data: {
                totalTokensUsed: { increment: turnTotalTokens },
              },
            })
          }

          // 7. Fetch updated state and send to client
          const updatedState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
          const updatedRels = await prisma.relationship.findMany({
            where: { OR: [{ met: true }, { name: { in: ['Тане', 'Лея', 'Джек Вейн', 'Макаї', 'Найя'] } }] },
            orderBy: { name: 'asc' },
          })
          const updatedInv = await prisma.inventoryItem.findMany()
          const updatedQuests = await prisma.quest.findMany()
          const updatedDiary = await prisma.diaryEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
          const updatedSkills = await prisma.skill.findMany()
          const updatedTribes = await prisma.tribeReputation.findMany()
          const updatedLocations = await prisma.location.findMany()
          const updatedAchievements = await prisma.achievement.findMany({ orderBy: { unlockedAt: 'desc' } })
          const updatedDiseases = await prisma.disease.findMany()
          const updatedFacts = await prisma.worldFact.findMany({ orderBy: { createdAt: 'asc' } })

          const tagLog = buildTagLog({
            mode: promptMode,
            merged: { ...merged, choices: finalChoices, diceRolls: resolvedDice },
            completedQuests,
            timeTick: {
              phaseAdvanced: timeTick.phaseAdvanced,
              newDay: timeTick.newDay,
              turnCount: timeTick.turnCount,
            },
          })

          const analyzerLabel = geminiAnalysis.provider === 'gemini'
            ? 'Gemini 2.0 Flash'
            : (geminiAnalysis.provider === 'deepseek'
              ? 'DeepSeek Chat'
              : 'Смарт-пропуск (теги ідеальні)')

          const tokenUsagePayload = {
            provider: `${narratorLLM.providerLabel} + ${analyzerLabel}`,
            narratorProvider: narratorLLM.providerLabel,
            analyzerProvider: analyzerLabel,
            providerKey: narratorLLM.provider,
            model: narratorLLM.model,
            promptTokens,
            completionTokens,
            analyzerTokens: analyzerUsage?.totalTokens || 0,
            totalTokens: turnTotalTokens,
            cumulativeTotalTokens: updatedState?.totalTokensUsed ?? 0,
            durationMs,
            smartSkipped: geminiAnalysis.provider === 'skipped',
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            gameState: updatedState,
            relationships: updatedRels,
            inventory: updatedInv,
            quests: updatedQuests,
            diary: updatedDiary,
            skills: updatedSkills,
            tribeReputations: updatedTribes,
            locations: updatedLocations,
            achievements: updatedAchievements,
            diseases: updatedDiseases,
            worldFacts: updatedFacts,
            completedQuests,
            promptMode,
            tagLog,
            tokenUsage: tokenUsagePayload,
            timeTick: {
              phaseAdvanced: timeTick.phaseAdvanced,
              newDay: timeTick.newDay,
              turnCount: timeTick.turnCount,
              timeOfDay: merged.stat.timeOfDay,
              dayNumber: merged.stat.dayNumber,
            },
            choices: finalChoices,
            diceRolls: merged.diceRolls,
            sexScene: merged.sexScene,
            phase: merged.phase,
            pleasure: merged.pleasure,
            stamina: merged.stamina,
            combo: merged.combo,
            domination: merged.domination,
            reactions: merged.reactions,
            erogenousZones: merged.erogenousZones,
            sexChoices: merged.sexChoices,
            sceneSummary: merged.sceneSummary,
            sceneMood: merged.sceneMood,
            laraDialogue: merged.laraDialogue,
            multiOrgasm: merged.multiOrgasm,
            penisStats: merged.penisStats,
          })}\n\n`))

          // 8. Auto-compress history if needed
          compressOldMessages().catch(e => console.error('Background compress error:', e))

        } catch (error: any) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: error?.message ?? 'Помилка стріму' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Внутрішня помилка сервера' }), { status: 500 })
  }
}
