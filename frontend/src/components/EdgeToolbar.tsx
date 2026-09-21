import { EDGE_COLOR_PALETTE } from '../lib/palette'

export function EdgeToolbar({
  color,
  onDelete,
  onColorChange,
}: {
  color: string
  onDelete: () => void
  onColorChange: (color: string) => void
}) {
  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-[var(--border-earth)] bg-[var(--surface)] px-4 py-2.5 shadow-lg">
      <button
        onClick={onDelete}
        aria-label="Delete connection"
        className="text-[var(--ink-muted)] hover:text-[var(--danger)]"
      >
        🗑
      </button>
      <div className="h-5 w-px bg-[var(--border-earth)]" />
      <div className="flex items-center gap-1.5">
        {EDGE_COLOR_PALETTE.map((swatch) => (
          <button
            key={swatch}
            onClick={() => onColorChange(swatch)}
            aria-label={`Set line color ${swatch}`}
            className="h-6 w-6 rounded-full"
            style={{
              backgroundColor: swatch,
              outline: swatch === color ? '2px solid var(--ink)' : undefined,
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
