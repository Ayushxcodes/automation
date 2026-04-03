import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ success:false })
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId
      },
      include: {
        assignedTo: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      success:true,
      tasks
    })

  } catch {
    return NextResponse.json({ success:false })
  }

}