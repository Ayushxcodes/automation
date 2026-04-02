import { google } from "googleapis"

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/google/callback"
)

export const gmail = google.gmail({ version: "v1", auth: oauth2Client })