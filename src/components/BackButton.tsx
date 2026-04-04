"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function BackButton() {
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

  if (!visible) return null

  // reposition on /projects so it doesn't overlap the page header
  const positionClass = pathname?.startsWith("/projects")
    ? "absolute left-4 top-60"
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
