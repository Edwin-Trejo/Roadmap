import { describe, expect, it } from 'vitest'
import { statusDisplay } from './statusDisplay'

describe('statusDisplay', () => {
  it('labels complete nodes as Complete with a moss-green color', () => {
    const result = statusDisplay('complete')
    expect(result.label).toBe('Complete')
    expect(result.color).toBe('#5f7a3d')
  })

  it('labels in_progress nodes as In Progress with an ochre color', () => {
    const result = statusDisplay('in_progress')
    expect(result.label).toBe('In Progress')
    expect(result.color).toBe('#b8860b')
  })

  it('labels next nodes as Next Step with a sienna color', () => {
    const result = statusDisplay('next')
    expect(result.label).toBe('Next Step')
    expect(result.color).toBe('#a0522d')
  })

  it('labels locked nodes as Locked with a taupe color', () => {
    const result = statusDisplay('locked')
    expect(result.label).toBe('Locked')
    expect(result.color).toBe('#8a7f6a')
  })
})
