import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) {
      return NextResponse.json({ success:false })
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const { taskId, description } = await req.json()
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { description }
    })

    try {
      await (prisma as any).activityLog.create({
        data: {
          action: "DESCRIPTION_UPDATED",
          details: "Description updated",
          userId: decoded.userId,
          taskId: task.id
        }
      })
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Failed to write activity log:', e)
      }
    }

    return NextResponse.json({ success:true })
  } catch {
    return NextResponse.json({ success:false })
  }
}
