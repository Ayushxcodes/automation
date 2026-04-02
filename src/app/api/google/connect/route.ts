import { NextResponse } from "next/server"
import { oauth2Client } from "@/lib/google"

export async function GET() {

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"]
  })

  return NextResponse.redirect(url)
}