import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/me — session user info
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true, email: true, name: true, role: true, createdAt: true,
      apiKeys: {
        select: {
          id: true, keyPrefix: true, name: true, quota: true, usedTokens: true,
          totalRequests: true, rateLimit: true, enabled: true, expiresAt: true, createdAt: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

