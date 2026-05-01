import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-center">
          <div className="bg-amber-100 p-3 rounded-full">
            <Clock className="w-12 h-12 text-amber-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Pending</h1>
        <p className="text-slate-600">
          El teu compte ha estat creat correctament, però un administrador l&apos;ha d&apos;aprovar abans de poder començar a registrar sessions.
        </p>
        <div className="pt-4">
          <Link href="/api/auth/signout">
            <Button variant="outline" className="w-full">
              Tanca la sessió
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
