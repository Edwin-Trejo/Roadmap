import { Link } from 'react-router-dom'
import type { ProjectSummary } from '../api/types'
import { ConfirmButton } from './ConfirmButton'

export function ProjectCard({
  project,
  onDelete,
}: {
  project: ProjectSummary
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-[var(--border-earth)] bg-[var(--surface)] p-5 shadow-sm transition hover:shadow-md">
      <Link to={`/projects/${project.id}`} className="block">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="min-w-0 truncate text-lg font-semibold text-[var(--ink)]">
            {project.name}
          </h3>
          <span className="shrink-0 text-sm font-medium text-[var(--ink-muted)]">
            {project.percent_complete}%
          </span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-alt)]">
          <div
            className="h-full rounded-full bg-[var(--accent)]"
            style={{ width: `${project.percent_complete}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.next_step_titles.length === 0 ? (
            <span className="text-sm text-[var(--ink-muted)]">No actionable next steps</span>
          ) : (
            project.next_step_titles.map((title) => (
              <span
                key={title}
                className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]"
              >
                {title}
              </span>
            ))
          )}
        </div>
      </Link>

      <div className="mt-4 flex justify-end border-t border-[var(--border-earth)] pt-3">
        <ConfirmButton
          label="Delete"
          onConfirm={onDelete}
          className="text-xs text-[var(--ink-muted)] hover:text-[var(--danger)]"
        />
      </div>
    </div>
  )
}
