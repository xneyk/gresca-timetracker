import { PrismaAdapter } from '@auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import prisma from './prisma'
import { UserStatus, UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id.toString(),
          role: UserRole.MEMBER,
          status: UserStatus.PENDING,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.status = (user as any).status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as any
        session.user.status = token.status as any
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      try {
        await prisma.accessRequest.create({
          data: {
            userId: user.id,
            status: UserStatus.PENDING,
          },
        })
      } catch (error) {
        console.error('Error creating access request:', error)
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true,
}
