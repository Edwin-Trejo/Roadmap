import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { ShapeAnnotationData } from './RectangleAnnotation'

export function CircleAnnotation({ data, selected, width, height }: NodeProps) {
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
          width: width ?? 100,
          height: height ?? 100,
          border: `3px solid ${color}`,
          borderRadius: '50%',
          background: 'transparent',
        }}
      />
    </>
  )
}
