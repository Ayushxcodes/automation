import { NextResponse } from "next/server"

export async function POST(req: Request) {

  try {

    const { messages } = await req.json()

    const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ reply: "Missing ANTHROPIC_API_KEY in environment" }, { status: 500 })
    }

    const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001"

    // sanitize messages to remove extra fields (Anthropic rejects unknown keys like `time`)
    const sanitizedMessages = (messages || []).map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 500,
        messages: sanitizedMessages
      })
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Anthropic API error:", response.status, text)
      return NextResponse.json({ reply: `AI error: ${response.status} ${text}` }, { status: 500 })
    }

    const data = await response.json()

    // Try several common locations for the assistant text
    let reply: string | undefined = undefined

    if (data?.content && Array.isArray(data.content) && data.content[0]?.text) {
      reply = data.content[0].text
    }
    if (!reply && data?.completion) reply = typeof data.completion === 'string' ? data.completion : JSON.stringify(data.completion)
    if (!reply && data?.output_text) reply = data.output_text
    if (!reply && data?.result?.output_text) reply = data.result.output_text
    if (!reply && data?.message?.content) reply = JSON.stringify(data.message.content)

    if (!reply) {
      console.error("Unexpected Anthropic response:", data)
      // Return a short serialized form to help debugging (avoid huge payloads)
      const short = JSON.stringify(data).slice(0, 2000)
      return NextResponse.json({ reply: `No response from AI. Raw: ${short}` }, { status: 500 })
    }

    return NextResponse.json({ reply })

  } catch (e) {
    return NextResponse.json({ reply: "Error talking to AI" })
  }

}
