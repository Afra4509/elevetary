import { NextResponse } from 'next/server'
import { PROVIDERS, callProvider } from '@/lib/providers/base'
import { prisma } from '@/lib/prisma'

// GET /api/internal/health — check all providers
export async function GET() {
  const results = await Promise.all(
    PROVIDERS.map(async (provider) => {
      const start = Date.now()
      let isOnline = false
      let latencyMs = 0

      try {
        const result = await callProvider(
          provider,
          {
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
            stream: false,
          },
          8000 // 8s timeout for health check
        )
        isOnline = result.success
        latencyMs = result.latencyMs
      } catch {
        latencyMs = Date.now() - start
      }

      // Update DB
      try {
        const existing = await prisma.providerHealth.findUnique({
          where: { provider: provider.id },
        })

        const totalChecks = (existing?.totalChecks ?? 0) + 1
        const failedChecks = (existing?.failedChecks ?? 0) + (isOnline ? 0 : 1)
        const successRate = ((totalChecks - failedChecks) / totalChecks) * 100

        await prisma.providerHealth.upsert({
          where: { provider: provider.id },
          update: {
            isOnline,
            latencyMs,
            successRate,
            errorRate: 100 - successRate,
            lastChecked: new Date(),
            totalChecks,
            failedChecks,
          },
          create: {
            provider: provider.id,
            isOnline,
            latencyMs,
            successRate: isOnline ? 100 : 0,
            errorRate: isOnline ? 0 : 100,
            totalChecks: 1,
            failedChecks: isOnline ? 0 : 1,
          },
        })
      } catch { /* non-critical */ }

      return {
        provider: provider.id,
        name: provider.name,
        model: provider.model,
        isOnline,
        latencyMs,
      }
    })
  )

  const allHealth = await prisma.providerHealth.findMany()

  return NextResponse.json({
    checked_at: new Date().toISOString(),
    providers: results.map((r) => {
      const health = allHealth.find((h) => h.provider === r.provider)
      return {
        ...r,
        successRate: Math.round(health?.successRate ?? 100),
        errorRate: Math.round(health?.errorRate ?? 0),
        lastChecked: health?.lastChecked,
        totalChecks: health?.totalChecks ?? 0,
      }
    }),
  })
}
