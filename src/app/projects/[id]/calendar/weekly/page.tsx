"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CaretLeft, CaretRight, Calendar as CalendarIcon } from "@phosphor-icons/react"

export default function WeeklyView() {
  const params = useParams()
  const id = params?.id
  const [tasks, setTasks] = useState<any[]>([])
  const [draggedTask, setDraggedTask] = useState<any>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  async function fetchTasks() {
    if (!id) return
    const res = await fetch(`/api/tasks/list?projectId=${id}`)
    const data = await res.json()
    if (data.success) {
      setTasks(data.tasks)
    }
  }

  useEffect(()=>{ fetchTasks() },[id])

  // 🔥 Get week range (Mon → Sun)
  function getWeekDates(date: Date) {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    const week = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      week.push(d)
    }
    return week
  }

  const weekDates = getWeekDates(currentDate)

  // 🔥 Filter tasks per day
  function getTasksForDate(date: Date) {
    return tasks.filter(t => {
      if (!t.publishDate) return false
      const d = new Date(t.publishDate)
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      )
    })
  }

  // 🔥 Navigation
  function nextWeek() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 7)
    setCurrentDate(d)
  }

  function prevWeek() {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 7)
    setCurrentDate(d)
  }

  async function handleDrop(date: Date) {
    if (!draggedTask) return
    try {
      const res = await fetch("/api/tasks/update", {
        method: "POST",
        credentials: 'same-origin',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: draggedTask.id, publishDate: date.toISOString() })
      })
      const data = await res.json()
      if (data.success) {
        setDraggedTask(null)
        fetchTasks()
      } else {
        // eslint-disable-next-line no-console
        console.error('Failed to move task', data)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error while dropping task', e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Weekly Planner</h1>
                <p className="text-gray-600 text-sm">Plan and organize your content schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={id ? `/projects/${id}/calendar` : '#'}>
                <Button variant="outline">
                  Monthly View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <CaretLeft className="w-4 h-4 mr-1" />
              Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              Next Week
              <CaretRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-4">
          {weekDates.map((date, i) => {
            const dayTasks = getTasksForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

            return (
              <Card
                key={i}
                className={`min-h-[400px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-sm">
                    <div className="text-gray-500">{dayName}</div>
                    <div className={`text-xl ${isToday ? 'text-blue-600 font-bold' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnter={(e) => e.currentTarget.classList.add("bg-blue-50")}
                  onDragLeave={(e) => e.currentTarget.classList.remove("bg-blue-50")}
                  onDrop={(e) => {
                    e.currentTarget.classList.remove("bg-blue-50")
                    handleDrop(date)
                  }}
                  className="space-y-2 min-h-[300px] cursor-pointer transition-colors"
                >
                  {dayTasks.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                      No tasks scheduled
                    </div>
                  ) : (
                    dayTasks.map(t => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={() => setDraggedTask(t)}
                        onDragEnd={() => setDraggedTask(null)}
                        className={`bg-white p-3 rounded-lg border shadow-sm text-xs cursor-move transition-all hover:shadow-md ${
                          draggedTask?.id === t.id ? 'opacity-50 border-dashed border-blue-300' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 mb-1">{t.title}</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {t.platform && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {t.platform}
                            </span>
                          )}
                          {t.format && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                              {t.format}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                          {t.status}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
