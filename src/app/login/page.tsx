"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // 👇 PUT FUNCTION HERE
  async function login() {

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    })

    if (res.ok) {
      router.push("/dashboard")
    } else {
      const data = await res.json().catch(()=>({ error: 'Login failed' }))
      alert(data.error || 'Login failed')
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

        <Button
          onClick={login}
          className="w-full"
        >
          Login
        </Button>

        <div className="text-center text-sm text-gray-600">
          No account? <Link href="/register" className="text-blue-600 underline">Register</Link>
        </div>

      </div>

    </div>

  )
}