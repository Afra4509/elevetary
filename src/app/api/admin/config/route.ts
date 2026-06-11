import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/config
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const configs = await prisma.systemConfig.findMany()
  const configMap = Object.fromEntries(configs.map((c) => [c.key, c.value]))

  return NextResponse.json({
    router_mode: configMap.router_mode ?? 'round-robin',
    maintenance_mode: configMap.maintenance_mode === 'true',
    default_quota: parseInt(configMap.default_quota ?? '100000'),
    default_rate_limit: parseInt(configMap.default_rate_limit ?? '60'),
  })
}

// PUT /api/admin/config
export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* ignore */ }

  const allowed = ['router_mode', 'maintenance_mode', 'default_quota', 'default_rate_limit']

  for (const [key, value] of Object.entries(body)) {
    if (!allowed.includes(key)) continue
    await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  }

  return NextResponse.json({ success: true })
}
