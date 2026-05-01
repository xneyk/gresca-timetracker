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

  const activeSession = await prisma.workSession.findFirst({
    where: {
      userId: session.user.id,
      endedAt: null,
    },
    include: {
      events: {
        orderBy: { startedAt: 'desc' },
      },
    },
  })

  if (!activeSession) return null

  // Calculate elapsed time until now
  const now = new Date()
  const totalWorkedSeconds = activeSession.events
    .filter(e => e.type === EventType.WORK)
    .reduce((acc, event) => {
      const end = event.endedAt || now
      return acc + Math.floor((end.getTime() - event.startedAt.getTime()) / 1000)
    }, 0)

  return {
    ...activeSession,
    currentElapsed: totalWorkedSeconds,
    isPaused: activeSession.events[0].type === EventType.BREAK && !activeSession.events[0].endedAt
  }
}

export async function getSessionById(sessionId: string) {
  const user = await getAuthenticatedUser()

  return prisma.workSession.findUnique({
    where: { 
      id: sessionId,
      userId: user.id 
    },
    include: {
      events: {
        orderBy: { startedAt: 'asc' },
      },
    },
  })
}

export async function getTeamStats(period: 'today' | 'week' | 'month' | 'all' = 'all') {
  await getAuthenticatedUser()

  const now = new Date()
  let startDate: Date | undefined

  if (period === 'today') {
    startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    startDate = new Date(now)
    const day = startDate.getDay() || 7 // Adjust for Sunday (0 -> 7)
    startDate.setDate(startDate.getDate() - day + 1) // Start of Monday
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const users = await prisma.user.findMany({
    where: {
      status: 'APPROVED',
    },
    include: {
      workSessions: {
        where: {
          endedAt: { not: null },
          ...(startDate ? { startedAt: { gte: startDate } } : {}),
        },
      },
    },
  })

  return users.map((user) => {
    const totalWorkedTime = user.workSessions.reduce((acc, session) => acc + (session.totalWorkedTime || 0), 0)
    const sessionCount = user.workSessions.length
    const lastSession = [...user.workSessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]

    return {
      id: user.id,
      name: user.name,
      image: user.image,
      totalWorkedTime,
      sessionCount,
      lastActivity: lastSession?.startedAt || null,
    }
  }).sort((a, b) => b.totalWorkedTime - a.totalWorkedTime)
}

export async function getRecentActivity(limit: number = 10) {
  await getAuthenticatedUser()

  return prisma.workSession.findMany({
    where: {
      endedAt: { not: null },
    },
    include: {
      user: true,
    },
    orderBy: {
      endedAt: 'desc',
    },
    take: limit,
  })
}

export async function getTodayStats() {
  const user = await getAuthenticatedUser()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sessions = await prisma.workSession.findMany({
    where: {
      userId: user.id,
      startedAt: {
        gte: today,
      },
      endedAt: {
        not: null,
      },
    },
  })

  const totalWorkedTime = sessions.reduce((acc, session) => acc + (session.totalWorkedTime || 0), 0)
  const sessionCount = sessions.length

  return {
    totalWorkedTime,
    sessionCount,
  }
}

export async function getUserSessions(userId?: string) {
  const currentUser = await getAuthenticatedUser()
  const targetUserId = userId || currentUser.id

  return prisma.workSession.findMany({
    where: {
      userId: targetUserId,
      endedAt: { not: null },
    },
    include: {
      user: true,
    },
    orderBy: {
      startedAt: 'desc',
    },
  })
}

export async function getAllSessions() {
  await getAuthenticatedUser()

  return prisma.workSession.findMany({
    where: {
      endedAt: { not: null },
    },
    include: {
      user: true,
    },
    orderBy: {
      startedAt: 'desc',
    },
  })
}
