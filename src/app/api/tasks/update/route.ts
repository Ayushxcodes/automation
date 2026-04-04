import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {

  try {

    // 🔐 Get user from token
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success:false, error:"Unauthorized" })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return NextResponse.json({ success:false })
    }

    const { taskId, status, publishDate } = await req.json()

    if (!taskId) {
      return NextResponse.json({ success:false })
    }

    // 🔥 Get task (include project for permission checks)
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    })

    if (!task) {
      return NextResponse.json({ success:false })
    }

    // 🔒 PERMISSION CHECK: allow if assigned, project owner, or admin
    if (
      task.assignedToId !== user.id &&
      user.role !== "admin" &&
      task.project?.userId !== user.id
    ) {
      return NextResponse.json({
        success:false,
        error:"Not allowed"
      })
    }

    // Store old status
    const oldStatus = task.status

    // ✅ Update allowed
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(publishDate && { publishDate: new Date(publishDate) })
      }
    })

    // Log activity using the Prisma client model directly; swallow errors so update still succeeds
    try {
      if (status) {
        await (prisma as any).activityLog.create({
          data: {
            action: "STATUS_CHANGED",
            details: `${oldStatus} → ${status}`,
            userId: user.id,
            taskId: task.id
          }
        })
      }

      if (publishDate) {
        await (prisma as any).activityLog.create({
          data: {
            action: "DATE_CHANGED",
            details: `Moved to ${new Date(publishDate).toDateString()}`,
            userId: user.id,
            taskId: task.id
          }
        })
      }
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Failed to write activity log:', e)
      }
    }

    return NextResponse.json({
      success:true,
      task: updated
    })

  } catch (e) {
    return NextResponse.json({ success:false })
  }

}