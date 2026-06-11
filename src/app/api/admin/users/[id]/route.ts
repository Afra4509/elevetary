import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateUserSchema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  password: z.string().min(8).optional().or(z.literal('')),
})

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  const { role, password } = parsed.data
  const dataToUpdate: any = {}
  
  if (role) dataToUpdate.role = role
  if (password && password.length >= 8) {
    dataToUpdate.passwordHash = await bcrypt.hash(password, 12)
  }

  if (Object.keys(dataToUpdate).length === 0) {
    return NextResponse.json({ success: true })
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
    })

    return NextResponse.json({ success: true, user: { id: updatedUser.id, role: updatedUser.role } })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getSessionFromRequest(req)
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent deleting yourself
  if (session!.userId === params.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
