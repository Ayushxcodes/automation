"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

type Props = {
  global?: boolean
}

export default function BackButton({ global }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // show back button when there is history to go back to
    try {
      setVisible(window.history.length > 1)
    } catch {
      setVisible(false)
    }
  }, [])

  // Hide on dashboard pages
  if (pathname?.startsWith("/dashboard")) return null

  // If this is the global layout instance, hide it on /ai so pages can render a sidebar back button instead
  if (global && pathname?.startsWith("/ai")) return null

  if (!visible) return null

  // reposition on /projects so it doesn't overlap the page header
  // For /ai we render in normal flow (sidebar) so use static positioning
  const positionClass = pathname?.startsWith("/projects")
    ? "absolute left-4 top-60"
    : pathname?.startsWith("/ai")
    ? "static"
    : "absolute left-4 top-4"

  return (
    <button
      onClick={() => router.back()}
      aria-label="Go back"
      className={`${positionClass} z-50 inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white text-sm shadow-sm hover:bg-gray-50`}
    >
      ← Back
    </button>
  )
}
