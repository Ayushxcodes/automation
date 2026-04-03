"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

export default function CalendarPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showPopup, setShowPopup] = useState(false)
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null)
  const popupRef = useRef<HTMLDivElement | null>(null)
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

  // close popup when clicking outside
  useEffect(()=>{
    function onDocClick(e: MouseEvent) {
      if (!popupRef.current) return
      if (!(e.target instanceof Node)) return
      if (!popupRef.current.contains(e.target as Node)) {
        setShowPopup(false)
      }
    }
    if (showPopup) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  },[showPopup])

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

  return (
    <div className="h-screen w-screen bg-gray-50">
      <div className="h-full w-full flex items-stretch justify-start p-0">
        <div className="w-full h-full max-w-none overflow-auto">
          <div className="h-full w-full" style={{ width: '100%' }}>
            <div className="w-full h-full" style={{ maxWidth: '100%' }}>
              <Calendar
                className="w-full h-full"
                style={{ width: '100%', maxWidth: 'none', height: '100%' }}
                onChange={(value:any)=>setSelectedDate(value)}
                onClickDay={(value:any, e:any) => {
                  setSelectedDate(value)
                  const x = e?.clientX ?? window.innerWidth/2
                  const y = e?.clientY ?? window.innerHeight/2
                  setPopupPos({ x, y })
                  setShowPopup(true)
                }}
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
                    <div className="text-green-500 text-sm text-center">●</div>
                  ) : null
                }}
              />
            </div>
          </div>
        </div>

        {/* Floating popup */}
        {showPopup && popupPos && (
          <div
            ref={popupRef}
            className="fixed z-50 w-80 bg-white border rounded shadow-lg p-3"
            style={{ left: popupPos.x, top: popupPos.y, transform: 'translate(-50%, 8px)' }}
          >
            <h3 className="font-semibold mb-2">Tasks on {selectedDate.toDateString()}</h3>
            {filtered.length === 0 ? (
              <p className="text-gray-500">No content scheduled</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {filtered.map((t)=> (
                  <div key={t.id} className="border p-2 rounded">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-gray-600">{t.platform} • {t.format}</p>
                    <p className="text-xs text-gray-500">Status: {t.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
