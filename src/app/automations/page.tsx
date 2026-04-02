"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AutomationsPage() {

  const [trigger, setTrigger] = useState("")
  const [action, setAction] = useState("")

  async function createAutomation() {

    await fetch("/api/automations/create", {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({
        trigger,
        action
      })

    })

    alert("Automation created")

  }

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

    </div>

  )
}