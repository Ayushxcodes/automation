import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") || ""
  const pathname = req.nextUrl.pathname
  console.log(`[middleware] incoming ${req.method} ${pathname}`)
  // Allowlist paths that don't require authentication
  // - exact matches: useful for single-route public pages
  // - prefix matches: allow everything under these directories (API, _next, static, public)
  const exactAllow = ["/login", "/register", "/favicon.ico"]
  const prefixAllow = ["/api/", "/_next/", "/static/", "/public/"]

  const isExact = exactAllow.includes(pathname)
  const isPrefix = prefixAllow.some((p) => pathname === p.slice(0, -1) || pathname.startsWith(p))

  if (isExact || isPrefix) {
    console.log("[middleware] allowed path:", pathname)
    const res = NextResponse.next()
    res.headers.set('x-middleware', 'allow')
    return res
  }

  // Check for a token cookie quickly
  const hasToken = cookieHeader.split(";").some(c => c.trim().startsWith("token="))
  console.log("[middleware] path=", pathname, "hasToken=", hasToken)
  if (!hasToken) {
    const r = NextResponse.redirect(new URL("/login", req.url))
    r.headers.set('x-middleware', 'redirect-no-token')
    return r
  }

  // Validate token by calling the server-side auth endpoint
  try {
    const origin = req.nextUrl?.origin || new URL(req.url).origin
    const resp = await fetch(`${origin}/api/auth/me`, {
      headers: { cookie: cookieHeader }
    })

    if (!resp.ok) {
      console.log('[middleware] /api/auth/me responded with', resp.status)
      const r = NextResponse.redirect(new URL("/login", req.url))
      r.headers.set('x-middleware', 'redirect-invalid-me')
      return r
    }

    const data = await resp.json().catch(() => ({ user: null }))
    if (!data || !data.user) {
      console.log('[middleware] /api/auth/me returned no user')
      const r = NextResponse.redirect(new URL("/login", req.url))
      r.headers.set('x-middleware', 'redirect-no-user')
      return r
    }

    const ok = NextResponse.next()
    ok.headers.set('x-middleware', 'authed')
    return ok
  } catch (e) {
    console.log('[middleware] validation error', e)
    const r = NextResponse.redirect(new URL("/login", req.url))
    r.headers.set('x-middleware', 'validation-error')
    return r
  }
}

export const config = {
  matcher: [
    '/:path*'
  ]
}
