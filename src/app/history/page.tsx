import { getUserSessions, getAllSessions } from '@/lib/actions/sessions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LayoutDashboard, History, Settings, Users, Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { UserAccount } from '@/components/user-account'

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin')

  const { view: viewParam } = await searchParams
  const view = viewParam || 'personal'
  const sessions = view === 'all' ? await getAllSessions() : await getUserSessions()

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900">Gresca TimeTracker</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/team" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Team
              </Link>
              <Link href="/history" className="text-sm font-medium text-slate-900 flex items-center gap-2">
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
            <UserAccount user={session.user} />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Session History</h2>
            <p className="text-slate-500 mt-1">Review your past work sessions and team activity.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Link 
              href="/history?view=personal"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                view === 'personal' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Personal
            </Link>
            <Link 
              href="/history?view=all"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                view === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Team
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {view === 'all' && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time Range</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Worked</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  {view === 'all' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={s.user?.image || ''} alt="" className="w-8 h-8 rounded-full border border-slate-100" />
                        <span className="text-sm font-bold text-slate-900">{s.user?.name}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-slate-900 font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(s.startedAt, 'MMM do, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4 text-slate-300" />
                      {format(s.startedAt, 'HH:mm')} - {format(s.endedAt!, 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {formatDuration(s.totalWorkedTime || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link 
                      href={`/sessions/${s.id}/summary`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={view === 'all' ? 5 : 4} className="px-6 py-12 text-center">
                    <p className="text-slate-400 italic">No sessions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
