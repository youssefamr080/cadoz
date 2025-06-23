import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Log the database URL (without credentials) for debugging
const dbUrl = process.env.MONGODB_URI
if (!dbUrl) {
  console.error('MONGODB_URI is not defined in environment variables')
  process.exit(1)
}

// Ensure the connection string is properly formatted
const formattedDbUrl = (() => {
  try {
    const url = new URL(dbUrl)
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/cadoz'
    }
    if (!url.search) {
      url.search = '?retryWrites=true&w=majority'
    }
    return url.toString()
  } catch (error) {
    console.error('Invalid connection string format:', error)
    return dbUrl
  }
})()

// Create PrismaClient instance with explicit configuration
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: formattedDbUrl,
  log: ['error', 'warn', 'query']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors
prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database')
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error)
    console.error('Connection string:', formattedDbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
    process.exit(1)
  })

export { prisma } 