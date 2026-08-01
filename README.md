# 🏝️ Острів Кай-Нуї — локальна AI RPG

Текстова рольова гра з AI-майстром (DeepSeek + опційний Gemini).  
Граєш Ларою Крафт на магічному острові: виживання, племена, квести, стосунки.

## Швидкий старт

### Вимоги
- Node.js 18+
- API-ключ [DeepSeek](https://platform.deepseek.com/)
- БД: **SQLite за замовчуванням** (файл, нічого ставити не треба)

### 1. Залежності
```bash
npm install
```

### 2. Env
```bash
copy .env.example .env
```
Заповни `DEEPSEEK_API_KEY`. У `.env` уже має бути:
```
DATABASE_URL="file:./dev.db"
```

### 3. Схема + seed
```bash
npm run db:setup
```

### 4. Запуск
```bash
npm run dev
```
Відкрий http://localhost:3000

> PostgreSQL/Docker більше не обов’язкові. Якщо хочеш Postgres — зміни `provider` у `prisma/schema.prisma` і `DATABASE_URL`.

## Скрипти
| Команда | Що робить |
|---------|-----------|
| `npm run dev` | dev-сервер |
| `npm run build` / `start` | production |
| `npm run db:setup` | generate + push + seed |
| `npm run db:seed` | лише seed |
| `npm run db:push` | Prisma schema → DB |

## Архітектура (коротко)
- **Next.js 14** App Router — UI + API
- **PostgreSQL + Prisma** — стан гри (singleton playthrough + save slots)
- **`/api/chat`** — стрім наративу, парсинг тегів, оновлення стейту
- **`data/game_context.txt`** — lore/rules для LLM
- **`lib/game/*`** — apply updates, survival, chapters, dice, world facts

### Сюжетна система
- **WorldFact** — канонічна довгострокова пам'ять (`FACT_ADD` / `FACT_REMOVE`)
- **Глави** — arrival → jungle → tribe → depths → temple → climax → ending
- **Dice** — d20 перекидається на сервері (чесні результати)
- **Starter quests** — «Вижити», «Дослідити», «Амулет»

Детальніша інструкція українською: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## API
| Endpoint | Опис |
|----------|------|
| `GET /api/health` | DB + ключі |
| `GET /api/export-game` | повний JSON-бекап сейву |
| `POST /api/import-game` | імпорт JSON-сейву (тіло = export) |
