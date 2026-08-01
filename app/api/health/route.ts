export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const key = process.env.DEEPSEEK_API_KEY?.trim() ?? ''
  const deepseekKey = Boolean(key && !key.includes('встав') && key.length >= 8)
  const checks: Record<string, boolean | string> = {
    ok: true,
    database: false,
    deepseekKey,
    geminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 8),
    hint: deepseekKey
      ? 'OK'
      : 'Додай DEEPSEEK_API_KEY у .env і перезапусти npm run dev',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (e: any) {
    checks.ok = false
    checks.database = false
    checks.dbError = e?.message ?? 'unknown'
  }

  if (!checks.deepseekKey) checks.ok = false

  return NextResponse.json(checks, { status: checks.ok ? 200 : 503 })
}
