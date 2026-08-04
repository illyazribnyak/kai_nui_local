export type SidebarTab =
  | 'stats'
  | 'inventory'
  | 'quests'
  | 'diary'
  | 'skills'
  | 'map'
  | 'tribes'
  | 'achievements'
  | 'characters'
  | 'lore'

export const ATTITUDE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  hostile: { label: 'Ворожий', emoji: '😡', color: 'text-red-500' },
  wary: { label: 'Насторожений', emoji: '😒', color: 'text-orange-400' },
  neutral: { label: 'Нейтральний', emoji: '😐', color: 'text-gray-400' },
  curious: { label: 'Зацікавлений', emoji: '🤔', color: 'text-yellow-400' },
  friendly: { label: 'Дружній', emoji: '😊', color: 'text-green-400' },
  devoted: { label: 'Відданий', emoji: '😍', color: 'text-pink-400' },
}

export const SKILL_CATEGORY_NAMES: Record<string, string> = {
  seduction: '🌹 Зваблення',
  technique: '💋 Техніка',
  endurance: '🔥 Витривалість',
  domination: '⛓️ Домінування',
  submission: '🦋 Підкорення',
  body_magic: '✨ Магія тіла',
}

export const INTRO_MESSAGE = `🌊 **Шторм. Темрява. Сіль на губах.**

Останній удар хвилі перевертає човен, і Лара Крафт летить у крижану безодню Тихого океану. Вода б'є в обличчя, ламає дихання, тягне на дно. Рюкзак зі спорядженням — втрачено. Зброя — на дні. Залишився лише стародавній амулет на шиї, який пульсує дивним теплом навіть у крижаній воді.

Хвилі виносять її на берег. Пісок. Теплий, білий пісок. Лара кашляє, випльовуючи солону воду, і відкриває очі.

**Острів.**

Перед нею — стіна тропічних джунглів. Повітря важке, вологе, пахне квітами та чимось... стародавнім. Амулет на грудях теплішає, його символи ледь помітно мерехтять блакитним.

Лара здіймається на ноги. Одяг порваний — від шортів та майки залишились клапті. Тіло подряпане, але нічого не зламано. Босоніж. Без зброї. Без їжі. Без зв'язку із зовнішнім світом.

Тільки амулет. І джунглі попереду.

*Хвилі позаду розбиваються об рифи. Уламки човна розкидані вздовж берега. Десь далеко в джунглях чути барабани...*

**Що робить Лара?**`

export type LlmProviderChoice = 'auto' | 'dual' | 'gemini' | 'deepseek'
