export type PromptMode = 'adventure' | 'dialogue' | 'combat' | 'sex'

// Note: JS \b is ASCII-oriented — use plain substring match for Ukrainian.
const SEX_RE =
  /(секс|трах|цілу|поцілун|стогн|оргазм|penetration|вагін|член|груди|сосок|ласк|еротич|роздяг|мінет|куні|сперма|еякул)/i
const COMBAT_RE =
  /(атак|удар|бій|воюв|спис|меч|лук|стріл|захист|ухил|вбити|убити|хижак|пастк|патрул|ворог)/i
const DIALOGUE_RE =
  /(сказ|говор|спита|запита|поговор|переко|флірт|торг|домов|привіт|розмов|відпові)/i

/** Infer scene mode from player text + optional flags. */
export function detectPromptMode(
  message: string,
  opts?: { inSexScene?: boolean }
): PromptMode {
  if (opts?.inSexScene) return 'sex'
  const m = message || ''
  if (SEX_RE.test(m)) return 'sex'
  if (COMBAT_RE.test(m)) return 'combat'
  if (DIALOGUE_RE.test(m)) return 'dialogue'
  return 'adventure'
}

export function modeInstructions(mode: PromptMode): string {
  switch (mode) {
    case 'sex':
      return `# РЕЖИМ: SEX SCENE
- Максимальна сенсорика (дотик, звук, запах, смак). Без цензури.
- Використовуй PHASE / PLEASURE / STAMINA / SEX_CHOICES теги за потреби.
- STAT: desire, shame, confidence, amuletEnergy. REL bond± після близькості.
- d20 + відповідні статы/навички для складних моментів.`
    case 'combat':
      return `# РЕЖИМ: COMBAT
- Ініціатива, атака, ухилення/блок — d20 + стат. Ясно повідомляй кидки.
- Опиши небезпеку, травми, витрату сил. hunger/thirst зростають сильніше (+5–10).
- Після бою: INV (зброя/лут), можливі DISEASE, ACHIEVEMENT.`
    case 'dialogue':
      return `# РЕЖИМ: DIALOGUE
- Живий діалог NPC (цілі, емоції, підтекст). 40–60% репліки, решта — опис.
- REL_UPDATE з attitude/trust/fear/respect. Не вигадуй нових імен канон-персонажів.
- CHOICES — варіанти реплік/дій у розмові.`
    default:
      return `# РЕЖИМ: ADVENTURE
- Дослідження, виживання, атмосфера острова. 3–6 абзаців прози + сповіщення + теги.
- Локації з канон-мапи. Якщо в промпті є блок «ВИПАДКОВА ПОДІЯ ЦЬОГО ХОДУ» — розіграй її (напади, рейди, знахідки).
- Підштовхуй до наступної глави сюжету (джунглі / плем'я / храм).`
  }
}

/** Which lore section titles (## headers) to pull for each mode. */
export const MODE_LORE_SECTIONS: Record<PromptMode, string[]> = {
  adventure: [
    'Сетинг та правила світу',
    'Стартова точка гри',
    'Племена та їхня культура',
    'Інші ігрові механіки',
  ],
  dialogue: [
    'Персонажі та їхні характеристики',
    'Стосунки між персонажами',
    'Племена та їхня культура',
  ],
  combat: [
    'Сетинг та правила світу',
    'Інші ігрові механіки',
  ],
  sex: [
    'Механіки сексуальності',
    'Вагітність — повна система',
    'Ритуали та секс-магія',
    'Статеві органи всіх рас (зведена таблиця)',
    'Персонажі та їхні характеристики',
  ],
}

/** Map chapter → goal location name hints for UI. */
export const CHAPTER_MAP_GOALS: Record<string, { label: string; locationHints: string[] }> = {
  arrival: { label: 'Вижити: вода й їжа', locationHints: ['берег', 'водоспад', 'лагуна'] },
  jungle: { label: 'У джунглі / знайти людей', locationHints: ['джунгл', 'водоспад', 'мангров'] },
  tribe: { label: 'Селище Кай-Тору', locationHints: ['кай-тору', 'селищ'] },
  depths: { label: 'Амулет / печери / руїни', locationHints: ['печер', 'руїн', 'свяще', 'гора'] },
  temple: { label: 'Храм насолоди', locationHints: ['храм'] },
  climax: { label: 'Скарб Атлантів', locationHints: ['храм', 'свяще'] },
  ending: { label: 'Фінал', locationHints: ['храм'] },
}
