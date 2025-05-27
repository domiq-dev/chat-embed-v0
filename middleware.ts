import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Specify that this middleware runs on the Edge runtime
export const runtime = 'edge';

export function middleware(req: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Remove the default X-Frame-Options header
  response.headers.delete("x-frame-options");

  // Add security headers
  response.headers.set(
    "content-security-policy",
    "frame-ancestors https://www.grandoaksburlington.com; default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:; style-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data: blob:; font-src 'self' data:;"
  );

  // Add CORS headers for widget.min.js
  if (req.nextUrl.pathname === '/widget.min.js') {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  return response;
}

// Configure which routes should trigger this middleware
export const config = {
  matcher: [
    // Match all paths except static files and internal Next.js paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
