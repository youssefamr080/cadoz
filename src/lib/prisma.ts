import { PrismaClient } from '@/../prisma/generated/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})

export { prisma } 