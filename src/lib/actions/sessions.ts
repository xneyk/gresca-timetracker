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

  const lastEvent = activeSession.events[0]
  const lastEventStart = lastEvent.startedAt

  return {
    ...activeSession,
    lastEventStart,
    totalWorkedSeconds,
    isPaused: lastEvent.type === EventType.BREAK && !lastEvent.endedAt
  }
}

export async function getSessionById(sessionId: string) {
  await getAuthenticatedUser()

  return prisma.workSession.findUnique({
    where: { 
      id: sessionId
    },
    include: {
      user: true,
      events: {
        orderBy: { startedAt: 'asc' },
      },
    },
  })
}

// Funció auxiliar per obtenir la mitjanit en la zona horària de Madrid com a objecte Date UTC
const getMadridMidnightUTC = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const madridDateStr = formatter.format(date); // YYYY-MM-DD
  
  // Creem un objecte que representi la mitjanit local a Madrid
  const madridMidnightLocal = new Date(`${madridDateStr}T00:00:00`);
  
  // Calculem la diferència per obtenir el timestamp UTC real
  const localInMadrid = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const offset = localInMadrid.getTime() - date.getTime();
  
  return new Date(madridMidnightLocal.getTime() - offset);
};

export async function getTeamStats(period: 'today' | 'week' | 'month' | 'all' = 'all') {
  await getAuthenticatedUser()

  const now = new Date()
  let startDate: Date | undefined

  if (period === 'today') {
    startDate = getMadridMidnightUTC(now);
  } else if (period === 'week') {
    const dayStart = getMadridMidnightUTC(now);
    const day = dayStart.getDay() || 7 // Dilluns = 1, Diumenge = 7
    startDate = new Date(dayStart)
    startDate.setDate(startDate.getDate() - day + 1)
  } else if (period === 'month') {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit'
    });
    const madridMonthStr = formatter.format(now); // YYYY-MM
    const madridMonthLocal = new Date(`${madridMonthStr}-01T00:00:00`);
    const localInMadrid = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const offset = localInMadrid.getTime() - now.getTime();
    startDate = new Date(madridMonthLocal.getTime() - offset);
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

export async function getRecentActivity(period: 'today' | 'week' | 'month' | 'all' = 'all', limit: number = 10) {
  await getAuthenticatedUser()

  const now = new Date()
  let startDate: Date | undefined

  if (period === 'today') {
    startDate = getMadridMidnightUTC(now);
  } else if (period === 'week') {
    const dayStart = getMadridMidnightUTC(now);
    const day = dayStart.getDay() || 7
    startDate = new Date(dayStart)
    startDate.setDate(startDate.getDate() - day + 1)
  } else if (period === 'month') {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit'
    });
    const madridMonthStr = formatter.format(now);
    const madridMonthLocal = new Date(`${madridMonthStr}-01T00:00:00`);
    const localInMadrid = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const offset = localInMadrid.getTime() - now.getTime();
    startDate = new Date(madridMonthLocal.getTime() - offset);
  }

  return prisma.workSession.findMany({
    where: {
      endedAt: { not: null },
      ...(startDate ? { startedAt: { gte: startDate } } : {}),
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
  const now = new Date()
  const today = getMadridMidnightUTC(now);

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
