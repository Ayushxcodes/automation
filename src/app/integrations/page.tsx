"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function IntegrationsPage() {

  const [connected, setConnected] = useState<string[]>([])

  async function fetchIntegrations() {

    const res = await fetch("/api/integrations/list")
    const data = await res.json()

    if (data.success) {
      // prefer server-provided connected types (only when accessToken exists)
      const types = data.connectedTypes ?? data.integrations.map((i:any)=>i.type)
      setConnected(types)
    }

  }

  useEffect(()=>{
    fetchIntegrations()
  },[])

  async function connect(type: string) {

    if (type === 'gmail') {
      // redirect user to Google OAuth connect
      window.location.href = '/api/google/connect'
      return
    }

    await fetch("/api/integrations/connect", {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({ type })

    })

    fetchIntegrations()

  }

  async function disconnect(type: string) {
    try {
      const res = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      if (data?.success) {
        fetchIntegrations()
      } else {
        console.error('Failed to disconnect', data)
        alert('Disconnect failed')
      }
    } catch (err) {
      console.error(err)
      alert('Disconnect failed')
    }
  }

  function isConnected(type:string){
    return connected.includes(type)
  }

  return (

    <div className="p-6 grid grid-cols-3 gap-6">

      {["gmail","whatsapp","claude"].map((type)=>(
        
        <Card key={type}>
          <CardContent className="p-4 space-y-4">

            <h2 className="capitalize">{type}</h2>

            <p>
              {isConnected(type) ? "✅ Connected" : "❌ Not Connected"}
            </p>

            <div className="flex gap-2">
              <Button
                disabled={isConnected(type)}
                onClick={()=>connect(type)}
              >
                {isConnected(type) ? "Connected" : "Connect"}
              </Button>
              {isConnected(type) && (
                <Button variant="ghost" onClick={() => disconnect(type)}>Disconnect</Button>
              )}
              {type === 'gmail' && (
                <>
                  <Button onClick={() => { window.location.href = '/api/google/connect' }} variant="ghost">Connect Gmail</Button>
                  <Button onClick={async () => { const res = await fetch('/api/google/fetch'); const data = await res.json(); if (data?.success) { alert('Fetched emails') ; fetchIntegrations() } else { alert('Fetch failed') } }}>Fetch Emails</Button>
                </>
              )}
            </div>

          </CardContent>
        </Card>

      ))}

    </div>

  )
}