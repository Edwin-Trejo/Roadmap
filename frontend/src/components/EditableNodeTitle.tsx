import { useState } from 'react'

export function EditableNodeTitle({
  title,
  onRename,
  className,
}: {
  title: string
  onRename: (title: string) => void
  className?: string
}) {
  const [draft, setDraft] = useState(title)

  function handleBlur() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== title) {
      onRename(trimmed)
    } else {
      setDraft(title)
    }
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      className={
        'rounded-md border border-transparent bg-transparent text-[var(--ink)] hover:border-[var(--border-earth)] focus:border-[var(--accent)] focus:outline-none' +
        (className ? ` ${className}` : '')
      }
    />
  )
}
