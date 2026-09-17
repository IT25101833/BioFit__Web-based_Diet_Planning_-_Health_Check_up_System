import { Calendar, CheckCircle2, FileText, Layers } from 'lucide-react'
import StatusBadge from '../../../../components/ui/StatusBadge'

export default function RelatedBioFitService({ service }) {
  if (!service) return null

  const displayName = service.title || service.name
  if (!service.reference && !displayName) return null

  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 space-y-3">
      <div className="flex items-center justify-between border-b border-[#eef2f0] pb-3">
        <h3 className="font-display text-sm font-bold text-[#111827]">
          Related BioFit Service
        </h3>
        {service.reference ? (
          <span className="font-mono text-xs text-[#6b7280]">
            {service.reference}
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl border border-[#e8ecf1] bg-[#f8faf9] p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#111827] truncate">
            {displayName}
          </span>
          <StatusBadge status={service.status} />
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6b7280]">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#8b93a1]" />
            <span>{service.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#8b93a1]" />
            <span>{service.time}</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-[#8b93a1] leading-relaxed">
        High-level service reference linked to support ticket. Specialist clinical notes remain protected.
      </p>
    </div>
  )
}
