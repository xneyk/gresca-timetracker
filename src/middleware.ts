import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { UserStatus } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const status = token?.status as UserStatus
    const path = req.nextUrl.pathname

    // If user is not approved and trying to access anything other than status pages
    if (
      status !== UserStatus.APPROVED &&
      token?.role !== 'ADMIN' &&
      !path.startsWith('/auth') &&
      !path.startsWith('/api') &&
      path !== '/pending' &&
      path !== '/rejected'
    ) {
      if (status === UserStatus.PENDING) {
        return NextResponse.redirect(new URL('/pending', req.url))
      }
      if (status === UserStatus.REJECTED) {
        return NextResponse.redirect(new URL('/rejected', req.url))
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
