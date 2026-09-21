import { NodeResizer, type NodeProps } from '@xyflow/react'
import { useState } from 'react'

export interface TextAnnotationData extends Record<string, unknown> {
  color: string
  text: string
  onTextChange: (text: string) => void
  onResizeEnd: (dims: { x: number; y: number; width: number; height: number }) => void
}

export function TextAnnotation({ data, selected, width, height }: NodeProps) {
  const { color, text, onTextChange, onResizeEnd } = data as TextAnnotationData
  const [draft, setDraft] = useState(text)

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={24}
        handleStyle={{ width: 10, height: 10 }}
        onResizeEnd={(_event, params) => onResizeEnd(params)}
      />
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== text) onTextChange(draft)
        }}
        placeholder="Add text…"
        className="nodrag h-full w-full resize-none bg-transparent p-1 text-sm font-medium outline-none"
        style={{ width: width ?? 140, height: height ?? 40, color }}
      />
    </>
  )
}
