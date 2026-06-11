import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey, getKeyPrefix } from '@/lib/apikey'
import { createApiKeySchema } from '@/lib/security/validate'

// GET /api/admin/keys — list all keys
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const keys = await prisma.apiKey.findMany({
    include: { owner: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: keys })
}

// POST /api/admin/keys — create new key
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createApiKeySchema.safeParse(body)
  if (!parsed.success) {
    const errorMsg = parsed.error?.errors?.[0]?.message || 'Invalid request'
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  const { name, userId, quota, rateLimit, expiresAt } = parsed.data

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const rawKey = generateApiKey()
  const keyHash = hashApiKey(rawKey)
  const keyPrefix = getKeyPrefix(rawKey)

  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash,
      keyPrefix,
      name,
      ownerId: userId,
      quota: quota ?? 100_000,
      rateLimit: rateLimit ?? 60,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      action: 'api_key.create',
      actorId: session!.userId,
      actorRole: 'admin',
      targetId: apiKey.id,
      details: JSON.stringify({ name, userId }),
    },
  })

  return NextResponse.json({
    success: true,
    key: rawKey, // Only returned ONCE on creation
    data: { ...apiKey, keyHash: undefined },
  }, { status: 201 })
}
