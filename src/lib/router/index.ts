import { PROVIDERS, Provider, ChatRequest, ProviderCallResult, callProvider } from '../providers/base'
import { prisma } from '../prisma'

type RouterMode = 'round-robin' | 'random' | 'priority'

// In-memory state
let roundRobinIndex = 0

// Circuit breaker state: provider ID → fail count + open timestamp
const circuitState: Record<string, { failures: number; openUntil: number }> = {
  A: { failures: 0, openUntil: 0 },
  B: { failures: 0, openUntil: 0 },
  C: { failures: 0, openUntil: 0 },
}

const CIRCUIT_FAILURE_THRESHOLD = 3
const CIRCUIT_OPEN_DURATION_MS = 30_000 // 30 seconds

function isCircuitOpen(providerId: string): boolean {
  const state = circuitState[providerId]
  if (!state) return false
  if (state.openUntil > Date.now()) return true
  if (state.openUntil !== 0 && state.openUntil <= Date.now()) {
    // Half-open: reset
    state.failures = 0
    state.openUntil = 0
  }
  return false
}

function recordFailure(providerId: string) {
  const state = circuitState[providerId]
  if (!state) return
  state.failures += 1
  if (state.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    state.openUntil = Date.now() + CIRCUIT_OPEN_DURATION_MS
    console.warn(`[Router] Circuit OPEN for provider ${providerId} for ${CIRCUIT_OPEN_DURATION_MS / 1000}s`)
  }
}

function recordSuccess(providerId: string) {
  const state = circuitState[providerId]
  if (!state) return
  state.failures = 0
  state.openUntil = 0
}

async function getRouterMode(): Promise<RouterMode> {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'router_mode' },
    })
    return (config?.value ?? 'round-robin') as RouterMode
  } catch {
    return 'round-robin'
  }
}

function selectProvider(mode: RouterMode, available: Provider[]): Provider {
  if (available.length === 0) throw new Error('No available providers')

  switch (mode) {
    case 'random':
      return available[Math.floor(Math.random() * available.length)]

    case 'priority':
      return available.sort((a, b) => a.priority - b.priority)[0]

    case 'round-robin':
    default: {
      const provider = available[roundRobinIndex % available.length]
      roundRobinIndex = (roundRobinIndex + 1) % available.length
      return provider
    }
  }
}

export interface RouterResult extends ProviderCallResult {
  retriedProviders?: string[]
}

export async function routeRequest(request: ChatRequest): Promise<RouterResult> {
  const mode = await getRouterMode()

  // Filter available providers (circuit not open)
  const availableProviders = PROVIDERS.filter(
    (p) => p.apiKey && !isCircuitOpen(p.id)
  )

  if (availableProviders.length === 0) {
    throw new Error('All providers are currently unavailable (circuit breakers open)')
  }

  const tried: string[] = []
  const remaining = [...availableProviders]

  while (remaining.length > 0) {
    const provider = selectProvider(mode, remaining)
    remaining.splice(remaining.indexOf(provider), 1)
    tried.push(provider.id)

    // Try each provider exactly once for lowest latency failover
    const result = await callProvider(provider, request)

    if (result.success) {
      recordSuccess(provider.id)
      return { ...result, retriedProviders: tried.length > 1 ? tried.slice(0, -1) : undefined }
    }

    console.warn(`[Router] Provider ${provider.id} failed: ${result.error}`)
    recordFailure(provider.id)
  }

  throw new Error('All providers failed after retries')
}

export { getRouterMode, circuitState }
