"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Chat,
  Lightning,
  FolderOpen,
  CheckSquare,
  ActivityIcon,
  TrendUp
} from "@phosphor-icons/react"

type RecentActivityItem = {
  id: string
  action: string
  createdAt: string
  task?: { title?: string }
}

export default function ClientDashboard({
  connectedAccounts,
  messagesToday,
  activeAutomations,
  totalProjects,
  activeTasks,
  recentActivity,
  completedTasksToday
}: {
  connectedAccounts: number
  messagesToday: number
  activeAutomations: number
  totalProjects: number
  activeTasks: number
  recentActivity: RecentActivityItem[]
  completedTasksToday: number
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your workspace.</p>
        </div>
        <div className="flex gap-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Connected Accounts"
          value={connectedAccounts}
          icon={<Users size={24} />}
          color="blue"
          trend={connectedAccounts > 0 ? "+1" : null}
        />

        <MetricCard
          title="Messages Today"
          value={messagesToday}
          icon={<Chat size={24} />}
          color="green"
          trend={messagesToday > 0 ? `+${messagesToday}` : null}
        />

        <MetricCard
          title="Active Automations"
          value={activeAutomations}
          icon={<Lightning size={24} />}
          color="purple"
          trend={null}
        />

        <MetricCard
          title="Active Tasks"
          value={activeTasks}
          icon={<CheckSquare size={24} />}
          color="orange"
          trend={completedTasksToday > 0 ? `+${completedTasksToday} done` : null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">Total projects in your workspace</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <TrendUp size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasksToday}</div>
            <p className="text-xs text-muted-foreground">Tasks completed today</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
            <ActivityIcon size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(100, Math.round((messagesToday * 10) + (completedTasksToday * 20) + (connectedAccounts * 15)))}
            </div>
            <p className="text-xs text-muted-foreground">Based on today's activity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                      {activity.task && (
                        <span className="text-gray-600"> on "{activity.task.title}"</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ActivityIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Start working on tasks to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, icon, color, trend }: { title: string; value: number; icon: React.ReactNode; color: string; trend: string | null }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]} text-white`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground mt-1">{trend} from yesterday</p>}
      </CardContent>
    </Card>
  )
}
