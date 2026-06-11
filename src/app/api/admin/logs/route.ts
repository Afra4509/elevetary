import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/logs
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50'))
  const status = searchParams.get('status')
  const provider = searchParams.get('provider')

  const where = {
    ...(status ? { status } : {}),
    ...(provider ? { provider } : {}),
  }

  const [logs, total] = await Promise.all([
    prisma.requestLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        apiKey: { select: { keyPrefix: true, name: true } },
        user: { select: { email: true } },
      },
    }),
    prisma.requestLog.count({ where }),
  ])

  return NextResponse.json({ data: logs, total, page, limit })
}
