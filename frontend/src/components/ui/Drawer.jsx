import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 'md',
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
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px]"
        aria-label="Close panel"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bf-drawer-title"
        className={[
          'relative z-10 flex h-full w-full flex-col border-l border-[#e8ecf1] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]',
          widths[width] || widths.md,
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#eef2f0] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="bf-drawer-title"
              className="font-display text-xl font-bold tracking-tight text-[#111827]"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6b7280] hover:bg-[#f4f6fb]"
            aria-label="Close"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="border-t border-[#eef2f0] px-5 py-4 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}
