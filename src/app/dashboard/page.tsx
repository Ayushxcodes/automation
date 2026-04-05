
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import dynamic from "next/dynamic"

const ClientDashboard = dynamic(() => import("./ClientDashboard"), { ssr: true })

export default async function DashboardPage() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return <DashboardSkeleton />
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    // Get all dashboard metrics
    const [
      connectedAccounts,
      messagesToday,
      activeAutomations,
      totalProjects,
      activeTasks,
      recentActivity,
      completedTasksToday
    ] = await Promise.all([
      // Connected integrations
      prisma.integration.count({
        where: { userId, accessToken: { not: null } }
      }),

      // Messages today
      prisma.message.count({
        where: {
          createdAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
          chat: { userId }
        }
      }),

      // Active automations
      prisma.automation.count({ where: { userId } }),

      // Total projects
      prisma.project.count({ where: { userId } }),

      // Active tasks (not completed)
      prisma.task.count({
        where: {
          project: { userId },
          status: { not: "completed" }
        }
      }),

      // Recent activity (last 5 activity logs)
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          task: { select: { title: true } },
          user: { select: { email: true } }
        }
      }),

      // Completed tasks today
      prisma.task.count({
        where: {
          project: { userId },
          status: "completed",
          createdAt: { gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) }
        }
      })
    ])

    // Serialize data for passing to a client component
    const serializedRecent = recentActivity.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      task: r.task ? { title: r.task.title } : undefined
    }))

    return (
      <ClientDashboard
        connectedAccounts={connectedAccounts}
        messagesToday={messagesToday}
        activeAutomations={activeAutomations}
        totalProjects={totalProjects}
        activeTasks={activeTasks}
        recentActivity={serializedRecent}
        completedTasksToday={completedTasksToday}
      />
    )

  } catch (err) {
    console.error('Dashboard stats error', err)
    return <DashboardSkeleton />
  }
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}