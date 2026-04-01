import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const response = NextResponse.json({ ok: true })
  response.cookies.set("token", "", { path: "/", maxAge: 0 })
  return response
}
