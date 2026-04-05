import { NextResponse } from 'next/server'

export async function GET() {
  const res = NextResponse.json({ ok: true, test: 'middleware-test' })
  res.headers.set('x-route-test', 'middleware-test')
  return res
}
