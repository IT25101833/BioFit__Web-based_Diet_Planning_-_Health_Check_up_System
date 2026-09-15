import { PieChart } from 'lucide-react'

export default function TicketStatusDonut({ statusOverview = [] }) {
  const safeOverview = Array.isArray(statusOverview) ? statusOverview : []
  const total =
    safeOverview.reduce((acc, curr) => acc + (Number(curr.count ?? curr.value) || 0), 0) || 1

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
            <PieChart className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[#111827]">
            Ticket Status Overview
          </h3>
        </div>
        <span className="text-xs font-semibold text-[#005a40]">{total} Total Active</span>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="h-3.5 w-full rounded-full bg-[#f4f6fb] overflow-hidden flex">
        {safeOverview.map((item) => {
          const count = Number(item.count ?? item.value) || 0
          const pct = Math.max(Math.round((count / total) * 100), 2)
          const label = item.status || item.label || 'Status'
          return (
            <div
              key={label}
              style={{
                width: `${pct}%`,
                backgroundColor: item.color || '#005a40',
              }}
              className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
              title={`${label}: ${count} (${pct}%)`}
            />
          )
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        {safeOverview.map((item) => {
          const label = item.status || item.label || 'Status'
          const count = Number(item.count ?? item.value) || 0
          return (
          <div
            key={label}
            className="flex items-center justify-between p-2.5 rounded-xl border border-[#f4f6fb] bg-[#f8faf9] text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color || '#005a40' }}
              />
              <span className="font-medium text-[#374151] truncate max-w-[110px]">
                {label}
              </span>
            </div>
            <span className="font-bold text-[#111827]">{count}</span>
          </div>
          )
        })}
      </div>
    </div>
  )
}
