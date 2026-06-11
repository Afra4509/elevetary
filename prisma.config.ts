import { defineConfig } from 'prisma/config'
import path from 'path'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? `file:${path.resolve(process.cwd(), 'prisma/dev.db')}`,
  },
})
