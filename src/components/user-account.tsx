'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { Button } from './ui/button'

interface UserAccountProps {
  user: {
    name?: string | null
    image?: string | null
    role: string
  }
}

export const UserAccount = ({ user }: UserAccountProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-900">{user.name}</p>
        <p className="text-xs text-slate-400 font-black uppercase tracking-tighter">{user.role.toLowerCase()}</p>
      </div>
      
      <div className="group relative">
        <img 
          src={user.image || ''} 
          alt={user.name || ''} 
          className="w-10 h-10 rounded-full border-2 border-slate-100 shadow-sm group-hover:border-blue-200 transition-all cursor-pointer"
        />
        
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
