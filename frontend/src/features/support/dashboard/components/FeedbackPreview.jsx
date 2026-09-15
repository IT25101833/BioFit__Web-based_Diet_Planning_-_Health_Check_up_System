import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, ThumbsUp, AlertTriangle, Lightbulb } from 'lucide-react'
import StatusBadge from '../../../../components/ui/StatusBadge'

export default function FeedbackPreview({ feedback = [] }) {
  return (
    <div className="rounded-3xl border border-[#e8ecf1] bg-white p-5 shadow-xs sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-3 border-b border-[#eef2f0] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e6f5f0] text-[#005a40]">
              <ClipboardList className="h-4 w-4" />
            </span>
            <h3 className="font-display text-sm font-bold text-[#111827]">
              Recent Feedback &amp; Complaints
            </h3>
          </div>
          <Link
            to="/support/feedback"
            className="text-xs font-semibold text-[#005a40] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#f4f6fb]">
          {feedback.slice(0, 3).map((item) => (
            <div key={item.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111827]">{item.client}</span>
                <StatusBadge status={item.type} />
              </div>
              <p className="text-xs font-medium text-[#374151] line-clamp-2 leading-relaxed">
                &ldquo;{item.subject}&rdquo;
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#6b7280]">
                <span>{item.date}</span>
                <Link
                  to="/support/feedback"
                  className="font-semibold text-[#005a40] hover:underline"
                >
                  Review Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
