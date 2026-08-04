import { prisma } from '@/lib/db'

/** Full skill catalog — upserted so existing DBs gain new skills without reset. */
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

  // Брудні розмови (окрема гілка)
  { name: 'Натяки і стогін', category: 'dirty_talk', description: 'Легкі натяки, зітхання, стогін' },
  { name: 'Брудні розмови', category: 'dirty_talk', description: 'Відверті брудні слова під час сексу' },
  { name: 'Брудна домінація', category: 'dirty_talk', description: 'Вербальний контроль і приниження/накази' },
  { name: 'Порно-голос', category: 'dirty_talk', description: 'Голос, від якого партнер не може стриматись' },

  // Дрочка (окрема гілка)
  { name: 'Легка стимуляція', category: 'handjob', description: 'Обережні рухи рукою' },
  { name: 'Дрочка руками', category: 'handjob', description: 'Впевнена ручна стимуляція' },
  { name: 'Техніка двох рук', category: 'handjob', description: 'Складніші патерни й тиск' },
  { name: 'Ручний фініш', category: 'handjob', description: 'Довести до оргазму лише руками' },

  // Мінет (окрема гілка)
  { name: 'Поцілунки голівки', category: 'blowjob', description: 'Поцілунки й легкі оральні ласки' },
  { name: 'Мінет', category: 'blowjob', description: 'Повноцінний оральний секс' },
  { name: 'Вологий ритм', category: 'blowjob', description: 'Слина, темп, варіації' },
  { name: 'Мінет-оргазм', category: 'blowjob', description: 'Довести партнера ротом до фінішу' },

  // Глибоке горло (окрема гілка)
  { name: 'Подолання рефлекса', category: 'deepthroat', description: 'Контроль блювотного рефлексу' },
  { name: 'Глибоке горло', category: 'deepthroat', description: 'Наскільки глибоко може прийняти' },
  { name: 'Hands-free горло', category: 'deepthroat', description: 'Глибина без допомоги рук' },
  { name: 'Горло-фініш', category: 'deepthroat', description: 'Фініш глибоко в горлі' },

  // Анал (окрема гілка)
  { name: 'Анальна підготовка', category: 'anal', description: 'Розслаблення, змазка, обережність' },
  { name: 'Анал', category: 'anal', description: 'Анальне проникнення з контролем' },
  { name: 'Глибокий анал', category: 'anal', description: 'Глибина й інтенсивність' },
  { name: 'Анальний оргазм', category: 'anal', description: 'Оргазм від анальної стимуляції' },

  // Вершниця
  { name: 'Сісти зверху', category: 'riding', description: 'Баланс і ритм зверху' },
  { name: 'Вершниця', category: 'riding', description: 'Впевнена їзда' },
  { name: 'Глибока їзда', category: 'riding', description: 'Глибина й кут' },
  { name: 'Вершниця-оргазм', category: 'riding', description: 'Оргазм у позиції зверху' },

  // Еджинг
  { name: 'Зупинка на краю', category: 'edging', description: 'Зупинитись перед піком' },
  { name: 'Еджинг', category: 'edging', description: 'Тримати партнера/себе на межі' },
  { name: 'Множинний еджинг', category: 'edging', description: 'Кілька циклів затримки' },
  { name: 'Заборона оргазму', category: 'edging', description: 'Повний контроль дозволу кінчати' },
  // Публічність
  { name: 'Натяк на людях', category: 'public', description: 'Флірт і натяки при свідках' },
  { name: 'Секс на виду', category: 'public', description: 'Близькість, де можуть побачити' },
  { name: 'Ритуальне шоу', category: 'public', description: 'Секс як вистава / обряд племені' },
  { name: 'Без сорому', category: 'public', description: 'Повна втрата сорому на людях' },
  // Кремпай / насіння
  { name: 'Прийняти всередині', category: 'creampie', description: 'Просити фініш всередині' },
  { name: 'Кремпай', category: 'creampie', description: 'Прийняти оргазм партнера в собі' },
  { name: 'Ризик насіння', category: 'creampie', description: 'Свідомий ризик вагітності' },
  { name: 'Прийняти все', category: 'creampie', description: 'Максимальна відкритість до насіння' },
  // Aftercare
  { name: 'Обійми після', category: 'aftercare', description: 'Фізична близькість після сексу' },
  { name: 'Aftercare', category: 'aftercare', description: 'Турбота, вода, тепло, спокій' },
  { name: 'Слова підтримки', category: 'aftercare', description: 'М\'які слова після жорсткої сцени' },
  { name: 'Зцілення близькості', category: 'aftercare', description: 'Відновлення довіри й тіла' },
] as const

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
        category: s.category,
        description: s.description,
      },
    })
  }
}
