import { getUserSessions } from '@/lib/actions/sessions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { LayoutDashboard, History, Settings, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import prisma from '@/lib/prisma'

import { BackButton } from '@/components/ui/back-button'

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin')

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) notFound()

  const sessions = await getUserSessions(user.id)
  
  const totalWorkedTime = sessions.reduce((acc, s) => acc + (s.totalWorkedTime || 0), 0)
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BackButton />

        <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-12 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <img src={user.image || ''} alt="" className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-lg" />
          <div className="text-center md:text-left flex-1">
            <h2 className="text-4xl font-black text-slate-900 mb-2">{user.name}</h2>
            <p className="text-slate-500 mb-6 font-medium">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                <span className="text-xs text-blue-400 uppercase font-black tracking-widest block mb-0.5">Total Time</span>
                <span className="text-2xl font-black text-blue-600">{formatDuration(totalWorkedTime)}</span>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 uppercase font-black tracking-widest block mb-0.5">Sessions</span>
                <span className="text-2xl font-black text-slate-700">{sessions.length}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-6">User Activity</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time Range</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Worked</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                    {format(s.startedAt, 'MMM do, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {format(s.startedAt, 'HH:mm')} - {format(s.endedAt!, 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {formatDuration(s.totalWorkedTime || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link href={`/sessions/${s.id}/summary`} className="text-slate-400 hover:text-blue-600 font-bold text-sm">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
