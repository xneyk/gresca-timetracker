import { PrismaClient, UserRole, UserStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // 1. Assegurar que tots els usuaris existents són ADMIN i APPROVED (per al teu cas)
  const users = await prisma.user.updateMany({
    data: {
      role: UserRole.ADMIN,
      status: UserStatus.APPROVED,
    },
  })

  // 2. Sincronitzar les sol·licituds d'accés: si l'usuari està aprovat, la sol·licitud també
  const approvedUsers = await prisma.user.findMany({
    where: { status: UserStatus.APPROVED },
    select: { id: true }
  })

  const userIds = approvedUsers.map(u => u.id)

  const requests = await prisma.accessRequest.updateMany({
    where: {
      userId: { in: userIds },
      status: UserStatus.PENDING
    },
    data: {
      status: UserStatus.APPROVED
    }
  })

  console.log(`Updated ${users.count} users to ADMIN.`)
  console.log(`Marked ${requests.count} access requests as APPROVED.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
