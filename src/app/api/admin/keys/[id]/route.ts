import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/keys/[id] — update (suspend/enable/change quota)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  let body: { enabled?: boolean; quota?: number; rateLimit?: number } = {}
  try { body = await req.json() } catch { /* empty patch */ }

  const updated = await prisma.apiKey.update({
    where: { id },
    data: {
      ...(body.enabled !== undefined ? { enabled: body.enabled } : {}),
      ...(body.quota !== undefined ? { quota: body.quota } : {}),
      ...(body.rateLimit !== undefined ? { rateLimit: body.rateLimit } : {}),
    },
  })

  await prisma.auditLog.create({
    data: {
      action: 'api_key.update',
      actorId: session!.userId,
      actorRole: 'admin',
      targetId: id,
      details: JSON.stringify(body),
    },
  })

  return NextResponse.json({ success: true, data: updated })
}

// DELETE /api/admin/keys/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  await prisma.apiKey.delete({ where: { id } })

  await prisma.auditLog.create({
    data: {
      action: 'api_key.delete',
      actorId: session!.userId,
      actorRole: 'admin',
      targetId: id,
    },
  })

  return NextResponse.json({ success: true })
}
