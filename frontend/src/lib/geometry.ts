export type Point = [number, number]

export interface NormalizedPoints {
  x: number
  y: number
  width: number
  height: number
  localPoints: Point[]
}

const MIN_SIZE = 4

export function normalizePoints(points: Point[]): NormalizedPoints {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, MIN_SIZE),
    height: Math.max(maxY - minY, MIN_SIZE),
    localPoints: points.map(([x, y]) => [x - minX, y - minY]),
  }
}

export function pointsToPolyline(points: Point[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}
