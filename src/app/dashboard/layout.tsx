import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const token = (await cookies()).get("token")?.value

  if (!token) {
    redirect("/login")
  }
  return (
    <div className="flex min-h-screen">
      
      <aside className="w-64 border-r p-4 space-y-4">
        <h2 className="font-bold text-lg">Automation Dashboard</h2>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/automations">Automations</Link>
          <Link href="/projects">Projects</Link>
        </nav>

      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}