import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add any custom middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          return true
        }
        
        // Allow access to API routes that don't require auth
        if (req.nextUrl.pathname.startsWith('/api/auth/') || 
            req.nextUrl.pathname.startsWith('/api/register') ||
            req.nextUrl.pathname.startsWith('/api/fal/') ||
            req.nextUrl.pathname.startsWith('/api/generate-prompts') ||
            req.nextUrl.pathname.startsWith('/api/generate-media') ||
            req.nextUrl.pathname.startsWith('/api/process-zip')) {
          return true
        }

        // For protected routes, require a valid token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}