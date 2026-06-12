import { prisma } from './lib/prisma'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      console.log('🔄 [Startup] Checking database connection...')
      await prisma.$queryRaw`SELECT 1;`
      console.log('✅ [Startup] Database connection successful!')
    } catch (error) {
      console.error('❌ [Startup] CRITICAL ERROR: Failed to connect to the database.')
      console.error('   Ensure your DATABASE_URL environment variable is set correctly in Vercel / .env')
      console.error('   Error details:', error)
    }
  }
}
