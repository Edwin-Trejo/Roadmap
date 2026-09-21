import type { NodeProps } from '@xyflow/react'

export interface LineAnnotationData extends Record<string, unknown> {
  color: string
  points: [number, number][]
}

export function ArrowAnnotation({ data, width, height }: NodeProps) {
  const { color, points } = data as LineAnnotationData
  const [start, end] = points
  const markerId = `arrowhead-${color.replace('#', '')}`

  return (
    <svg
      width={width ?? 100}
      height={height ?? 100}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={start[0]}
        y1={start[1]}
        x2={end[0]}
        y2={end[1]}
        stroke={color}
        strokeWidth={3}
        markerEnd={`url(#${markerId})`}
      />
    </svg>
  )
}
