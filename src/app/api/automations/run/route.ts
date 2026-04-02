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
      // normalize actions (support new `actions` array or legacy `action` string)
      const actionsList: string[] = Array.isArray(auto.actions) ? auto.actions : ((auto as any).action ? [(auto as any).action] : [])
      const resItem: any = { id: auto.id, trigger: auto.trigger, actions: actionsList }

      try {
        const triggerMatches = ["new_email", "new email", "new_message"].includes(auto.trigger)

        if (!triggerMatches) {
          resItem.skipped = true
          results.push(resItem)
          continue
        }

        if (actionsList.length === 0) {
          resItem.skipped = true
          results.push(resItem)
          continue
        }

        let currentOutput = emailText

        for (const action of actionsList) {
          if (action === "summarize") {
            currentOutput = await askClaude(`Summarize this:\n\n${currentOutput}`)
          } else if (action === "generate_reply") {
            currentOutput = await askClaude(`Generate a reply for this:\n\n${currentOutput}`)
          } else if (action === "extract_tasks") {
            currentOutput = await askClaude(`Extract tasks from this:\n\n${currentOutput}`)
          } else {
            // unknown action - note and skip
            resItem.unknownAction = true
          }
        }

        resItem.output = currentOutput

        const log = await prisma.automationLog.create({ data: { output: currentOutput ?? '', automationId: auto.id } })
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