import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  const user = await prisma.user.findUnique({ where: { id: token } })
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
  return user
}
