import { Activity, Clock } from 'lucide-react'

export default function SupportActivity({ activities = [] }) {
  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
            <Activity className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[#111827]">
            Recent Support Activity
          </h3>
        </div>
        <span className="text-xs text-[#8b93a1]">Real-time stream</span>
      </div>

      <div className="divide-y divide-[#f4f6fb] text-xs">
        {activities.map((act) => (
          <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
            <p className="font-medium text-[#374151] leading-relaxed">{act.text || act.detail || act.title}</p>
            <span className="text-[11px] text-[#8b93a1] shrink-0">{act.at}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
