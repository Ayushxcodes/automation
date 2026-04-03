import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ success: false, user: null })

    const payload: any = verifyToken(token)
    const userId = payload.userId ?? payload.id
    if (!userId) return NextResponse.json({ success: false, user: null })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ success: false, user: null })

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } })
  } catch (e) {
    return NextResponse.json({ success: false, user: null })
  }
}
