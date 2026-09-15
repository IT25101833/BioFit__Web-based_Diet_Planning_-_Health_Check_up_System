import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page = 1,
  pageSize = 8,
  total = 0,
  onChange,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(total, safePage * pageSize)

  return (
    <div
      className={[
        'flex flex-wrap items-center justify-between gap-3 border-t border-[#eef2f0] pt-4',
        className,
      ].join(' ')}
    >
      <p className="text-[12px] text-[#6b7280]">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onChange?.(safePage - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#e8ecf1] bg-white px-3 text-sm font-semibold text-[#4b5563] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <span className="text-sm font-semibold text-[#111827]">
          {safePage} / {totalPages}
        </span>
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onChange?.(safePage + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#e8ecf1] bg-white px-3 text-sm font-semibold text-[#4b5563] disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
