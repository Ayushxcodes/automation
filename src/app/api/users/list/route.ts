import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json({ success: true, users })
  } catch (err) {
    return NextResponse.json({ success: false })
  }
}
