"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function TasksPage() {

  const { id } = useParams()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [format, setFormat] = useState("")
  const [platform, setPlatform] = useState("")
  const [topic, setTopic] = useState("")
  const [publishDate, setPublishDate] = useState<string | undefined>(undefined)
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined)
  const [platformFilter, setPlatformFilter] = useState("")
  const [topicFilter, setTopicFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [logs, setLogs] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState("")
  const [logsLoading, setLogsLoading] = useState(false)

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
        assignedToId,
        format,
        platform,
        topic,
        publishDate
      })
    })

    const data = await res.json()

    if (data.success) {
      toast.success("Task created")
      setTitle("")
      setDescription("")
      setAssignedToId(undefined)
      setFormat("")
      setPlatform("")
      setTopic("")
      setPublishDate(undefined)
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

  // 🔹 Delete a task
  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task? This cannot be undone.")) return
    try {
      const res = await fetch("/api/tasks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Task deleted")
        fetchTasks()
      } else {
        toast.error(data.error || "Delete failed")
      }
    } catch (e) {
      toast.error("Delete failed")
    }
  }

  // 🔹 Fetch logs for a task
  async function fetchLogs(taskId: string) {
    // toggle: close if already open
    if (selectedTaskId === taskId) {
      setSelectedTaskId("")
      setLogs([])
      return
    }

    setLogsLoading(true)
    try {
      const res = await fetch(`/api/tasks/logs?taskId=${taskId}`)
      const data = await res.json()
      // eslint-disable-next-line no-console
      console.log("logs response:", data)
      if (data.success) {
        setLogs(data.logs)
        setSelectedTaskId(taskId)
      } else {
        setLogs([])
        setSelectedTaskId("")
      }
    } catch (e) {
      // keep UI stable
      setLogs([])
      setSelectedTaskId("")
    } finally {
      setLogsLoading(false)
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

  // 🔹 Run AI scheduler: assign publish dates to unscheduled tasks
  async function runScheduler() {
    try {
      const res = await fetch("/api/ai/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id })
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Tasks scheduled: ${data.count}`)
        fetchTasks()
      } else {
        toast.error(data.error || "Scheduling failed")
      }
    } catch (e) {
      toast.error("Scheduling failed")
    }
  }

  // 🔥 Content flow groups
  const idea = tasks.filter(t => t.status === "idea" && (platformFilter ? t.platform === platformFilter : true) && (topicFilter ? t.topic === topicFilter : true) && (statusFilter ? t.status === statusFilter : true))
  const script = tasks.filter(t => t.status === "script" && (platformFilter ? t.platform === platformFilter : true) && (topicFilter ? t.topic === topicFilter : true) && (statusFilter ? t.status === statusFilter : true))
  const filmed = tasks.filter(t => t.status === "filmed" && (platformFilter ? t.platform === platformFilter : true) && (topicFilter ? t.topic === topicFilter : true) && (statusFilter ? t.status === statusFilter : true))
  const edited = tasks.filter(t => t.status === "edited" && (platformFilter ? t.platform === platformFilter : true) && (topicFilter ? t.topic === topicFilter : true) && (statusFilter ? t.status === statusFilter : true))
  const published = tasks.filter(t => t.status === "published" && (platformFilter ? t.platform === platformFilter : true) && (topicFilter ? t.topic === topicFilter : true) && (statusFilter ? t.status === statusFilter : true))

  const router = useRouter()

  async function deleteProject() {
    if (!confirm("Delete this project and all its tasks? This cannot be undone.")) return
    try {
      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Project deleted")
        router.push('/projects')
      } else {
        toast.error(data.error || "Delete failed")
      }
    } catch (e) {
      toast.error("Delete failed")
    }
  }

  return (

    <div className="p-6 space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <button onClick={runScheduler} className="h-9 px-3 bg-black text-white rounded">Auto Schedule (AI)</button>
          <button onClick={deleteProject} className="h-9 px-3 bg-red-600 text-white rounded">Delete Project</button>
        </div>
      </div>

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

          <input
            placeholder="Format (reel/post/video)"
            value={format}
            onChange={(e)=>setFormat((e as any).target.value)}
            className="min-w-0 bg-white border border-gray-200 h-9 text-sm px-2 rounded"
          />

          <input
            placeholder="Platform (yt/ig/li/tw)"
            value={platform}
            onChange={(e)=>setPlatform((e as any).target.value)}
            className="min-w-0 bg-white border border-gray-200 h-9 text-sm px-2 rounded"
          />

          <input
            placeholder="Topic"
            value={topic}
            onChange={(e)=>setTopic((e as any).target.value)}
            className="min-w-0 bg-white border border-gray-200 h-9 text-sm px-2 rounded"
          />

          <input
            type="date"
            value={publishDate ?? ""}
            onChange={(e)=>setPublishDate((e as any).target.value || undefined)}
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

      {/* 🔥 Filters */}
      <div className="flex items-center gap-2">
        <select value={platformFilter} onChange={(e)=>setPlatformFilter((e as any).target.value)} className="text-sm border rounded px-2 py-1">
          <option value="">Platform (all)</option>
          {[...new Set(tasks.map(t=>t.platform).filter(Boolean))].map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={topicFilter} onChange={(e)=>setTopicFilter((e as any).target.value)} className="text-sm border rounded px-2 py-1">
          <option value="">Topic (all)</option>
          {[...new Set(tasks.map(t=>t.topic).filter(Boolean))].map(tpc=> <option key={tpc} value={tpc}>{tpc}</option>)}
        </select>
        <select value={statusFilter} onChange={(e)=>setStatusFilter((e as any).target.value)} className="text-sm border rounded px-2 py-1">
          <option value="">Status (all)</option>
          <option value="idea">Idea</option>
          <option value="script">Script</option>
          <option value="filmed">Filmed</option>
          <option value="edited">Edited</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* 🔥 Kanban Columns (Content Flow) */}
      <div className="grid grid-cols-5 gap-4">

        <Column title="Idea" tasks={idea} color="bg-red-100" onStatusChange={updateStatus} currentUser={currentUser} fetchLogs={fetchLogs} logsLoading={logsLoading} selectedTaskId={selectedTaskId} />

        <Column title="Script" tasks={script} color="bg-yellow-100" onStatusChange={updateStatus} currentUser={currentUser} fetchLogs={fetchLogs} logsLoading={logsLoading} selectedTaskId={selectedTaskId} />

        <Column title="Filmed" tasks={filmed} color="bg-indigo-100" onStatusChange={updateStatus} currentUser={currentUser} fetchLogs={fetchLogs} logsLoading={logsLoading} selectedTaskId={selectedTaskId} />

        <Column title="Edited" tasks={edited} color="bg-orange-100" onStatusChange={updateStatus} currentUser={currentUser} fetchLogs={fetchLogs} logsLoading={logsLoading} selectedTaskId={selectedTaskId} />

        <Column title="Published" tasks={published} color="bg-green-100" onStatusChange={updateStatus} currentUser={currentUser} fetchLogs={fetchLogs} logsLoading={logsLoading} selectedTaskId={selectedTaskId} />

      </div>

      {selectedTaskId && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold mb-2">Activity Logs ({logs.length})</h2>
            <div className="flex items-center gap-2">
              {logsLoading && <div className="h-4 w-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />}
              <button onClick={()=>{ setSelectedTaskId(""); setLogs([]) }} className="text-xs text-gray-600 px-2 py-1 border rounded hover:bg-gray-100">Close</button>
            </div>
          </div>

          {logs.length === 0 && !logsLoading && (
            <p className="text-sm text-gray-500">No logs for this task</p>
          )}

          {logs.map((log)=> (
            <div key={log.id} className="text-sm border-b py-3">
              <div className="flex items-baseline justify-between">
                <p>
                  <span className="font-medium">{log.user?.email || 'system'}</span>{' '}
                  {log.action === "TASK_CREATED" && "created a task"}
                  {log.action === "TASK_ASSIGNED" && (`assigned task (${log.details})`)}
                  {log.action === "STATUS_CHANGED" && (`changed status (${log.details})`)}
                  {log.action === "DESCRIPTION_UPDATED" && "updated description"}
                </p>
                <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
              <pre className="mt-2 bg-white p-2 rounded text-xs overflow-auto whitespace-pre-wrap">{log.details}</pre>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

// 🔹 Column Component (Excel-like styling)
function Column({ title, tasks, color, onStatusChange, currentUser, fetchLogs }: any) {

  return (

    <div className={`p-4 rounded-xl space-y-3 min-h-[350px] ${color}`}>

      <h2 className="font-semibold text-lg">{title}</h2>

      {tasks.length === 0 && (
        <p className="text-sm opacity-70">No tasks</p>
      )}

      {tasks.map((t:any, idx:number)=>(
        <TaskCard key={t.id} task={{...t, row: idx + 1}} onStatusChange={onStatusChange} currentUser={currentUser} fetchLogs={fetchLogs} />
      ))}

    </div>
  )
}

function TaskCard({ task, currentUser, onStatusChange, fetchLogs, logsLoading, selectedTaskId }: any) {
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
      {task.publishDate && (
        <p className="text-xs text-gray-500">Scheduled: {new Date(task.publishDate).toLocaleString()}</p>
      )}
      {task.assignedTo && (
        <p className="text-xs text-blue-600"> Assigned to: {task.assignedTo.email} </p>
      )}
      <select value={task.status} disabled={!canEdit} onChange={handleChange} className={`text-xs border rounded px-2 py-1 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`} >
            <option value="idea">Idea</option>
            <option value="script">Script</option>
            <option value="filmed">Filmed</option>
            <option value="edited">Edited</option>
            <option value="published">Published</option>
      </select>
      <div>
        {(() => {
          const isOpen = selectedTaskId === task.id
          return (
            <button
              onClick={()=>fetchLogs?.(task.id)}
              className="inline-flex items-center gap-2 px-2 py-1 text-xs rounded border text-blue-600 hover:bg-blue-50"
            >
              {logsLoading && isOpen ? (
                <div className="h-3 w-3 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              ) : null}
              {isOpen ? 'Hide Logs' : 'View Logs'}
            </button>
          )
        })()}
      </div>
      {canEdit && (
        <div className="mt-2">
          <button onClick={()=>deleteTask(task.id)} className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50">Delete</button>
        </div>
      )}
      {!canEdit && (
        <p className="text-xs text-red-500"> You are not allowed to update this task </p>
      )}
      {/* Metrics */}
      <div className="flex gap-3 mt-2">
        <p className="text-xs">YT: {task.ytViews ?? 0}</p>
        <p className="text-xs">IG: {task.igReach ?? 0}</p>
        <p className="text-xs">LI: {task.liImpressions ?? 0}</p>
        <p className="text-xs">TW: {task.twImpressions ?? 0}</p>
      </div>
    </div>
  )
}