import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      
      <aside className="w-64 border-r p-4 space-y-4">
        <h2 className="font-bold text-lg">Automation Dashboard</h2>

        <nav className="flex flex-col gap-2">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/integrations">Integrations</Link>
          <Link href="/automations">Automations</Link>
        </nav>

      </aside>

      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  )
}