import { ArrowUpRight, Sparkles } from 'lucide-react'
import { formatWhen } from '../utils/formatWhen'

export default function EscalatedTicketState({ escalation }) {
  if (!escalation) return null

  const escalationDate = formatWhen(escalation.escalatedAt, { style: 'date' })

  return (
    <div className="rounded-3xl border border-purple-200 bg-purple-50/50 p-5 shadow-xs mb-6 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-200 text-purple-900">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-purple-950">
              Specialist Review in Progress
            </h3>
            <p className="text-xs text-purple-800">
              Assigned to {escalation.escalatedTo}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 border border-purple-200">
          {escalation.status || 'Under Review'}
        </span>
      </div>

      <div className="rounded-2xl border border-purple-200 bg-white/80 p-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Escalated By:</span>
          <span className="font-medium text-[#111827]">{escalation.escalatedBy}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#6b7280]">Escalation Date:</span>
          <span className="font-medium text-[#111827]">{escalationDate}</span>
        </div>
        <div className="pt-1 border-t border-purple-100">
          <span className="text-[#6b7280] block mb-1 font-semibold">Reason for Escalation:</span>
          <p className="text-[#1f2937] leading-relaxed italic">{escalation.reason}</p>
        </div>
        {escalation.additionalContext ? (
          <div className="pt-1">
            <span className="text-[#6b7280] block mb-0.5">Additional Context:</span>
            <p className="text-[#4b5563] leading-relaxed">{escalation.additionalContext}</p>
          </div>
        ) : null}
      </div>

      {escalation.specialistResponse ? (
        <div className="mt-4 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs">
          <div className="flex items-center gap-2 mb-1 text-[#15803d] font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Specialist Guidance Received</span>
          </div>
          <p className="text-[#14532d] leading-relaxed">
            {escalation.specialistResponse}
          </p>
        </div>
      ) : null}
    </div>
  )
}
