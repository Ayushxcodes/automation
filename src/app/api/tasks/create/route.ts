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

    return NextResponse.json({
      success:true,
      task
    })

  } catch {
    return NextResponse.json({ success:false })
  }

}