import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [users, apiKeys, stats, logs, providerHealth] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, enabled: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.apiKey.findMany({
      include: { owner: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.apiKey.count({ where: { enabled: true } }),
      prisma.requestLog.count(),
      prisma.requestLog.count({ where: { status: 'success' } }),
      prisma.requestLog.count({ where: { status: 'error' } }),
    ]),
    prisma.requestLog.findMany({
      orderBy: { createdAt: 'desc' }, take: 50,
      include: { apiKey: { select: { keyPrefix: true } }, user: { select: { email: true } } },
    }),
    prisma.providerHealth.findMany(),
  ])

  const [totalUsers, activeKeys, totalReqs, successReqs, errorReqs] = stats

  const config = await prisma.systemConfig.findMany()
  const configMap = Object.fromEntries(config.map((c) => [c.key, c.value]))

  return (
    <AdminClient
      users={users}
      apiKeys={apiKeys}
      stats={{ totalUsers, activeKeys, totalReqs, successReqs, errorReqs }}
      logs={logs}
      providerHealth={providerHealth}
      routerMode={configMap.router_mode ?? 'round-robin'}
      maintenanceMode={configMap.maintenance_mode === 'true'}
    />
  )
}
