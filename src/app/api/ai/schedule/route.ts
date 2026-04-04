import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function getBestTime(task: any, date: Date) {
  const platform = (task.platform || "").toLowerCase()
  const d = new Date(date)
  if (platform === "ig") {
    d.setHours(19, 0, 0) // 7 PM
  } else if (platform === "li") {
    d.setHours(9, 0, 0) // 9 AM
  } else if (platform === "yt") {
    d.setHours(11, 0, 0) // 11 AM
  } else if (platform === "tw") {
    d.setHours(12, 0, 0) // noon for high-frequency
  } else {
    d.setHours(12, 0, 0)
  }
  return d
}

export async function POST(req: Request) {
  try {
    const { projectId, userId } = await req.json()

    const tasks = await prisma.task.findMany({ where: { projectId, publishDate: null } })

    if (tasks.length === 0) {
      return NextResponse.json({ success: false, error: "No unscheduled tasks" })
    }

    let currentDate = new Date()
    const updatedTasks: any[] = []

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]

      const platform = (task.platform || "").toLowerCase()
      let assignedDate = new Date(currentDate)

      // Platform-specific day selection
      if (platform === "yt") {
        // weekends only
        while (![0, 6].includes(assignedDate.getDay())) {
          assignedDate.setDate(assignedDate.getDate() + 1)
        }
      } else if (platform === "li") {
        // weekdays only
        while ([0, 6].includes(assignedDate.getDay())) {
          assignedDate.setDate(assignedDate.getDate() + 1)
        }
      } else if (platform === "ig") {
        // avoid weekends (Sat=6, Sun=0)
        while ([0, 6].includes(assignedDate.getDay())) {
          assignedDate.setDate(assignedDate.getDate() + 1)
        }
      }

      // Set best time for platform
      assignedDate = getBestTime(task, assignedDate)

      // Overload protection: max 3 posts per day
      const dayStart = new Date(assignedDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(assignedDate)
      dayEnd.setHours(23, 59, 59, 999)

      const count = await prisma.task.count({ where: { publishDate: { gte: dayStart, lte: dayEnd } } })
      if (count >= 3) {
        // move forward and retry this task
        currentDate.setDate(currentDate.getDate() + 1)
        i--
        continue
      }

      const updated = await prisma.task.update({ where: { id: task.id }, data: { publishDate: assignedDate } })
      updatedTasks.push(updated)

      // Log AI decision if a userId is provided
      if (userId) {
        try {
          await prisma.activityLog.create({
            data: {
              action: "AI_SCHEDULED",
              details: `Scheduled on ${assignedDate.toISOString()} (${platform})`,
              userId,
              taskId: task.id
            }
          })
        } catch (e) {
          // logging failure should not block scheduling
        }
      }

      // Move forward one day after scheduling
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({ success: true, count: updatedTasks.length })
  } catch (e) {
    return NextResponse.json({ success: false })
  }
}
