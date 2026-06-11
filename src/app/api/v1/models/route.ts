import { NextResponse } from 'next/server'
import { PROVIDERS } from '@/lib/providers/base'

export async function GET() {
  const models = PROVIDERS.map((p) => ({
    id: p.model,
    object: 'model',
    created: Math.floor(Date.now() / 1000),
    owned_by: 'aeferalow',
    provider: p.id,
  }))

  return NextResponse.json({
    object: 'list',
    data: models,
  })
}
