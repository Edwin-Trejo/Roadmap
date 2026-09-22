import { useState } from 'react'

const CONTROLS: { icon: string; label: string }[] = [
  { icon: '⬚', label: 'Left-drag empty space: select multiple' },
  { icon: '✥', label: 'Middle or right-drag: pan canvas' },
  { icon: '✋', label: 'Drag a shape or node: move it' },
  { icon: '✎', label: 'Double-click text: edit' },
  { icon: '⤢', label: 'Drag a corner: resize' },
  { icon: '⌫', label: 'Select + Delete key: remove' },
]

const STORAGE_KEY = 'roadmap_legend_collapsed'

function getInitialCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function ControlsLegend() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed)

  function toggle() {
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore write failures (private browsing, etc.)
      }
      return next
    })
  }

  if (collapsed) {
    return (
      <button
        onClick={toggle}
        aria-label="Show controls legend"
        title="Show controls"
        className="absolute bottom-4 left-0 z-10 rounded-r-lg border border-l-0 border-[var(--border-earth)] bg-[var(--surface)] px-1.5 py-2 text-[var(--ink-muted)] shadow-lg hover:text-[var(--ink)]"
      >
        ›
      </button>
    )
  }

  return (
    <div className="absolute bottom-4 left-4 z-10 w-64 rounded-lg border border-[var(--border-earth)] bg-[var(--surface)] p-3 text-xs shadow-lg">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          Controls
        </span>
        <button
          onClick={toggle}
          aria-label="Hide controls legend"
          title="Hide controls"
          className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          ‹
        </button>
      </div>
      <ul className="space-y-1">
        {CONTROLS.map(({ icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-[var(--ink)]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[var(--surface-alt)] text-sm">
              {icon}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
