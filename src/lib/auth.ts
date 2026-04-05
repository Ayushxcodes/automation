import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET)
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const payload: any = verifyToken(token)
    const userId = payload.userId ?? payload.id
    if (!userId) return null
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return user
  } catch (e) {
    return null
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || (user.role ?? '').toLowerCase() !== "admin") {
    throw new Error("Unauthorized")
  }
  return user
}