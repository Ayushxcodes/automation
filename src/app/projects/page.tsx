"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ProjectsPage() {

  const router = useRouter()

  const [name, setName] = useState("")
  const [projects, setProjects] = useState<any[]>([])

  async function fetchProjects() {
    const res = await fetch("/api/projects/list")
    const data = await res.json()

    if (data.success) {
      setProjects(data.projects)
    }
  }

  async function createProject() {

    if (!name) return toast.error("Enter project name")

    const res = await fetch("/api/projects/create", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ name })
    })

    const data = await res.json()

    if (data.success) {
      toast.success("Project created")
      setName("")
      fetchProjects()
    } else {
      toast.error("Failed")
    }
  }

  useEffect(()=>{
    fetchProjects()
  },[])

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-xl font-bold">Projects</h1>

      {/* Create Project */}
      <div className="flex gap-2">

        <Input
          placeholder="Project name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <Button onClick={createProject}>
          Create
        </Button>

      </div>

      {/* List Projects */}
      <div className="space-y-3">

        {projects.length === 0 && (
          <p className="text-gray-500">No projects yet</p>
        )}

        {projects.map((p)=>(
          <div
            key={p.id}
            onClick={()=>router.push(`/projects/${p.id}`)}
            className="border p-3 rounded cursor-pointer hover:bg-gray-50"
          >
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(p.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

      </div>

    </div>
  )
}