import { Lock, Paperclip, Stethoscope } from 'lucide-react'
import Avatar from '../../../../components/ui/Avatar'
import { formatWhen } from '../utils/formatWhen'

export default function TicketResponseCard({ response }) {
  const isInternalNote = response.role === 'internal_note' || response.role === 'internal'
  const isSpecialist = response.role === 'specialist'
  const isSupport = response.role === 'support'

  const formattedDate = formatWhen(response.at)

  if (isInternalNote) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 text-amber-900">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950">{response.author}</span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  Internal Note · Staff Only
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-amber-700/80">{formattedDate}</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-amber-900 whitespace-pre-wrap pl-9">
          {response.body}
        </p>
      </div>
    )
  }

  if (isSpecialist) {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200 text-purple-900">
              <Stethoscope className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-950">{response.author}</span>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-800">
                  Specialist Consultation
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-purple-700/80">{formattedDate}</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-purple-950 whitespace-pre-wrap pl-10.5">
          {response.body}
        </p>
      </div>
    )
  }

  if (isSupport) {
    return (
      <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <Avatar name={response.author} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#14532d]">{response.author}</span>
                <span className="rounded-md bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#15803d]">
                  Customer Experience
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#166534]/70">{formattedDate}</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-[#14532d] whitespace-pre-wrap pl-10.5">
          {response.body}
        </p>
      </div>
    )
  }

  // Client response (soft neutral card)
  return (
    <div className="rounded-2xl border border-[#e8ecf1] bg-white p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={response.author} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#111827]">{response.author}</span>
              <span className="rounded-md bg-[#f4f6fb] px-2 py-0.5 text-[10px] font-medium text-[#4b5563]">
                Client
              </span>
            </div>
          </div>
        </div>
        <span className="text-[11px] text-[#6b7280]">{formattedDate}</span>
      </div>
      <p className="text-xs sm:text-sm leading-relaxed text-[#374151] whitespace-pre-wrap pl-10.5">
        {response.body}
      </p>

      {response.attachments && response.attachments.length > 0 ? (
        <div className="mt-3 flex items-center gap-2 pl-10.5 text-xs text-[#6b7280]">
          <Paperclip className="h-3.5 w-3.5" />
          <span>{response.attachments.length} attachment(s)</span>
        </div>
      ) : null}
    </div>
  )
}
