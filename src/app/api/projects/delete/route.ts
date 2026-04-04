import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()
    if (!projectId) return NextResponse.json({ success: false, error: "Missing projectId" })

    // delete tasks and their logs first
    const tasks = await prisma.task.findMany({ where: { projectId } })
    const taskIds = tasks.map(t => t.id)
    if (taskIds.length > 0) {
      await prisma.activityLog.deleteMany({ where: { taskId: { in: taskIds } } })
      await prisma.task.deleteMany({ where: { id: { in: taskIds } } })
    }

    await prisma.project.delete({ where: { id: projectId } })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: "Delete failed" })
  }
}
