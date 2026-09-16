import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { resolved, setMode } = useTheme()
  const isDark = resolved === 'dark'

  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] text-[var(--bf-muted)] shadow-[var(--bf-shadow-out)] transition hover:text-[var(--bf-ink)]',
        className,
      ].join(' ')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      {isDark ? (
        <Moon className="h-4 w-4" strokeWidth={2.1} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={2.1} />
      )}
    </button>
  )
}
