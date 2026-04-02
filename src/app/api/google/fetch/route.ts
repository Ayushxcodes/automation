import { gmail, oauth2Client } from "@/lib/google"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { decryptToObj, encryptObj } from "@/lib/crypto"

export async function GET() {

  try {

    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ success:false }, { status: 401 })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    const integration = await prisma.integration.findFirst({ where: { userId, type: 'gmail' } })
    if (!integration || !integration.accessToken) {
      return NextResponse.json({ success:false, error: 'Not connected' }, { status: 400 })
    }

    // decrypt stored tokens and set credentials
    let tokens: any
    try {
      tokens = decryptToObj(integration.accessToken)
    } catch (err) {
      console.error('Failed to decrypt tokens', err)
      return NextResponse.json({ success: false, error: 'Invalid tokens' }, { status: 500 })
    }

    oauth2Client.setCredentials(tokens)

    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 5 })
    const messages = res.data.messages || []

    for (const msg of messages) {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id! })
      const snippet = full.data.snippet || ''
      await prisma.email.create({ data: { content: snippet, userId } })
    }

    // persist refreshed tokens (if Google client refreshed them)
    try {
      const current = oauth2Client.credentials
      if (current && JSON.stringify(current) !== JSON.stringify(tokens)) {
        const enc = encryptObj(current)
        await prisma.integration.update({ where: { id: integration.id }, data: { accessToken: enc } })
      }
    } catch (err) {
      console.error('Failed to persist refreshed tokens', err)
    }

    return NextResponse.json({ success:true })

  }

  catch (e) {
    console.log(e)
    return NextResponse.json({ success:false })
  }

}