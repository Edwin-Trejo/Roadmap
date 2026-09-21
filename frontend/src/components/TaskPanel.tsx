import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { RoadmapNode, Task } from '../api/types'
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
  const [subtaskFormFor, setSubtaskFormFor] = useState<number | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

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

  const addSubtask = useMutation({
    mutationFn: ({ taskId, title }: { taskId: number; title: string }) =>
      api.createSubtask(taskId, title),
    onSuccess: () => {
      setSubtaskFormFor(null)
      setNewSubtaskTitle('')
      invalidate()
    },
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

  function handleAddSubtask(e: FormEvent, taskId: number) {
    e.preventDefault()
    if (newSubtaskTitle.trim()) addSubtask.mutate({ taskId, title: newSubtaskTitle.trim() })
  }

  function handleTitleBlur() {
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== node.title) {
      renameNode.mutate(trimmed)
    } else {
      setTitleDraft(node.title)
    }
  }

  function renderTaskRow(task: Task, isSubtask: boolean) {
    const hasSubtasks = task.subtasks.length > 0
    return (
      <li key={task.id} className={isSubtask ? 'ml-6' : ''}>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={task.done}
            disabled={hasSubtasks}
            title={hasSubtasks ? 'Completes automatically once all subtasks are done' : undefined}
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
          {!isSubtask && (
            <button
              onClick={() => setSubtaskFormFor(subtaskFormFor === task.id ? null : task.id)}
              className="text-xs text-[var(--ink-muted)] hover:text-[var(--accent)]"
            >
              + subtask
            </button>
          )}
          <button
            onClick={() => deleteTask.mutate(task.id)}
            aria-label={`Delete ${task.title}`}
            className="text-[var(--ink-muted)] hover:text-[var(--danger)]"
          >
            ✕
          </button>
        </div>

        {!isSubtask && task.subtasks.length > 0 && (
          <ul className="mt-1 space-y-1">
            {task.subtasks.map((subtask) => renderTaskRow(subtask, true))}
          </ul>
        )}

        {!isSubtask && subtaskFormFor === task.id && (
          <form
            onSubmit={(e) => handleAddSubtask(e, task.id)}
            className="ml-6 mt-1 flex gap-2"
          >
            <input
              autoFocus
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a subtask"
              className="flex-1 rounded-md border border-[var(--border-earth)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--ink)]"
            />
            <button
              type="submit"
              className="rounded-md bg-[var(--accent)] px-2 py-1 text-xs font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
            >
              Add
            </button>
          </form>
        )}
      </li>
    )
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
        {node.tasks.map((task) => renderTaskRow(task, false))}
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
