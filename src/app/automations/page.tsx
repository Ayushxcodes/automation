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

    <div className="p-6 space-y-4 w-96">

      <h1>Create Automation</h1>

      <Input
        placeholder="Trigger (e.g. new email)"
        value={trigger}
        onChange={(e)=>setTrigger(e.target.value)}
      />

      <Input
        placeholder="Action (e.g. send whatsapp)"
        value={action}
        onChange={(e)=>setAction(e.target.value)}
      />

      <Button onClick={createAutomation}>
        Create
      </Button>

      <Button onClick={runAutomations}>
        Run Automations
      </Button>

      <div className="pt-4">
        <h2 className="font-semibold mb-2">Your Automations</h2>
        {automations.length === 0 && <div className="text-sm text-muted-foreground">No automations yet</div>}
        <ul className="space-y-2 mt-2">
          {automations.map((a) => (
            <li key={a.id} className="p-3 border rounded">
              <div><strong>Trigger:</strong> {a.trigger}</div>
              <div><strong>Action:</strong> {a.action}</div>
              <div className="text-xs text-gray-500">Created: {new Date(a.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>

    </div>

  )
}