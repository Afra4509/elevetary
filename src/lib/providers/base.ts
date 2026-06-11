export interface Provider {
  id: 'A' | 'B' | 'C'
  name: string
  model: string
  apiKey: string
  baseUrl: string
  priority: number
}

export const PROVIDERS: Provider[] = [
  {
    id: 'A',
    name: 'Provider A',
    model: process.env.PROVIDER_A_MODEL ?? 'gpt-5-mini',
    apiKey: process.env.PROVIDER_A_KEY ?? '',
    baseUrl: process.env.PROVIDER_A_URL ?? '',
    priority: 1,
  },
  {
    id: 'B',
    name: 'Provider B',
    model: process.env.PROVIDER_B_MODEL ?? 'gpt-4o-mini',
    apiKey: process.env.PROVIDER_B_KEY ?? '',
    baseUrl: process.env.PROVIDER_B_URL ?? '',
    priority: 2,
  },
  {
    id: 'C',
    name: 'Provider C',
    model: process.env.PROVIDER_C_MODEL ?? 'gpt-5-chat',
    apiKey: process.env.PROVIDER_C_KEY ?? '',
    baseUrl: process.env.PROVIDER_C_URL ?? '',
    priority: 3,
  },
]

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type ChatRequest = {
  model?: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
  response_format?: { type: 'json_object' | 'text' }
}

export type ProviderCallResult = {
  success: boolean
  provider: Provider
  data?: unknown
  stream?: ReadableStream
  error?: string
  latencyMs: number
  promptTokens: number
  completionTokens: number
}

export async function callProvider(
  provider: Provider,
  request: ChatRequest,
  timeoutMs = 90000 // Increased back to 90s because Bluesminds API is very slow natively
): Promise<ProviderCallResult> {
  const start = Date.now()

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    // Strip trailing /v1 if already included in baseUrl, then append canonical path
    const baseUrl = provider.baseUrl.replace(/\/v1\/?$/, '')
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
        'User-Agent': 'Aeferalow-Gateway/1.0',
        'Accept': 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: request.messages,
        stream: request.stream ?? false,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? 4096,
        top_p: 0.95,
        ...(request.response_format ? { response_format: request.response_format } : {}),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    const latencyMs = Date.now() - start

    if (!response.ok) {
      const errText = await response.text()
      return {
        success: false,
        provider,
        error: `Provider returned ${response.status}: ${errText.substring(0, 200)}`,
        latencyMs,
        promptTokens: 0,
        completionTokens: 0,
      }
    }

    if (request.stream) {
      return {
        success: true,
        provider,
        stream: response.body as ReadableStream,
        latencyMs,
        promptTokens: 0,
        completionTokens: 0,
      }
    }

    const data = await response.json() as {
      usage?: { prompt_tokens: number; completion_tokens: number }
    }
    return {
      success: true,
      provider,
      data,
      latencyMs,
      promptTokens: data?.usage?.prompt_tokens ?? 0,
      completionTokens: data?.usage?.completion_tokens ?? 0,
    }
  } catch (err) {
    const latencyMs = Date.now() - start
    const error = err instanceof Error ? err.message : 'Unknown error'
    return {
      success: false,
      provider,
      error: error.includes('abort') ? 'Request timed out' : error,
      latencyMs,
      promptTokens: 0,
      completionTokens: 0,
    }
  }
}
