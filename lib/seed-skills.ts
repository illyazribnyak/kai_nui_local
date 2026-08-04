import { prisma } from '@/lib/db'

/** Full skill catalog — also used to upsert missing skills on existing DBs. */
export const INITIAL_SKILLS = [
  // Зваблення
  { name: 'Чарівний погляд', category: 'seduction', description: 'Вміння зачарувати поглядом' },
  { name: 'Солодкі слова', category: 'seduction', description: 'Мистецтво еротичних компліментів' },
  { name: 'Спокусливий танець', category: 'seduction', description: 'Танець, що розпалює бажання' },
  { name: 'Аура бажання', category: 'seduction', description: 'Магічна привабливість тіла' },
  // Техніка
  { name: 'Ніжний дотик', category: 'technique', description: 'Вміння ласкати тіло партнера' },
  { name: 'Поцілунок вогню', category: 'technique', description: 'Пристрасні поцілунки' },
  { name: 'Гнучкість тіла', category: 'technique', description: 'Різноманітні пози та рухи' },
  { name: 'Майстерність рук', category: 'technique', description: 'Вправність дотиків і ласк' },
  // Витривалість
  { name: 'Тривала насолода', category: 'endurance', description: 'Здатність довго тримати темп' },
  { name: 'Множинне задоволення', category: 'endurance', description: 'Кілька хвиль оргазму поспіль' },
  { name: 'Контроль тіла', category: 'endurance', description: 'Управління своїми відчуттями' },
  { name: 'Невтомність', category: 'endurance', description: 'Невичерпна сексуальна енергія' },
  // Домінування
  { name: 'Владний голос', category: 'domination', description: 'Командний тон, що збуджує' },
  { name: "Зв'язування", category: 'domination', description: 'Мистецтво еротичного бондажу' },
  { name: 'Покарання та нагорода', category: 'domination', description: 'Гра з болем і насолодою' },
  { name: 'Повна влада', category: 'domination', description: 'Абсолютний контроль над партнером' },
  // Підкорення
  { name: 'Покірність', category: 'submission', description: 'Мистецтво віддаватися партнеру' },
  { name: 'Чутливість', category: 'submission', description: 'Підвищена чутливість до дотиків' },
  { name: 'Прохання та благання', category: 'submission', description: 'Вміння просити так, що неможливо відмовити' },
  { name: 'Повна довіра', category: 'submission', description: 'Абсолютна відкритість і вразливість' },
  // Магія тіла
  { name: 'Цілюща ласка', category: 'body_magic', description: 'Дотик, що зцілює тіло й душу' },
  { name: 'Ритуал насолоди', category: 'body_magic', description: 'Магічний ритуал через секс' },
  { name: "Зв'язок душ", category: 'body_magic', description: 'Телепатичний зв\'язок під час близькості' },
  { name: 'Екстаз сили', category: 'body_magic', description: 'Перетворення оргазму на магічну енергію' },
  // Інтимні акти (нова гілка)
  { name: 'Брудні розмови', category: 'acts', description: 'Брудні слова, стогін, вербальне збудження' },
  { name: 'Дрочка руками', category: 'acts', description: 'Майстерність ручної стимуляції партнера' },
  { name: 'Мінет', category: 'acts', description: 'Оральні ласки, ритм і техніка' },
  { name: 'Глибоке горло', category: 'acts', description: 'Глибоке прийняття, контроль дихання' },
  { name: 'Анал', category: 'acts', description: 'Анальна близькість: підготовка, темп, контроль' },
] as const

/**
 * Ensure all catalog skills exist. Never resets existing levels/XP.
 */
export async function seedSkills() {
  for (const s of INITIAL_SKILLS) {
    await prisma.skill.upsert({
      where: { name: s.name },
      create: {
        name: s.name,
        category: s.category,
        description: s.description,
        level: 0,
        xp: 0,
        maxXp: 100,
      },
      update: {
        // keep progression; refresh metadata only
        category: s.category,
        description: s.description,
      },
    })
  }
}
