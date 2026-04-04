import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export default async function DashboardPage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      // show zeros if not authenticated
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              Connected Accounts
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              Messages Today
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              Active Automations
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
      )
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    // count connected integrations (accessToken present)
    const connectedAccounts = await prisma.integration.count({
      where: {
        userId,
        accessToken: { not: null }
      }
    })

    // count messages created since start of today across user's chats
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)

    const messagesToday = await prisma.message.count({
      where: {
        createdAt: { gte: startOfDay },
        chat: { userId }
      }
    })

    const activeAutomations = await prisma.automation.count({ where: { userId } })

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card>
          <CardContent className="p-4">
            Connected Accounts
            <p className="text-2xl font-bold">{connectedAccounts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            Messages Today
            <p className="text-2xl font-bold">{messagesToday}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            Active Automations
            <p className="text-2xl font-bold">{activeAutomations}</p>
          </CardContent>
        </Card>

      </div>
    )

  } catch (err) {
    // fallback UI on any error
    // eslint-disable-next-line no-console
    console.error('Dashboard stats error', err)
    return (
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            Connected Accounts
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            Messages Today
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            Active Automations
            <p className="text-2xl font-bold">0</p>
          </CardContent>
        </Card>
      </div>
    )
  }
}