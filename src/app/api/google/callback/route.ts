import { NextResponse } from "next/server"
import { oauth2Client } from "@/lib/google"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import { encryptObj } from "@/lib/crypto"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")

  if (!code) return NextResponse.json({ success:false })

  const { tokens } = await oauth2Client.getToken(code)

  // persist tokens for the authenticated user
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
      const userId = decoded.userId

      // save or update integration record (encrypt tokens at rest)
      const existing = await prisma.integration.findFirst({ where: { userId, type: 'gmail' } })
      const enc = encryptObj(tokens)
      if (existing) {
        await prisma.integration.update({ where: { id: existing.id }, data: { accessToken: enc } })
      } else {
        await prisma.integration.create({ data: { userId, type: 'gmail', accessToken: enc } })
      }
    }
  } catch (err) {
    console.error('Failed to persist google tokens', err)
  }

  oauth2Client.setCredentials(tokens)

  return NextResponse.redirect("http://localhost:3000/automations")
}