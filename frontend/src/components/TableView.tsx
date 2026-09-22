import type { ProjectGraph } from '../api/types'
import { getNodeConnections } from '../lib/connections'
import { NodeCard } from './NodeCard'

const BADGE_TEXT = '#fdfbf5'

const COLUMNS = [
  { key: 'complete', label: 'Completed', statuses: ['complete'], badgeColor: '#5f7a3d' },
  { key: 'active', label: 'In Progress', statuses: ['in_progress', 'next'], badgeColor: '#c07a1e' },
  { key: 'locked', label: 'Locked', statuses: ['locked'], badgeColor: '#a13a2b' },
] as const

export function TableView({ graph, projectId }: { graph: ProjectGraph; projectId: number }) {
  const titleById = Object.fromEntries(graph.nodes.map((n) => [n.id, n.title]))

  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-hidden p-4 sm:grid-cols-3">
      {COLUMNS.map((column) => {
        const nodes = graph.nodes.filter((n) =>
          (column.statuses as readonly string[]).includes(n.status),
        )
        return (
          <div key={column.key} className="flex flex-col overflow-hidden">
            <h2 className="mb-3 shrink-0">
              <span
                className="inline-block rounded-md px-3 py-1.5 text-sm font-semibold uppercase tracking-wide"
                style={{ backgroundColor: column.badgeColor, color: BADGE_TEXT }}
              >
                {column.label} ({nodes.length})
              </span>
            </h2>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {nodes.map((node) => {
                const { dependsOn, leadsTo } = getNodeConnections({
                  nodeId: node.id,
                  edges: graph.edges,
                  titleById,
                })
                return (
                  <NodeCard
                    key={node.id}
                    node={node}
                    projectId={projectId}
                    dependsOn={dependsOn}
                    leadsTo={leadsTo}
                  />
                )
              })}
              {nodes.length === 0 && (
                <p className="text-xs text-[var(--ink-muted)]">Nothing here.</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
