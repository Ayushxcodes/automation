"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Weekly Planner</h1>

        {/* View switch: Weekly → Monthly */}
        <div className="p-1">
          <Link
            href={id ? `/projects/${id}/calendar` : '#'}
            className="px-3 py-1 border rounded text-sm bg-white"
          >
            Monthly view
          </Link>
        </div>
      </div>

      {/* 🔹 Controls */}
      <div className="flex gap-2">
        <button onClick={prevWeek} className="px-3 py-1 border rounded"> Prev </button>
        <button onClick={nextWeek} className="px-3 py-1 border rounded"> Next </button>
      </div>

      {/* 🔥 Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, i)=>{
          const dayTasks = getTasksForDate(date)
          return (
            <div
              key={i}
              onDragOver={(e)=>e.preventDefault()}
              onDragEnter={(e)=>e.currentTarget.classList.add("bg-blue-100")}
              onDragLeave={(e)=>e.currentTarget.classList.remove("bg-blue-100")}
              onDrop={(e)=>{ e.currentTarget.classList.remove("bg-blue-100"); handleDrop(date) }}
              className="border rounded p-2 min-h-[200px] bg-gray-50 hover:bg-gray-100"
            >
              <p className="text-sm font-semibold"> {date.toDateString().slice(0,10)} </p>

              <div className="space-y-2 mt-2">
                {dayTasks.length === 0 && (
                  <p className="text-xs text-gray-400">No tasks</p>
                )}

                {dayTasks.map(t=>(
                  <div key={t.id} draggable onDragStart={()=>setDraggedTask(t)} onDragEnd={()=>setDraggedTask(null)} className={`bg-white p-2 rounded shadow text-xs cursor-move ${draggedTask?.id === t.id ? 'opacity-70 border-2 border-dashed' : ''}`}>
                    <p className="font-medium">{t.title}</p>
                    <p className="text-gray-500"> {t.platform} • {t.format} </p>
                    <p className="text-[10px]"> {t.status} </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
