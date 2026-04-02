import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function askClaude(prompt: string) {

  const response: any = await client.messages.create({
    model: "claude-haiku-4-5-20251001", // ✅ WORKING MODEL
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })

  const blocks = response?.content ?? []
  const first = blocks[0]

  if (!first || first.type !== "text") {
    console.log("Invalid response:", response)
    return "No output"
  }

  return first.text
}