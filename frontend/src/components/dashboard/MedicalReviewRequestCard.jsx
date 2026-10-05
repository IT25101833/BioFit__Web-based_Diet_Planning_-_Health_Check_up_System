import { CalendarClock } from 'lucide-react'
import Button from '../ui/Button'

export default function MedicalReviewRequestCard({ review }) {
  if (!review?.id) return null

  const advisor = review.advisorName || 'Your Medical Advisor'
  const dateLabel = review.reviewDateLabel || review.reviewDate || '-'
  const path =
    review.chooseTimePath ||
    `/client/appointments/book?reviewRequestId=${encodeURIComponent(review.id)}`

  return (
    <section aria-label="Next medical review">
      <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              <CalendarClock className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <div>
              <p className="text-[13px] font-medium text-[#6b7280]">Next Medical Review</p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
                {advisor} has requested a medical review.
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#005a40]">{dateLabel}</p>
            </div>
          </div>
          <Button
            to={path}
            size="sm"
            className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
          >
            Choose Time
          </Button>
        </div>
      </article>
    </section>
  )
}
