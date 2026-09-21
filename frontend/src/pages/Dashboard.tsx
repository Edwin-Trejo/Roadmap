import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { ProjectCard } from '../components/ProjectCard'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../auth/AuthContext'

export function Dashboard() {
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [showNewProject, setShowNewProject] = useState(false)
  const [name, setName] = useState('')

  const {
    data: projects,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: api.listProjects,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }

  const createProject = useMutation({
    mutationFn: (projectName: string) => api.createProject(projectName),
    onSuccess: () => {
      invalidate()
      setShowNewProject(false)
      setName('')
    },
  })

  const deleteProject = useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: invalidate,
  })

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (name.trim()) createProject.mutate(name.trim())
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Projects</h1>
          <div className="flex gap-3">
            <ThemeToggle />
            <button
              onClick={() => setShowNewProject((v) => !v)}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
            >
              + New Project
            </button>
            <button
              onClick={logout}
              className="rounded-md border border-[var(--border-earth)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--surface-alt)]"
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
              className="flex-1 rounded-md border border-[var(--border-earth)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
            />
            <button
              type="submit"
              disabled={createProject.isPending}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              Create
            </button>
          </form>
        )}

        {isLoading && <p className="text-[var(--ink-muted)]">Loading…</p>}

        {isError && (
          <div className="mb-6 rounded-md border border-[var(--danger)] bg-[var(--surface)] p-4 text-sm text-[var(--danger)]">
            <p className="mb-2">
              Couldn't load projects:{' '}
              {error instanceof Error ? error.message : 'unknown error'}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-md border border-[var(--danger)] px-3 py-1 text-xs font-medium hover:bg-[var(--danger)] hover:text-[var(--accent-fg)]"
            >
              Retry
            </button>
          </div>
        )}

        {createProject.isError && (
          <p className="mb-4 text-sm text-[var(--danger)]">
            Couldn't create project:{' '}
            {createProject.error instanceof Error ? createProject.error.message : 'unknown error'}
          </p>
        )}

        {projects && projects.length === 0 && (
          <p className="text-[var(--ink-muted)]">No projects yet — create your first one above.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => deleteProject.mutate(project.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
