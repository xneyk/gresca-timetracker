'use server'

import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { EventType, UserStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Not authenticated')
  if (session.user.status !== UserStatus.APPROVED && session.user.role !== 'ADMIN') {
    throw new Error('Not authorized')
  }
  return session.user
}

export async function startSession(projectName: string = 'Gresca') {
  const user = await getAuthenticatedUser()

  // Check if there's already an active session
  const activeSession = await prisma.workSession.findFirst({
    where: {
      userId: user.id,
      endedAt: null,
    },
  })

  if (activeSession) throw new Error('Already have an active session')

  const workSession = await prisma.workSession.create({
    data: {
      userId: user.id,
      projectName,
      events: {
        create: {
          type: EventType.WORK,
          startedAt: new Date(),
        },
      },
    },
    include: {
      events: {
        orderBy: { startedAt: 'desc' },
      },
    },
  })

  revalidatePath('/dashboard')
  return workSession
}

export async function pauseSession(sessionId: string) {
  const user = await getAuthenticatedUser()

  const workSession = await prisma.workSession.findUnique({
    where: { id: sessionId, userId: user.id },
    include: { events: { orderBy: { startedAt: 'desc' }, take: 1 } },
  })

  if (!workSession || workSession.endedAt) throw new Error('Session not found or already ended')

  const lastEvent = workSession.events[0]
  if (lastEvent.type !== EventType.WORK || lastEvent.endedAt) {
    throw new Error('Can only pause from work state')
  }

  await prisma.$transaction([
    prisma.sessionEvent.update({
      where: { id: lastEvent.id },
      data: { endedAt: new Date() },
    }),
    prisma.sessionEvent.create({
      data: {
        workSessionId: sessionId,
        type: EventType.BREAK,
        startedAt: new Date(),
      },
    }),
  ])

  revalidatePath('/dashboard')
}

export async function resumeSession(sessionId: string) {
  const user = await getAuthenticatedUser()

  const workSession = await prisma.workSession.findUnique({
    where: { id: sessionId, userId: user.id },
    include: { events: { orderBy: { startedAt: 'desc' }, take: 1 } },
  })

  if (!workSession || workSession.endedAt) throw new Error('Session not found or already ended')

  const lastEvent = workSession.events[0]
  if (lastEvent.type !== EventType.BREAK || lastEvent.endedAt) {
    throw new Error('Can only resume from break state')
  }

  await prisma.$transaction([
    prisma.sessionEvent.update({
      where: { id: lastEvent.id },
      data: { endedAt: new Date() },
    }),
    prisma.sessionEvent.create({
      data: {
        workSessionId: sessionId,
        type: EventType.WORK,
        startedAt: new Date(),
      },
    }),
  ])

  revalidatePath('/dashboard')
}

export async function finishSession(sessionId: string) {
  const user = await getAuthenticatedUser()

  const workSession = await prisma.workSession.findUnique({
    where: { id: sessionId, userId: user.id },
    include: { events: true },
  })

  if (!workSession || workSession.endedAt) throw new Error('Session not found or already ended')

  const now = new Date()
  const lastEvent = workSession.events.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]

  // Close the last event if it's open
  if (!lastEvent.endedAt) {
    await prisma.sessionEvent.update({
      where: { id: lastEvent.id },
      data: { endedAt: now },
    })
    // Refresh events for calculation
    lastEvent.endedAt = now
  }

  // Calculate total worked time
  const totalWorkedTime = workSession.events
    .filter((e) => e.type === EventType.WORK)
    .reduce((total, event) => {
      const end = event.endedAt || now
      return total + Math.floor((end.getTime() - event.startedAt.getTime()) / 1000)
    }, 0)

  const updatedSession = await prisma.workSession.update({
    where: { id: sessionId },
    data: {
      endedAt: now,
      totalWorkedTime,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/history')
  return updatedSession
}

export async function getActiveSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  return prisma.workSession.findFirst({
    where: {
      userId: session.user.id,
      endedAt: null,
    },
    include: {
      events: {
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
  })
}
