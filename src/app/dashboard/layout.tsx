import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const initials = (user?.email || 'U').split('@')[0].slice(0,2).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="w-72 border-r p-6 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-medium">{initials}</div>
            <div>
              <div className="text-sm font-medium">{user?.email}</div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
          </div>

          <h2 className="font-bold text-lg mb-4">Workspace</h2>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">Overview</Link>
            <Link href="/projects" className="px-3 py-2 rounded hover:bg-gray-100">Projects</Link>
            <Link href="/automations" className="px-3 py-2 rounded hover:bg-gray-100">Automations</Link>
            <Link href="/integrations" className="px-3 py-2 rounded hover:bg-gray-100">Integrations</Link>
            <Link href="/ai" className="px-3 py-2 rounded hover:bg-gray-100">AI Assistant</Link>
          </nav>

          {user?.role === 'ADMIN' && (
            <div className="mt-6">
              <Link href="/projects/create" className="inline-block bg-indigo-600 text-white px-3 py-2 rounded text-sm shadow">Create Project</Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-sm text-red-600 hover:underline">Sign out</button>
            </form>
          </div>
        </aside>

        <main className="flex-1 p-6 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}