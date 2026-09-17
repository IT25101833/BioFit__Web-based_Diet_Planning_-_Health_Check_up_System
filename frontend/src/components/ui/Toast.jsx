import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ open, message, onClose }) {
  if (!open || !message) return null

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] px-4 py-3 shadow-[var(--bf-shadow-out)]"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40] shadow-[var(--bf-shadow-out)]">
        <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <p className="flex-1 pt-1 text-sm font-medium text-[var(--bf-ink)]">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface)] p-1 text-[var(--bf-muted)] shadow-[var(--bf-shadow-out)] hover:text-[var(--bf-ink)]"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
