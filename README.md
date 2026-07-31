# 🏝️ Острів Кай-Нуї — локальна AI RPG

Текстова рольова гра з AI-майстром (DeepSeek + опційний Gemini).  
Граєш Ларою Крафт на магічному острові: виживання, племена, квести, стосунки.

## Швидкий старт

### Вимоги
- Node.js 18+
- Docker (для PostgreSQL) **або** локальний PostgreSQL 14+
- API-ключ [DeepSeek](https://platform.deepseek.com/)

### 1. Залежності
```bash
npm install
```

### 2. База даних (Docker)
```bash
docker compose up -d
```

### 3. Env
```bash
cp .env.example .env
```
Заповни `DEEPSEEK_API_KEY`. `GEMINI_API_KEY` — опційно (аналізатор з fallback на DeepSeek).

### 4. Схема + seed
```bash
npm run db:setup
```

### 5. Запуск
```bash
npm run dev
```
Відкрий http://localhost:3000

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
- **`lib/game/*`** — parse tags, apply updates, survival ticks

Детальніша інструкція українською: [LOCAL_SETUP.md](./LOCAL_SETUP.md)

## API health
`GET /api/health` — перевірка DB і наявності ключів (без секретів).
