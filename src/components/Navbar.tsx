"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar(){
  const [user, setUser] = useState<{id:number,email:string,role?:string}|null>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const parts = pathname?.split('/').filter(Boolean) || []
  const projectId = parts[0] === 'projects' && parts[1] ? parts[1] : null


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

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/integrations', label: 'Integrations' },
    { href: projectId ? `/projects/${projectId}/calendar` : '/projects', label: projectId ? 'Calendar' : 'Projects' },
  ]

  const initials = (user?.email || 'U').split('@')[0].slice(0,2).toUpperCase()

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg">Automation</Link>

            {user && (
              <nav className="hidden md:flex gap-2 text-sm items-center">
                {links.map(l => {
                  const active = pathname === l.href || pathname?.startsWith(l.href + '/')
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={`px-3 py-2 rounded-md transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      {l.label}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <div className="text-sm text-right">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">{initials}</div>
                  <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="text-sm">Login</Link>
                  <Link href="/register" className="text-sm">Register</Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
              onClick={()=>setOpen(v=>!v)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            </button>
          </div>
        </div>

        {open && (
            <div className="md:hidden py-2">
            <nav className="flex flex-col gap-1">
              {user && links.map(l => (
                <Link key={l.href} href={l.href} className="px-3 py-2 rounded hover:bg-gray-100">{l.label}</Link>
              ))}
              <div className="pt-2">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{user.email}</div>
                      <div className="text-xs text-gray-500">{user.role}</div>
                    </div>
                    <button onClick={logout} className="text-sm text-red-600">Logout</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Link href="/login" className="text-sm">Login</Link>
                    <Link href="/register" className="text-sm">Register</Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
