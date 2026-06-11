import { prisma } from './lib/prisma'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      console.log('🔄 [Startup] Checking database connection...')
      // Attempt to query the database to verify the connection
      await prisma.$queryRaw`SELECT 1;`
      console.log('✅ [Startup] Database connection successful!')
    } catch (error) {
      console.error('❌ [Startup] CRITICAL ERROR: Failed to connect to the database.')
      console.error('   Ensure your DATABASE_URL environment variable is correct and the Azure PostgreSQL server is running.')
      console.error('   Error details:', error)
      // Depending on how strict we want to be, we could process.exit(1) here,
      // but in serverless/PaaS environments it's sometimes better to let the app run 
      // and fail gracefully on requests, or at least log loudly.
    }
  }
}
