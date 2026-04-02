"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import Link from "next/link"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // 👇 PUT FUNCTION HERE
  async function login() {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json().catch(() => ({ success: false, error: 'Login failed' }))

      if (data && data.success) {
        toast.success('Logged in successfully')
        router.push("/dashboard")
      } else {
        toast.error(data?.error || 'Login failed')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4 w-80">

        <h1 className="text-2xl font-bold text-center">Automation Dashboard</h1>
        <p className="text-sm text-gray-500 text-center">Sign in to continue to your Automation Dashboard</p>

        <input
          placeholder="email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80"
        />

        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-xs dark:bg-input/30 dark:disabled:bg-input/80"
        />

        <Button
          onClick={login}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Login'}
        </Button>

        <div className="text-center text-sm text-gray-600">
          No account? <Link href="/register" className="text-blue-600 underline">Register</Link>
        </div>

      </div>

    </div>

  )
}