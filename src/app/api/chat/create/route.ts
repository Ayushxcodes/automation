import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })

    const payload: any = verifyToken(token)
    const userId = payload.userId ?? payload.id
    if (!userId) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })

    const chat = await prisma.chat.create({ data: { userId } })
    return NextResponse.json({ chat })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
