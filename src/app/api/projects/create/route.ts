import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function POST(req: Request) {

  try {

    const user = await requireAdmin()

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ success:false, error:"Name required" })
    }

    const project = await prisma.project.create({
      data: {
        name,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success:true,
      project
    })

  } catch (e) {
    return NextResponse.json({ success:false, error:"Something went wrong" })
  }

}