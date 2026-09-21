import { describe, expect, it } from 'vitest'
import { normalizePoints } from './geometry'

describe('normalizePoints', () => {
  it('computes the bounding box top-left as x/y', () => {
    const result = normalizePoints([
      [50, 100],
      [150, 40],
    ])
    expect(result.x).toBe(50)
    expect(result.y).toBe(40)
  })

  it('computes width/height as the bounding box span', () => {
    const result = normalizePoints([
      [50, 100],
      [150, 40],
    ])
    expect(result.width).toBe(100)
    expect(result.height).toBe(60)
  })

  it('translates points to be relative to the bounding box origin', () => {
    const result = normalizePoints([
      [50, 100],
      [150, 40],
    ])
    expect(result.localPoints).toEqual([
      [0, 60],
      [100, 0],
    ])
  })

  it('enforces a minimum size for a perfectly straight horizontal line', () => {
    const result = normalizePoints([
      [10, 10],
      [80, 10],
    ])
    expect(result.height).toBeGreaterThanOrEqual(4)
    expect(result.width).toBe(70)
  })
})
