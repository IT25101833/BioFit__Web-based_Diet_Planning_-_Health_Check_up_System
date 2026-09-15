import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { mode, cycleMode } = useTheme()
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor
  const label =
    mode === 'dark' ? 'Dark mode' : mode === 'light' ? 'Light mode' : 'System theme'

  return (
    <button
      type="button"
      onClick={cycleMode}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface)] text-[var(--bf-muted)] shadow-[var(--bf-shadow-out)] transition hover:text-[var(--bf-ink)]',
        className,
      ].join(' ')}
      aria-label={`Theme: ${label}. Click to change.`}
      title={label}
    >
      <Icon className="h-4 w-4" strokeWidth={2.1} />
    </button>
  )
}
