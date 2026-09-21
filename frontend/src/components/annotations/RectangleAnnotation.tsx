import { NodeResizer, type NodeProps } from '@xyflow/react'

export interface ShapeAnnotationData extends Record<string, unknown> {
  color: string
  onResizeEnd: (dims: { x: number; y: number; width: number; height: number }) => void
}

export function RectangleAnnotation({ data, selected, width, height }: NodeProps) {
  const { color, onResizeEnd } = data as ShapeAnnotationData
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={20}
        minHeight={20}
        handleStyle={{ width: 10, height: 10 }}
        onResizeEnd={(_event, params) => onResizeEnd(params)}
      />
      <div
        style={{
          width: width ?? 120,
          height: height ?? 80,
          border: `3px solid ${color}`,
          borderRadius: 6,
          background: 'transparent',
        }}
      />
    </>
  )
}
