import { PrismaClient } from '@/../prisma/generated/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log the database URL (without credentials) for debugging
const dbUrl = process.env.MONGODB_URI
if (!dbUrl) {
  console.error('MONGODB_URI is not defined in environment variables')
  process.exit(1)
}

// Create PrismaClient instance with explicit configuration
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: dbUrl,
  log: ['error', 'warn']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database')
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error)
    process.exit(1)
  })

export { prisma } 