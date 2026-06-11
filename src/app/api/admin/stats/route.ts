import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callProvider, PROVIDERS } from '@/lib/providers/base'

// GET /api/admin/stats — overview stats for admin dashboard
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [totalUsers, totalKeys, activeKeys, totalRequests, successLogs, errorLogs, avgLatency] =
    await Promise.all([
      prisma.user.count(),
      prisma.apiKey.count(),
      prisma.apiKey.count({ where: { enabled: true } }),
      prisma.requestLog.count(),
      prisma.requestLog.count({ where: { status: 'success' } }),
      prisma.requestLog.count({ where: { status: 'error' } }),
      prisma.requestLog.aggregate({ _avg: { latencyMs: true } }),
    ])

  return NextResponse.json({
    totalUsers,
    totalKeys,
    activeKeys,
    totalRequests,
    successRequests: successLogs,
    errorRequests: errorLogs,
    successRate: totalRequests > 0 ? Math.round((successLogs / totalRequests) * 100) : 100,
    avgLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
  })
}
