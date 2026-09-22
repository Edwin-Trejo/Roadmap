import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { RoadmapNode } from '../api/types'
import { ConfirmButton } from './ConfirmButton'
import { EditableNodeTitle } from './EditableNodeTitle'
import { NodeTaskEditor } from './NodeTaskEditor'

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

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['graph', projectId] })
  }

  const renameNode = useMutation({
    mutationFn: (title: string) => api.updateNode(node.id, { title }),
    onSuccess: invalidate,
  })

  const deleteNode = useMutation({
    mutationFn: () => api.deleteNode(node.id),
    onSuccess: () => {
      invalidate()
      onClose()
    },
  })

  return (
    <aside className="fixed right-0 top-0 flex h-full w-96 flex-col border-l border-[var(--border-earth)] bg-[var(--surface)] p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-2">
        <EditableNodeTitle
          title={node.title}
          onRename={(title) => renameNode.mutate(title)}
          className="w-full text-lg font-semibold"
        />
        <button
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          ✕
        </button>
      </div>

      <div className="mb-6 flex-1 overflow-y-auto">
        <NodeTaskEditor node={node} projectId={projectId} />
      </div>

      <ConfirmButton label="Delete node" onConfirm={() => deleteNode.mutate()} />
    </aside>
  )
}
