import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {

  try {

    const body = await req.json()

    const { email, password } = body

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // store user in DB
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })

  }

  catch (error) {

    return NextResponse.json({ success: false, error: "User already exists" }, { status: 409 })

  }

}