import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json()
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ success: false, messages: [] }, { status: 401 })

    const payload: any = verifyToken(token)
    const userId = payload.userId ?? payload.id
    if (!userId) return NextResponse.json({ success: false, messages: [] }, { status: 401 })

    const chat = await prisma.chat.findUnique({ where: { id: chatId } })
    if (!chat || chat.userId !== userId) return NextResponse.json({ success: false, messages: [] }, { status: 403 })

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ messages })
  } catch (e) {
    return NextResponse.json({ success: false, messages: [] }, { status: 500 })
  }
}
