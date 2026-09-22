import { EDGE_COLOR_PALETTE } from '../lib/palette'

export type AnnotationTool = 'select' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'freehand'

const TOOLS: { tool: AnnotationTool; label: string; icon: string }[] = [
  { tool: 'select', label: 'Select', icon: '⇱' },
  { tool: 'rectangle', label: 'Rectangle', icon: '▭' },
  { tool: 'circle', label: 'Circle', icon: '◯' },
  { tool: 'arrow', label: 'Arrow', icon: '↗' },
  { tool: 'text', label: 'Text', icon: 'T' },
  { tool: 'freehand', label: 'Pen', icon: '✎' },
]

export function AnnotationToolbar({
  activeTool,
  onToolChange,
  color,
  onColorChange,
  selectedLineColor,
  onDeleteLine,
  onLineColorChange,
}: {
  activeTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  color: string
  onColorChange: (color: string) => void
  selectedLineColor?: string | null
  onDeleteLine?: () => void
  onLineColorChange?: (color: string) => void
}) {
  const editingLine = selectedLineColor != null
  const swatchColor = editingLine ? selectedLineColor : color
  const handleSwatchClick = editingLine ? onLineColorChange! : onColorChange

  return (
    <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-[var(--border-earth)] bg-[var(--surface)] px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1">
        {TOOLS.map(({ tool, label, icon }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            aria-label={label}
            title={label}
            className={
              tool === activeTool
                ? 'flex h-8 w-8 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-fg)]'
                : 'flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink)] hover:bg-[var(--surface-alt)]'
            }
          >
            {icon}
          </button>
        ))}
      </div>

      {editingLine && (
        <>
          <div className="h-6 w-px bg-[var(--border-earth)]" />
          <button
            onClick={onDeleteLine}
            className="rounded-md border border-[var(--danger)] px-2.5 py-1 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--accent-fg)]"
          >
            Delete line
          </button>
        </>
      )}

      <div className="h-6 w-px bg-[var(--border-earth)]" />
      <div className="flex items-center gap-1.5">
        {EDGE_COLOR_PALETTE.map((swatch) => (
          <button
            key={swatch}
            onClick={() => handleSwatchClick(swatch)}
            aria-label={`Use color ${swatch}`}
            className="h-5 w-5 rounded-full"
            style={{
              backgroundColor: swatch,
              outline: swatch === swatchColor ? '2px solid var(--ink)' : undefined,
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
