"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'

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
      const res = await fetch("/api/automations/run", { method: "POST" })
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
  },[])

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

  return (

    <div className="p-6 space-y-6 max-w-2xl mx-auto">

      <h1 className="text-2xl font-bold">Create Automation</h1>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Trigger</label>
        <Select value={trigger} onValueChange={setTrigger}>
          <SelectTrigger>
            <SelectValue placeholder="Select Trigger" />
          </SelectTrigger>
          <SelectContent>
            {TRIGGERS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="text-sm font-medium">Action (add steps)</label>
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
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2 mt-2">
          {actions.map((act, index) => (
            <div key={index} className="flex items-center justify-between border p-2 rounded">
              <div>Step {index + 1}: {actionLabels[act] ?? act}</div>
              <Button variant="ghost" onClick={() => setActions(prev => prev.filter((_, i) => i !== index))}>Remove</Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={createAutomation}>
          Create
        </Button>

        <Button onClick={runAutomations}>
          Run Automations
        </Button>
      </div>

      <div className="pt-6">
        <h2 className="text-lg font-semibold mb-3">Your Automations</h2>
        {automations.length === 0 && <div className="text-sm text-gray-500">No automations yet</div>}
        <ul className="grid gap-3 mt-2">
          {automations.map((a) => (
            <li key={a.id} className="p-4 border rounded-md flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{triggerLabels[a.trigger] ?? a.trigger}</div>
                <div className="text-sm text-gray-600">
                  {Array.isArray(a.actions) ? (
                    a.actions.map((act: string, i: number) => (
                      <div key={i}>→ {actionLabels[act] ?? act}</div>
                    ))
                  ) : (
                    <div>→ {actionLabels[a.action] ?? a.action}</div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end ml-4">
                <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
                <Button variant="ghost" onClick={() => deleteAutomation(a.id)} className="mt-2">
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <h2 className="text-lg font-semibold mb-3">Automation Logs</h2>
        {logs.length === 0 && <div className="text-sm text-gray-500">No logs yet</div>}
        <ul className="grid gap-3 mt-2">
          {logs.map((l) => (
            <li key={l.id} className="p-4 border rounded-md">
              <div className="text-sm text-gray-500">Automation: {l.automationId} • {new Date(l.createdAt).toLocaleString()}</div>
              <div className="mt-2">
                {renderStructured(l.output)}
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>

  )
}