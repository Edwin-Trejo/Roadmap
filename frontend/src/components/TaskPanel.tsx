import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { NodeStatus, RoadmapNode } from '../api/types'

const STATUS_OPTIONS: { value: NodeStatus | ''; label: string }[] = [
  { value: '', label: 'Auto (from tasks)' },
  { value: 'locked', label: 'Locked' },
  { value: 'next', label: 'Next Step' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
]

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

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['graph', projectId] })
  }

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

  const setStatusOverride = useMutation({
    mutationFn: (status: NodeStatus | '') =>
      status === ''
        ? api.updateNode(node.id, { clear_status_override: true })
        : api.updateNode(node.id, { status_override: status }),
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

  return (
    <aside className="fixed right-0 top-0 flex h-full w-96 flex-col border-l border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{node.title}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      <label className="mb-1 text-xs font-medium uppercase text-slate-500">Status</label>
      <select
        className="mb-6 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        value={node.status_override ?? ''}
        onChange={(e) => setStatusOverride.mutate(e.target.value as NodeStatus | '')}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <h3 className="mb-2 text-xs font-medium uppercase text-slate-500">Tasks</h3>
      <ul className="mb-4 flex-1 space-y-2 overflow-y-auto">
        {node.tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.done}
              onChange={(e) => toggleTask.mutate({ id: task.id, done: e.target.checked })}
            />
            <span className={task.done ? 'flex-1 text-slate-400 line-through' : 'flex-1'}>
              {task.title}
            </span>
            <button
              onClick={() => deleteTask.mutate(task.id)}
              aria-label={`Delete ${task.title}`}
              className="text-slate-300 hover:text-red-500"
            >
              ✕
            </button>
          </li>
        ))}
        {node.tasks.length === 0 && (
          <li className="text-sm text-slate-400">No tasks yet.</li>
        )}
      </ul>

      <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task"
          className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      <button
        onClick={() => deleteNode.mutate()}
        className="mt-auto rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        Delete node
      </button>
    </aside>
  )
}
