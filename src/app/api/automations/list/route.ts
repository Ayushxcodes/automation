import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) return NextResponse.json({ success: false }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    const automations = await prisma.automation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })

    return NextResponse.json({ success: true, automations })
  } catch (err: any) {
    console.error('Error listing automations:', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
