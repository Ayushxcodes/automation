import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { askClaude } from "@/lib/claude"

export async function POST() {

  try {

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err: any) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId

    const automations = await prisma.automation.findMany({ where: { userId } })

    const results: Array<any> = []
    let logsCreated = 0

    for (const auto of automations) {
      // Sample content for demo/testing. In future this should come from the integration trigger payload.
      const emailText = "Hey, we have a meeting tomorrow at 10am. Please prepare the slides and send the report."
      const resItem: any = { id: auto.id, trigger: auto.trigger, action: auto.action }

      try {
        const triggerMatches = ["new_email", "new email", "new_message"].includes(auto.trigger)

        if (!triggerMatches) {
          resItem.skipped = true
          results.push(resItem)
          continue
        }

        let output: string | null = null

        if (auto.action === "summarize") {
          output = await askClaude(`Summarize this email in 2-3 lines:\n\n${emailText}`)
        } else if (auto.action === "generate_reply") {
          output = await askClaude(`Write a short, professional reply to this email:\n\n${emailText}\n\nKeep it concise (2-3 sentences).`)
        } else if (auto.action === "extract_tasks") {
          output = await askClaude(`Extract the action items from this email as a bullet list:\n\n${emailText}`)
        } else {
          // unknown action - skip but record
          resItem.unknownAction = true
          resItem.skipped = true
          results.push(resItem)
          continue
        }

        resItem.output = output

        const log = await prisma.automationLog.create({ data: { output: output ?? '', automationId: auto.id } })
        resItem.logId = log.id
        resItem.saved = true
        logsCreated++
      } catch (innerErr: any) {
        console.error('Error processing automation', auto.id, innerErr)
        resItem.error = innerErr?.message ?? String(innerErr)
        resItem.saved = false
      }

      results.push(resItem)
    }

    return NextResponse.json({ success: true, processed: automations.length, logsCreated, results })

  }

  catch (error) {

    console.log(error)

    return NextResponse.json({
      success:false
    })

  }

}