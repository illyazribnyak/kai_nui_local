export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { escapeHtml, formatMessageHtmlSafe } from '@/lib/game/html'

export async function GET() {
  try {
    const gameState = await prisma.gameState.findUnique({ where: { id: 'singleton' } })
    const messages = await prisma.message.findMany({ orderBy: { createdAt: 'asc' } })
    const relationships = await prisma.relationship.findMany({ where: { met: true } })
    const achievements = await prisma.achievement.findMany()

    const day = gameState?.dayNumber ?? 1
    const title = `Острів Кай-Нуї: Еротична Хроніка Лари Крафт`

    let storyContentHtml = ''
    let turnIndex = 1

    for (const msg of messages) {
      if (msg.role === 'user') {
        storyContentHtml += `
          <div class="user-action">
            <span class="action-tag">Хід #${turnIndex++} — Дія Лари:</span>
            <p class="action-text">«${escapeHtml(msg.content)}»</p>
          </div>
        `
      } else {
        const formatted = formatMessageHtmlSafe(msg.content)
        storyContentHtml += `
          <div class="narrative-block">
            ${formatted}
          </div>
        `
      }
    }

    const relsSummaryHtml = relationships.length > 0
      ? relationships.map(r => `<li><strong>${escapeHtml(r.name)}</strong> (${escapeHtml(r.tribe)}): Bond ${r.bond}/10, Ставлення: ${escapeHtml(r.attitude)}</li>`).join('')
      : '<li>Жодного персонажа ще не зустрінуто</li>'

    const achSummaryHtml = achievements.length > 0
      ? achievements.map(a => `<li>🏆 <strong>${escapeHtml(a.name)}</strong>: ${escapeHtml(a.description)}</li>`).join('')
      : '<li>Досягнень ще немає</li>'

    const htmlDocument = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Georgia:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
    
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --text-color: #e2e8f0;
      --accent-color: #f59e0b;
      --emerald-color: #10b981;
      --pink-color: #ec4899;
    }

    body {
      font-family: 'Georgia', serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.8;
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    header {
      text-align: center;
      border-bottom: 2px solid #334155;
      padding-bottom: 30px;
      margin-bottom: 40px;
    }

    h1 {
      font-size: 2.2rem;
      color: var(--accent-color);
      margin-bottom: 8px;
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 0.95rem;
      color: #94a3b8;
    }

    .stats-card {
      background-color: var(--card-bg);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 40px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-top: 10px;
    }

    .user-action {
      background: rgba(245, 158, 11, 0.1);
      border-left: 4px solid var(--accent-color);
      padding: 12px 16px;
      margin: 28px 0 16px 0;
      border-radius: 0 8px 8px 0;
      font-family: 'Inter', sans-serif;
    }

    .action-tag {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent-color);
      display: block;
      margin-bottom: 4px;
    }

    .action-text {
      margin: 0;
      font-weight: 600;
      color: #fef3c7;
    }

    .narrative-block {
      margin-bottom: 24px;
      font-size: 1.05rem;
    }

    .narrative-block p {
      margin-bottom: 16px;
    }

    footer {
      margin-top: 60px;
      border-top: 1px solid #334155;
      padding-top: 20px;
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 0.85rem;
      color: #64748b;
    }

    @media print {
      body { background-color: #fff; color: #000; }
      .user-action { background: #fffbeeb; border-color: #d97706; }
    }
  </style>
</head>
<body>
  <header>
    <h1>🌴 ${escapeHtml(title)}</h1>
    <div class="subtitle">Пригодницько-еротичний роман про виживання Лари Крафт • День ${day}</div>
  </header>

  <div class="stats-card">
    <h3 style="margin-top:0; color:#cbd5e1;">📊 Стан Лари на момент завантаження</h3>
    <div class="stats-grid">
      <div>📍 Локація: <strong>${escapeHtml(gameState?.location ?? 'Берег')}</strong></div>
      <div>❤️ Бажання: <strong>${gameState?.desire ?? 0}/100</strong></div>
      <div>😳 Сором: <strong>${gameState?.shame ?? 0}/100</strong></div>
      <div>💪 Сила: <strong>${gameState?.strength ?? 6}</strong></div>
      <div>🏃 Спритність: <strong>${gameState?.agility ?? 8}</strong></div>
      <div>🌟 Настрій: <strong>${escapeHtml(gameState?.mood ?? 'neutral')}</strong></div>
    </div>
  </div>

  <main>
    ${storyContentHtml}
  </main>

  <section class="stats-card" style="margin-top: 50px;">
    <h3>👥 Зустрінуті Персонажі</h3>
    <ul>${relsSummaryHtml}</ul>

    <h3>🏆 Досягнення у пригоді</h3>
    <ul>${achSummaryHtml}</ul>
  </section>

  <footer>
    Згенеровано в Острів Кай-Нуї RPG • ${new Date().toLocaleDateString('uk-UA')}
  </footer>
</body>
</html>`

    const filename = `lara-croft-storybook-day${day}.html`

    return new NextResponse(htmlDocument, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Export Storybook error:', error)
    return NextResponse.json({ error: error?.message ?? 'Export story failed' }, { status: 500 })
  }
}
