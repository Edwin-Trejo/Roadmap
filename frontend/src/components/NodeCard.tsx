import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { RoadmapNode } from '../api/types'
import { statusDisplay } from '../lib/statusDisplay'
import { ConfirmButton } from './ConfirmButton'
import { EditableNodeTitle } from './EditableNodeTitle'
import { NodeTaskEditor } from './NodeTaskEditor'

export function NodeCard({
  node,
  projectId,
  dependsOn,
  leadsTo,
}: {
  node: RoadmapNode
  projectId: number
  dependsOn: string[]
  leadsTo: string[]
}) {
  const queryClient = useQueryClient()

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['graph', projectId] })
  }

  const renameNode = useMutation({
    mutationFn: (title: string) => api.updateNode(node.id, { title }),
    onSuccess: invalidate,
  })

  const deleteNode = useMutation({
    mutationFn: () => api.deleteNode(node.id),
    onSuccess: invalidate,
  })

  const { label, color } = statusDisplay(node.status)

  return (
    <div className="rounded-lg border border-[var(--border-earth)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <EditableNodeTitle
          title={node.title}
          onRename={(title) => renameNode.mutate(title)}
          className="flex-1 text-sm font-semibold"
        />
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ color, backgroundColor: 'var(--surface-alt)' }}
        >
          {label}
        </span>
      </div>

      <div className="mb-2 text-xs text-[var(--ink-muted)]">
        {node.done_tasks}/{node.total_tasks} tasks
      </div>

      {(dependsOn.length > 0 || leadsTo.length > 0) && (
        <div className="mb-3 space-y-0.5 text-xs text-[var(--ink-muted)]">
          {dependsOn.length > 0 && <div>Depends on: {dependsOn.join(', ')}</div>}
          {leadsTo.length > 0 && <div>Leads to: {leadsTo.join(', ')}</div>}
        </div>
      )}

      <NodeTaskEditor node={node} projectId={projectId} />

      <div className="mt-3">
        <ConfirmButton label="Delete node" onConfirm={() => deleteNode.mutate()} />
      </div>
    </div>
  )
}
