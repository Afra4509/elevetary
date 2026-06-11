import { NextRequest, NextResponse } from 'next/server'
import { resolveApiKey, extractBearerToken } from '@/lib/apikey'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const rawKey = extractBearerToken(req.headers.get('authorization'))
  if (!rawKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 })
  }

  const apiKey = await resolveApiKey(rawKey)
  if (!apiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: apiKey.ownerId } })

  return NextResponse.json({
    id: user?.id,
    email: user?.email,
    name: user?.name,
    role: user?.role,
    api_key: {
      id: apiKey.id,
      prefix: apiKey.keyPrefix,
      enabled: apiKey.enabled,
      quota: apiKey.quota,
      used_tokens: apiKey.usedTokens,
      remaining_quota: apiKey.quota - apiKey.usedTokens,
      total_requests: apiKey.totalRequests,
      rate_limit: apiKey.rateLimit,
      expires_at: apiKey.expiresAt,
      created_at: apiKey.createdAt,
    },
  })
}
