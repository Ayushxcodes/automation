import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { askClaude } from "@/lib/claude"

export async function POST(req: Request, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const resolved = await params
    const id = resolved?.id
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    const auto = await prisma.automation.findUnique({ where: { id } })
    if (!auto || auto.userId !== userId) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

    // sample input
    const emailText = "Hey, we have a meeting tomorrow at 10am. Please prepare the slides and send the report."
    const actionsList: string[] = Array.isArray(auto.actions) ? auto.actions : ((auto as any).action ? [(auto as any).action] : [])

    if (actionsList.length === 0) {
      return NextResponse.json({ success: false, error: 'No actions' }, { status: 400 })
    }

    let currentOutput = emailText
    const results: any[] = []

    for (const action of actionsList) {
      if (action === 'summarize') {
        currentOutput = await askClaude(`Summarize this:\n\n${currentOutput}`)
      } else if (action === 'generate_reply') {
        currentOutput = await askClaude(`Generate a reply for this:\n\n${currentOutput}`)
      } else if (action === 'extract_tasks') {
        currentOutput = await askClaude(`Extract tasks from the following text. Return output in this EXACT format:\n\nCompleted Tasks:\n- ...\n\nPending Tasks:\n- ...\n\nOpen Questions:\n- ...\n\nText:\n${currentOutput}`)
      } else {
        results.push({ action, skipped: true })
        continue
      }
      results.push({ action, output: currentOutput })
    }

    const log = await prisma.automationLog.create({ data: { output: currentOutput ?? '', automationId: id } })

    return NextResponse.json({ success: true, results, log })
  } catch (err: any) {
    console.error('Error running single automation', err)
    return NextResponse.json({ success: false, error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
