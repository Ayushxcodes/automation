"use client"

import { useEffect, useState } from "react"
import BackButton from "../../components/BackButton"

export default function ChatClient() {
  const [chats, setChats] = useState<any[]>([])
  const [currentChat, setCurrentChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState("")

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
      body: JSON.stringify({ messages: [...messages, userMsg] }),
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

  return (
    <>
      {/* Sidebar */}
      <div className="w-64 border-r p-4 space-y-2">
        <BackButton />

        <button onClick={newChat} className="w-full bg-black text-white p-2 rounded">
          + New Chat
        </button>

        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              setCurrentChat(chat)
              loadMessages(chat.id)
            }}
            className="p-2 border rounded cursor-pointer"
          >
            Chat {chat.id?.slice?.(0, 5)}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 flex flex-col relative">
        <div className="flex-1 overflow-y-auto space-y-2 pb-28">
          {messages.map((m, i) => (
            <div key={i} className="border p-2 rounded">
              <b>{m.role}</b>: {m.content}
            </div>
          ))}
        </div>
        <div className="sticky bottom-4">
          <div className="bg-white/80 dark:bg-black/75 backdrop-blur-sm border rounded-lg p-3 shadow-sm">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border p-2 rounded-md"
              />
              <button onClick={sendMessage} className="bg-black text-white px-4 rounded-md">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
