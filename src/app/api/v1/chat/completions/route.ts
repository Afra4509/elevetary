import { NextRequest, NextResponse } from 'next/server'
import { resolveApiKey, extractBearerToken } from '@/lib/apikey'
import { routeRequest } from '@/lib/router'
import { chatCompletionSchema } from '@/lib/security/validate'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 90

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  // IP-level rate limit (global): 100 req/min
  const ipLimit = checkRateLimit(`ip:${ip}`, 100, 60_000)
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: { message: 'Rate limit exceeded', type: 'rate_limit_error' } }, { status: 429 })
  }

  // Auth
  const authHeader = req.headers.get('authorization')
  const rawKey = extractBearerToken(authHeader)
  if (!rawKey) {
    return NextResponse.json({ error: { message: 'Missing API key. Pass Authorization: Bearer afr_...', type: 'auth_error' } }, { status: 401 })
  }

  const apiKey = await resolveApiKey(rawKey)
  if (!apiKey) {
    return NextResponse.json({ error: { message: 'Invalid or expired API key', type: 'auth_error' } }, { status: 401 })
  }

  if (!apiKey.enabled) {
    return NextResponse.json({ error: { message: 'API key is disabled', type: 'auth_error' } }, { status: 403 })
  }

  // Quota check
  if (apiKey.usedTokens >= apiKey.quota) {
    return NextResponse.json({ error: { message: 'Token quota exhausted. Contact admin.', type: 'quota_error' } }, { status: 429 })
  }

  // Per-key rate limit
  const keyLimit = checkRateLimit(`key:${apiKey.id}`, apiKey.rateLimit, 60_000)
  if (!keyLimit.allowed) {
    return NextResponse.json({ error: { message: 'API key rate limit exceeded', type: 'rate_limit_error' } }, { status: 429 })
  }

  // Parse & validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: { message: 'Invalid JSON body', type: 'invalid_request_error' } }, { status: 400 })
  }

  const parsed = chatCompletionSchema.safeParse(body)
  if (!parsed.success) {
    const errorMsg = parsed.error?.issues?.[0]?.message || 'Invalid request format'
    return NextResponse.json({ error: { message: errorMsg, type: 'invalid_request_error' } }, { status: 400 })
  }

  const chatRequest = parsed.data
  const isStream = chatRequest.stream === true

  try {
    const result = await routeRequest(chatRequest)

    if (!result.success) {
      await logRequest({
        apiKeyId: apiKey.id,
        userId: apiKey.ownerId,
        provider: result.provider.id,
        model: result.provider.model,
        status: 'error',
        latencyMs: result.latencyMs,
        ip,
        promptTokens: 0,
        completionTokens: 0,
        errorMessage: result.error,
      })
      return NextResponse.json(
        { error: { message: result.error ?? 'Provider error', type: 'provider_error' } },
        { status: 502 }
      )
    }

    if (isStream && result.stream) {
      // Wrap the stream to intercept token usage from [DONE] SSE frame
      const upstream = result.stream as ReadableStream<Uint8Array>
      const decoder = new TextDecoder()
      let buffer = ''
      let completionTokens = 0
      let promptTokens = 0
      const apiKeyId = apiKey.id
      const userId = apiKey.ownerId
      const providerId = result.provider.id
      const providerModel = result.provider.model
      const latencyMs = result.latencyMs

      const transformed = new ReadableStream<Uint8Array>({
        async start(controller) {
          const reader = upstream.getReader()
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              // Pass bytes through unchanged
              controller.enqueue(value)

              // Parse for usage data
              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() ?? ''

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                const raw = line.slice(6).trim()
                if (raw === '[DONE]') continue
                try {
                  const json = JSON.parse(raw)
                  // Some providers send usage in streaming chunks
                  if (json.usage) {
                    promptTokens = json.usage.prompt_tokens ?? 0
                    completionTokens = json.usage.completion_tokens ?? 0
                  }
                  // Count characters as fallback estimation
                  const delta = json.choices?.[0]?.delta?.content ?? ''
                  if (delta && completionTokens === 0) {
                    completionTokens += Math.ceil(delta.length / 4)
                  }
                } catch { /* skip malformed */ }
              }
            }
          } finally {
            reader.releaseLock()
            controller.close()

            // Estimate prompt tokens from messages if not provided
            if (promptTokens === 0) {
              const msgs = chatRequest.messages
              promptTokens = msgs.reduce((acc, m) => acc + Math.ceil((m.content?.length ?? 0) / 4), 0)
            }
            const totalTokens = promptTokens + completionTokens

            // Log & update usage (non-blocking)
            logRequest({ apiKeyId, userId, provider: providerId, model: providerModel, status: 'success', latencyMs, ip, promptTokens, completionTokens, streaming: true })
            updateApiKeyUsage(apiKeyId, totalTokens)
          }
        },
      })

      return new NextResponse(transformed, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
          'X-Provider': result.provider.id,
        },
      })
    }

    // Non-streaming response
    const data = result.data as Record<string, unknown>
    await logRequest({
      apiKeyId: apiKey.id,
      userId: apiKey.ownerId,
      provider: result.provider.id,
      model: result.provider.model,
      status: 'success',
      latencyMs: result.latencyMs,
      ip,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
    })
    await updateApiKeyUsage(apiKey.id, result.promptTokens + result.completionTokens)

    return NextResponse.json(data, {
      headers: { 'X-Provider': result.provider.id },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[Chat completions error]', message)
    return NextResponse.json({ error: { message, type: 'server_error' } }, { status: 503 })
  }
}

async function logRequest(params: {
  apiKeyId: string
  userId: string
  provider: string
  model: string
  status: string
  latencyMs: number
  ip: string
  promptTokens: number
  completionTokens: number
  errorMessage?: string
  streaming?: boolean
}) {
  try {
    await prisma.requestLog.create({
      data: {
        apiKeyId: params.apiKeyId,
        userId: params.userId,
        provider: params.provider,
        model: params.model,
        status: params.status,
        latencyMs: params.latencyMs,
        ipAddress: params.ip,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.promptTokens + params.completionTokens,
        errorMessage: params.errorMessage,
        streaming: params.streaming ?? false,
      },
    })
  } catch (e) {
    console.error('[Log error]', e)
  }
}

async function updateApiKeyUsage(keyId: string, tokens: number) {
  if (tokens <= 0) return
  try {
    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        usedTokens: { increment: tokens },
        totalRequests: { increment: 1 },
      },
    })
  } catch (e) {
    console.error('[Usage update error]', e)
  }
}
