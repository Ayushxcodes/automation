import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {

  try {

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success:false, error:"Unauthorized" })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ success:false, error:"Name required" })
    }

    const project = await prisma.project.create({
      data:{
        name,
        userId: decoded.userId
      }
    })

    return NextResponse.json({
      success:true,
      project
    })

  } catch (e) {
    return NextResponse.json({ success:false, error:"Something went wrong" })
  }

}