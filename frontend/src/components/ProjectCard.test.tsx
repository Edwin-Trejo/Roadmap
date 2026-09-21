import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { ProjectSummary } from '../api/types'
import { ProjectCard } from './ProjectCard'

const project: ProjectSummary = {
  id: 1,
  name: 'Roadmap App',
  description: 'A dashboard',
  created_at: '2026-01-01T00:00:00Z',
  percent_complete: 42,
  next_step_titles: ['Build API', 'Write tests'],
}

function renderCard(p: ProjectSummary) {
  return render(
    <MemoryRouter>
      <ProjectCard project={p} />
    </MemoryRouter>,
  )
}

describe('ProjectCard', () => {
  it('shows the project name and percent complete', () => {
    renderCard(project)
    expect(screen.getByText('Roadmap App')).toBeInTheDocument()
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('lists each next-step title as a chip', () => {
    renderCard(project)
    expect(screen.getByText('Build API')).toBeInTheDocument()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
  })

  it('shows a fallback message when there are no next steps', () => {
    renderCard({ ...project, next_step_titles: [] })
    expect(screen.getByText(/no actionable next steps/i)).toBeInTheDocument()
  })

  it('links to the project roadmap page', () => {
    renderCard(project)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/projects/1')
  })
})
