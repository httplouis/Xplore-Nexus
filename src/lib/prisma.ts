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
  // Use DIRECT_URL for local dev (better SSL handling), DATABASE_URL for production (pooler)
  const connectionString = process.env.NODE_ENV === 'production'
    ? (process.env.DATABASE_URL || process.env.DIRECT_URL)
    : (process.env.DIRECT_URL || process.env.DATABASE_URL)

  // Safe debug: extract and log only the DB host (no credentials) so we can
  // confirm which host the deployed app is using. Remove this after debugging.
  try {
    const host = connectionString?.split('@')?.[1]?.split(':')?.[0]
    if (host) {
      // Use console.error so Vercel/hosting platforms surface it in function logs
      console.error('PRISMA_DB_HOST=' + host)
    }
  } catch (e) {
    // ignore parsing errors
  }

  const pool = new Pool({ 
    connectionString,
    ssl: connectionString?.includes('supabase.co') || connectionString?.includes('supabase.com')
      ? { rejectUnauthorized: false }
      : undefined
  })
  const adapter = new PrismaPg(pool)
  prismaClientInstance = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClientInstance
  }
}

export const prisma = prismaClientInstance
