import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const { type } = await req.json()

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ success: false }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    // delete integration record(s) for this user/type
    const deleted = await prisma.integration.deleteMany({ where: { userId, type } })

    return NextResponse.json({ success: true, deletedCount: deleted.count })
  } catch (err: any) {
    console.error('Error disconnecting integration', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
