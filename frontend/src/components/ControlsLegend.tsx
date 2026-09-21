const CONTROLS: { icon: string; label: string }[] = [
  { icon: '⬚', label: 'Left-drag empty space: select multiple' },
  { icon: '✥', label: 'Middle or right-drag: pan canvas' },
  { icon: '✋', label: 'Drag a shape or node: move it' },
  { icon: '✎', label: 'Double-click text: edit' },
  { icon: '⤢', label: 'Drag a corner: resize' },
  { icon: '⌫', label: 'Select + Delete key: remove' },
]

export function ControlsLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 w-64 rounded-lg border border-[var(--border-earth)] bg-[var(--surface)] p-3 text-xs shadow-lg">
      <div className="mb-1.5 font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
        Controls
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
