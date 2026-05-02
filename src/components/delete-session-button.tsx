'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteSession } from '@/lib/actions/sessions'
import { useRouter } from 'next/navigation'

interface DeleteSessionButtonProps {
  sessionId: string
  redirectAfter?: string
  className?: string
  variant?: 'icon' | 'button'
}

export const DeleteSessionButton = ({ 
  sessionId, 
  redirectAfter,
  className = "",
  variant = 'icon'
}: DeleteSessionButtonProps) => {
  const [isPending, setIsPending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsPending(true)
    try {
      await deleteSession(sessionId)
      if (redirectAfter) {
        router.push(redirectAfter)
      }
      setShowConfirm(false)
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Failed to delete session')
      setIsPending(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
        <span className="text-xs font-bold text-red-500 uppercase">Sure?</span>
        <button 
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs font-black bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'YES'}
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowConfirm(false)
          }}
          disabled={isPending}
          className="text-xs font-black bg-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-300 disabled:opacity-50 transition-colors"
        >
          NO
        </button>
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowConfirm(true)
        }}
        className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors border border-transparent hover:border-red-100 ${className}`}
      >
        <Trash2 className="w-4 h-4" />
        Delete Session
      </button>
    )
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setShowConfirm(true)
      }}
      className={`p-2 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 ${className}`}
      title="Delete session"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
