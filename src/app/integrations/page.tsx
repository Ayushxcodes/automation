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
      const types = data.integrations.map((i:any)=>i.type)
      setConnected(types)
    }

  }

  useEffect(()=>{
    fetchIntegrations()
  },[])

  async function connect(type: string) {

    await fetch("/api/integrations/connect", {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body: JSON.stringify({ type })

    })

    fetchIntegrations()

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

            <Button
              disabled={isConnected(type)}
              onClick={()=>connect(type)}
            >
              {isConnected(type) ? "Connected" : "Connect"}
            </Button>

          </CardContent>
        </Card>

      ))}

    </div>

  )
}