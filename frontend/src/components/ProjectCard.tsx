import { Link } from 'react-router-dom'
import type { ProjectSummary } from '../api/types'

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {project.name}
        </h3>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {project.percent_complete}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${project.percent_complete}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.next_step_titles.length === 0 ? (
          <span className="text-sm text-slate-400">No actionable next steps</span>
        ) : (
          project.next_step_titles.map((title) => (
            <span
              key={title}
              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              {title}
            </span>
          ))
        )}
      </div>
    </Link>
  )
}
