'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Play, Pause, Square } from 'lucide-react'
import { startSession, pauseSession, resumeSession, finishSession } from '@/lib/actions/sessions'
import { EventType } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface TimeTrackerProps {
  initialSession: any 
}

export const TimeTracker = ({ initialSession }: TimeTrackerProps) => {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [elapsed, setElapsed] = useState(initialSession?.currentElapsed || 0)
  const [isPending, setIsPending] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (initialSession) {
      setSession(initialSession)
      setElapsed(initialSession.currentElapsed || 0)
    } else {
      setSession(null)
      setElapsed(0)
    }
  }, [initialSession])

  useEffect(() => {
    const isActive = session && !session.endedAt
    const isWorking = isActive && !session.isPaused

    if (isWorking) {
      // Clear any existing timer to avoid duplicates
      if (timerRef.current) clearInterval(timerRef.current)
      
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
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
      // The session from startSession doesn't have currentElapsed/isPaused calculated
      // but we know it's a fresh start.
      setSession({ ...newSession, currentElapsed: 0, isPaused: false })
      setElapsed(0)
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
      setSession({ ...session, isPaused: true })
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
      setSession({ ...session, isPaused: false })
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const handleFinish = async () => {
    setIsPending(true)
    try {
      const finishedSession = await finishSession(session.id)
      router.push(`/sessions/${finishedSession.id}/summary`)
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const isActive = session && !session.endedAt
  const isWorking = isActive && !session.isPaused

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 transition-all">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
        {isActive ? (isWorking ? '🔥 Session in progress' : '☕ Taking a break') : '✨ Ready for a new session?'}
      </h2>
      
      <div className={`text-7xl font-mono font-black mb-10 tracking-tighter transition-colors ${
        isWorking ? 'text-blue-600' : 'text-slate-300'
      }`}>
        {formatTime(elapsed)}
      </div>

      <div className="flex gap-4 w-full max-w-sm">
        {!isActive ? (
          <Button size="lg" onClick={handleStart} disabled={isPending} className="flex-1 h-16 text-lg font-black gap-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Play className="w-6 h-6 fill-current" />
            START WORK
          </Button>
        ) : (
          <>
            {isWorking ? (
              <Button size="lg" variant="secondary" onClick={handlePause} disabled={isPending} className="flex-1 h-16 text-lg font-black gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700">
                <Pause className="w-6 h-6 fill-current" />
                PAUSE
              </Button>
            ) : (
              <Button size="lg" onClick={handleResume} disabled={isPending} className="flex-1 h-16 text-lg font-black gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                <Play className="w-6 h-6 fill-current" />
                RESUME
              </Button>
            )}
            <Button size="lg" variant="danger" onClick={handleFinish} disabled={isPending} className="flex-1 h-16 text-lg font-black gap-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-100">
              <Square className="w-6 h-6 fill-current" />
              FINISH
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
