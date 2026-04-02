import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {

  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return NextResponse.json({ success:false })

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

  const { content } = await req.json()

  const email = await prisma.email.create({
    data:{
      content,
      userId: decoded.userId
    }
  })

  return NextResponse.json({
    success:true,
    email
  })

}