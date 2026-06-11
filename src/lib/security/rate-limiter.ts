import { NextRequest } from 'next/server'

// In-memory rate limiter (use Redis for production/multi-instance)
// Map key: ip:apiKey or ip → { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getWindow(windowMs: number) {
  return Math.floor(Date.now() / windowMs) * windowMs + windowMs
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs = 60_000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const resetAt = getWindow(windowMs)
  const entry = rateLimitMap.get(identifier)

  if (!entry || entry.resetAt < Date.now()) {
    rateLimitMap.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

// Clean up expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key)
    }
  }, 60_000)
}
