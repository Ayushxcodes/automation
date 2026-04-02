import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function DELETE(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams ?? {}
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return NextResponse.json({ success: false }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    const automation = await prisma.automation.findUnique({ where: { id } })
    if (!automation || automation.userId !== userId) {
      return NextResponse.json({ success: false }, { status: 404 })
    }

    await prisma.automation.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error deleting automation:', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
