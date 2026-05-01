'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Play, Pause, Square, SkipForward } from 'lucide-react'
import { startSession, pauseSession, resumeSession, finishSession } from '@/lib/actions/sessions'
import { EventType } from '@prisma/client'

interface TimeTrackerProps {
  initialSession: any // Type this properly later
}

export const TimeTracker = ({ initialSession }: TimeTrackerProps) => {
  const [session, setSession] = useState(initialSession)
  const [elapsed, setElapsed] = useState(0)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setSession(initialSession)
  }, [initialSession])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (session && !session.endedAt) {
      const lastEvent = session.events[0]
      
      if (lastEvent.type === EventType.WORK && !lastEvent.endedAt) {
        // Calculate initial elapsed from events
        // This is a bit complex for a client-side only timer, 
        // usually we'd want to calculate it more accurately
        interval = setInterval(() => {
          setElapsed((prev) => prev + 1)
        }, 1000)
      }
    }

    return () => clearInterval(interval)
  }, [session])

  // Reset elapsed when session changes or on mount
  useEffect(() => {
    if (session && !session.endedAt) {
      // Calculate total worked time so far
      // For now, let's just use a simple approach
    } else {
      setElapsed(0)
    }
  }, [session])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    setIsPending(true)
    try {
      const newSession = await startSession()
      setSession(newSession)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handlePause = async () => {
    setIsPending(true)
    try {
      await pauseSession(session.id)
      // Re-fetch or update state locally
      // For simplicity, let's assume we re-fetch via server actions revalidation
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleResume = async () => {
    setIsPending(true)
    try {
      await resumeSession(session.id)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleFinish = async () => {
    setIsPending(true)
    try {
      await finishSession(session.id)
      setSession(null)
      setElapsed(0)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const isActive = session && !session.endedAt
  const isWorking = isActive && session?.events?.[0]?.type === EventType.WORK

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
        {isActive ? (isWorking ? 'Working on Gresca' : 'Taking a break') : 'Ready to work?'}
      </h2>
      
      <div className="text-6xl font-mono font-bold text-slate-900 mb-8">
        {formatTime(elapsed)}
      </div>

      <div className="flex gap-4">
        {!isActive ? (
          <Button size="lg" onClick={handleStart} disabled={isPending} className="gap-2">
            <Play className="w-5 h-5 fill-current" />
            Start Session
          </Button>
        ) : (
          <>
            {isWorking ? (
              <Button size="lg" variant="secondary" onClick={handlePause} disabled={isPending} className="gap-2">
                <Pause className="w-5 h-5 fill-current" />
                Take a Break
              </Button>
            ) : (
              <Button size="lg" onClick={handleResume} disabled={isPending} className="gap-2">
                <Play className="w-5 h-5 fill-current" />
                Resume Work
              </Button>
            )}
            <Button size="lg" variant="danger" onClick={handleFinish} disabled={isPending} className="gap-2">
              <Square className="w-5 h-5 fill-current" />
              Finish Session
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
