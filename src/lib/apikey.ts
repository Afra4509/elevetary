import crypto from 'crypto'
import { prisma } from './prisma'

/**
 * Generate a cryptographically secure API key
 * Format: afr_<32 random hex chars>
 */
export function generateApiKey(): string {
  const random = crypto.randomBytes(24).toString('hex')
  return `afr_${random}`
}

/**
 * Hash an API key for secure storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Extract prefix from a key for display (first 12 chars)
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, 12) + '...'
}

/**
 * Validate and resolve API key from request header
 * Returns the ApiKey record or null
 */
export async function resolveApiKey(rawKey: string) {
  if (!rawKey || !rawKey.startsWith('afr_')) return null

  const keyHash = hashApiKey(rawKey)

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { owner: true },
  })

  if (!apiKey) return null
  if (!apiKey.enabled) return null
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null

  // Check quota
  if (apiKey.usedTokens >= apiKey.quota) return null

  return apiKey
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}
