import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST() {

  try {

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json({ success:false })
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    )

    const userId = decoded.userId

    // get all automations
    const automations = await prisma.automation.findMany({
      where: { userId }
    })

    for (const auto of automations) {

      console.log("Running automation:")
      console.log("Trigger:", auto.trigger)
      console.log("Action:", auto.action)

      // simulate execution
      if (auto.trigger === "new email") {

        console.log("📧 New email detected")

        if (auto.action === "send whatsapp") {
          console.log("📲 Sending WhatsApp message...")
        }

      }

    }

    return NextResponse.json({
      success:true
    })

  }

  catch {

    return NextResponse.json({
      success:false
    })

  }

}