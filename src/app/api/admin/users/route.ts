import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().max(100).optional(),
  role: z.enum(['user', 'admin']).default('user'),
})

// GET /api/admin/users
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true, enabled: true, createdAt: true,
      _count: { select: { apiKeys: true, requestLogs: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: users })
}

// POST /api/admin/users — invite/create user
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { email, password, name, role } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  await prisma.auditLog.create({
    data: {
      action: 'user.create',
      actorId: session!.userId,
      actorRole: 'admin',
      targetId: user.id,
      details: JSON.stringify({ email, role }),
    },
  })

  return NextResponse.json({ success: true, data: user }, { status: 201 })
}
