import { useTheme } from '../theme/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="rounded-md border border-[var(--border-earth)] px-3 py-1.5 text-sm text-[var(--ink)] hover:bg-[var(--surface-alt)]"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
