import { useEffect, useRef, useState } from 'react'

export function EditableTaskTitle({
  title,
  done,
  onRename,
}: {
  title: string
  done: boolean
  onRename: (title: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  function finish() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== title) {
      onRename(trimmed)
    } else {
      setDraft(title)
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={finish}
        onKeyDown={(e) => {
          if (e.key === 'Enter') finish()
          if (e.key === 'Escape') {
            setDraft(title)
            setEditing(false)
          }
        }}
        className="flex-1 rounded border border-[var(--accent)] bg-[var(--surface)] px-1 text-sm text-[var(--ink)] outline-none"
      />
    )
  }

  return (
    <span
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
      className={
        done
          ? 'flex-1 cursor-text text-[var(--ink-muted)] line-through'
          : 'flex-1 cursor-text text-[var(--ink)]'
      }
    >
      {title}
    </span>
  )
}
