"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

export default function CalendarPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [platform, setPlatform] = useState("")
  const [format, setFormat] = useState("")
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

  return (
    <div className="h-screen w-screen bg-gray-50">
      <div className="h-full w-full flex items-stretch justify-start p-0">
        <div className="w-full h-full max-w-none overflow-auto">
          <div className="h-full w-full" style={{ width: '100%' }}>
            <div className="w-full h-full" style={{ maxWidth: '100%' }}>
              {/* View switch: Monthly / Weekly */}
              <div className="p-3 flex justify-end">
                <Link
                  href={id ? `/projects/${id}/calendar/weekly` : '#'}
                  className="px-3 py-1 border rounded text-sm bg-white"
                >
                  Weekly view
                </Link>
              </div>
              <Calendar
                className="w-full h-full"
                onChange={(value:any)=>setSelectedDate(value)}
                onClickDay={(value:any, e:any) => {
                  setSelectedDate(value)
                  const x = e?.clientX ?? window.innerWidth/2
                  const y = e?.clientY ?? window.innerHeight/2

                  const hasTask = tasks.some(t => {
                    if (!t.publishDate) return false
                    const d = new Date(t.publishDate)
                    return (
                      d.getDate() === value.getDate() &&
                      d.getMonth() === value.getMonth() &&
                      d.getFullYear() === value.getFullYear()
                    )
                  })

                  if (hasTask) {
                    setPopupPos({ x, y })
                    setShowPopup(true)
                    setShowModal(false)
                  } else {
                    setShowPopup(false)
                    setShowModal(true)
                  }
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
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Tasks on {selectedDate.toDateString()}</h3>
              <button
                onClick={() => { setShowModal(true); setShowPopup(false) }}
                className="text-sm px-2 py-1 border rounded"
              >
                Add Task
              </button>
            </div>
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
        {/* Create Task Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl space-y-3 w-80">
              <h2 className="font-semibold"> Create Task ({selectedDate?.toDateString()}) </h2>
              <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border p-2 rounded" />
              <input placeholder="Platform (yt/ig/li)" value={platform} onChange={(e)=>setPlatform(e.target.value)} className="w-full border p-2 rounded" />
              <input placeholder="Format (reel/post/video)" value={format} onChange={(e)=>setFormat(e.target.value)} className="w-full border p-2 rounded" />
              <div className="flex gap-2">
                <button onClick={createTask} className="bg-black text-white px-3 py-1 rounded" > Create </button>
                <button onClick={()=>setShowModal(false)} className="border px-3 py-1 rounded" > Cancel </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
