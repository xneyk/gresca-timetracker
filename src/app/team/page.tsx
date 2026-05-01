import { getTeamStats, getRecentActivity } from '@/lib/actions/sessions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LayoutDashboard, History, Settings, Users, Trophy, Activity, Clock, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function TeamDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ period?: string }> 
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin')

  const { period: periodParam } = await searchParams
  const period = (periodParam as 'today' | 'week' | 'month' | 'all') || 'all'
  const teamStats = await getTeamStats(period)
  const recentActivity = await getRecentActivity(10)

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'all', label: 'All Time' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900">Gresca Track</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/team" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </Link>
              <Link href="/history" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <img src={session.user.image || ''} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-amber-500">
              <Trophy className="w-8 h-8" />
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Leaderboard</h2>
            </div>
            <p className="text-slate-500 font-medium">Tracking the team&apos;s effort and dedication.</p>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm self-start">
            {periods.map((p) => (
              <Link 
                key={p.id}
                href={`/team?period=${p.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  period === p.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {teamStats.map((member, index) => (
              <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:border-blue-300 group">
                <div className="flex items-center gap-6">
                  <div className={`flex items-center justify-center w-10 h-10 font-black rounded-xl ${
                    index === 0 ? 'bg-amber-100 text-amber-600' : 
                    index === 1 ? 'bg-slate-100 text-slate-500' :
                    index === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <img src={member.image || ''} alt="" className="w-14 h-14 rounded-full border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform" />
                  <div>
                    <Link href={`/team/${member.id}`}>
                      <h3 className="text-lg font-black text-slate-900 hover:text-blue-600 transition-colors cursor-pointer">{member.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                        {member.sessionCount} sessions
                      </span>
                      {member.lastActivity && (
                        <span className="text-xs text-slate-400">
                          Active {formatDistanceToNow(member.lastActivity)} ago
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Worked Time</p>
                  <p className="text-2xl font-black text-blue-600">{formatDuration(member.totalWorkedTime)}</p>
                </div>
              </div>
            ))}

            {teamStats.length === 0 && (
              <div className="bg-white py-20 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                <CalendarDays className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No activity in this period</h3>
                <p className="text-slate-500">Try selecting a different time range or start working!</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2 text-blue-600">
              <Activity className="w-6 h-6" />
              <h2 className="text-xl font-black uppercase tracking-tight">Recent activity</h2>
            </div>

            <div className="space-y-6">
              {recentActivity.map((session) => (
                <div key={session.id} className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center z-10">
                    <Clock className="w-3 h-3 text-blue-500" />
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-hover hover:border-blue-200">
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-black text-slate-900">{session.user.name}</span> finished work
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {formatDuration(session.totalWorkedTime || 0)}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {formatDistanceToNow(session.endedAt!)} ago
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
