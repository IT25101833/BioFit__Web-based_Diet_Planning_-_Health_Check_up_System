import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'w-[min(100%,28rem)]',
    md: 'w-[min(100%,36rem)]',
    lg: 'w-[min(100%,42rem)]',
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-[#1a2332]/35 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={() => onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bf-modal-title"
        className={[
          'relative z-10 mx-4 flex max-h-[92svh] shrink-0 flex-col rounded-t-3xl border border-[var(--bf-border)] bg-[var(--bf-surface-raised)] shadow-[var(--bf-shadow-out)] sm:mx-0 sm:rounded-[1.25rem]',
          widths[size] || widths.md,
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--bf-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2
              id="bf-modal-title"
              className="font-display text-xl font-bold tracking-tight text-[var(--bf-ink)]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-[var(--bf-muted)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--bf-border)] bg-[var(--bf-surface)] text-[var(--bf-muted)] shadow-[var(--bf-shadow-out)] hover:text-[var(--bf-ink)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children ? <div className="min-w-0 overflow-y-auto px-5 py-5 sm:px-6">{children}</div> : null}
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--bf-border)] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
