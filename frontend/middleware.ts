import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user is authenticated by looking for the auth token
  const token = request.cookies.get('authToken')?.value
  const isAuthenticated = !!token;

  // List of public paths that don't require authentication
  const publicPaths = ['/auth']

  // Check if the requested path is public
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // If authenticated and trying to access /auth, redirect to /board
  if (isAuthenticated && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/board', request.url))
  }

  if (!isAuthenticated && !isPublicPath) {
    // Redirect to the auth page if not authenticated and not accessing a public path
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Continue to the requested page if authenticated or accessing a public path
  return NextResponse.next()
}

// Specify which routes this middleware should run for
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
