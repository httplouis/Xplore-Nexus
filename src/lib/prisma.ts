import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prismaClientInstance: PrismaClient

if (globalForPrisma.prisma) {
  prismaClientInstance = globalForPrisma.prisma
} else {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prismaClientInstance = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClientInstance
  }
}

export const prisma = prismaClientInstance
