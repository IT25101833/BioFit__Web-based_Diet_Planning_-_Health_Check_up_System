import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ open, message, onClose }) {
  if (!open || !message) return null

  return (
    <div
      role="status"
      className="fixed right-4 bottom-4 z-[90] flex max-w-sm items-start gap-3 rounded-2xl border border-[#d7eee6] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
        <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
      </span>
      <p className="flex-1 pt-1 text-sm font-medium text-[#111827]">{message}</p>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-[#9ca3af] hover:bg-[#f4f6fb] hover:text-[#4b5563]"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
