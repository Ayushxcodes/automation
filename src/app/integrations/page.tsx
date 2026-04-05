"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
export default function IntegrationsPage() {

  const [connected, setConnected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  async function fetchIntegrations() {
    try {
      setLoading(true)
      const res = await fetch("/api/integrations/list")
      const data = await res.json()

      if (data.success) {
        const types = data.connectedTypes ?? data.integrations.map((i:any)=>i.type)
        setConnected(types)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchIntegrations()
  },[])

  async function connect(type: string) {
    try {
      setActionLoading(s => ({ ...s, [type]: true }))

      if (type === 'gmail') {
        window.location.href = '/api/google/connect'
        return
      }

      const res = await fetch("/api/integrations/connect", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      if (!data?.success) alert('Connect failed')
      await fetchIntegrations()
    } catch (e) {
      console.error(e)
      alert('Connect failed')
    } finally {
      setActionLoading(s => ({ ...s, [type]: false }))
    }
  }

  async function disconnect(type: string) {
    try {
      setActionLoading(s => ({ ...s, [type]: true }))
      const res = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      if (data?.success) {
        await fetchIntegrations()
      } else {
        console.error('Failed to disconnect', data)
        alert('Disconnect failed')
      }
    } catch (err) {
      console.error(err)
      alert('Disconnect failed')
    } finally {
      setActionLoading(s => ({ ...s, [type]: false }))
    }
  }

  function isConnected(type:string){
    return connected.includes(type)
  }

  const services = [
    { key: 'gmail', name: 'Gmail', desc: 'Connect your Google account to fetch emails and send notifications.' },
    { key: 'whatsapp', name: 'WhatsApp', desc: 'Send notifications to WhatsApp users via a gateway.' },
    { key: 'claude', name: 'Anthropic Claude', desc: 'Use Claude for assistant and automation tasks.' },
  ]

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-sm text-gray-600">Connect external services to power automations and alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchIntegrations} className="text-sm bg-white border px-3 py-1 rounded hover:bg-gray-50">{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <Card key={s.key}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl font-semibold text-gray-700">{s.name[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{s.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${isConnected(s.key) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {isConnected(s.key) ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{s.desc}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={() => connect(s.key)} disabled={isConnected(s.key) || !!actionLoading[s.key]}>
                      {actionLoading[s.key] ? 'Working...' : isConnected(s.key) ? 'Connected' : 'Connect'}
                    </Button>

                    {isConnected(s.key) && (
                      <Button variant="ghost" onClick={() => disconnect(s.key)} disabled={!!actionLoading[s.key]}>Disconnect</Button>
                    )}

                    {s.key === 'gmail' && (
                      <>
                        <Button variant="ghost" onClick={() => { window.location.href = '/api/google/connect' }}>Connect Gmail</Button>
                        <Button onClick={async () => { setActionLoading(a=>({...a, fetch: true})); const res = await fetch('/api/google/fetch'); const data = await res.json(); setActionLoading(a=>({...a, fetch: false})); if (data?.success) { alert('Fetched emails'); fetchIntegrations() } else { alert('Fetch failed') } }}>Fetch Emails</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
