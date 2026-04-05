"use client"

import React, { useEffect, useRef, useState } from "react"
import BackButton from "../../components/BackButton"

export default function ChatClient() {
  // Helper: format content into paragraphs, lists, and code blocks
  function renderInline(text: string) {
    const parts: any[] = []
    const regex = /`([^`]+)`/g
    let last = 0
    let m: RegExpExecArray | null
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index))
      parts.push(
        <code key={parts.length} className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
          {m[1]}
        </code>
      )
      last = m.index + m[0].length
    }
    if (last < text.length) parts.push(text.slice(last))
    return parts
  }

  function formatNonCode(text: string) {
    const out: any[] = []
    const paragraphs = text.split(/\n\s*\n/)
    paragraphs.forEach((p, idx) => {
      const lines = p.split('\n').map((l) => l.trim())
      // list detection
      if (lines.every((l) => /^(-|\*|\d+\.)\s+/.test(l))) {
        const isOrdered = /^\d+\./.test(lines[0])
        const items = lines.map((l, i) => {
          const content = l.replace(/^(-|\*|\d+\.)\s+/, '')
          return (
            <li key={i} className="ml-4">
              {renderInline(content)}
            </li>
          )
        })
        out.push(isOrdered ? <ol key={idx} className="list-decimal ml-6">{items}</ol> : <ul key={idx} className="list-disc ml-6">{items}</ul>)
      } else {
        out.push(
          <p key={idx} className="whitespace-pre-wrap">
            {renderInline(p)}
          </p>
        )
      }
    })
    return out
  }

  function formatContent(content: string) {
    if (!content) return null
    const nodes: any[] = []
    const codeBlockRegex = /```([\s\S]*?)```/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const before = content.slice(lastIndex, match.index)
      if (before) nodes.push(...formatNonCode(before))
      nodes.push(
        <pre key={nodes.length} className="bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto text-sm">
          <code>{match[1]}</code>
        </pre>
      )
      lastIndex = match.index + match[0].length
    }
    const rest = content.slice(lastIndex)
    if (rest) nodes.push(...formatNonCode(rest))
    return nodes
  }
  const [chats, setChats] = useState<any[]>([])
  const [currentChat, setCurrentChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  async function loadChats() {
    const res = await fetch("/api/chat/list")
    const data = await res.json()
    setChats(data.chats)
  }

  async function newChat() {
    const res = await fetch("/api/chat/create", { method: "POST" })
    const data = await res.json()
    setCurrentChat(data.chat)
    setMessages([])
    loadChats()
  }

  async function loadMessages(chatId: string) {
    const res = await fetch("/api/chat/messages", { method: "POST", body: JSON.stringify({ chatId }) })
    const data = await res.json()
    setMessages(data.messages)
  }

  async function sendMessage() {
    if (!input || !currentChat) return
    setSending(true)
    const userMsg = { role: "user", content: input }
    const toSend = [...messages, userMsg]
    setMessages((prev) => [...prev, userMsg])
    const text = input
    setInput("")

    // save user msg
    await fetch("/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: currentChat.id, role: "user", content: text }),
    })

    // send to AI (include system tool-enabled prompt)
    const systemPrompt = `You are an AI assistant managing content tasks. RULES:
+ NEVER ask for projectId
+ ALWAYS use provided projectId automatically
+ When user asks to create posts → create tasks using tools
+ Do NOT generate text posts unless explicitly asked
+ If user asks to "create posts" → create tasks, not content.`

    // attempt to pick up project context from the page URL (query param `projectId`)
    const currentProjectId = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("projectId") : null

    // send to AI (pass system as top-level field and include projectId)
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system: systemPrompt, messages: toSend, projectId: currentProjectId }),
    })
    const data = await res.json()
    const aiMsg = { role: "assistant", content: data.reply }
    setMessages((prev) => [...prev, aiMsg])

    // save AI msg
    await fetch("/api/chat/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId: currentChat.id, role: "assistant", content: data.reply }),
    })
    setSending(false)
  }

  useEffect(() => {
    loadChats()
  }, [])

  // scroll to bottom when messages change
  useEffect(() => {
    const el = messagesRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  // focus input when a chat is selected
  useEffect(() => {
    inputRef.current?.focus()
  }, [currentChat])

  return (
    <>
      {/* Sidebar */}
      <div className="w-64 border-r p-4 space-y-4 flex flex-col">
        <BackButton />

        <div className="flex items-center gap-2">
          <button onClick={newChat} className="flex-1 bg-black text-white p-2 rounded">+ New Chat</button>
        </div>

        <div className="mt-2 text-sm text-gray-500">Recent chats</div>
        <div className="mt-2 overflow-y-auto flex-1 space-y-2">
          {chats.length === 0 && <div className="text-sm text-gray-500">No chats yet</div>}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                setCurrentChat(chat)
                loadMessages(chat.id)
              }}
              className={`p-2 border rounded cursor-pointer ${currentChat?.id === chat.id ? "bg-gray-100 dark:bg-gray-800" : "hover:bg-gray-50"}`}>
              <div className="text-sm font-medium">Chat {chat.id?.slice?.(0, 5)}</div>
              <div className="text-xs text-gray-500">{chat.preview ?? ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 flex flex-col relative">
        <div ref={messagesRef} className="flex-1 overflow-y-auto space-y-4 pb-28">
          {messages.length === 0 && <div className="text-sm text-gray-500">No messages yet</div>}
          {messages.map((m, i) => {
            const isAssistant = m.role === "assistant"
            return (
              <div key={i} className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                {isAssistant && (
                  <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">A</div>
                )}

                <div className={`max-w-[75%] p-3 rounded-lg ${isAssistant ? 'bg-gray-50 dark:bg-gray-900 border' : 'bg-black text-white'}`}>
                  <div className="text-xs text-gray-500 mb-1 capitalize">{isAssistant ? 'Assistant' : 'You'}</div>
                  <div className="text-sm leading-relaxed">{isAssistant ? formatContent(m.content) : <span className="whitespace-pre-wrap">{m.content}</span>}</div>
                </div>

                {!isAssistant && (
                  <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium">You</div>
                )}
              </div>
            )
          })}
        </div>
        <div className="sticky bottom-4">
          <div className="bg-white/90 dark:bg-black/80 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentChat ? "Type a message... (Enter to send)" : "Select or create a chat to start"}
                className="flex-1 border p-2 rounded-md resize-none min-h-[48px] max-h-36"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input || !currentChat || sending}
                className={`px-4 py-2 rounded-md ${!input || !currentChat ? "bg-gray-300 text-gray-600" : sending ? "bg-gray-800 text-white/80" : "bg-black text-white"}`}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
