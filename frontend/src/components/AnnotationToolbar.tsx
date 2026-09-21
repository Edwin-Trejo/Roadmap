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
}: {
  activeTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  color: string
  onColorChange: (color: string) => void
}) {
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
      <div className="h-6 w-px bg-[var(--border-earth)]" />
      <div className="flex items-center gap-1.5">
        {EDGE_COLOR_PALETTE.map((swatch) => (
          <button
            key={swatch}
            onClick={() => onColorChange(swatch)}
            aria-label={`Use color ${swatch}`}
            className="h-5 w-5 rounded-full"
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
