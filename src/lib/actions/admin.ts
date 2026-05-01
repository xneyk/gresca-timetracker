'use server'

import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { UserStatus, UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function getAccessRequests() {
  await ensureAdmin()
  return prisma.accessRequest.findMany({
    where: {
      status: UserStatus.PENDING,
    },
    include: {
      user: true,
    },
    orderBy: {
      requestedAt: 'desc',
    },
  })
}

export async function updateRequestStatus(requestId: string, status: UserStatus) {
  const admin = await ensureAdmin()

  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  })

  if (!request) throw new Error('Request not found')

  await prisma.$transaction([
    prisma.accessRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedBy: admin.id,
      },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: { status },
    }),
  ])

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function getAllUsers() {
  await ensureAdmin()
  return prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateUserRole(userId: string, role: UserRole) {
  await ensureAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })
  revalidatePath('/admin')
}
