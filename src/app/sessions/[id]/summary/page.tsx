import { getSessionById } from '@/lib/actions/sessions'
import { notFound, redirect } from 'next/navigation'
import { CheckCircle2, Clock, Calendar, PlayCircle, PauseCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BackButton } from '@/components/ui/back-button'
import { DeleteSessionButton } from '@/components/delete-session-button'

interface SummaryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SessionSummaryPage({ params }: SummaryPageProps) {
  const currentUserSession = await getServerSession(authOptions)
  if (!currentUserSession) redirect('/api/auth/signin')

  const { id } = await params
  const session = await getSessionById(id)

  if (!session) {
    notFound()
  }

  if (!session.endedAt) {
    redirect('/dashboard')
  }

  const isOwner = currentUserSession.user.id === session.userId

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    
    if (h > 0) return `${h}h ${m}min`
    return `${m}min`
  }

  const formatEventDuration = (start: Date, end: Date | null) => {
    if (!end) return '...'
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000)
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-green-600 px-8 py-10 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Session Summary</h1>
            <p className="text-green-100 opacity-90">
              {isOwner 
                ? "Great job! You've completed your work session." 
                : `Session completed by ${session.user.name}`}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <Clock className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Worked</span>
                <span className="text-xl font-bold text-slate-900">{formatDuration(session.totalWorkedTime || 0)}</span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date</span>
                <span className="text-xl font-bold text-slate-900">{format(session.startedAt, 'MMM do, yyyy')}</span>
              </div>

              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <div className="flex gap-1 mb-2">
                  <span className="text-xs font-bold text-slate-400">{format(session.startedAt, 'HH:mm')}</span>
                  <span className="text-xs text-slate-300">-</span>
                  <span className="text-xs font-bold text-slate-400">{format(session.endedAt, 'HH:mm')}</span>
                </div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Duration</span>
                <span className="text-xl font-bold text-slate-900">
                  {formatDuration(Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000))}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              Timeline
            </h2>
            
            <div className="space-y-4">
              {session.events.map((event, index) => (
                <div key={event.id} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.type === 'WORK' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {event.type === 'WORK' ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
                    </div>
                    {index < session.events.length - 1 && (
                      <div className="w-0.5 h-8 bg-slate-100 my-1" />
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">{event.type === 'WORK' ? 'Working' : 'Resting'}</p>
                      <p className="text-xs text-slate-500">
                        {format(event.startedAt, 'HH:mm')} - {event.endedAt ? format(event.endedAt, 'HH:mm') : 'Now'}
                      </p>
                    </div>
                    <div className={`font-mono font-medium ${
                      event.type === 'WORK' ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {formatEventDuration(event.startedAt, event.endedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center gap-6">
              <Link href={isOwner ? "/dashboard" : "/team"}>
                <button className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                  {isOwner ? "Return to Dashboard" : "Return to Team Dashboard"}
                </button>
              </Link>

              {(isOwner || currentUserSession.user.role === 'ADMIN') && (
                <div className="pt-6 border-t border-slate-100 w-full flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Danger Zone</p>
                  <DeleteSessionButton 
                    sessionId={session.id} 
                    variant="button" 
                    redirectAfter={isOwner ? "/history" : `/team/${session.userId}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
