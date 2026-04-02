"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'

export default function AutomationsPage() {

  const [trigger, setTrigger] = useState("")
  const [action, setAction] = useState("")
  const [automations, setAutomations] = useState<any[]>([])

  async function createAutomation() {

    const res = await fetch("/api/automations/create", {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        trigger,
        action
      })

    })
    const data = await res.json().catch(()=>null)
    if (data?.success) {
      toast.success("Automation created")
      fetchList()
      setTrigger("")
      setAction("")
    } else {
      toast.error("Failed to create automation")
      console.error(data)
    }

  }

  async function runAutomations() {
    try {
      const res = await fetch("/api/automations/run", { method: "POST" })
      const data = await res.json().catch(()=>null)
      if (data?.success) toast.success("Automations executed (check console)")
      else {
        toast.error("Failed to run automations")
        console.error(data)
      }
    } catch (err) {
      toast.error("Failed to run automations")
      console.error(err)
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
  },[])

  return (

    <div className="p-6 space-y-6 max-w-2xl mx-auto">

      <h1 className="text-2xl font-bold">Create Automation</h1>

      <div className="grid gap-2">
        <Input
          className="w-full"
          placeholder="Trigger (e.g. new email)"
          value={trigger}
          onChange={(e)=>setTrigger(e.target.value)}
        />

        <Input
          className="w-full"
          placeholder="Action (e.g. send whatsapp)"
          value={action}
          onChange={(e)=>setAction(e.target.value)}
        />
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
                <div className="font-medium">{a.trigger}</div>
                <div className="text-sm text-gray-600">{a.action}</div>
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

    </div>

  )
}