"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function register() {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json().catch(() => ({ success: false, error: 'Registration failed' }))

      if (data && data.success) {
        alert("Registration successful — please log in.")
        router.push("/login")
      } else {
        alert(data?.error || 'Registration failed')
      }
    } catch (e) {
      alert('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-4 w-80">

        <Input
          placeholder="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <Input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <Button onClick={register} className="w-full" disabled={loading}>{loading ? 'Registering…' : 'Register'}</Button>

      </div>
    </div>
  )
}
