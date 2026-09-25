import type { ReactNode } from 'react'
import type { RoadmapNode } from '../api/types'
import { BADGE_TEXT, STATUS_COLUMNS } from '../lib/statusColumns'

export function StatusBoard({
  nodes,
  renderCard,
}: {
  nodes: RoadmapNode[]
  renderCard: (node: RoadmapNode) => ReactNode
}) {
  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-hidden p-4 sm:grid-cols-3">
      {STATUS_COLUMNS.map((column) => {
        const columnNodes = nodes.filter((n) =>
          (column.statuses as readonly string[]).includes(n.status),
        )
        return (
          <div key={column.key} className="flex flex-col overflow-hidden">
            <h2 className="mb-3 shrink-0">
              <span
                className="inline-block rounded-md px-3 py-1.5 text-sm font-semibold uppercase tracking-wide"
                style={{ backgroundColor: column.badgeColor, color: BADGE_TEXT }}
              >
                {column.label} ({columnNodes.length})
              </span>
            </h2>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {columnNodes.map((node) => renderCard(node))}
              {columnNodes.length === 0 && (
                <p className="text-xs text-[var(--ink-muted)]">Nothing here.</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
