import { Apple, Dumbbell } from 'lucide-react'
import Button from '../ui/Button'

export default function CareRecommendationCard({ recommendation }) {
  if (!recommendation?.nutrition && !recommendation?.fitness) return null

  const advisor = recommendation.advisorName || 'Your Medical Advisor'
  const both = recommendation.nutrition && recommendation.fitness
  const title = both
    ? `${advisor} recommended nutrition and fitness support.`
    : recommendation.nutrition
      ? `${advisor} recommended a nutrition consultation.`
      : `${advisor} recommended a fitness session.`

  return (
    <section aria-label="Recommended support">
      <article className="rounded-[1.25rem] border border-[#e8ecf1] bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e6f5f0] text-[#005a40]">
              {recommendation.fitness && !recommendation.nutrition ? (
                <Dumbbell className="h-5 w-5" strokeWidth={2.1} />
              ) : (
                <Apple className="h-5 w-5" strokeWidth={2.1} />
              )}
            </span>
            <div>
              <p className="text-[13px] font-medium text-[#6b7280]">Recommended support</p>
              <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-[#111827]">
                {title}
              </h2>
              {recommendation.assessmentDate ? (
                <p className="mt-2 text-sm text-[#4b5563]">
                  From your health assessment on {recommendation.assessmentDate}.
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {recommendation.nutrition ? (
              <Button
                to="/client/appointments/book?service=nutrition"
                size="sm"
                className="rounded-xl !bg-[#005a40] hover:!bg-[#004833]"
              >
                Book nutrition
              </Button>
            ) : null}
            {recommendation.fitness ? (
              <Button
                to="/client/appointments/book?service=fitness"
                size="sm"
                variant={recommendation.nutrition ? 'outline' : undefined}
                className={
                  recommendation.nutrition
                    ? 'rounded-xl !text-[#005a40]'
                    : 'rounded-xl !bg-[#005a40] hover:!bg-[#004833]'
                }
              >
                Book fitness
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  )
}
