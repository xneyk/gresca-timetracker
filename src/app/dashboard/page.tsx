import { getActiveSession, getTodayStats } from '@/lib/actions/sessions'
import { TimeTracker } from '@/components/time-tracker'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { 
  LayoutDashboard as DashboardIcon, 
  History as HistoryIcon, 
  Settings as SettingsIcon, 
  Users as UsersIcon,
  PlayCircle,
  PauseCircle
} from 'lucide-react'
import Link from 'next/link'
import { UserAccount } from '@/components/user-account'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin')

  const activeSession = await getActiveSession()
  const todayStats = await getTodayStats()

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900">Gresca TimeTracker</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <DashboardIcon className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/team" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Team
              </Link>
              <Link href="/history" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <HistoryIcon className="w-4 h-4" />
                History
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <UserAccount user={session.user} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <TimeTracker initialSession={activeSession} />
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 uppercase mb-4 font-semibold tracking-tight">Today&apos;s Stats</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center py-0.5 gap-4">
                  <span className="text-slate-600 font-medium">Total Worked</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">{formatDuration(todayStats.totalWorkedTime)}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 gap-4">
                  <span className="text-slate-600 font-medium">Sessions</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">{todayStats.sessionCount}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 uppercase mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/history" className="block text-blue-600 hover:underline text-sm">View full history →</Link>
                <Link href="/team" className="block text-blue-600 hover:underline text-sm">Team activity →</Link>
              </div>
            </div>
          </div>

          {activeSession && activeSession.events && activeSession.events.length > 0 && (
            <div className="mt-12 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Active Session Timeline
              </h3>
              <div className="space-y-4">
                {activeSession.events.map((event: any, index: number) => (
                  <div key={event.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        event.type === 'WORK' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {event.type === 'WORK' ? <PlayCircle className="w-5 h-5" /> : <PauseCircle className="w-5 h-5" />}
                      </div>
                      {index < activeSession.events.length - 1 && (
                        <div className="w-0.5 h-8 bg-slate-100 my-1" />
                      )}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div>
                        <p className="font-bold text-slate-900">{event.type === 'WORK' ? 'Working' : 'Resting'}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(event.startedAt), 'HH:mm')} - {event.endedAt ? format(new Date(event.endedAt), 'HH:mm') : 'Now'}
                        </p>
                      </div>
                      <div className={`font-mono font-medium ${
                        event.type === 'WORK' ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {event.endedAt 
                          ? `${Math.floor((new Date(event.endedAt).getTime() - new Date(event.startedAt).getTime()) / 60000)}m` 
                          : 'Ongoing'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
