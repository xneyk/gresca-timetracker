import { getAccessRequests, getAllUsers } from '@/lib/actions/admin'
import { UserManagement } from '@/components/user-management'
import { LayoutDashboard, History, Settings, Users, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/dashboard')
  }

  const requests = await getAccessRequests()
  const users = await getAllUsers()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-slate-900">Gresca Track</h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link href="/history" className="text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </Link>
              <Link href="/admin" className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
              <p className="text-xs text-slate-500 capitalize">Admin</p>
            </div>
            <img src={session.user.image || ''} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Access Requests */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-slate-900">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Access Requests</h2>
            </div>
            <UserManagement initialRequests={requests} />
          </section>

          {/* Members List */}
          <section>
            <div className="flex items-center gap-2 mb-6 text-slate-900">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">All Members</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img className="h-8 w-8 rounded-full" src={user.image || ''} alt="" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            user.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
