import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { ProjectCard } from '../components/ProjectCard'
import { useAuth } from '../auth/AuthContext'

export function Dashboard() {
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [showNewProject, setShowNewProject] = useState(false)
  const [name, setName] = useState('')

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: api.listProjects,
  })

  const createProject = useMutation({
    mutationFn: (projectName: string) => api.createProject(projectName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setShowNewProject(false)
      setName('')
    },
  })

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (name.trim()) createProject.mutate(name.trim())
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Projects</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewProject((v) => !v)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Project
          </button>
          <button
            onClick={logout}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>

      {showNewProject && (
        <form onSubmit={handleCreate} className="mb-8 flex gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            disabled={createProject.isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {projects && projects.length === 0 && (
        <p className="text-slate-500">No projects yet — create your first one above.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}
