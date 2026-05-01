'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Gresca Track</h1>
          <p className="text-slate-500">Sistema de Time Tracking per l&apos;equip</p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-200">
            <p>Inicia sessió amb el teu compte de GitHub per accedir al dashboard.</p>
          </div>
          
          <Button 
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-3 py-6 text-lg"
          >
            <Github className="w-6 h-6" />
            Sign in with GitHub
          </Button>
          
          <p className="text-center text-xs text-slate-400">
            En entrar, acceptes que les teves sessions de treball siguin visibles per a la resta de l&apos;equip.
          </p>
        </div>
      </div>
    </div>
  )
}
