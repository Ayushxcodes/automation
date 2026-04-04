import { prisma } from "@/lib/prisma"
import { tools } from "@/lib/ai-tools"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const reqBody = await req.json()
    const { messages, projectId } = reqBody


    const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
    if (!API_KEY) {
      return NextResponse.json({ reply: "Missing Anthropic/Claude API key" }, { status: 500 })
    }

    const MODEL = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001"

    // sanitize messages to remove extra fields (Anthropic rejects unknown keys like `time`)
    const sanitizedMessages = (messages || []).map((m: any) => ({ role: m.role, content: m.content }))

    // Anthropic Messages API expects a top-level `system` parameter, not a message with role `system`.
    // Accept either `system` at top-level or detect a leading message with role === 'system'.
    let systemContent: string | undefined = reqBody.system
    if (!systemContent && sanitizedMessages.length > 0 && sanitizedMessages[0].role === "system") {
      systemContent = sanitizedMessages[0].content
      sanitizedMessages.shift()
    }

    const bodyToSend: any = { model: MODEL, max_tokens: 800, messages: sanitizedMessages, tools }
    if (systemContent) bodyToSend.system = systemContent

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(bodyToSend),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Anthropic API error:", response.status, text)
      return NextResponse.json({ reply: `AI error: ${response.status} ${text}` }, { status: 500 })
    }

    const data = await response.json()
    const content = data.content?.[0]

    // 🔥 TOOL CALL handling
    if (content?.type === "tool_use") {
      const { name, input } = content
      let result: any = null

      if (name === "create_task") {
        // prefer explicit input.projectId, otherwise fall back to top-level provided projectId
        const finalProjectId = input.projectId || projectId
        result = await prisma.task.create({
          data: {
            title: input.title,
            platform: input.platform || undefined,
            projectId: finalProjectId,
            status: "idea",
          },
        })
      }

      if (name === "schedule_task") {
        result = await prisma.task.update({
          where: { id: input.taskId },
          data: { publishDate: input.publishDate ? new Date(input.publishDate) : undefined },
        })
      }

      return NextResponse.json({ reply: `Action completed: ${name}`, result })
    }

    // fallback: try to extract assistant text
    const reply = content?.text || data?.completion || data?.output_text || data?.result?.output_text || data?.message?.content || null
    if (!reply) {
      console.error("Unexpected Anthropic response:", data)
      return NextResponse.json({ reply: "No response from AI" }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error in /api/ai/chat:', e)
    return NextResponse.json({ reply: "Error talking to AI" }, { status: 500 })
  }
}
