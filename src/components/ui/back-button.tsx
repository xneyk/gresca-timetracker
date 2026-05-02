'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  className?: string
  label?: string
}

export const BackButton = ({ 
  className = "inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors font-medium cursor-pointer",
  label = "Go back"
}: BackButtonProps) => {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className={className}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  )
}
