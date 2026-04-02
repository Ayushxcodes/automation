import { PrismaClient, Prisma } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL ?? ''
const adapter = new PrismaPg({ connectionString })

export const prisma: PrismaClient =
  global.prisma ?? new PrismaClient({ adapter } as Prisma.Subset<Prisma.PrismaClientOptions, Prisma.PrismaClientOptions>)

if (process.env.NODE_ENV !== 'production') global.prisma = prisma
