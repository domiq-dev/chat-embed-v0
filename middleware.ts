import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Remove the default X-Frame-Options header
  res.headers.delete("x-frame-options");

  // Add CSP
  res.headers.set(
    "content-security-policy",
    "frame-ancestors https://www.grandoaksburlington.com"
  );

  return res;
}
