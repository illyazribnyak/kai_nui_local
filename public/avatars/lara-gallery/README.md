# Галерея Лари — куди класти фото і КОЛИ вони вмикаються

Поклади файли сюди → вони з’являться в **Стати → картка Лари → Галерея**.  
Гра **сама обирає активний портрет** за станом (desire, локація, ніч, dark…) і **ключовими словами в імені файлу**.

## Формати

`.jpg` `.jpeg` `.png` `.webp`

## Як називати (важливо!)

Ім’я файлу = теги. Роздільники `_` або `-`.

| Слово в імені | Коли підсилює вибір |
|---------------|---------------------|
| `sexy` `seductive` `sensual` | desire ≥ 50–75, секс-сцена |
| `intimate` `boudoir` `closeup` | desire ≥ 30, вечір, близькість |
| `afterglow` | soft після близькості (mood happy/aroused, desire середній) |
| `beach` `lagoon` | локація берег / лагуна |
| `jungle` `island` | джунглі / острів |
| `temple` `ritual` | храм, ритуальний одяг |
| `night` | timeOfDay night/evening |
| `day` `morning` | день / ранок |
| `wet` `rain` | weather rain/storm |
| `dark` | isDarkLara |
| `pregnant` | isPregnant |
| `tribal` | селище / племінний одяг |
| `confident` | висока confidence |
| `exhausted` | mood exhausted |
| `tee` `shirt` `white` | одяг з майкою/білим |
| `nude` | сильне desire / секс-сцена (обережно в git) |

### Приклади

```
lara_sexy_beach.jpg          → бажання + берег
lara_sexy_night.jpg          → бажання + ніч
lara_boudoir_intimate.jpg    → вечір / desire
lara_dark_seductive.jpg      → Темна Лара
lara_pregnant_soft.jpg       → вагітність
lara_afterglow.jpg           → після близькості
lara_wet_shirt_sexy.jpg      → дощ + desire (якщо є wet+sexy)
lara_temple_ritual.jpg       → храм
```

Чим більше релевантних слів у імені — тим вищий **score**. Перемагає найкращий збіг.

## Пріоритет (спрощено)

1. **dark** / **pregnant** (сюжетні прапори)  
2. **Секс-сцена** + sexy/intimate  
3. **Desire** (sexy vs спокійні фото)  
4. **Локація** (beach / jungle / temple)  
5. **Час доби** (night / day)  
6. **Одяг / погода / настрій**  

Якщо score низький — лишається вбудований look-аватар (`lara_aroused.png` тощо).

## Флоу

1. Згенеруй → поклади сюди з розумним іменем  
2. `git add` + commit (лише те, що можна в репо)  
3. Онови гру / кнопка **Оновити** в галереї  

## Не комітити

Порн-сайти / Reddit без ліцензії. Локально: `public/avatars/body/private/` (gitignore).
