"use client"

import { useEffect, useRef, useState } from "react"

type Message = {
  role: "user" | "assistant"
  content: string
  time?: string
}

export default function AIPage() {

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendMessage() {
    if (!input || loading) return

    const userMsg: Message = { role: "user", content: input, time: new Date().toISOString() }

    const newMessages = [...messages, userMsg]

    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: newMessages })
      })

      const data = await res.json()

      const assistantMsg: Message = { role: "assistant", content: data.reply || "No response", time: new Date().toISOString() }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error contacting AI.", time: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>){
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function copyMessage(text: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  function renderAssistant(content: string) {
    // Render code blocks delimited by ``` and text paragraphs
    const parts = content.split(/```/g)
    return parts.map((part, idx) => {
      // odd indices are code blocks
      if (idx % 2 === 1) {
        return (
          <pre key={idx} className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm"><code>{part.trim()}</code></pre>
        )
      }

      // text portion: split into paragraphs by blank lines
      return part.split(/\n\n+/).map((p, i) => (
        <p key={`${idx}-${i}`} className="mb-2 text-sm leading-relaxed">
          {p.trim()}
        </p>
      ))
    })
  }

  return (

    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>

      <div className="border rounded-lg p-4 h-[60vh] max-h-[800px] overflow-y-auto bg-white shadow-sm">

        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">Start the conversation by asking a question below.</div>
        )}

        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' ? (
                <div className="flex items-start gap-3 max-w-[80%]">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">A</div>
                  </div>
                  <div className="relative bg-gray-100 text-gray-900 px-4 py-3 rounded-xl shadow">
                    <div className="text-xs text-gray-500 mb-1">Assistant</div>
                    <div className="text-sm">
                      {renderAssistant(m.content)}
                    </div>
                    <button
                      onClick={() => copyMessage(m.content)}
                      className="absolute right-2 top-2 text-xs text-gray-500 hover:text-gray-700"
                      aria-label="Copy message"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 max-w-[80%] justify-end">
                  <div className="relative bg-blue-600 text-white px-4 py-3 rounded-xl shadow">
                    <div className="text-xs text-blue-100 mb-1 text-right">You</div>
                    <div className="text-sm text-right">
                      <span>{m.content}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-sm text-gray-500">Thinking...</div>
          )}

          <div ref={endRef} />
        </div>

      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything... (Enter to send, Shift+Enter for newline)"
          className="flex-1 border p-3 rounded-lg"
          disabled={loading}
        />

        <button
          onClick={sendMessage}
          className={`px-4 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-black'}`}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

    </div>
  )
}
