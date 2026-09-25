import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../api/client'
import type { ProjectGraph, RoadmapNode } from '../api/types'
import { StatusBoard } from './StatusBoard'

function NodeNotesCard({ node, projectId }: { node: RoadmapNode; projectId: number }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(node.description ?? '')

  const saveNotes = useMutation({
    mutationFn: (description: string) => api.updateNode(node.id, { description }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['graph', projectId] }),
  })

  function handleBlur() {
    if (draft !== (node.description ?? '')) saveNotes.mutate(draft)
  }

  return (
    <div className="rounded-lg border border-[var(--border-earth)] bg-[var(--surface)] p-4 shadow-sm">
      <h3 className="mb-2 text-base font-semibold text-[var(--ink)]">{node.title}</h3>

      {node.tasks.length > 0 && (
        <ul className="mb-3 space-y-1 text-xs text-[var(--ink-muted)]">
          {node.tasks.map((task) => (
            <li key={task.id}>
              <span className={task.done ? 'line-through' : undefined}>• {task.title}</span>
              {task.subtasks.length > 0 && (
                <ul className="ml-4 mt-0.5 space-y-0.5">
                  {task.subtasks.map((subtask) => (
                    <li key={subtask.id} className={subtask.done ? 'line-through' : undefined}>
                      ◦ {subtask.title}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder="Add notes…"
        rows={4}
        className="w-full resize-y rounded-md border border-[var(--border-earth)] bg-[var(--surface)] p-2 text-xs text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
      />
    </div>
  )
}

export function NotesView({ graph, projectId }: { graph: ProjectGraph; projectId: number }) {
  return (
    <StatusBoard
      nodes={graph.nodes}
      renderCard={(node) => <NodeNotesCard key={node.id} node={node} projectId={projectId} />}
    />
  )
}
