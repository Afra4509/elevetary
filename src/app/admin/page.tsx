import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [users, apiKeys, statusCounts, logs, providerHealth, config] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, enabled: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.apiKey.findMany({
      include: { owner: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.requestLog.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.requestLog.findMany({
      orderBy: { createdAt: 'desc' }, take: 50,
      include: { apiKey: { select: { keyPrefix: true } }, user: { select: { email: true } } },
    }),
    prisma.providerHealth.findMany(),
    prisma.systemConfig.findMany()
  ])

  const totalUsers = users.length
  const activeKeys = apiKeys.filter(k => k.enabled).length
  const successReqs = statusCounts.find(s => s.status === 'success')?._count.status ?? 0
  const errorReqs = statusCounts.find(s => s.status === 'error')?._count.status ?? 0
  const totalReqs = successReqs + errorReqs

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
