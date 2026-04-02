"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'

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
        toast.success("Registration successful — please log in.")
        router.push("/login")
      } else {
        toast.error(data?.error || 'Registration failed')
      }
    } catch (e) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 w-80">

        <h1 className="text-2xl font-bold text-center">Automation Dashboard</h1>
        <p className="text-sm text-gray-500 text-center">Create an account to access your Automation Dashboard</p>

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
