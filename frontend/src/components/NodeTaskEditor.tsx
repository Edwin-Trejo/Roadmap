import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { RoadmapNode, Task } from '../api/types'
import { EditableTaskTitle } from './EditableTaskTitle'

export function NodeTaskEditor({ node, projectId }: { node: RoadmapNode; projectId: number }) {
  const queryClient = useQueryClient()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [subtaskFormFor, setSubtaskFormFor] = useState<number | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

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

  const renameTask = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => api.updateTask(id, { title }),
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

  function handleAddTask(e: FormEvent) {
    e.preventDefault()
    if (newTaskTitle.trim()) addTask.mutate(newTaskTitle.trim())
  }

  function handleAddSubtask(e: FormEvent, taskId: number) {
    e.preventDefault()
    if (newSubtaskTitle.trim()) addSubtask.mutate({ taskId, title: newSubtaskTitle.trim() })
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
          <EditableTaskTitle
            title={task.title}
            done={task.done}
            onRename={(title) => renameTask.mutate({ id: task.id, title })}
          />
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
          <form onSubmit={(e) => handleAddSubtask(e, task.id)} className="ml-6 mt-1 flex gap-2">
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
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase text-[var(--ink-muted)]">Tasks</h3>
      <ul className="space-y-2">
        {node.tasks.map((task) => renderTaskRow(task, false))}
        {node.tasks.length === 0 && (
          <li className="text-sm text-[var(--ink-muted)]">No tasks yet.</li>
        )}
      </ul>

      <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
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
    </div>
  )
}
