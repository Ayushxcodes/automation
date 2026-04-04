import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { taskId } = await req.json()
    if (!taskId) return NextResponse.json({ success: false, error: "Missing taskId" })

    // delete related activity logs first (optional)
    await prisma.activityLog.deleteMany({ where: { taskId } })

    await prisma.task.delete({ where: { id: taskId } })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: "Delete failed" })
  }
}
