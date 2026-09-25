import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../api/client'
import type { ProjectGraph, Task } from '../api/types'

function TaskNotesTextarea({ task, projectId }: { task: Task; projectId: number }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(task.notes ?? '')

  const saveNotes = useMutation({
    mutationFn: (notes: string) => api.updateTask(task.id, { notes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['graph', projectId] }),
  })

  function handleBlur() {
    if (draft !== (task.notes ?? '')) saveNotes.mutate(draft)
  }

  return (
    <textarea
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      placeholder="Add notes…"
      rows={3}
      className="w-full resize-y rounded-md border border-[var(--border-earth)] bg-[var(--surface)] p-2 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
    />
  )
}

function TaskNotesRow({
  task,
  projectId,
  indented,
}: {
  task: Task
  projectId: number
  indented: boolean
}) {
  return (
    <div className={indented ? 'ml-6' : ''}>
      <div className="mb-1 text-sm font-medium text-[var(--ink)]">{task.title}</div>
      <TaskNotesTextarea task={task} projectId={projectId} />
      {!indented && task.subtasks.length > 0 && (
        <div className="mt-3 space-y-3">
          {task.subtasks.map((subtask) => (
            <TaskNotesRow key={subtask.id} task={subtask} projectId={projectId} indented />
          ))}
        </div>
      )}
    </div>
  )
}

export function NotesView({ graph, projectId }: { graph: ProjectGraph; projectId: number }) {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        {graph.nodes.map((node) => (
          <section key={node.id}>
            <h2 className="mb-3 text-base font-semibold text-[var(--ink)]">{node.title}</h2>
            {node.tasks.length === 0 ? (
              <p className="text-sm text-[var(--ink-muted)]">No tasks in this phase.</p>
            ) : (
              <div className="space-y-4">
                {node.tasks.map((task) => (
                  <TaskNotesRow key={task.id} task={task} projectId={projectId} indented={false} />
                ))}
              </div>
            )}
          </section>
        ))}
        {graph.nodes.length === 0 && (
          <p className="text-sm text-[var(--ink-muted)]">No phases yet.</p>
        )}
      </div>
    </div>
  )
}
