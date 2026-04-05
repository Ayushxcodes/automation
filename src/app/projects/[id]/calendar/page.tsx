"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Calendar as CalendarIcon, CheckCircle, Clock, FilmReel } from "@phosphor-icons/react"

export default function CalendarPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [platform, setPlatform] = useState("")
  const [format, setFormat] = useState("")
  const params = useParams()
  const id = params?.id

  // 🔹 Fetch tasks
  async function fetchTasks() {
    if (!id) return
    const res = await fetch(`/api/tasks/list?projectId=${id}`)
    const data = await res.json()
    if (data.success) {
      setTasks(data.tasks)
    }
  }

  useEffect(()=>{ fetchTasks() },[id])

  // 🔹 Tasks for selected date
  const filtered = tasks.filter(t => {
    if (!t.publishDate) return false
    const d = new Date(t.publishDate)
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    )
  })

  // Create task API
  async function createTask() {
    if (!title || !selectedDate || !id) return
    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, projectId: id, publishDate: selectedDate, platform, format })
      })
      const data = await res.json()
      if (data?.success) {
        setShowModal(false)
        setTitle("")
        setPlatform("")
        setFormat("")
        fetchTasks()
      }
    } catch (err) {
      console.error('createTask error', err)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'edited': return <Clock className="w-4 h-4 text-orange-500" />
      case 'filmed': return <FilmReel className="w-4 h-4 text-blue-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <style jsx>{`
        .calendar-container .react-calendar {
          width: 100%;
          max-width: none;
          background: white;
          border: none;
          border-radius: 8px;
          font-family: inherit;
        }
        .calendar-container .react-calendar__tile {
          padding: 8px;
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .calendar-container .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white !important;
        }
        .calendar-container .react-calendar__tile:hover {
          background: #f3f4f6;
        }
        .calendar-container .react-calendar__month-view__days__day--weekend {
          color: #ef4444;
        }
        .calendar-container .react-calendar__navigation {
          margin-bottom: 1rem;
        }
        .calendar-container .react-calendar__navigation button {
          color: #374151;
          font-weight: 600;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
                <p className="text-gray-600 mt-1">Schedule and manage your content workflow</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={id ? `/projects/${id}/calendar/weekly` : '#'}>
                <Button variant="outline">
                  Weekly View
                </Button>
              </Link>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="calendar-container">
                  <Calendar
                    onChange={(value: any) => setSelectedDate(value)}
                    value={selectedDate}
                    tileContent={({ date }) => {
                      const hasTask = tasks.some(t => {
                        if (!t.publishDate) return false
                        const d = new Date(t.publishDate)
                        return (
                          d.getDate() === date.getDate() &&
                          d.getMonth() === date.getMonth() &&
                          d.getFullYear() === date.getFullYear()
                        )
                      })
                      return hasTask ? (
                        <div className="flex justify-center mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      ) : null
                    }}
                    className="w-full border-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No content scheduled for this date</p>
                    <Button
                      onClick={() => setShowModal(true)}
                      variant="outline"
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map((t) => (
                      <div key={t.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{t.title}</h3>
                          {getStatusIcon(t.status)}
                        </div>
                        <div className="space-y-2">
                          {t.description && (
                            <p className="text-sm text-gray-600">{t.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {t.platform && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {t.platform}
                              </span>
                            )}
                            {t.format && (
                              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                {t.format}
                              </span>
                            )}
                            {t.topic && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                {t.topic}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Task Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Task
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Schedule content for {selectedDate.toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700">Title *</label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="platform" className="text-sm font-medium text-gray-700">Platform</label>
                  <Input
                    id="platform"
                    placeholder="yt/ig/li/tw"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="format" className="text-sm font-medium text-gray-700">Format</label>
                  <Input
                    id="format"
                    placeholder="reel/post/video"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={createTask} disabled={!title.trim()}>
                    Create Task
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
