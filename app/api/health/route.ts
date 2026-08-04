export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function keyOk(raw: string | undefined): boolean {
  const k = raw?.trim() ?? ''
  return Boolean(k && !k.includes('встав') && k.length >= 8)
}

export async function GET() {
  const deepseekKey = keyOk(process.env.DEEPSEEK_API_KEY)
  const geminiKey = keyOk(process.env.GEMINI_API_KEY)
  const hasAnyLlm = deepseekKey || geminiKey

  const checks: Record<string, boolean | string> = {
    ok: true,
    database: false,
    deepseekKey,
    geminiKey,
    hint: hasAnyLlm
      ? 'OK'
      : 'Додай DEEPSEEK_API_KEY або GEMINI_API_KEY у .env і перезапусти npm run dev',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (e: any) {
    checks.ok = false
    checks.database = false
    checks.dbError = e?.message ?? 'unknown'
  }

  // DB down => not ok. Missing both API keys => ok=false but still 200 so UI can render setup.
  if (!checks.database) checks.ok = false
  else if (!hasAnyLlm) checks.ok = false

  const status = checks.database ? 200 : 503
  return NextResponse.json(checks, { status })
}
