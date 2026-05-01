import { getActiveSession } from '@/lib/actions/sessions'
import { TimeTracker } from '@/components/time-tracker'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { LogOut, LayoutDashboard, History, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/api/auth/signin')

  const activeSession = await getActiveSession()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900">Gresca Track</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
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
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{session.user.role.toLowerCase()}</p>
            </div>
            <img 
              src={session.user.image || ''} 
              alt={session.user.name || ''} 
              className="w-8 h-8 rounded-full border border-slate-200"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <TimeTracker initialSession={activeSession} />
          
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-medium text-slate-500 uppercase mb-4 font-semibold tracking-tight">Today&apos;s Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Total Worked</span>
                  <span className="font-bold text-slate-900">0h 0m</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Sessions</span>
                  <span className="font-bold text-slate-900">0</span>
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
        </div>
      </main>
    </div>
  )
}
