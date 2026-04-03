import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const taskId = searchParams.get("taskId")
  if (!taskId) {
    return NextResponse.json({ success:false })
  }

  

  try {
    const logs = await (prisma as any).activityLog.findMany({
      where: { taskId },
      include: { user: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success:true, logs })
  } catch (e) {
    // If the model isn't available or another error happens, return details for debugging
    return NextResponse.json({ success:false, error: String(e) })
  }
}
