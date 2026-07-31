export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const checks: Record<string, boolean | string> = {
    ok: true,
    database: false,
    deepseekKey: Boolean(process.env.DEEPSEEK_API_KEY && !process.env.DEEPSEEK_API_KEY.includes('встав')),
    geminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 8),
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
