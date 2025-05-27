import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Remove the default X-Frame-Options header
  res.headers.delete("x-frame-options");

  // Add security headers
  res.headers.set(
    "content-security-policy",
    "frame-ancestors https://www.grandoaksburlington.com; default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data: blob:; font-src 'self' data:;"
  );

  // Add CORS headers for widget.min.js
  if (req.nextUrl.pathname === '/widget.min.js') {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }

  return res;
}

// Configure which routes should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ (API routes)
     * 2. /_next/ (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
