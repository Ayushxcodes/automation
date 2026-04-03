import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const total = await prisma.task.count()
    const done = await prisma.task.count({ where: { status: "published" } })
    const inProgress = await prisma.task.count({ where: { status: { not: "published" } } })
    const completionRate = total === 0 ? 0 : (done / total) * 100
    return NextResponse.json({ success: true, data: { total, done, inProgress, completionRate } })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) })
  }
}
