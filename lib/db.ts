import { PrismaClient, Prisma } from '@/lib/generated/prisma'
import type { Match, Round } from '@/lib/generated/prisma'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const db = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export { Prisma }
export type { Match, Round }
export default db