import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"
import { users } from "@/lib/users"

export async function POST(req: Request) {

  const body = await req.json()

  const user = users.find(u => u.email === body.email)

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 400 }
    )
  }

  const validPassword = await bcrypt.compare(
    body.password,
    user.password
  )

  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    )
  }

  const token = signToken({
    id: user.id,
    email: user.email
  })

  const response = NextResponse.json({
    message: "login success"
  })

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return response
}