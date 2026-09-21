import { describe, expect, it } from 'vitest'
import { statusDisplay } from './statusDisplay'

describe('statusDisplay', () => {
  it('labels complete nodes as Complete with a green color', () => {
    const result = statusDisplay('complete')
    expect(result.label).toBe('Complete')
    expect(result.color).toBe('#16a34a')
  })

  it('labels in_progress nodes as In Progress with an amber color', () => {
    const result = statusDisplay('in_progress')
    expect(result.label).toBe('In Progress')
    expect(result.color).toBe('#d97706')
  })

  it('labels next nodes as Next Step with a blue color', () => {
    const result = statusDisplay('next')
    expect(result.label).toBe('Next Step')
    expect(result.color).toBe('#2563eb')
  })

  it('labels locked nodes as Locked with a gray color', () => {
    const result = statusDisplay('locked')
    expect(result.label).toBe('Locked')
    expect(result.color).toBe('#64748b')
  })
})
