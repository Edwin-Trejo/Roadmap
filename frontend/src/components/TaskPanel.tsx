import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { RoadmapNode } from '../api/types'
import { ConfirmButton } from './ConfirmButton'

export function TaskPanel({
  node,
  projectId,
  onClose,
}: {
  node: RoadmapNode
  projectId: number
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [titleDraft, setTitleDraft] = useState(node.title)

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['graph', projectId] })
  }

  const renameNode = useMutation({
    mutationFn: (title: string) => api.updateNode(node.id, { title }),
    onSuccess: invalidate,
  })

  const addTask = useMutation({
    mutationFn: (title: string) => api.createTask(node.id, title),
    onSuccess: () => {
      setNewTaskTitle('')
      invalidate()
    },
  })

  const toggleTask = useMutation({
    mutationFn: ({ id, done }: { id: number; done: boolean }) => api.updateTask(id, { done }),
    onSuccess: invalidate,
  })

  const deleteTask = useMutation({
    mutationFn: (id: number) => api.deleteTask(id),
    onSuccess: invalidate,
  })

  const deleteNode = useMutation({
    mutationFn: () => api.deleteNode(node.id),
    onSuccess: () => {
      invalidate()
      onClose()
    },
  })

  function handleAddTask(e: FormEvent) {
    e.preventDefault()
    if (newTaskTitle.trim()) addTask.mutate(newTaskTitle.trim())
  }

  function handleTitleBlur() {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== node.title) {
      renameNode.mutate(trimmed)
    } else {
      setTitleDraft(node.title)
    }
  }

  return (
    <aside className="fixed right-0 top-0 flex h-full w-96 flex-col border-l border-[var(--border-earth)] bg-[var(--surface)] p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-2">
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          className="w-full rounded-md border border-transparent bg-transparent text-lg font-semibold text-[var(--ink)] hover:border-[var(--border-earth)] focus:border-[var(--accent)] focus:outline-none"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          ✕
        </button>
      </div>

      <h3 className="mb-2 text-xs font-medium uppercase text-[var(--ink-muted)]">Tasks</h3>
      <ul className="mb-4 flex-1 space-y-2 overflow-y-auto">
        {node.tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.done}
              onChange={(e) => toggleTask.mutate({ id: task.id, done: e.target.checked })}
            />
            <span
              className={
                task.done
                  ? 'flex-1 text-[var(--ink-muted)] line-through'
                  : 'flex-1 text-[var(--ink)]'
              }
            >
              {task.title}
            </span>
            <button
              onClick={() => deleteTask.mutate(task.id)}
              aria-label={`Delete ${task.title}`}
              className="text-[var(--ink-muted)] hover:text-[var(--danger)]"
            >
              ✕
            </button>
          </li>
        ))}
        {node.tasks.length === 0 && (
          <li className="text-sm text-[var(--ink-muted)]">No tasks yet.</li>
        )}
      </ul>

      <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task"
          className="flex-1 rounded-md border border-[var(--border-earth)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--ink)]"
        />
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
        >
          Add
        </button>
      </form>

      <ConfirmButton label="Delete node" onConfirm={() => deleteNode.mutate()} />
    </aside>
  )
}
