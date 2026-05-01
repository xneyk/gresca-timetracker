'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Check, X, Clock } from 'lucide-react'
import { updateRequestStatus } from '@/lib/actions/admin'
import { UserStatus } from '@prisma/client'

interface UserManagementProps {
  initialRequests: any[]
}

export const UserManagement = ({ initialRequests }: UserManagementProps) => {
  const [requests, setRequests] = useState(initialRequests)
  const [isPending, setIsPending] = useState(false)

  const handleAction = async (requestId: string, status: UserStatus) => {
    setIsPending(true)
    try {
      await updateRequestStatus(requestId, status)
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'PENDING')

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="flex justify-center mb-4 text-slate-300">
          <Clock className="w-12 h-12" />
        </div>
        <p className="text-slate-500 font-medium">No hi ha sol·licituds pendents d&apos;aprovació.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pendingRequests.map((request) => (
        <div key={request.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-4 mb-6">
            <img src={request.user.image || ''} alt="" className="w-12 h-12 rounded-full border border-slate-100" />
            <div>
              <h3 className="font-bold text-slate-900">{request.user.name}</h3>
              <p className="text-sm text-slate-500 truncate max-w-[150px]">{request.user.email}</p>
              <p className="text-xs text-slate-400 mt-1">Requested {new Date(request.requestedAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700" 
              onClick={() => handleAction(request.id, 'APPROVED')}
              disabled={isPending}
            >
              <Check className="w-4 h-4" />
              Approve
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              onClick={() => handleAction(request.id, 'REJECTED')}
              disabled={isPending}
            >
              <X className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
