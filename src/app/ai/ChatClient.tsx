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

    // send to AI
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: toSend }),
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
      <div className="w-64 border-r p-4 space-y-2">
        <BackButton />

        <button onClick={newChat} className="w-full bg-black text-white p-2 rounded">
          + New Chat
        </button>

        {chats.length === 0 && <div className="text-sm text-gray-500">No chats yet</div>}
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              setCurrentChat(chat)
              loadMessages(chat.id)
            }}
            className={`p-2 border rounded cursor-pointer ${currentChat?.id === chat.id ? "bg-gray-100 dark:bg-gray-800" : ""}`}
          >
            Chat {chat.id?.slice?.(0, 5)}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 flex flex-col relative">
        <div ref={messagesRef} className="flex-1 overflow-y-auto space-y-2 pb-28">
          {messages.length === 0 && <div className="text-sm text-gray-500">No messages yet</div>}
          {messages.map((m, i) => {
            const isAssistant = m.role === "assistant"
            return (
              <div
                key={i}
                className={`p-3 rounded ${isAssistant ? "bg-gray-50 dark:bg-gray-900 border" : "bg-white/60 border"}`}
              >
                <div className="flex items-start gap-2">
                  <b className="capitalize mr-2 text-sm text-gray-700 dark:text-gray-300">{m.role}</b>
                  <div className="flex-1 mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {isAssistant ? (
                      <div className="space-y-2">{formatContent(m.content)}</div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="sticky bottom-4">
          <div className="bg-white/80 dark:bg-black/75 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentChat ? "Type a message... (Enter to send, Shift+Enter for newline)" : "Select or create a chat to start"}
                className="flex-1 border p-2 rounded-md resize-none h-12"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input || !currentChat}
                className={`px-4 rounded-md ${!input || !currentChat ? "bg-gray-300 text-gray-600" : "bg-black text-white"}`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
