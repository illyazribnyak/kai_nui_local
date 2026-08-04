# 🏝️ Острів Кай-Нуї — локальний запуск на ноутбуці

Це повний код гри. Нижче — покрокова інструкція, як запустити його локально
(Windows / macOS / Linux).

---

## Що потрібно встановити (один раз)

1. **Node.js 18 або 20** — https://nodejs.org (LTS-версія).
2. **Yarn** — після встановлення Node виконай у терміналі:
   ```bash
   npm install -g yarn
   ```
3. **База даних** — за замовчуванням **SQLite** (файл `prisma/dev.db`, нічого ставити не треба).
   PostgreSQL/Docker — опційно, лише якщо сам захочеш.

---

## Крок 1. Розпакуй архів

Розпакуй `kai_nui_local.zip` у зручну папку та відкрий термінал у ній.

```bash
cd kai_nui_local
```

## Крок 2. Встанови залежності

```bash
npm install
# або: yarn install
```

## Крок 3. Налаштуй файл оточення `.env`

```bash
copy .env.example .env
```
Відкрий `.env` і встав:
- `DATABASE_URL="file:./prisma/dev.db"` — уже є в example (SQLite, без сервера БД).
- `DEEPSEEK_API_KEY` — **ОБОВ'ЯЗКОВО**. Отримати: https://platform.deepseek.com/ → API Keys.
- `GEMINI_API_KEY` — необов'язково.

> ⚠️ Ключі — секрети. Не коміть `.env` у git.

## Крок 4. Створи таблиці + seed

```bash
npm run db:setup
```
Це зробить `prisma generate`, створить `prisma/dev.db` і засіє локації/квести/навички.

## Крок 5. Запусти гру 🎮

```bash
npm run dev
```
Відкрий у браузері: **http://localhost:3000**

---

## Збірка робочої версії (необов'язково)

```bash
yarn build
yarn start
```

---

## Куди класти свої гіфки/картинки для секс-сцен

Поклади файли у папку `public/` (наприклад `public/scenes/foreplay/...`).
Все, що лежить у `public/`, доступне в грі за прямим шляхом,
наприклад файл `public/scenes/foreplay/1.gif` → адреса `/scenes/foreplay/1.gif`.
Після цього напиши мені — і я підключу їх до сцен у коді.

---

## Часті проблеми

- **`Can't reach database server`** — база не запущена або неправильний `DATABASE_URL`.
  Перевір, що контейнер/сервіс PostgreSQL працює на порту 5432.
- **Порожні відповіді ШІ / помилки 401** — не заданий або невірний `DEEPSEEK_API_KEY`.
- **`prisma` команда не знайдена** — виконуй через `yarn prisma ...`, а не напряму.
- **Порт 3000 зайнятий** — запусти на іншому порту: `yarn dev -p 3001`.

---

## Після оновлення коду (git pull)

1. `npm install` — якщо змінились залежності  
2. `npm run db:push` — якщо змінилась `prisma/schema.prisma`  
3. Перезапусти `npm run dev`

**Ключі AI:** достатньо `DEEPSEEK_API_KEY` **або** `GEMINI_API_KEY` (краще DeepSeek для наративу; Gemini — analyzer/fallback).

**Крафт:** рецепти спільні для UI-верстака й AI — `lib/game/crafting.ts`.

