import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { users } from "@/lib/users"

export async function POST(req: Request) {

  const body = await req.json()

  const hashedPassword = await bcrypt.hash(body.password, 10)

  const user = {
    id: Date.now(),
    email: body.email,
    password: hashedPassword
  }

  users.push(user)

  return NextResponse.json({
    message: "user created"
  })
}