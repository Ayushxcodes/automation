import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {

  // Edge-safe cookie check: read raw `cookie` header
  const cookieHeader = req.headers.get("cookie") || ""
  const hasToken = cookieHeader.split(";").some(c => c.trim().startsWith("token="))

  // debug: log path and cookie header to terminal
  // protect dashboard route
  if (!hasToken && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/integrations",
    "/integrations/:path*",
  ]
}