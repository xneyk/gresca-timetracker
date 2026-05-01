import { UserRole, UserStatus } from '@prisma/client'
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      status: UserStatus
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    status: UserStatus
  }
}
