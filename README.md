# 🏝️ Острів Кай-Нуї — локальна AI RPG

Текстова рольова гра з AI-майстром (**DeepSeek** і/або **Gemini**).  
Граєш Ларою Крафт на магічному острові: виживання, племена, квести, стосунки, крафт.

## Швидкий старт

### Вимоги
- Node.js 18+
- Хоча б один API-ключ:
  - [DeepSeek](https://platform.deepseek.com/) — основний наратор (рекомендовано)
  - [Gemini](https://aistudio.google.com/apikey) — опційно (analyzer / fallback)
- БД: **SQLite** за замовчуванням (файл, нічого ставити не треба)

### 1. Залежності
```bash
npm install
```

### 2. Env
```bash
cp .env.example .env
```
Заповни ключі. Мінімум один з `DEEPSEEK_API_KEY` / `GEMINI_API_KEY`.

```
DATABASE_URL="file:./dev.db"
DEEPSEEK_API_KEY="..."
GEMINI_API_KEY=""          # опційно
```

### 3. Схема + seed
Перший запуск:
```bash
npm run db:setup
```

Після `git pull`, якщо змінилась `prisma/schema.prisma` (наприклад `totalTokensUsed`):
```bash
npm run db:push
```
Повний seed з нуля знову: `npm run db:setup`.

### 4. Запуск
```bash
npm run dev
```
Відкрий http://localhost:3000

> PostgreSQL/Docker не обов’язкові. Для Postgres зміни `provider` у `prisma/schema.prisma` і `DATABASE_URL`.

## Скрипти
| Команда | Що робить |
|---------|-----------|
| `npm run dev` | dev-сервер |
| `npm run build` / `start` | production |
| `npm run db:setup` | generate + push + seed |
| `npm run db:seed` | лише seed |
| `npm run db:push` | Prisma schema → DB (після pull) |
| `npm test` | unit-тести |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run smoke` | API smoke (потрібен `npm run dev`) |
| `npm run ci` | typecheck + test |

## Архітектура (коротко)
- **Next.js 14** App Router — UI + API
- **SQLite + Prisma** — стан гри (singleton playthrough + save slots)
- **`/api/chat`** — стрім наративу, hybrid LLM, парсинг тегів, оновлення стейту
- **`lib/llm/client.ts`** — DeepSeek + Gemini (stream, analyzer, tokens)
- **`lib/game/crafting.ts`** — канонічні рецепти (UI верстак + system prompt)
- **`data/game_context.txt`** — lore/rules для LLM
- **`lib/game/*`** — apply updates, survival, chapters, dice, world facts

### Сюжетна система
- **WorldFact** — канонічна довгострокова пам’ять (`FACT_ADD` / `FACT_REMOVE`)
- **Глави** — arrival → jungle → tribe → depths → temple → climax → ending
- **Dice** — d20 перекидається на сервері
- **Starter quests** — ladder до храму
- **Prompt modes** — adventure / dialogue / combat / sex (auto-detect)
- **Crafting** — один каталог рецептів для верстака й AI
- **Техлог** — counts тегів після ходу (під чатом)

Детальніша інструкція українською: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## API
| Endpoint | Опис |
|----------|------|
| `GET /api/health` | DB + ключі |
| `GET /api/export-game` | повний JSON-бекап сейву |
| `POST /api/import-game` | імпорт JSON-сейву (тіло = export) |
| `GET /api/export-story` | HTML-хроніка (storybook) |
| `POST /api/craft` | детермінований крафт/споживання (`action: craft|consume`) — без LLM |
| `POST /api/redo-turn` | відкат стану + текст останньої дії для повтору |

### Верстак
У сайдбарі **Інвентар → Верстак**: рецепти з `lib/game/crafting.ts` виконуються через `/api/craft` миттєво (без чату).  
AI як і раніше може крафтити наративно через `INV_UPDATE`, але UI-верстак — server-side.
