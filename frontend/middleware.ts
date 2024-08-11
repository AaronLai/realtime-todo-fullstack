// /Volumes/Workspace/todo-sl/frontend/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  // This is a placeholder. Replace with your actual auth check
  const isAuthenticated = false;

  // List of public paths that don't require authentication
  const publicPaths = ['/auth','/board']

  // Check if the requested path is public
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

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
