import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function GET() {

  try {

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success:false })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const projects = await prisma.project.findMany({
      where: {
        userId: decoded.userId
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      success:true,
      projects
    })

  } catch {
    return NextResponse.json({ success:false })
  }

}