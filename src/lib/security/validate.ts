import { z } from 'zod'

export const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().max(32_000),
})

export const chatCompletionSchema = z.object({
  model: z.string().optional(),
  messages: z.array(chatMessageSchema).min(1).max(100),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().int().min(1).max(32_000).optional(),
  response_format: z
    .object({ type: z.enum(['json_object', 'text']) })
    .optional(),
})

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  userId: z.string().min(1),
  quota: z.number().int().min(1000).max(10_000_000).optional().default(100_000),
  rateLimit: z.number().int().min(1).max(1000).optional().default(60),
  expiresAt: z.string().datetime().optional(),
})

export function sanitizeInput(str: string): string {
  // Remove null bytes and control chars
  return str.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}
