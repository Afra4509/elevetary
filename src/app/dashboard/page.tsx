import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      apiKeys: { orderBy: { createdAt: 'desc' } },
      requestLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true, provider: true, model: true, status: true,
          totalTokens: true, latencyMs: true, createdAt: true,
        },
      },
    },
  })

  if (!user) redirect('/login')

  const primaryKey = user.apiKeys[0] ?? null

  return <DashboardClient user={user} primaryKey={primaryKey} recentLogs={user.requestLogs} />
}
