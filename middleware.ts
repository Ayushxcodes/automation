import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || ""
  const pathname = req.nextUrl.pathname

  const protectedPaths = ["/dashboard", "/integrations", "/automations"]
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const hasToken = cookieHeader.split(";").some(c => c.trim().startsWith("token="))

  if (!hasToken) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const origin = req.nextUrl?.origin || new URL(req.url).origin
    const resp = await fetch(`${origin}/api/auth/me`, {
      headers: { cookie: cookieHeader }
    })

    if (!resp.ok) return NextResponse.redirect(new URL("/login", req.url))

    const data = await resp.json().catch(() => ({ user: null }))
    if (!data || !data.user) return NextResponse.redirect(new URL("/login", req.url))

    return NextResponse.next()
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/integrations",
    "/integrations/:path*",
    "/automations",
    "/automations/:path*",
  ]
}