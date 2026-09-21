import type { NodeProps } from '@xyflow/react'
import { pointsToPolyline } from '../../lib/geometry'
import type { LineAnnotationData } from './ArrowAnnotation'

export function FreehandAnnotation({ data, width, height }: NodeProps) {
  const { color, points } = data as LineAnnotationData

  return (
    <svg
      width={width ?? 100}
      height={height ?? 100}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <polyline
        points={pointsToPolyline(points)}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
