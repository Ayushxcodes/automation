"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Folder, Plus, Calendar, Spinner } from "@phosphor-icons/react"

export default function ProjectsPage() {

  const router = useRouter()

  const [name, setName] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects/list")
      const data = await res.json()

      if (data.success) {
        setProjects(data.projects)
      }
    } catch (error) {
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  async function createProject() {

    if (!name.trim()) {
      toast.error("Please enter a project name")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/projects/create", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Project created successfully")
        setName("")
        fetchProjects()
      } else {
        toast.error(data.message || "Failed to create project")
      }
    } catch (error) {
      toast.error("Failed to create project")
    } finally {
      setCreating(false)
    }
  }

  useEffect(()=>{
    fetchProjects()
  },[])

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage and organize your automation projects</p>
        </div>

        {/* Create Project Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 max-w-md">
              <Input
                placeholder="Enter project name..."
                value={name}
                onChange={(e)=>setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createProject()}
                className="flex-1"
              />
              <Button
                onClick={createProject}
                disabled={creating || !name.trim()}
                className="min-w-[100px]"
              >
                {creating ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2 animate-spin" />
                    Creating
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Projects ({projects.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first project to get started with automation workflows.
                </p>
                <Button
                  onClick={() => document.querySelector('input')?.focus()}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p)=>(
                <Card
                  key={p.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group"
                  onClick={()=>router.push(`/projects/${p.id}`)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <Folder className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="truncate">{p.name}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Created {new Date(p.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}