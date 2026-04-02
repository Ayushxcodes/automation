import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || ""
  const match = cookieHeader.split(";").map(s => s.trim()).find(s => s.startsWith("token="))
  const token = match ? match.split("=").slice(1).join("=") : null

  if (!token) return NextResponse.json({ user: null })

  try {
    const payload: any = verifyToken(token as string)
    const userId = payload.userId ?? payload.id
    if (!userId) return NextResponse.json({ user: null })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ user: null })

    return NextResponse.json({ user: { id: user.id, email: user.email } })
  } catch (e) {
    return NextResponse.json({ user: null })
  }
}
