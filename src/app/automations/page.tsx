"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from 'sonner'
import { Lightning, Mailbox, Chat, Robot, Play, Trash, Clock, Plus, Gear } from "@phosphor-icons/react"

export default function AutomationsPage() {

  const TRIGGERS = [
    { label: "New Email", value: "new_email" },
    { label: "New Message", value: "new_message" },
  ]

  const ACTIONS = [
    { label: "Summarize with AI", value: "summarize" },
    { label: "Generate Reply", value: "generate_reply" },
    { label: "Extract Tasks", value: "extract_tasks" },
  ]

  const triggerLabels: any = {
    new_email: "New Email",
    "new email": "New Email",
    new_message: "New Message",
  }

  const actionLabels: any = {
    summarize: "Summarize",
    generate_reply: "Generate Reply",
    extract_tasks: "Extract Tasks",
    "send whatsapp": "Send WhatsApp",
  }

  const [trigger, setTrigger] = useState("new_email")
  const [actions, setActions] = useState<string[]>([])
  const [automations, setAutomations] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [input, setInput] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [emails, setEmails] = useState<any[]>([])

  async function createAutomation() {

    const res = await fetch("/api/automations/create", {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        trigger,
        actions
      })

    })
    const data = await res.json().catch(()=>null)
      if (data?.success) {
      toast.success("Automation created")
      fetchList()
        fetchLogs()
      setTrigger("new_email")
      setActions([])
    } else {
      toast.error("Failed to create automation")
      console.error(data)
    }

  }

  async function runAutomations() {
    try {
      const res = await fetch("/api/automations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input })
      })
      const data = await res.json().catch(()=>null)
      if (data?.success) {
        toast.success(`Automations executed — ${data.logsCreated ?? 0} logs`)
        fetchLogs()
      }
      else {
        const msg = data?.error || JSON.stringify(data)
        toast.error(msg || "Failed to run automations")
        console.error('Run automations failed:', data)
      }
    } catch (err) {
      toast.error("Failed to run automations")
      console.error(err)
    }
  }

  async function createEmail() {
    if (!input) {
      toast.error('Paste email content first')
      return
    }
    try {
      const res = await fetch('/api/email/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input })
      })
      const data = await res.json().catch(()=>null)
      if (data?.success) {
        toast.success('Email saved')
        fetchEmails()
        setInput('')
      } else {
        toast.error('Failed to save email')
        console.error('createEmail failed', data)
      }
    } catch (err) {
      toast.error('Failed to save email')
      console.error(err)
    }
  }

  async function fetchEmails() {
    try {
      const res = await fetch('/api/email/list')
      const data = await res.json().catch(()=>null)
      if (data?.success) setEmails(data.emails ?? [])
      else console.error('Failed to fetch emails', data)
    } catch (err) {
      console.error('Error fetching emails', err)
    }
  }

  async function runEmailOnAll(email: any) {
    try {
      const res = await fetch('/api/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: email.content })
      })
      const data = await res.json().catch(()=>null)
      if (data?.success) {
        toast.success(`Automations executed — ${data.logsCreated ?? 0} logs`)
        fetchLogs()
      } else {
        toast.error('Failed to run automations on email')
        console.error('runEmailOnAll failed', data)
      }
    } catch (err) {
      toast.error('Failed to run automations on email')
      console.error(err)
    }
  }

  async function fetchLogs() {
    try {
      const res = await fetch('/api/automations/logs')
      const data = await res.json().catch(()=>null)
      if (data?.success) setLogs(data.logs ?? [])
      else console.error('Failed to fetch logs', data)
    } catch (err) {
      console.error('Error fetching logs', err)
    }
  }

  async function runSingle(id: string) {
    if (!input) {
      toast.error('Paste input before running')
      return
    }
    try {
      setLoadingId(id)
      const res = await fetch(`/api/automations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, automationId: id })
      })
      const data = await res.json().catch(()=>null)
      if (data?.success) {
        toast.success('Automation executed')
        fetchLogs()
      } else {
        toast.error(data?.error || 'Failed to run automation')
        console.error('runSingle failed', data)
      }
    } catch (err) {
      toast.error('Failed to run automation')
      console.error(err)
    } finally {
      setLoadingId(null)
    }
  }

  async function deleteAutomation(id: string) {
    if (!id) {
      toast.error('Invalid automation id')
      console.error('deleteAutomation called with falsy id:', id)
      return
    }

    try {
      const res = await fetch(`/api/automations/delete/${id}`, { method: 'DELETE' })

      let data: any = null
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        try { data = await res.json() } catch (e) { data = null }
      } else {
        try { data = await res.text() } catch (e) { data = null }
      }

      if (res.ok && data?.success !== false) {
        toast.success('Automation deleted')
        fetchList()
      } else {
        const msg = data?.error || data || `Status ${res.status}`
        toast.error('Failed to delete automation')
        console.error('Delete failed:', res.status, msg)
      }
    } catch (err) {
      toast.error('Failed to delete automation')
      console.error(err)
    }
  }

  async function fetchList() {
    try {
      const res = await fetch('/api/automations/list')
      const data = await res.json()
      if (data?.success) setAutomations(data.automations ?? [])
      else {
        console.error('Failed to fetch automations', data)
      }
    } catch (err) {
      console.error('Error fetching automations', err)
    }
  }

  useEffect(()=>{
    fetchList()
    fetchLogs()
    fetchEmails()
  },[])

  function groupedLogs() {
    return logs.reduce((acc: any, log: any) => {
      if (!acc[log.automationId]) acc[log.automationId] = []
      acc[log.automationId].push(log)
      return acc
    }, {})
  }

  function renderStructured(text: string | undefined | null) {
    if (!text) return null
    const lines = text.split(/\r?\n/)
    const elems: any[] = []
    let listBuffer: string[] | null = null

    const flushList = () => {
      if (!listBuffer) return
      elems.push(
        <ul className="pl-5 list-disc my-2" key={elems.length}>
          {listBuffer.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
      listBuffer = null
    }

    for (const raw of lines) {
      const line = raw.trim()
      if (line === "") {
        flushList()
        elems.push(<div key={elems.length} className="my-2" />)
        continue
      }

      if (/^#{1,6}\s+/.test(line)) {
        flushList()
        const level = Math.min(6, line.match(/^#+/)![0].length)
        const content = line.replace(/^#{1,6}\s+/, "")
        const Tag = (`h${Math.max(3, level)}`) as any
        elems.push(<Tag key={elems.length} className="font-semibold">{content}</Tag>)
        continue
      }

      if (/^[-*]\s+/.test(line)) {
        const item = line.replace(/^[-*]\s+/, "")
        listBuffer = listBuffer ?? []
        listBuffer.push(item)
        continue
      }

      if (/^\d+\.\s+/.test(line)) {
        // numbered list - render as bullets for simplicity
        const item = line.replace(/^\d+\.\s+/, "")
        listBuffer = listBuffer ?? []
        listBuffer.push(item)
        continue
      }

      // paragraph line
      flushList()
      elems.push(<p key={elems.length} className="my-1 whitespace-pre-wrap">{line}</p>)
    }

    flushList()

    return <div className="text-sm text-gray-800">{elems}</div>
  }

  const grouped = groupedLogs()

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Lightning className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
              <p className="text-gray-600 text-sm">Create and manage automated workflows</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Automation */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trigger Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Trigger</label>
                  <Select value={trigger} onValueChange={setTrigger}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGERS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            {t.value === 'new_email' ? <Mailbox className="w-4 h-4" /> : <Chat className="w-4 h-4" />}
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Actions</label>
                  <Select onValueChange={(v: string) => {
                    if (!v) return
                    setActions((prev) => [...prev, v])
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIONS.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          <div className="flex items-center gap-2">
                            <Robot className="w-4 h-4" />
                            {a.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Actions */}
                {actions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Selected Actions</label>
                    <div className="space-y-2">
                      {actions.map((act, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Step {index + 1}:</span>
                            <span className="text-sm">{actionLabels[act] ?? act}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActions(prev => prev.filter((_, i) => i !== index))}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Test Input</label>
                  <textarea
                    placeholder="Paste email or message content here to test your automation..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button onClick={createAutomation} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Automation
                  </Button>
                  <Button variant="outline" onClick={createEmail} className="flex items-center gap-2">
                    <Mailbox className="w-4 h-4" />
                    Save as Email
                  </Button>
                  <Button variant="secondary" onClick={runAutomations} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Test All
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Your Automations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="w-5 h-5" />
                  Your Automations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {automations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Robot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No automations created yet</p>
                    <p className="text-sm">Create your first automation above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {automations.map((a) => (
                      <div key={a.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {a.trigger === 'new_email' ? <Mailbox className="w-4 h-4 text-blue-500" /> : <Chat className="w-4 h-4 text-green-500" />}
                              <span className="font-medium">{triggerLabels[a.trigger] ?? a.trigger}</span>
                            </div>
                            <div className="space-y-1">
                              {Array.isArray(a.actions) ? (
                                a.actions.map((act: string, i: number) => (
                                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    {actionLabels[act] ?? act}
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                  {actionLabels[(a as any).action] ?? (a as any).action}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-gray-500">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={!input || loadingId === a.id}
                                onClick={() => runSingle(a.id)}
                              >
                                {loadingId === a.id ? (
                                  <>
                                    <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                                    Running...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Test
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAutomation(a.id)}
                              >
                                <Trash className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Logs */}
                        <div className="border-t pt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Recent Logs</span>
                          </div>
                          {(!grouped[a.id] || grouped[a.id].length === 0) ? (
                            <p className="text-sm text-gray-500">No execution logs yet</p>
                          ) : (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {grouped[a.id]?.slice(0, 3).map((log: any) => (
                                <div key={log.id} className="bg-gray-50 p-3 rounded text-sm">
                                  <div className="text-xs text-gray-500 mb-1">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </div>
                                  <div className="whitespace-pre-wrap text-gray-800">
                                    {renderStructured(log.output)}
                                  </div>
                                </div>
                              ))}
                              {grouped[a.id]?.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{grouped[a.id].length - 3} more logs...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inbox Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mailbox className="w-5 h-5" />
                  Inbox
                </CardTitle>
              </CardHeader>
              <CardContent>
                {emails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mailbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No saved emails</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {emails.map((e) => (
                      <div key={e.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-xs text-gray-500">
                            {new Date(e.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInput(e.content)}
                              className="h-6 px-2 text-xs"
                            >
                              Use
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => runEmailOnAll(e)}
                              className="h-6 px-2 text-xs"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 line-clamp-3">
                          {e.content.length > 100 ? `${e.content.substring(0, 100)}...` : e.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}