import { Award, Clock, HeartHandshake, Zap } from 'lucide-react'

export default function SupportPerformance({ performance }) {
  if (!performance) return null

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
            <Award className="h-4 w-4" />
          </span>
          <h3 className="font-display text-sm font-bold text-[#111827]">
            Service Performance
          </h3>
        </div>
        <span className="text-xs text-[#8b93a1]">Weekly Benchmarks</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3 text-center space-y-1">
          <span className="text-[11px] text-[#6b7280] block">Resolved This Week</span>
          <p className="font-display text-xl font-bold text-[#111827]">
            {performance.resolvedThisWeek}
          </p>
          <span className="text-[10px] text-[#6b7280] font-medium">Recorded this week</span>
        </div>

        <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3 text-center space-y-1">
          <span className="text-[11px] text-[#6b7280] block">Average Waiting</span>
          <p className="font-display text-xl font-bold text-[#005a40]">
            {performance.avgWaitingMinutes ?? '—'}
            {performance.avgWaitingMinutes == null ? '' : 'm'}
          </p>
          <span className="text-[10px] text-[#6b7280] font-medium">Active tickets</span>
        </div>

        <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3 text-center space-y-1">
          <span className="text-[11px] text-[#6b7280] block">SLA Breaches</span>
          <p className="font-display text-xl font-bold text-[#111827]">
            {performance.slaBreaches ?? 0}
          </p>
          <span className="text-[10px] text-[#6b7280] font-medium">Past waiting target</span>
        </div>

        <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3 text-center space-y-1">
          <span className="text-[11px] text-[#6b7280] block">SLA Compliance</span>
          <p className="font-display text-xl font-bold text-[#005a40]">
            {performance.slaCompliancePercentage == null ? '—' : `${performance.slaCompliancePercentage}%`}
          </p>
          <span className="text-[10px] text-[#6b7280] font-medium">From waiting time</span>
        </div>
      </div>
    </div>
  )
}
