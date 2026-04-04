import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { chatId, role, content } = await req.json()
  await prisma.message.create({ data: { chatId, role, content } })
  return NextResponse.json({ success: true })
}
