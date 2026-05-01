'use client'

import React, { useState } from 'react'
import { UserRole } from '@prisma/client'
import { updateUserRole } from '@/lib/actions/admin'

interface RoleSelectorProps {
  userId: string
  initialRole: UserRole
  currentUserRole: UserRole
}

export const RoleSelector = ({ userId, initialRole, currentUserRole }: RoleSelectorProps) => {
  const [role, setRole] = useState<UserRole>(initialRole)
  const [isPending, setIsPending] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole
    setRole(newRole)
    setIsPending(true)
    try {
      await updateUserRole(userId, newRole)
    } catch (error) {
      console.error(error)
      setRole(initialRole) // Revert on error
    } finally {
      setIsPending(false)
    }
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={isPending}
      className="text-sm border-slate-200 rounded-md bg-transparent focus:ring-blue-500 focus:border-blue-500"
    >
      <option value={UserRole.MEMBER}>MEMBER</option>
      <option value={UserRole.ADMIN}>ADMIN</option>
    </select>
  )
}
