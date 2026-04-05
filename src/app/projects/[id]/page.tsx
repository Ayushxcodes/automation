"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FolderOpen,
  Plus,
  Calendar,
  User,
  Funnel,
  Trash,
  Eye,
  EyeSlash,
  Play,
  FilmReel,
  Scissors,
  CheckCircle,
  Lightbulb,
  Spinner,
  Robot,
  Trash as TrashIcon
} from "@phosphor-icons/react"

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
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  // 🔹 Fetch tasks
  async function fetchTasks() {
    try {
      const res = await fetch(`/api/tasks/list?projectId=${id}`)
      const data = await res.json()

      if (data.success) {
        setTasks(data.tasks)
      }
    } catch (error) {
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Create task
  async function createTask() {

    if (!title.trim()) {
      toast.error("Title is required")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/tasks/create", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          projectId: id,
          assignedToId,
          format: format.trim(),
          platform: platform.trim(),
          topic: topic.trim(),
          publishDate
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Task created successfully")
        setTitle("")
        setDescription("")
        setAssignedToId(undefined)
        setFormat("")
        setPlatform("")
        setTopic("")
        setPublishDate(undefined)
        fetchTasks()
      } else {
        toast.error(data.message || "Failed to create task")
      }
    } catch (error) {
      toast.error("Failed to create task")
    } finally {
      setCreating(false)
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
    toast("Delete this task? This cannot be undone.", {
      action: {
        label: "Delete",
        onClick: async () => {
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
      }
    })
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
    toast("Delete this project and all its tasks? This cannot be undone.", {
      action: {
        label: "Delete",
        onClick: async () => {
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
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Tasks</h1>
                <p className="text-gray-600 mt-1">Manage your content creation workflow</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={runScheduler}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Robot className="w-4 h-4" />
                Auto Schedule (AI)
              </Button>
              <Button
                onClick={deleteProject}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete Project
              </Button>
            </div>
          </div>
        </div>

        {/* Create Task Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  placeholder="Task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createTask()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Input
                  placeholder="Task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Format</label>
                <Input
                  placeholder="reel/post/video"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Platform</label>
                <Input
                  placeholder="yt/ig/li/tw"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Topic</label>
                <Input
                  placeholder="Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Publish Date</label>
                <Input
                  type="date"
                  value={publishDate ?? ""}
                  onChange={(e) => setPublishDate(e.target.value || undefined)}
                />
              </div>

              <div className="space-y-2 col-span-full">
                <label className="text-sm font-medium text-gray-700">Assign to</label>
                <Select value={assignedToId ?? ""} onValueChange={(value: string) => setAssignedToId(value || undefined)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {users.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={createTask}
                disabled={creating || !title.trim()}
                className="flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Spinner className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Funnel className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Platform:</span>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All platforms</SelectItem>
                    {[...new Set(tasks.map(t => t.platform).filter(Boolean))].map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Topic:</span>
                <Select value={topicFilter} onValueChange={setTopicFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All topics</SelectItem>
                    {[...new Set(tasks.map(t => t.topic).filter(Boolean))].map(tpc => (
                      <SelectItem key={tpc} value={tpc}>{tpc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                    <SelectItem value="filmed">Filmed</SelectItem>
                    <SelectItem value="edited">Edited</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(platformFilter || topicFilter || statusFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPlatformFilter("")
                      setTopicFilter("")
                      setStatusFilter("")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <div className="mb-8 w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Content Workflow</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading tasks...</span>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 min-w-max">
              <Column
                title="Idea"
                tasks={idea}
                color="bg-red-50 border-red-200"
                icon={<Lightbulb className="w-5 h-5" />}
                onStatusChange={updateStatus}
                currentUser={currentUser}
                fetchLogs={fetchLogs}
                logsLoading={logsLoading}
                selectedTaskId={selectedTaskId}
                deleteTask={deleteTask}
              />

              <Column
                title="Script"
                tasks={script}
                color="bg-yellow-50 border-yellow-200"
                icon={<Play className="w-5 h-5" />}
                onStatusChange={updateStatus}
                currentUser={currentUser}
                fetchLogs={fetchLogs}
                logsLoading={logsLoading}
                selectedTaskId={selectedTaskId}
                deleteTask={deleteTask}
              />

              <Column
                title="Filmed"
                tasks={filmed}
                color="bg-indigo-50 border-indigo-200"
                icon={<FilmReel className="w-5 h-5" />}
                onStatusChange={updateStatus}
                currentUser={currentUser}
                fetchLogs={fetchLogs}
                logsLoading={logsLoading}
                selectedTaskId={selectedTaskId}
                deleteTask={deleteTask}
              />

              <Column
                title="Edited"
                tasks={edited}
                color="bg-orange-50 border-orange-200"
                icon={<Scissors className="w-5 h-5" />}
                onStatusChange={updateStatus}
                currentUser={currentUser}
                fetchLogs={fetchLogs}
                logsLoading={logsLoading}
                selectedTaskId={selectedTaskId}
                deleteTask={deleteTask}
              />

              <Column
                title="Published"
                tasks={published}
                color="bg-green-50 border-green-200"
                icon={<CheckCircle className="w-5 h-5" />}
                onStatusChange={updateStatus}
                currentUser={currentUser}
                fetchLogs={fetchLogs}
                logsLoading={logsLoading}
                selectedTaskId={selectedTaskId}
                deleteTask={deleteTask}
              />
            </div>
            </div>
          )}
        </div>

        {/* Activity Logs */}
        {selectedTaskId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Activity Logs ({logs.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  {logsLoading && <Spinner className="w-4 h-4 animate-spin" />}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTaskId("")
                      setLogs([])
                    }}
                  >
                    <EyeSlash className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {logs.length === 0 && !logsLoading && (
                <p className="text-gray-500 text-center py-4">No activity logs for this task</p>
              )}

              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">
                          {log.user?.email || 'system'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {log.action === "TASK_CREATED" && "created this task"}
                          {log.action === "TASK_ASSIGNED" && `assigned task (${log.details})`}
                          {log.action === "STATUS_CHANGED" && `changed status (${log.details})`}
                          {log.action === "DESCRIPTION_UPDATED" && "updated description"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {log.details && (
                      <pre className="bg-white p-3 rounded text-xs overflow-auto whitespace-pre-wrap border">
                        {log.details}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}

// 🔹 Column Component (Excel-like styling)
function Column({ title, tasks, color, icon, onStatusChange, currentUser, fetchLogs, logsLoading, selectedTaskId, deleteTask }: any) {

  return (
    <Card className={`${color} border-2 min-h-[500px] min-w-[320px] max-w-none`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <span className="ml-auto bg-white/80 text-gray-700 px-2 py-1 rounded-full text-sm font-normal">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2 opacity-50">{icon}</div>
            <p className="text-sm">No tasks in {title.toLowerCase()}</p>
          </div>
        )}

        {tasks.map((t: any, idx: number) => (
          <TaskCard
            key={t.id}
            task={{ ...t, row: idx + 1 }}
            onStatusChange={onStatusChange}
            currentUser={currentUser}
            fetchLogs={fetchLogs}
            logsLoading={logsLoading}
            selectedTaskId={selectedTaskId}
            deleteTask={deleteTask}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function TaskCard({ task, currentUser, onStatusChange, fetchLogs, logsLoading, selectedTaskId, deleteTask }: any) {
  const canEdit = currentUser && ((currentUser.role ?? '').toLowerCase() === "admin" || task.assignedToId === currentUser.id)

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
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Title and Row Number */}
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-900 leading-tight pr-2">{task.title}</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
              #{task.row}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            {task.publishDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Scheduled: {new Date(task.publishDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            )}

            {task.assignedTo && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>Assigned to: {task.assignedTo.email}</span>
              </div>
            )}

            {/* Platform, Format, Topic */}
            <div className="flex flex-wrap gap-2">
              {task.platform && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {task.platform}
                </span>
              )}
              {task.format && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {task.format}
                </span>
              )}
              {task.topic && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {task.topic}
                </span>
              )}
            </div>
          </div>

          {/* Status Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Status:</label>
            <Select
              value={task.status}
              onValueChange={(value: string) => { if (canEdit) onStatusChange?.(task.id, value) }}
              disabled={!canEdit}
            >
              <SelectTrigger className={`w-full ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">Idea</SelectItem>
                <SelectItem value="script">Script</SelectItem>
                <SelectItem value="filmed">Filmed</SelectItem>
                <SelectItem value="edited">Edited</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs?.(task.id)}
              className="flex items-center gap-2"
            >
              {logsLoading && selectedTaskId === task.id ? (
                <Spinner className="w-3 h-3 animate-spin" />
              ) : selectedTaskId === task.id ? (
                <EyeSlash className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              {selectedTaskId === task.id ? 'Hide Logs' : 'View Logs'}
            </Button>

            {canEdit && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteTask(task.id)}
                className="flex items-center gap-2"
              >
                <Trash className="w-3 h-3" />
                Delete
              </Button>
            )}
          </div>

          {/* Permissions Notice */}
          {!canEdit && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
              You don't have permission to edit this task
            </p>
          )}

          {/* Metrics */}
          {(task.ytViews || task.igReach || task.liImpressions || task.twImpressions) && (
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {task.ytViews !== undefined && (
                  <div className="bg-red-50 text-red-700 p-2 rounded text-center">
                    <div className="font-medium">{task.ytViews.toLocaleString()}</div>
                    <div>YouTube Views</div>
                  </div>
                )}
                {task.igReach !== undefined && (
                  <div className="bg-pink-50 text-pink-700 p-2 rounded text-center">
                    <div className="font-medium">{task.igReach.toLocaleString()}</div>
                    <div>IG Reach</div>
                  </div>
                )}
                {task.liImpressions !== undefined && (
                  <div className="bg-blue-50 text-blue-700 p-2 rounded text-center">
                    <div className="font-medium">{task.liImpressions.toLocaleString()}</div>
                    <div>LI Impressions</div>
                  </div>
                )}
                {task.twImpressions !== undefined && (
                  <div className="bg-sky-50 text-sky-700 p-2 rounded text-center">
                    <div className="font-medium">{task.twImpressions.toLocaleString()}</div>
                    <div>TW Impressions</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}