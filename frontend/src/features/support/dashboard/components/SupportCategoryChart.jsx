import { BarChart3 } from 'lucide-react'

export default function SupportCategoryChart({ categories = [] }) {
  const safeCategories = Array.isArray(categories) ? categories : []
  const maxCount = Math.max(
    ...safeCategories.map((c) => Number(c.count ?? c.value) || 0),
    1,
  )

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
            <BarChart3 className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[#111827]">
            Support Requests by Category
          </h3>
        </div>
        <span className="text-xs text-[#8b93a1]">Last 30 days</span>
      </div>

      <div className="space-y-3 pt-1">
        {safeCategories.map((item) => {
          const count = Number(item.count ?? item.value) || 0
          const widthPercent = Math.round((count / maxCount) * 100)
          const label = item.category || item.label || 'Other'
          const percentage = item.percentage ?? Math.round((count / maxCount) * 100)

          return (
            <div key={label} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#374151] truncate max-w-[200px]">
                  {label}
                </span>
                <span className="font-semibold text-[#111827]">
                  {count} <span className="text-[#8b93a1] font-normal">({percentage}%)</span>
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#f4f6fb] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color || '#005a40',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
