import { Link } from 'react-router-dom'
import { ArrowRight, MessageSquareText } from 'lucide-react'

export default function RecentInquiriesList({ inquiries = [] }) {
  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-[#eef2f0] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
              <MessageSquareText className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-[#111827]">
              Recent Client Inquiries
            </h3>
          </div>
          <Link
            to="/support/inquiries"
            className="text-xs font-semibold text-[#005a40] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#f4f6fb]">
          {inquiries.slice(0, 4).map((inq) => (
            <div key={inq.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111827]">{inq.client}</span>
                <span className="text-[11px] text-[#8b93a1]">{inq.time}</span>
              </div>
              <p className="text-xs font-medium text-[#374151] line-clamp-1">
                &ldquo;{inq.subject}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#6b7280] pt-1">
                <span className="rounded-md bg-[#f4f6fb] px-2 py-0.5">{inq.category}</span>
                <Link
                  to="/support/inquiries"
                  className="font-semibold text-[#005a40] hover:underline"
                >
                  Respond →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
