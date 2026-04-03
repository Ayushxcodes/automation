"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"

export default function TasksPage() {

  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined)

  // 🔹 Fetch tasks
  async function fetchTasks() {
    const res = await fetch(`/api/tasks/list?projectId=${id}`)
    const data = await res.json()

    if (data.success) {
      setTasks(data.tasks)
    }
  }

  // 🔹 Create task
  async function createTask() {

    if (!title) return toast.error("Title required")

    const res = await fetch("/api/tasks/create", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        title,
        description,
        projectId: id,
        assignedToId
      })
    })

    const data = await res.json()

    if (data.success) {
      toast.success("Task created")
      setTitle("")
      setDescription("")
      setAssignedToId(undefined)
      fetchTasks()
    } else {
      toast.error("Failed")
    }
  }

  // 🔹 Update status
  async function updateStatus(taskId: string, status: string) {

    const res = await fetch("/api/tasks/update", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ taskId, status })
    })

    const data = await res.json()

    if (data.success) {
      fetchTasks()
    } else {
      toast.error(data.error || "Update failed")
    }
  }

  // 🔹 Fetch users
  async function fetchUsers() {
    try {
      const res = await fetch('/api/users/list')
      const data = await res.json()
      if (data.success) setUsers(data.users)
    } catch {}
  }

  // 🔹 Fetch current user
  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success) setCurrentUser(data.user)
    } catch {}
  }

  useEffect(()=>{
    fetchTasks()
    fetchUsers()
    fetchMe()
  },[])

  // 🔥 Group tasks
  const todo = tasks.filter(t => t.status === "todo")
  const inProgress = tasks.filter(t => t.status === "in_progress")
  const done = tasks.filter(t => t.status === "done")

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">Tasks</h1>

      {/* 🔹 Create Task (toolbar styled like spreadsheet row) */}
      <div className="space-y-3 max-w-2xl">
        <div className="flex gap-2 items-center bg-gray-50 p-3 rounded border border-gray-200">
          <div className="text-xs text-gray-500 w-8 text-right">#</div>

          <input
            placeholder="Task title"
            value={title}
            onChange={(e)=>setTitle((e as any).target.value)}
            className="min-w-0 bg-white border border-gray-200 h-9 text-sm px-2 rounded"
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e)=>setDescription((e as any).target.value)}
            className="min-w-0 bg-white border border-gray-200 h-9 text-sm px-2 rounded"
          />

          <select
            value={assignedToId ?? ""}
            onChange={(e)=>setAssignedToId((e as any).target.value || undefined)}
            className="min-w-0 bg-white border border-gray-200 h-9 text-sm px-2 rounded"
          >
            <option value="">Assign user (optional)</option>
            {users.map(u=>(
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>

          <button onClick={createTask} className="h-9 px-3 bg-black text-white rounded">
            Add
          </button>
        </div>
      </div>

      {/* 🔥 Kanban Columns */}
      <div className="grid grid-cols-3 gap-4">

        <Column title="Todo" tasks={todo} color="bg-red-100" onStatusChange={updateStatus} currentUser={currentUser} />

        <Column title="In Progress" tasks={inProgress} color="bg-yellow-100" onStatusChange={updateStatus} currentUser={currentUser} />

        <Column title="Done" tasks={done} color="bg-green-100" onStatusChange={updateStatus} currentUser={currentUser} />

      </div>

    </div>
  )
}

// 🔹 Column Component (Excel-like styling)
function Column({ title, tasks, color, onStatusChange, currentUser }: any) {

  return (

    <div className={`p-4 rounded-xl space-y-3 min-h-[350px] ${color}`}>

      <h2 className="font-semibold text-lg">{title}</h2>

      {tasks.length === 0 && (
        <p className="text-sm opacity-70">No tasks</p>
      )}

      {tasks.map((t:any, idx:number)=>(
        <TaskCard key={t.id} task={{...t, row: idx + 1}} onStatusChange={onStatusChange} currentUser={currentUser} />
      ))}

    </div>
  )
}

function TaskCard({ task, currentUser, onStatusChange }: any) {
  const canEdit = currentUser && (currentUser.role === "admin" || task.assignedToId === currentUser.id)

  async function handleChange(e: any) {
    const status = e.target.value
    if (!canEdit) return
    try {
      await onStatusChange?.(task.id, status)
    } catch (err) {
      // parent will handle errors; keep UI stable
    }
  }

  return (
    <div className="bg-white p-3 rounded-xl shadow space-y-2 border">
      <p className="font-medium">{task.title}</p>
      {task.description && (
        <p className="text-sm text-gray-600">{task.description}</p>
      )}
      {task.assignedTo && (
        <p className="text-xs text-blue-600"> Assigned to: {task.assignedTo.email} </p>
      )}
      <select value={task.status} disabled={!canEdit} onChange={handleChange} className={`text-xs border rounded px-2 py-1 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`} >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      {!canEdit && (
        <p className="text-xs text-red-500"> You are not allowed to update this task </p>
      )}
    </div>
  )
}