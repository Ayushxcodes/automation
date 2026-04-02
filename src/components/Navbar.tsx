"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar(){
  const [user, setUser] = useState<{id:number,email:string}|null>(null)
  const pathname = usePathname()


  useEffect(()=>{
    let mounted = true
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r=>r.json())
      .then(data=>{ if (mounted) setUser(data.user) })
      .catch(()=>{})
    return ()=>{ mounted = false }
  },[pathname])

  const router = useRouter()

  async function logout(){
    await fetch('/api/auth/logout',{ method: 'POST' })
    // SPA navigation so app state updates without full reload
    router.push('/login')
  }

  return (
    <header className="w-full border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold">Automation</Link>
        {user ? (
          <nav className="hidden md:flex gap-3 text-sm">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/integrations">Integrations</Link>
          </nav>
        ) : null}
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.email}</span>
            <button onClick={logout} className="text-sm text-red-600">Logout</button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="text-sm">Login</Link>
            <Link href="/register" className="text-sm">Register</Link>
          </div>
        )}
      </div>
    </header>
  )
}
