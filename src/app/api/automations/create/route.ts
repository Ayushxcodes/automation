import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {

  try {

    const body = await req.json()
    const { trigger, action } = body ?? {}

    // basic validation
    if (typeof trigger !== 'string' || typeof action !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err: any) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    const automation = await prisma.automation.create({
      data: {
        trigger,
        action,
        userId,
      },
    })

    return NextResponse.json({ success: true, automation })

  } catch (err: any) {
    console.error('Error creating automation:', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Server error' }, { status: 500 })
  }

}