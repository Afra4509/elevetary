import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminEmail = 'afrafadmadinata@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Mikasa29'
  const adminHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: 'Administrator',
      role: 'admin',
    },
  })

  console.log(`✅ Admin user: ${admin.email}`)

  const configs = [
    { key: 'router_mode', value: 'round-robin' },
    { key: 'maintenance_mode', value: 'false' },
    { key: 'default_quota', value: '100000' },
    { key: 'default_rate_limit', value: '60' },
  ]

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    })
  }

  console.log('✅ System config done')
  console.log('\n🚀 Ready! Login at http://localhost:3000/login')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
