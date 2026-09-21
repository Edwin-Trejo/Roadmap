import { useState } from 'react'

export function ConfirmButton({
  label,
  onConfirm,
  className,
}: {
  label: string
  onConfirm: () => void
  className?: string
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setConfirming(true)
        }}
        className={
          className ??
          'rounded-md border border-[var(--danger)] px-3 py-2 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--accent-fg)]'
        }
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[var(--ink-muted)]">Are you sure?</span>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setConfirming(false)
          onConfirm()
        }}
        className="rounded-md bg-[var(--danger)] px-2 py-1 font-medium text-[var(--accent-fg)] hover:bg-[var(--danger-hover)]"
      >
        Confirm
      </button>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setConfirming(false)
        }}
        className="rounded-md border border-[var(--border-earth)] px-2 py-1 text-[var(--ink)] hover:bg-[var(--surface-alt)]"
      >
        Cancel
      </button>
    </div>
  )
}
