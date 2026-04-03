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

    const { title, description, projectId, assignedToId } = await req.json()

    if (!title || !projectId) {
      return NextResponse.json({ success:false, error:"Missing fields" })
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId: assignedToId || undefined
      }
    })

    // Write structured activity logs; swallow errors so primary flow isn't affected
    try {
      await (prisma as any).activityLog.create({
        data: {
          action: "TASK_CREATED",
          details: `Task \"${title}\" created`,
          userId: decoded.userId,
          taskId: task.id
        }
      })

      if (assignedToId) {
        const assignedUser = await prisma.user.findUnique({ where: { id: assignedToId } })
        await (prisma as any).activityLog.create({
          data: {
            action: "TASK_ASSIGNED",
            details: `Assigned to ${assignedUser?.email}`,
            userId: decoded.userId,
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
      task
    })

  } catch {
    return NextResponse.json({ success:false })
  }

}