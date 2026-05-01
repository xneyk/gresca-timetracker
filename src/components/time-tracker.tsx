'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Coffee, Rocket, FlagTriangleRight } from 'lucide-react'
import { startSession, pauseSession, resumeSession, finishSession } from '@/lib/actions/sessions'
import { useRouter } from 'next/navigation'

interface TimeTrackerProps {
  initialSession: any 
}

export const TimeTracker = ({ initialSession }: TimeTrackerProps) => {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  
  const calculateCurrentElapsed = (sessionObj: any) => {
    if (!sessionObj || !sessionObj.lastEventStart) return 0
    const start = new Date(sessionObj.lastEventStart).getTime()
    const now = new Date().getTime()
    return Math.max(0, Math.floor((now - start) / 1000))
  }

  const [elapsed, setElapsed] = useState(calculateCurrentElapsed(initialSession))
  const [isPending, setIsPending] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (initialSession) {
      setSession(initialSession)
      setElapsed(calculateCurrentElapsed(initialSession))
    } else {
      setSession(null)
      setElapsed(0)
    }
  }, [initialSession])

  useEffect(() => {
    const isActive = session && !session.endedAt

    if (isActive) {
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
      setSession({ ...newSession, lastEventStart: new Date(), isPaused: false })
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
      setSession({ ...session, isPaused: true, lastEventStart: new Date() })
      setElapsed(0)
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
      setSession({ ...session, isPaused: false, lastEventStart: new Date() })
      setElapsed(0)
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
        {isActive ? (isWorking ? '🚀 Currently working' : '☕ Taking a break') : '✨ Start new session'}
      </h2>
      
      <div className={`text-7xl font-medium mb-10 tracking-tighter transition-colors ${
        isWorking ? 'text-blue-600' : (isActive ? 'text-amber-500' : 'text-slate-300')
      }`}>
        {formatTime(elapsed)}
      </div>

      <div className="flex flex-col gap-4 w-full">
        {!isActive ? (
          <Button size="lg" onClick={handleStart} disabled={isPending} className="w-full h-16 text-lg font-black gap-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <Rocket className="w-6 h-6 fill-current" />
            START WORK
          </Button>
        ) : (
          <>
            {isWorking ? (
              <Button size="lg" variant="secondary" onClick={handlePause} disabled={isPending} className="w-full h-16 text-lg font-black gap-3 bg-slate-100 hover:bg-slate-200 text-slate-700">
                <Coffee className="w-6 h-6" />
                TAKE A BREAK
              </Button>
            ) : (
              <Button size="lg" onClick={handleResume} disabled={isPending} className="w-full h-16 text-lg font-black gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                <Rocket className="w-6 h-6 fill-current" />
                RESUME WORK
              </Button>
            )}
            <Button size="lg" variant="danger" onClick={handleFinish} disabled={isPending} className="w-full h-16 text-lg font-black gap-3 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-100">
              <FlagTriangleRight className="w-6 h-6 fill-current" />
              FINISH
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
