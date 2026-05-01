import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function RejectedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Accés Denegat</h1>
        <p className="text-slate-600">
          Ho sentim, la teva sol·licitud d&apos;accés ha estat rebutjada. Contacta amb un administrador si creus que es tracta d&apos;un error.
        </p>
        <div className="pt-4">
          <Link href="/api/auth/signout">
            <Button variant="outline" className="w-full">
              Torna al Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
