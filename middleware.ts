import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Specify that this middleware runs on the Edge runtime
export const runtime = 'edge';

export function middleware(req: NextRequest) {
  // Log the path for debugging
  console.log(`Edge middleware invoked for path: ${req.nextUrl.pathname}`);

  // Simplest pass-through
  return NextResponse.next();
}

// Configure which routes should trigger this middleware
export const config = {
  matcher: [
    // Match all paths except static files and internal Next.js paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
