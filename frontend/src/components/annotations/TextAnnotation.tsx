import { NodeResizer, type NodeProps } from '@xyflow/react'
import { useEffect, useRef, useState } from 'react'

export interface TextAnnotationData extends Record<string, unknown> {
  color: string
  text: string
  onTextChange: (text: string) => void
  onResizeEnd: (dims: { x: number; y: number; width: number; height: number }) => void
}

export function TextAnnotation({ data, selected, width, height }: NodeProps) {
  const { color, text, onTextChange, onResizeEnd } = data as TextAnnotationData
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }, [editing])

  function finishEditing() {
    setEditing(false)
    if (draft !== text) onTextChange(draft)
  }

  const boxStyle = { width: width ?? 160, height: height ?? 44, color }

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={24}
        handleStyle={{ width: 10, height: 10 }}
        onResizeEnd={(_event, params) => onResizeEnd(params)}
      />
      {editing ? (
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={finishEditing}
          placeholder="Add text…"
          className="nodrag h-full w-full resize-none bg-transparent p-1 text-sm font-medium outline-none"
          style={boxStyle}
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          className="h-full w-full cursor-move whitespace-pre-wrap p-1 text-sm font-medium"
          style={{ ...boxStyle, opacity: text ? 1 : 0.5 }}
        >
          {text || 'Double-click to add text…'}
        </div>
      )}
    </>
  )
}
