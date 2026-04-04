import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ success: false, chats: [] }, { status: 401 })

    const payload: any = verifyToken(token)
    const userId = payload.userId ?? payload.id
    if (!userId) return NextResponse.json({ success: false, chats: [] }, { status: 401 })

    const chats = await prisma.chat.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })
    return NextResponse.json({ chats })
  } catch (e) {
    return NextResponse.json({ success: false, chats: [] }, { status: 500 })
  }
}
