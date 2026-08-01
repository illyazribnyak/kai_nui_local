export type PromptMode = 'adventure' | 'dialogue' | 'combat' | 'sex'

const SEX_RE =
  /\b(секс|трах|цілу|поцілун|стог|оргазм|penetration|вагін|член|груди|сосок|ласк|еротич|розділ(и|итись)|роздяг|мінет|куні|їба|сперма|еякул)\b/i
const COMBAT_RE =
  /\b(атак|удар|бій|вою|спис|меч|лук|стріл|захист|блок|ухил|вбити|убити|хижак|пастк|патрул|ворог)\b/i
const DIALOGUE_RE =
  /\b(сказ|говор|спита|запита|поговор|переко|флірт|торг|домов|привіт|розмов|відпові)\b/i

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
- Локації з канон-мапи. Випадкові події d20 при подорожі.
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
  arrival: { label: 'Знайди воду / вийди з берега', locationHints: ['берег', 'водоспад', 'джунгл'] },
  jungle: { label: 'Глибше в джунглі', locationHints: ['джунгл', 'водоспад', 'лагуна'] },
  tribe: { label: 'Селище Кай-Тору', locationHints: ['кай-тору', 'селищ'] },
  depths: { label: 'Печери / руїни / гора', locationHints: ['печер', 'руїн', 'свяще', 'гора'] },
  temple: { label: 'Храм', locationHints: ['храм'] },
  climax: { label: 'Скарб / ритуал', locationHints: ['храм', 'свяще'] },
  ending: { label: 'Фінал', locationHints: ['храм'] },
}
